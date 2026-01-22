const { chromium } = require('playwright-core');
const NodeCache = require('node-cache');
require('dotenv').config();

// ✅ Cache de 6 horas (no scrapear siempre)
const cache = new NodeCache({ stdTTL: 21600 });

// ✅ Credenciales desde .env (NUNCA en el código)
const SEGO_USER = process.env.SEGO_USER;
const SEGO_PASS = process.env.SEGO_PASS;

// ✅ Mantener una sola instancia del navegador (no abrir por cada usuario)
let browserInstance = null;
let contextInstance = null;
let ultimoUso = Date.now();

// Cerrar navegador después de 30 minutos de inactividad
const TIMEOUT_INACTIVIDAD = 30 * 60 * 1000;

/**
 * ✅ Aplicar margen de ganancia al precio
 * Fórmula: precio con IGV + 50%
 */
const aplicarMargen = (precioBase) => {
  if (!precioBase || precioBase === 0) return 0;
  return precioBase * 1.5; // +50%
};

/**
 * ✅ Obtener o crear instancia del navegador (singleton)
 */
const obtenerNavegador = async () => {
  try {
    // Verificar si hay que cerrar por inactividad
    if (browserInstance && (Date.now() - ultimoUso > TIMEOUT_INACTIVIDAD)) {
      console.log('Cerrando navegador por inactividad...');
      await browserInstance.close();
      browserInstance = null;
      contextInstance = null;
    }

    // Si ya existe y está activo, reutilizar
    if (browserInstance && contextInstance) {
      ultimoUso = Date.now();
      return { browser: browserInstance, context: contextInstance };
    }

    console.log('Iniciando nueva instancia de navegador...');
    
    browserInstance = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled'
      ]
    });

    contextInstance = await browserInstance.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'es-PE',
      timezoneId: 'America/Lima'
    });

    // ✅ Ocultar que es un bot
    await contextInstance.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });
    });

    ultimoUso = Date.now();
    return { browser: browserInstance, context: contextInstance };
  } catch (error) {
    console.error('Error al obtener navegador:', error.message);
    browserInstance = null;
    contextInstance = null;
    throw error;
  }
};

/**
 * ✅ Obtener productos de Sego (función principal)
 * NUEVA ESTRATEGIA: Login y búsqueda en la misma página sin cerrarla
 */
const obtenerProductosSego = async (termino) => {
  let page = null;
  
  try {
    // ✅ Verificar caché primero
    const cacheKey = `sego_pro_${termino.toLowerCase()}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log(`✓ Productos obtenidos desde caché (${cached.length} productos)`);
      return cached;
    }

    console.log(`\n🔍 Buscando "${termino}" en Sego...`);

    // ✅ Obtener navegador singleton
    const { context } = await obtenerNavegador();

    // Crear página
    page = await context.newPage();

    // ✅ PASO 1: Ir directamente a la búsqueda (sin login previo)
    console.log('1️⃣ Navegando a búsqueda...');
    const urlBusqueda = `https://www.sego.com.pe/shop?search=${encodeURIComponent(termino)}`;
    await page.goto(urlBusqueda, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });

    // ✅ PASO 2: Verificar si necesitamos login
    await page.waitForTimeout(2000);
    const necesitaLogin = await page.evaluate(() => {
      return document.body.textContent.includes('para ver precio') || 
             document.body.textContent.includes('Iniciar sesión');
    });

    if (necesitaLogin) {
      console.log('2️⃣ Se requiere login, iniciando sesión...');
      
      // Navegar directamente a login
      await page.goto('https://www.sego.com.pe/web/login', { 
        waitUntil: 'domcontentloaded',
        timeout: 30000 
      });
      
      // Llenar formulario
      await page.waitForSelector('input[name="login"]', { timeout: 10000 });
      await page.fill('input[name="login"]', SEGO_USER);
      await page.fill('input[name="password"]', SEGO_PASS);
      
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 }),
        page.click('button[type="submit"]')
      ]);
      
      console.log('✓ Login completado');
      
      // Volver a la búsqueda
      console.log('3️⃣ Volviendo a la búsqueda...');
      await page.goto(urlBusqueda, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
    } else {
      console.log('✓ Sesión ya activa');
    }

    // Esperar productos
    await page.waitForSelector('.tp-product-item', { timeout: 10000 }).catch(() => {
      console.log('⚠️ No se encontraron productos');
    });

    // ✅ Esperar a que carguen los precios dinámicamente (JavaScript)
    // Los precios se cargan después del HTML inicial
    console.log('⏳ Esperando carga de precios dinámicos...');
    await page.waitForTimeout(8000); // Más tiempo para JavaScript

    // ✅ PASO 4: Extraer productos con precios
    console.log('4️⃣ Extrayendo precios...');
    const productos = await page.evaluate(() => {
      const items = document.querySelectorAll('.tp-product-item');
      const resultados = [];

      items.forEach((item) => {
        try {
          const nombre = item.querySelector('.tp-product-title a, h6 a')?.textContent.trim() || '';
          const textoCompleto = item.textContent;
          
          // SKU
          const skuMatch = textoCompleto.match(/SKU:\s*([A-Z0-9\-]+)/i);
          const sku = skuMatch ? skuMatch[1] : 'N/A';

          // ✅ EXTRACCIÓN DE PRECIO - Múltiples estrategias
          let precioSoles = null;
          
          // Estrategia 1: Buscar en el div de precios
          const precioDiv = item.querySelector('.product_item_price_custom, [class*="price"]');
          if (precioDiv) {
            const textoPrecio = precioDiv.textContent;
            
            // Buscar "Precio con IGV: $ XX.XX" o "$ XX.XX"
            const matchIGV = textoPrecio.match(/(?:Precio con IGV[:\s]*)?[\$]\s*([\d,\.]+)/i);
            if (matchIGV) {
              precioSoles = matchIGV[1];
            }
          }
          
          // Estrategia 2: Buscar en todo el texto
          if (!precioSoles) {
            // Buscar todos los precios con $
            const matches = textoCompleto.match(/\$\s*([\d,\.]+)/g);
            if (matches && matches.length > 0) {
              // Si hay múltiples precios, el último suele ser con IGV
              const ultimoPrecio = matches[matches.length - 1];
              precioSoles = ultimoPrecio.replace('$', '').trim();
            }
          }
          
          // Estrategia 3: Buscar en atributos data-*
          if (!precioSoles) {
            const elementoConPrecio = item.querySelector('[data-price], [data-list-price], [data-product-price]');
            if (elementoConPrecio) {
              precioSoles = elementoConPrecio.dataset.price || 
                           elementoConPrecio.dataset.listPrice || 
                           elementoConPrecio.dataset.productPrice;
            }
          }

          const descripcion = item.querySelector('.tp-product-description, .product-description')?.textContent.trim() || nombre;
          const imagenEl = item.querySelector('.tp-product-image, img');
          const imagenUrl = imagenEl ? (imagenEl.src || imagenEl.dataset.src || '') : '';
          const urlProducto = item.querySelector('.tp-product-title a')?.href || '';

          if (nombre && nombre.length > 2) {
            resultados.push({
              nombre,
              descripcion,
              sku,
              precioSoles,
              imagenUrl,
              urlProducto
            });
          }
        } catch (error) {
          console.error('Error procesando producto:', error);
        }
      });

      return resultados;
    });

    await page.close();
    page = null;

    console.log(`✓ Encontrados ${productos.length} productos`);

    // ✅ PASO 4: Procesar precios y aplicar margen del 50%
    const productosConPrecio = productos.map(p => {
      let precioBase = 0;
      let precioReal = false;

      if (p.precioSoles) {
        // El precio ya está en SOLES (es el precio con IGV de Sego)
        const precioNumerico = parseFloat(p.precioSoles.replace(/,/g, ''));
        if (!isNaN(precioNumerico) && precioNumerico > 0) {
          precioBase = precioNumerico;
          precioReal = true;
          console.log(`  ✓ ${p.nombre.substring(0, 40)}... = S/ ${precioBase.toFixed(2)} → S/ ${(precioBase * 1.5).toFixed(2)} (+50%)`);
        }
      }

      if (!precioReal) {
        precioBase = estimarPrecio(p.nombre);
        console.log(`  ⚠️ ${p.nombre.substring(0, 40)}... = S/ ${precioBase.toFixed(2)} (estimado)`);
      }

      const precioConMargen = aplicarMargen(precioBase);

      return {
        nombre: p.nombre,
        descripcion: p.descripcion,
        sku: p.sku,
        precio: precioConMargen,
        precioBase: precioBase,
        precioTexto: `S/ ${precioConMargen.toFixed(2)}`,
        imagenUrl: normalizarUrl(p.imagenUrl),
        urlProducto: normalizarUrl(p.urlProducto),
        fuente: 'SEGO',
        categoria: 'General',
        precioEstimado: !precioReal
      };
    });

    // ✅ Guardar en caché (6 horas)
    if (productosConPrecio.length > 0) {
      cache.set(cacheKey, productosConPrecio);
      console.log(`✓ ${productosConPrecio.length} productos guardados en caché`);
    }

    return productosConPrecio;
  } catch (error) {
    console.error('❌ Error obteniendo productos:', error.message);
    if (page) {
      await page.close().catch(() => {});
    }
    throw error;
  }
};

/**
 * ✅ Estimar precio basado en el nombre del producto
 */
const estimarPrecio = (nombre) => {
  const nombreLower = nombre.toLowerCase();
  if (nombreLower.includes('nvr') || nombreLower.includes('dvr')) return 450;
  if (nombreLower.includes('8mp') || nombreLower.includes('4k')) return 280;
  if (nombreLower.includes('5mp') || nombreLower.includes('6mp')) return 200;
  if (nombreLower.includes('4mp')) return 150;
  if (nombreLower.includes('2mp') || nombreLower.includes('1080p')) return 120;
  if (nombreLower.includes('ptz') || nombreLower.includes(' pt ')) return 350;
  if (nombreLower.includes('wifi')) return 180;
  if (nombreLower.includes('disco') || nombreLower.includes('hdd')) return 250;
  return 150;
};

/**
 * ✅ Normalizar URL
 */
const normalizarUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return `https://www.sego.com.pe${url}`;
  return `https://www.sego.com.pe/${url}`;
};

/**
 * ✅ Cerrar navegador (para limpieza)
 */
const cerrarNavegador = async () => {
  try {
    if (browserInstance) {
      await browserInstance.close();
      browserInstance = null;
      contextInstance = null;
      console.log('✓ Navegador cerrado');
    }
  } catch (error) {
    console.error('Error al cerrar navegador:', error.message);
  }
};

/**
 * ✅ Limpiar caché
 */
const limpiarCache = () => {
  cache.flushAll();
  console.log('✓ Caché limpiado');
};

// ✅ Cerrar navegador al terminar el proceso
process.on('SIGINT', async () => {
  await cerrarNavegador();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await cerrarNavegador();
  process.exit(0);
});

module.exports = {
  obtenerProductosSego,
  cerrarNavegador,
  limpiarCache
};
