const { chromium } = require('playwright-core');
const NodeCache = require('node-cache');

// Cache de 1 hora
const cache = new NodeCache({ stdTTL: 3600 });

// Credenciales de Sego
const SEGO_EMAIL = 'Bradatecsrl@gmail.com';
const SEGO_PASSWORD = '20608918371';

// Variables globales para mantener el navegador y contexto
let browser = null;
let context = null;
let paginaSesion = null;

/**
 * Aplicar margen de ganancia al precio
 */
const aplicarMargen = (precioBase) => {
  if (!precioBase || precioBase === 0) return 0;
  return precioBase * 1.5; // +50%
};

/**
 * Iniciar navegador y mantener sesión activa
 */
const iniciarSesionPersistente = async () => {
  try {
    if (browser && context && paginaSesion) {
      // Verificar si la sesión sigue activa
      try {
        const url = paginaSesion.url();
        console.log('Sesión existente activa en:', url);
        return paginaSesion;
      } catch (error) {
        console.log('Sesión expirada, reiniciando...');
        browser = null;
        context = null;
        paginaSesion = null;
      }
    }

    console.log('Iniciando nueva sesión en Sego...');
    
    browser = await chromium.launch({
      headless: false, // IMPORTANTE: usar modo visible para evitar detección
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled'
      ]
    });

    context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 720 },
      locale: 'es-PE',
      timezoneId: 'America/Lima'
    });

    // Ocultar que es un bot
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });
    });

    paginaSesion = await context.newPage();

    console.log('Navegando a Sego...');
    await paginaSesion.goto('https://www.sego.com.pe/web/login', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });

    // Esperar a que cargue el formulario
    await paginaSesion.waitForSelector('input[name="login"]', { timeout: 10000 });

    console.log('Llenando formulario de login...');
    await paginaSesion.fill('input[name="login"]', SEGO_EMAIL);
    await paginaSesion.fill('input[name="password"]', SEGO_PASSWORD);

    console.log('Enviando formulario...');
    // Click y esperar navegación
    await Promise.all([
      paginaSesion.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 }),
      paginaSesion.click('button[type="submit"]')
    ]);

    const urlFinal = paginaSesion.url();
    console.log('URL después del login:', urlFinal);

    if (urlFinal.includes('/web/login')) {
      console.log('⚠️ Login falló - aún en página de login');
      
      // Verificar si hay mensaje de error
      const errorVisible = await paginaSesion.locator('.alert-danger, .o_error_detail').count();
      if (errorVisible > 0) {
        const errorText = await paginaSesion.locator('.alert-danger, .o_error_detail').first().textContent();
        console.log('Error de login:', errorText);
      }
      
      return null;
    }

    console.log('✓ Login exitoso!');
    return paginaSesion;
  } catch (error) {
    console.error('Error al iniciar sesión:', error.message);
    return null;
  }
};

/**
 * Obtener precios reales de Sego
 */
const obtenerPreciosRealesSego = async (termino) => {
  try {
    const cacheKey = `sego_real_${termino.toLowerCase()}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log('Precios obtenidos desde caché');
      return cached;
    }

    console.log(`\nObteniendo precios reales para: "${termino}"`);

    // Iniciar o reutilizar sesión
    const pagina = await iniciarSesionPersistente();
    if (!pagina) {
      throw new Error('No se pudo iniciar sesión en Sego');
    }

    // Navegar a la búsqueda
    const urlBusqueda = `https://www.sego.com.pe/shop?search=${encodeURIComponent(termino)}`;
    console.log('Navegando a búsqueda...');
    await pagina.goto(urlBusqueda, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });

    // Esperar a que carguen los productos
    await pagina.waitForSelector('.tp-product-item', { timeout: 10000 });
    
    // Esperar un poco más para que carguen los precios
    await pagina.waitForTimeout(3000);

    console.log('Extrayendo productos y precios...');

    // Extraer productos con precios
    const productos = await pagina.evaluate(() => {
      const items = document.querySelectorAll('.tp-product-item');
      const resultados = [];

      items.forEach((item, index) => {
        try {
          // Nombre
          const nombreEl = item.querySelector('.tp-product-title a, h6 a');
          const nombre = nombreEl ? nombreEl.textContent.trim() : '';

          // SKU
          const skuText = item.textContent;
          const skuMatch = skuText.match(/SKU:\s*([A-Z0-9\-]+)/i);
          const sku = skuMatch ? skuMatch[1] : 'N/A';

          // Buscar precio - múltiples patrones
          let precioUSD = null;
          const textoCompleto = item.textContent;

          // Patrón 1: "Precio con IGV: $ XX.XX"
          const match1 = textoCompleto.match(/Precio con IGV[:\s]*\$\s*([\d,\.]+)/i);
          if (match1) {
            precioUSD = match1[1];
          }

          // Patrón 2: Solo "$ XX.XX"
          if (!precioUSD) {
            const match2 = textoCompleto.match(/\$\s*([\d,\.]+)/);
            if (match2) {
              precioUSD = match2[1];
            }
          }

          // Descripción
          const descripcionEl = item.querySelector('.tp-product-description, .product-description');
          const descripcion = descripcionEl ? descripcionEl.textContent.trim() : nombre;

          // Imagen
          const imagenEl = item.querySelector('.tp-product-image, img');
          const imagenUrl = imagenEl ? (imagenEl.src || imagenEl.dataset.src || '') : '';

          // URL del producto
          const urlEl = item.querySelector('.tp-product-title a');
          const urlProducto = urlEl ? urlEl.href : '';

          if (nombre && nombre.length > 2) {
            resultados.push({
              nombre,
              descripcion,
              sku,
              precioUSD,
              imagenUrl,
              urlProducto,
              index
            });
          }
        } catch (error) {
          console.error('Error procesando producto:', error);
        }
      });

      return resultados;
    });

    console.log(`Encontrados ${productos.length} productos`);

    // Procesar precios
    const productosConPrecio = productos.map(p => {
      let precioBase = 0;
      let precioReal = false;

      if (p.precioUSD) {
        // Convertir USD a PEN (tipo de cambio 3.75)
        const precioNumerico = parseFloat(p.precioUSD.replace(/,/g, ''));
        if (!isNaN(precioNumerico)) {
          precioBase = precioNumerico * 3.75;
          precioReal = true;
          console.log(`  ✓ ${p.nombre}: $${precioNumerico.toFixed(2)} = S/ ${precioBase.toFixed(2)}`);
        }
      }

      if (!precioReal) {
        // Estimar precio
        precioBase = estimarPrecio(p.nombre);
        console.log(`  ⚠ ${p.nombre}: Estimado S/ ${precioBase.toFixed(2)}`);
      }

      const precioConMargen = aplicarMargen(precioBase);

      return {
        nombre: p.nombre,
        descripcion: p.descripcion,
        sku: p.sku,
        precio: precioConMargen,
        precioBase: precioBase,
        precioTexto: `S/ ${precioConMargen.toFixed(2)}`,
        imagenUrl: p.imagenUrl ? normalizarUrl(p.imagenUrl) : null,
        urlProducto: p.urlProducto ? normalizarUrl(p.urlProducto) : null,
        fuente: 'SEGO',
        categoria: 'General',
        precioEstimado: !precioReal
      };
    });

    // Guardar en caché
    if (productosConPrecio.length > 0) {
      cache.set(cacheKey, productosConPrecio);
    }

    return productosConPrecio;
  } catch (error) {
    console.error('Error obteniendo precios reales:', error.message);
    throw error;
  }
};

/**
 * Estimar precio basado en el nombre del producto
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
  return 150;
};

/**
 * Normalizar URL
 */
const normalizarUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return `https://www.sego.com.pe${url}`;
  return `https://www.sego.com.pe/${url}`;
};

/**
 * Cerrar navegador
 */
const cerrarNavegador = async () => {
  try {
    if (browser) {
      await browser.close();
      browser = null;
      context = null;
      paginaSesion = null;
      console.log('Navegador cerrado');
    }
  } catch (error) {
    console.error('Error al cerrar navegador:', error.message);
  }
};

/**
 * Limpiar caché
 */
const limpiarCache = () => {
  cache.flushAll();
  console.log('Caché limpiado');
};

module.exports = {
  obtenerPreciosRealesSego,
  cerrarNavegador,
  limpiarCache
};
