const axios = require('axios');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');
const cheerio = require('cheerio');
const NodeCache = require('node-cache');

// Cache de 1 hora
const cache = new NodeCache({ stdTTL: 3600 });

// Credenciales de Sego
const SEGO_EMAIL = 'Bradatecsrl@gmail.com';
const SEGO_PASSWORD = '20608918371';

// Cliente axios con soporte para cookies
const jar = new CookieJar();
const client = wrapper(axios.create({
  jar,
  withCredentials: true,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
  },
  timeout: 30000
}));

// Variable para controlar si ya se inició sesión
let sesionIniciada = false;

/**
 * Aplicar margen de ganancia al precio
 * Fórmula: precio con IGV + 50%
 */
const aplicarMargen = (precioBase) => {
  if (!precioBase || precioBase === 0) return 0;
  return precioBase * 1.5; // +50%
};

/**
 * Iniciar sesión en Sego
 */
const iniciarSesionSego = async () => {
  try {
    if (sesionIniciada) {
      console.log('Sesión ya iniciada');
      return true;
    }

    console.log('Iniciando sesión en Sego con axios...');

    // Paso 1: Obtener la página de login para obtener el CSRF token
    const loginPageResponse = await client.get('https://www.sego.com.pe/web/login');
    const $ = cheerio.load(loginPageResponse.data);
    const csrfToken = $('input[name="csrf_token"]').val();

    console.log(`CSRF Token: ${csrfToken ? 'Obtenido' : 'No encontrado'}`);

    // Paso 2: Hacer el POST de login
    const loginData = new URLSearchParams({
      'login': SEGO_EMAIL,
      'password': SEGO_PASSWORD,
      'csrf_token': csrfToken || '',
      'redirect': ''
    });

    const loginResponse = await client.post(
      'https://www.sego.com.pe/web/login',
      loginData.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Referer': 'https://www.sego.com.pe/web/login',
          'Origin': 'https://www.sego.com.pe'
        },
        maxRedirects: 5
      }
    );

    // Verificar si el login fue exitoso
    const loginHtml = loginResponse.data;
    const hasLoginForm = loginHtml.includes('name="login"') && loginHtml.includes('name="password"');
    
    if (hasLoginForm) {
      console.log('⚠️ Login falló - aún muestra formulario de login');
      return false;
    }

    console.log('✓ Login exitoso con axios');
    
    // Obtener cookies para debug
    const cookies = await jar.getCookies('https://www.sego.com.pe');
    console.log(`Cookies guardadas: ${cookies.length}`);
    cookies.forEach(cookie => {
      console.log(`  - ${cookie.key}: ${cookie.value.substring(0, 20)}...`);
    });

    sesionIniciada = true;
    return true;
  } catch (error) {
    console.error('Error al iniciar sesión:', error.message);
    return false;
  }
};

/**
 * Buscar productos en Sego con axios
 */
const buscarProductosSegoAxios = async (termino) => {
  try {
    const cacheKey = `sego_axios_${termino.toLowerCase()}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log('Productos obtenidos desde caché');
      return cached;
    }

    console.log(`Buscando "${termino}" en Sego con axios...`);

    // Iniciar sesión si no se ha hecho
    const loginExitoso = await iniciarSesionSego();
    if (!loginExitoso) {
      console.log('⚠️ No se pudo iniciar sesión, usando precios estimados');
    }

    // Hacer la búsqueda
    const urlBusqueda = `https://www.sego.com.pe/shop?search=${encodeURIComponent(termino)}`;
    console.log(`Buscando en: ${urlBusqueda}`);
    
    const response = await client.get(urlBusqueda);
    const $ = cheerio.load(response.data);

    // Verificar si hay precios visibles
    const textoCompleto = $('body').text();
    const hayPrecios = textoCompleto.includes('Precio con IGV') || textoCompleto.includes('$ ');
    console.log(`¿Hay precios visibles?: ${hayPrecios ? 'Sí' : 'No'}`);

    const productos = [];
    const elementosProducto = $('.tp-product-item');

    console.log(`Encontrados ${elementosProducto.length} productos`);

    elementosProducto.each((index, element) => {
      try {
        const $element = $(element);

        // Nombre
        const nombre = $element.find('.tp-product-title a, h6 a').first().text().trim();

        // SKU
        const skuText = $element.find('p strong:contains("SKU:")').parent().text();
        const sku = skuText.replace('SKU:', '').trim() || 'N/A';

        // Precio - buscar "Precio con IGV"
        let precioTexto = '';
        const textoElemento = $element.text();
        
        // Buscar patrón "Precio con IGV: $ XX.XX"
        const matchIGV = textoElemento.match(/Precio con IGV[:\s]*\$?\s*([\d,\.]+)/i);
        if (matchIGV) {
          precioTexto = matchIGV[1];
          console.log(`  Precio encontrado para "${nombre}": $${precioTexto}`);
        } else {
          // Buscar cualquier precio en formato $ XX.XX
          const matchPrecio = textoElemento.match(/\$\s*([\d,\.]+)/);
          if (matchPrecio) {
            precioTexto = matchPrecio[1];
            console.log(`  Precio alternativo para "${nombre}": $${precioTexto}`);
          }
        }

        // Descripción
        const descripcion = $element.find('.tp-product-description, .product-description').first().text().trim() || nombre;

        // Imagen
        let imagenUrl = $element.find('.tp-product-image').first().attr('src') ||
                       $element.find('img').first().attr('src') ||
                       $element.find('img').first().attr('data-src');

        // URL del producto
        const urlProducto = $element.find('.tp-product-title a, a[itemprop="url"]').first().attr('href');

        if (nombre && nombre.length > 2) {
          productos.push({
            nombre,
            descripcion,
            sku,
            precioTexto,
            imagenUrl: imagenUrl ? normalizarUrl(imagenUrl) : null,
            urlProducto: urlProducto ? normalizarUrl(urlProducto) : null
          });
        }
      } catch (error) {
        console.error('Error al procesar producto:', error);
      }
    });

    // Procesar precios y aplicar margen
    const productosConPrecio = productos.map(p => {
      let precioBase = extraerPrecio(p.precioTexto);

      // Si encontramos precio, es en dólares, convertir a soles
      if (precioBase > 0) {
        precioBase = precioBase * 3.75; // Convertir USD a PEN
        console.log(`  Precio real: $${(precioBase / 3.75).toFixed(2)} USD = S/ ${precioBase.toFixed(2)} PEN`);
      } else {
        // Si no se encontró precio, estimar
        precioBase = estimarPrecio(p.nombre);
        console.log(`  Precio estimado: S/ ${precioBase.toFixed(2)}`);
      }

      const precioConMargen = aplicarMargen(precioBase);

      return {
        nombre: p.nombre,
        descripcion: p.descripcion,
        sku: p.sku,
        precio: precioConMargen,
        precioBase: precioBase,
        precioTexto: `S/ ${precioConMargen.toFixed(2)}`,
        imagenUrl: p.imagenUrl,
        urlProducto: p.urlProducto,
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
    console.error('Error al buscar productos con axios:', error.message);
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
 * Limpiar caché
 */
const limpiarCache = () => {
  cache.flushAll();
  sesionIniciada = false;
  console.log('Caché limpiado y sesión reiniciada');
};

module.exports = {
  buscarProductosSegoAxios,
  limpiarCache
};
