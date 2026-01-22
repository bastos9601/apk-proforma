const axios = require('axios');
const cheerio = require('cheerio');
const NodeCache = require('node-cache');

// Cache de 1 hora para no hacer muchas peticiones
const cache = new NodeCache({ stdTTL: 3600 });

// Credenciales de Sego
const SEGO_EMAIL = 'Bradatecsrl@gmail.com';
const SEGO_PASSWORD = '20608918371';

// Variable para almacenar la sesión
let segoSession = null;

// Cargar supabase solo si está disponible
let supabase = null;
try {
  supabase = require('../configuracion/supabase');
} catch (error) {
  console.log('Supabase no disponible, usando solo precios estimados');
}

/**
 * Obtener precio almacenado de Sego desde la base de datos
 * @param {string} sku - SKU del producto
 * @param {string} usuarioId - ID del usuario
 * @returns {Promise<number|null>} Precio almacenado o null
 */
const obtenerPrecioAlmacenado = async (sku, usuarioId) => {
  try {
    if (!supabase || !sku || sku === 'N/A') return null;
    
    const { data, error } = await supabase
      .from('precios_sego')
      .select('precio_venta')
      .eq('sku', sku)
      .eq('usuario_id', usuarioId)
      .single();
    
    if (error || !data) return null;
    
    return parseFloat(data.precio_venta);
  } catch (error) {
    return null;
  }
};

/**
 * Estimar precio basado en el nombre del producto
 * Esta es una función temporal hasta que se ingresen precios reales
 * @param {string} nombre - Nombre del producto
 * @returns {number} Precio estimado
 */
const estimarPrecio = (nombre) => {
  const nombreLower = nombre.toLowerCase();
  
  // Precios base estimados según tipo de producto
  if (nombreLower.includes('nvr') || nombreLower.includes('dvr')) {
    return 450; // NVR/DVR promedio
  }
  if (nombreLower.includes('8mp') || nombreLower.includes('4k')) {
    return 280; // Cámaras 8MP
  }
  if (nombreLower.includes('5mp') || nombreLower.includes('6mp')) {
    return 200; // Cámaras 5-6MP
  }
  if (nombreLower.includes('4mp')) {
    return 150; // Cámaras 4MP
  }
  if (nombreLower.includes('2mp') || nombreLower.includes('1080p')) {
    return 120; // Cámaras 2MP/1080p
  }
  if (nombreLower.includes('ptz') || nombreLower.includes(' pt ')) {
    return 350; // Cámaras PTZ
  }
  if (nombreLower.includes('wifi')) {
    return 180; // Cámaras WiFi
  }
  if (nombreLower.includes('disco') || nombreLower.includes('hdd')) {
    return 250; // Discos duros
  }
  if (nombreLower.includes('fuente') || nombreLower.includes('power')) {
    return 45; // Fuentes de poder
  }
  if (nombreLower.includes('cable')) {
    return 35; // Cables
  }
  if (nombreLower.includes('conector') || nombreLower.includes('balun')) {
    return 15; // Conectores
  }
  
  // Precio por defecto
  return 150;
};

/**
 * Scraper para extraer productos de SEGO
 * ADVERTENCIA: Usar solo con permiso de SEGO
 */

/**
 * Iniciar sesión en Sego
 * @returns {Promise<Object>} Objeto con cookies de sesión
 */
const iniciarSesionSego = async () => {
  try {
    // Si ya tenemos sesión, retornarla
    if (segoSession) {
      console.log('Usando sesión existente de Sego');
      return segoSession;
    }

    console.log('Iniciando sesión en Sego...');

    // Crear un jar de cookies para mantener la sesión
    const cookieJar = [];
    
    // Función helper para extraer y guardar cookies
    const guardarCookies = (headers) => {
      const setCookies = headers['set-cookie'];
      if (setCookies) {
        setCookies.forEach(cookie => {
          const cookieParts = cookie.split(';')[0];
          const [name, value] = cookieParts.split('=');
          // Actualizar o agregar cookie
          const index = cookieJar.findIndex(c => c.name === name);
          if (index >= 0) {
            cookieJar[index] = { name, value };
          } else {
            cookieJar.push({ name, value });
          }
        });
      }
    };
    
    // Función helper para obtener string de cookies
    const obtenerCookieString = () => {
      return cookieJar.map(c => `${c.name}=${c.value}`).join('; ');
    };

    // Paso 1: Obtener la página de login para obtener cookies iniciales y CSRF token
    console.log('Paso 1: Obteniendo página de login...');
    const loginPageResponse = await axios.get('https://www.sego.com.pe/web/login', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      },
      timeout: 15000,
      maxRedirects: 5
    });
    
    guardarCookies(loginPageResponse.headers);
    
    const $ = cheerio.load(loginPageResponse.data);
    const csrfToken = $('input[name="csrf_token"]').val();
    
    console.log(`CSRF Token encontrado: ${csrfToken ? 'Sí' : 'No'}`);
    console.log(`Cookies iniciales: ${cookieJar.length}`);

    // Paso 2: Hacer el POST de login
    console.log('Paso 2: Enviando credenciales...');
    const loginData = new URLSearchParams({
      'login': SEGO_EMAIL,
      'password': SEGO_PASSWORD,
      'csrf_token': csrfToken || '',
      'redirect': ''
    });

    const loginResponse = await axios.post('https://www.sego.com.pe/web/login', loginData.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': obtenerCookieString(),
        'Referer': 'https://www.sego.com.pe/web/login',
        'Origin': 'https://www.sego.com.pe'
      },
      timeout: 15000,
      maxRedirects: 5,
      validateStatus: (status) => status >= 200 && status < 400
    });
    
    guardarCookies(loginResponse.headers);
    
    console.log(`Cookies después del login: ${cookieJar.length}`);
    console.log(`Status del login: ${loginResponse.status}`);

    // Verificar si el login fue exitoso buscando indicadores en la respuesta
    const $response = cheerio.load(loginResponse.data);
    const hasLoginForm = $response('form[action*="/web/login"]').length > 0;
    const hasUserMenu = $response('.o_user_menu, .o_portal_user_menu').length > 0;
    
    if (hasLoginForm && !hasUserMenu) {
      console.log('⚠️ Advertencia: Parece que el login no fue exitoso');
    } else {
      console.log('✓ Login parece exitoso');
    }

    segoSession = {
      cookies: obtenerCookieString(),
      cookieJar: cookieJar
    };

    console.log('Sesión iniciada en Sego');
    return segoSession;
  } catch (error) {
    console.error('Error al iniciar sesión en Sego:', error.message);
    // Continuar sin sesión, los precios no estarán disponibles
    return null;
  }
};

/**
 * Aplicar margen de ganancia al precio
 * Fórmula: precio con IGV + 50%
 * @param {number} precioBase - Precio base con IGV
 * @returns {number} Precio con margen aplicado
 */
const aplicarMargen = (precioBase) => {
  if (!precioBase || precioBase === 0) return 0;
  return precioBase * 1.5; // +50%
};

/**
 * Obtener productos de una categoría de SEGO
 * @param {string} url - URL de la página de productos
 * @returns {Promise<Array>} Lista de productos
 */
const obtenerProductosSego = async (url = 'https://www.sego.com.pe/shop') => {
  try {
    // Verificar si está en caché
    const cacheKey = `sego_productos_${url}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log('Productos obtenidos desde caché');
      return cached;
    }

    console.log('Haciendo scraping de:', url);

    // Iniciar sesión para obtener precios
    const session = await iniciarSesionSego();

    // Configurar headers con cookies de sesión
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
    };

    if (session && session.cookies) {
      headers['Cookie'] = session.cookies;
    }

    // Hacer petición HTTP
    const response = await axios.get(url, {
      headers,
      timeout: 10000
    });

    // Cargar HTML con Cheerio
    const $ = cheerio.load(response.data);
    const productos = [];

    // Selectores específicos para SEGO (Odoo eCommerce)
    console.log('Buscando productos en SEGO...');
    
    // SEGO usa .tp-product-item para cada producto
    const elementosProducto = $('.tp-product-item');
    
    if (elementosProducto.length > 0) {
      console.log(`Encontrados ${elementosProducto.length} productos con selector: .tp-product-item`);

      elementosProducto.each((index, element) => {
        try {
          const $element = $(element);
          
          // Nombre del producto
          const nombre = $element.find('.tp-product-title a').first().text().trim() ||
                        $element.find('h6 a').first().text().trim();
          
          // SKU
          const sku = $element.find('p strong:contains("SKU:")').parent().text().replace('SKU:', '').trim();
          
          // Precio - intentar múltiples selectores
          let precioTexto = '';
          
          // Intentar diferentes selectores para el precio
          const selectoresPrecio = [
            '.product_price',
            '.oe_currency_value',
            '[itemprop="price"]',
            '.tp-product-price',
            '.price',
            'span.oe_price',
            'b.oe_price',
            '.product-price',
            'span[data-oe-type="monetary"]'
          ];
          
          for (const selector of selectoresPrecio) {
            const precio = $element.find(selector).first().text().trim();
            if (precio && precio !== '' && !precio.toLowerCase().includes('consultar')) {
              precioTexto = precio;
              break;
            }
          }
          
          // Si no se encontró precio, buscar cualquier texto que parezca un precio
          if (!precioTexto) {
            const todoTexto = $element.text();
            const matchPrecio = todoTexto.match(/S\/?\s*\.?\s*(\d{1,3}(?:[,\.]\d{3})*(?:[,\.]\d{2})?)/);
            if (matchPrecio) {
              precioTexto = matchPrecio[0];
            } else {
              precioTexto = 'Consultar precio';
            }
          }
          
          if (index < 3) {
            console.log(`Producto ${index + 1}: ${nombre}`);
            console.log(`  Precio encontrado: "${precioTexto}"`);
          }
          
          // Descripción (usar el nombre si no hay descripción)
          const descripcion = $element.find('.tp-product-description, .product-description').first().text().trim() ||
                             nombre;
          
          // Imagen
          let imagenUrl = $element.find('.tp-product-image').first().attr('src') ||
                         $element.find('img').first().attr('src') ||
                         $element.find('img').first().attr('data-src');
          
          // URL del producto
          const urlProducto = $element.find('.tp-product-title a, a[itemprop="url"]').first().attr('href');
          
          // Solo agregar si tiene al menos nombre
          if (nombre && nombre.length > 2) {
            let precioBase = extraerPrecio(precioTexto);
            
            // Si no se encontró precio, estimar basado en el nombre del producto
            if (precioBase === 0) {
              precioBase = estimarPrecio(nombre);
              console.log(`  Precio estimado para "${nombre}": S/ ${precioBase.toFixed(2)}`);
            }
            
            const precioConMargen = aplicarMargen(precioBase);
            
            productos.push({
              nombre: nombre,
              descripcion: descripcion || nombre,
              sku: sku || 'N/A',
              precio: precioConMargen, // Precio con margen del 50%
              precioBase: precioBase, // Precio original de Sego
              precioTexto: `S/ ${precioConMargen.toFixed(2)}`,
              imagenUrl: imagenUrl ? normalizarUrl(imagenUrl, url) : null,
              urlProducto: urlProducto ? normalizarUrl(urlProducto, url) : null,
              fuente: 'SEGO',
              categoria: 'General',
              precioEstimado: extraerPrecio(precioTexto) === 0 // Indicar si es estimado
            });
          }
        } catch (error) {
          console.error('Error al procesar producto:', error);
        }
      });
    } else {
      console.log('No se encontraron productos con .tp-product-item');
      console.log('Intentando selectores alternativos...');
      
      // Intentar otros selectores comunes
      const selectoresAlternativos = [
        '[data-product-template-id]',
        '.product',
        '.product-item',
        '[itemtype="http://schema.org/Product"]'
      ];
      
      for (const selector of selectoresAlternativos) {
        const elementos = $(selector);
        if (elementos.length > 0) {
          console.log(`Encontrados ${elementos.length} productos con selector: ${selector}`);
          break;
        }
      }
    }

    console.log(`Productos extraídos: ${productos.length}`);

    // Guardar en caché
    if (productos.length > 0) {
      cache.set(cacheKey, productos);
    }

    return productos;
  } catch (error) {
    console.error('Error en scraping de SEGO:', error.message);
    throw new Error('No se pudo obtener productos de SEGO: ' + error.message);
  }
};

/**
 * Buscar productos por término
 * @param {string} termino - Término de búsqueda
 * @returns {Promise<Array>} Productos filtrados
 */
const buscarProductosSego = async (termino) => {
  try {
    // Construir URL de búsqueda de SEGO
    const urlBusqueda = `https://www.sego.com.pe/shop?search=${encodeURIComponent(termino)}`;
    
    console.log(`Buscando "${termino}" en SEGO:`, urlBusqueda);
    
    // Verificar si está en caché
    const cacheKey = `sego_busqueda_${termino.toLowerCase()}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log('Resultados obtenidos desde caché');
      return cached;
    }

    // Iniciar sesión para obtener precios
    const session = await iniciarSesionSego();

    // Configurar headers con cookies de sesión
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
    };

    if (session && session.cookies) {
      headers['Cookie'] = session.cookies;
    }

    // Hacer petición HTTP con el término de búsqueda
    const response = await axios.get(urlBusqueda, {
      headers,
      timeout: 10000
    });

    // Cargar HTML con Cheerio
    const $ = cheerio.load(response.data);
    const productos = [];

    console.log('Buscando productos en resultados de búsqueda...');
    
    // SEGO usa .tp-product-item para cada producto
    const elementosProducto = $('.tp-product-item');
    
    if (elementosProducto.length > 0) {
      console.log(`Encontrados ${elementosProducto.length} productos`);

      elementosProducto.each((index, element) => {
        try {
          const $element = $(element);
          
          // Nombre del producto
          const nombre = $element.find('.tp-product-title a').first().text().trim() ||
                        $element.find('h6 a').first().text().trim();
          
          // SKU
          const sku = $element.find('p strong:contains("SKU:")').parent().text().replace('SKU:', '').trim();
          
          // Precio - intentar múltiples selectores
          let precioTexto = '';
          
          // Intentar diferentes selectores para el precio
          const selectoresPrecio = [
            '.product_price',
            '.oe_currency_value',
            '[itemprop="price"]',
            '.tp-product-price',
            '.price',
            'span.oe_price',
            'b.oe_price',
            '.product-price',
            'span[data-oe-type="monetary"]'
          ];
          
          for (const selector of selectoresPrecio) {
            const precio = $element.find(selector).first().text().trim();
            if (precio && precio !== '' && !precio.toLowerCase().includes('consultar')) {
              precioTexto = precio;
              break;
            }
          }
          
          // Si no se encontró precio, buscar cualquier texto que parezca un precio
          if (!precioTexto) {
            const todoTexto = $element.text();
            const matchPrecio = todoTexto.match(/S\/?\s*\.?\s*(\d{1,3}(?:[,\.]\d{3})*(?:[,\.]\d{2})?)/);
            if (matchPrecio) {
              precioTexto = matchPrecio[0];
            } else {
              precioTexto = 'Consultar precio';
            }
          }
          
          if (index < 3) {
            console.log(`Producto búsqueda ${index + 1}: ${nombre}`);
            console.log(`  Precio encontrado: "${precioTexto}"`);
          }
          
          // Descripción (usar el nombre si no hay descripción)
          const descripcion = $element.find('.tp-product-description, .product-description').first().text().trim() ||
                             nombre;
          
          // Imagen
          let imagenUrl = $element.find('.tp-product-image').first().attr('src') ||
                         $element.find('img').first().attr('src') ||
                         $element.find('img').first().attr('data-src');
          
          // URL del producto
          const urlProducto = $element.find('.tp-product-title a, a[itemprop="url"]').first().attr('href');
          
          // Solo agregar si tiene al menos nombre
          if (nombre && nombre.length > 2) {
            let precioBase = extraerPrecio(precioTexto);
            
            // Si no se encontró precio, estimar basado en el nombre del producto
            if (precioBase === 0) {
              precioBase = estimarPrecio(nombre);
              console.log(`  Precio estimado para "${nombre}": S/ ${precioBase.toFixed(2)}`);
            }
            
            const precioConMargen = aplicarMargen(precioBase);
            
            productos.push({
              nombre: nombre,
              descripcion: descripcion || nombre,
              sku: sku || 'N/A',
              precio: precioConMargen, // Precio con margen del 50%
              precioBase: precioBase, // Precio original de Sego
              precioTexto: `S/ ${precioConMargen.toFixed(2)}`,
              imagenUrl: imagenUrl ? normalizarUrl(imagenUrl, urlBusqueda) : null,
              urlProducto: urlProducto ? normalizarUrl(urlProducto, urlBusqueda) : null,
              fuente: 'SEGO',
              categoria: 'General',
              precioEstimado: extraerPrecio(precioTexto) === 0 // Indicar si es estimado
            });
          }
        } catch (error) {
          console.error('Error al procesar producto:', error);
        }
      });
    } else {
      console.log('No se encontraron productos en los resultados de búsqueda');
    }

    console.log(`Productos encontrados: ${productos.length}`);

    // Guardar en caché
    if (productos.length > 0) {
      cache.set(cacheKey, productos);
    }

    return productos;
  } catch (error) {
    console.error('Error al buscar productos:', error.message);
    throw new Error('No se pudo buscar productos en SEGO: ' + error.message);
  }
};

/**
 * Obtener producto específico por nombre
 * @param {string} nombre - Nombre del producto
 * @returns {Promise<Object>} Producto encontrado
 */
const obtenerProductoPorNombre = async (nombre) => {
  try {
    const productos = await obtenerProductosSego();
    const producto = productos.find(p => 
      p.nombre.toLowerCase() === nombre.toLowerCase()
    );
    
    if (!producto) {
      throw new Error('Producto no encontrado');
    }
    
    return producto;
  } catch (error) {
    console.error('Error al obtener producto:', error);
    throw error;
  }
};

/**
 * Extraer precio numérico de un texto
 * @param {string} precioTexto - Texto con el precio
 * @returns {number} Precio numérico
 */
const extraerPrecio = (precioTexto) => {
  if (!precioTexto || precioTexto === 'Consultar precio') return 0;
  
  console.log(`  Extrayendo precio de: "${precioTexto}"`);
  
  // Eliminar texto no numérico excepto números, puntos y comas
  let precioLimpio = precioTexto
    .replace(/[^\d,\.]/g, '') // Mantener solo dígitos, comas y puntos
    .trim();
  
  console.log(`  Precio limpio: "${precioLimpio}"`);
  
  // Si tiene formato peruano (ej: 1,234.56 o 1234.56)
  // Eliminar comas de miles
  precioLimpio = precioLimpio.replace(/,/g, '');
  
  const precio = parseFloat(precioLimpio);
  const resultado = isNaN(precio) ? 0 : precio;
  
  console.log(`  Precio final: ${resultado}`);
  
  return resultado;
};

/**
 * Normalizar URL de imagen
 * @param {string} imagenUrl - URL de la imagen
 * @param {string} baseUrl - URL base del sitio
 * @returns {string} URL normalizada
 */
const normalizarUrl = (imagenUrl, baseUrl) => {
  if (!imagenUrl) return null;
  
  // Si ya es una URL completa
  if (imagenUrl.startsWith('http')) {
    return imagenUrl;
  }
  
  // Si es una URL relativa
  const base = new URL(baseUrl);
  if (imagenUrl.startsWith('/')) {
    return `${base.protocol}//${base.host}${imagenUrl}`;
  }
  
  return `${base.protocol}//${base.host}/${imagenUrl}`;
};

/**
 * Limpiar caché
 */
const limpiarCache = () => {
  cache.flushAll();
  console.log('Caché limpiado');
};

module.exports = {
  obtenerProductosSego,
  buscarProductosSego,
  obtenerProductoPorNombre,
  limpiarCache
};
