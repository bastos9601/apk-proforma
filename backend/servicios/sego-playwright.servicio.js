const { chromium } = require('playwright-core');
const NodeCache = require('node-cache');

// Cache de 1 hora
const cache = new NodeCache({ stdTTL: 3600 });

// Credenciales de Sego
const SEGO_EMAIL = 'Bradatecsrl@gmail.com';
const SEGO_PASSWORD = '20608918371';

// Variable para almacenar el navegador
let browser = null;
let context = null;

/**
 * Aplicar margen de ganancia al precio
 * Fórmula: precio con IGV + 50%
 */
const aplicarMargen = (precioBase) => {
  if (!precioBase || precioBase === 0) return 0;
  return precioBase * 1.5; // +50%
};

/**
 * Iniciar navegador y sesión en Sego
 */
const iniciarNavegador = async () => {
  try {
    if (browser && context) {
      console.log('Usando navegador existente');
      return context;
    }

    console.log('Iniciando navegador Chromium...');
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      acceptDownloads: false,
      ignoreHTTPSErrors: true
    });

    const page = await context.newPage();

    console.log('Navegando a Sego...');
    await page.goto('https://www.sego.com.pe/web/login', { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Esperar a que el formulario esté visible
    await page.waitForSelector('input[name="login"]', { timeout: 10000 });

    console.log('Iniciando sesión...');
    // Llenar formulario de login
    await page.fill('input[name="login"]', SEGO_EMAIL);
    await page.fill('input[name="password"]', SEGO_PASSWORD);

    // Click en el botón de login y esperar navegación
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 }),
      page.click('button[type="submit"]')
    ]);

    // Verificar si el login fue exitoso
    const url = page.url();
    if (url.includes('/web/login')) {
      console.log('⚠️ Login falló, verificar credenciales');
    } else {
      console.log('✓ Login exitoso - URL:', url);
      
      // Guardar cookies para debug
      const cookies = await context.cookies();
      console.log(`Cookies guardadas: ${cookies.length}`);
    }

    await page.close();

    console.log('Navegador iniciado y sesión establecida');
    return context;
  } catch (error) {
    console.error('Error al iniciar navegador:', error.message);
    throw error;
  }
};

/**
 * Buscar productos en Sego con Playwright
 */
const buscarProductosSegoPlaywright = async (termino) => {
  try {
    const cacheKey = `sego_pw_${termino.toLowerCase()}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log('Productos obtenidos desde caché');
      return cached;
    }

    console.log(`Buscando "${termino}" en Sego con Playwright...`);

    // Iniciar navegador y sesión
    const ctx = await iniciarNavegador();
    const page = await ctx.newPage();

    // Navegar a la búsqueda
    const urlBusqueda = `https://www.sego.com.pe/shop?search=${encodeURIComponent(termino)}`;
    console.log(`Navegando a: ${urlBusqueda}`);
    await page.goto(urlBusqueda, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Esperar a que los productos carguen
    await page.waitForSelector('.tp-product-item', { timeout: 10000 }).catch(() => {
      console.log('No se encontraron productos con .tp-product-item');
    });

    // Esperar un poco más para que los precios carguen
    await page.waitForTimeout(2000);

    // Debug: verificar si hay precios visibles
    const hayPrecios = await page.evaluate(() => {
      const texto = document.body.textContent;
      return texto.includes('Precio con IGV') || texto.includes('$ ');
    });
    
    console.log(`¿Hay precios visibles?: ${hayPrecios ? 'Sí' : 'No'}`);
    
    if (!hayPrecios) {
      console.log('⚠️ No se detectaron precios, la sesión puede no estar activa');
    }

    // Extraer productos
    const productos = await page.evaluate(() => {
      const items = document.querySelectorAll('.tp-product-item');
      const resultados = [];

      items.forEach((item) => {
        try {
          // Nombre
          const nombreEl = item.querySelector('.tp-product-title a, h6 a');
          const nombre = nombreEl ? nombreEl.textContent.trim() : '';

          // SKU
          const skuEl = item.querySelector('p strong');
          let sku = 'N/A';
          if (skuEl && skuEl.textContent.includes('SKU:')) {
            sku = skuEl.parentElement.textContent.replace('SKU:', '').trim();
          }

          // Precio - buscar "Precio con IGV"
          let precioTexto = '';
          let precioConIGV = '';
          
          // Buscar el texto "Precio con IGV:"
          const textoCompleto = item.textContent;
          const matchIGV = textoCompleto.match(/Precio con IGV[:\s]*\$?\s*([\d,\.]+)/i);
          
          if (matchIGV) {
            precioConIGV = matchIGV[1];
            precioTexto = precioConIGV;
          } else {
            // Si no encuentra "Precio con IGV", buscar cualquier precio
            const selectoresPrecio = [
              '.product_price',
              '.oe_currency_value',
              '[itemprop="price"]',
              '.tp-product-price',
              '.price'
            ];

            for (const selector of selectoresPrecio) {
              const precioEl = item.querySelector(selector);
              if (precioEl && precioEl.textContent.trim()) {
                precioTexto = precioEl.textContent.trim();
                break;
              }
            }
          }

          // Descripción
          const descripcionEl = item.querySelector('.tp-product-description, .product-description');
          const descripcion = descripcionEl ? descripcionEl.textContent.trim() : nombre;

          // Imagen
          const imagenEl = item.querySelector('.tp-product-image, img');
          const imagenUrl = imagenEl ? (imagenEl.src || imagenEl.dataset.src || '') : '';

          // URL del producto
          const urlEl = item.querySelector('.tp-product-title a, a[itemprop="url"]');
          const urlProducto = urlEl ? urlEl.href : '';

          if (nombre && nombre.length > 2) {
            resultados.push({
              nombre,
              descripcion: descripcion || nombre,
              sku,
              precioTexto,
              precioConIGV,
              imagenUrl,
              urlProducto
            });
          }
        } catch (error) {
          console.error('Error al procesar producto:', error);
        }
      });

      return resultados;
    });

    await page.close();

    console.log(`Encontrados ${productos.length} productos`);

    // Procesar precios y aplicar margen
    const productosConPrecio = productos.map(p => {
      let precioBase = extraerPrecio(p.precioTexto);

      // Si encontramos precio, ya está en soles (no convertir)
      if (precioBase > 0) {
        console.log(`Precio real encontrado para "${p.nombre}": S/ ${precioBase.toFixed(2)}`);
      } else {
        // Si no se encontró precio, estimar
        precioBase = estimarPrecio(p.nombre);
        console.log(`Precio estimado para "${p.nombre}": S/ ${precioBase.toFixed(2)}`);
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
        precioEstimado: extraerPrecio(p.precioTexto) === 0
      };
    });

    // Guardar en caché
    if (productosConPrecio.length > 0) {
      cache.set(cacheKey, productosConPrecio);
    }

    return productosConPrecio;
  } catch (error) {
    console.error('Error al buscar productos con Playwright:', error.message);
    throw error;
  }
};

/**
 * Extraer precio numérico de un texto
 */
const extraerPrecio = (precioTexto) => {
  if (!precioTexto || precioTexto === 'Consultar precio') return 0;
  
  // Eliminar texto no numérico excepto números, puntos y comas
  let precioLimpio = precioTexto
    .replace(/[^\d,\.]/g, '')
    .trim();
  
  // Eliminar comas de miles
  precioLimpio = precioLimpio.replace(/,/g, '');
  
  const precio = parseFloat(precioLimpio);
  return isNaN(precio) ? 0 : precio;
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
  if (nombreLower.includes('disco') || nombreLower.includes('hdd')) return 250;
  if (nombreLower.includes('fuente') || nombreLower.includes('power')) return 45;
  if (nombreLower.includes('cable')) return 35;
  if (nombreLower.includes('conector') || nombreLower.includes('balun')) return 15;
  
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
  buscarProductosSegoPlaywright,
  cerrarNavegador,
  limpiarCache
};
