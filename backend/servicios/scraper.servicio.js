const axios = require('axios');
const cheerio = require('cheerio');
const NodeCache = require('node-cache');

// Cache de 1 hora para no hacer muchas peticiones
const cache = new NodeCache({ stdTTL: 3600 });

/**
 * Scraper para extraer productos de SEGO
 * ADVERTENCIA: Usar solo con permiso de SEGO
 */

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

    // Hacer petición HTTP
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      },
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
          
          // Precio (puede estar oculto si requiere login)
          const precioTexto = $element.find('.product_price, .oe_currency_value, [itemprop="price"]').first().text().trim() ||
                             'Consultar precio';
          
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
            productos.push({
              nombre: nombre,
              descripcion: descripcion || nombre,
              sku: sku || 'N/A',
              precio: extraerPrecio(precioTexto),
              precioTexto: precioTexto,
              imagenUrl: imagenUrl ? normalizarUrl(imagenUrl, url) : null,
              urlProducto: urlProducto ? normalizarUrl(urlProducto, url) : null,
              fuente: 'SEGO',
              categoria: 'General'
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

    // Hacer petición HTTP con el término de búsqueda
    const response = await axios.get(urlBusqueda, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      },
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
          
          // Precio (puede estar oculto si requiere login)
          const precioTexto = $element.find('.product_price, .oe_currency_value, [itemprop="price"]').first().text().trim() ||
                             'Consultar precio';
          
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
            productos.push({
              nombre: nombre,
              descripcion: descripcion || nombre,
              sku: sku || 'N/A',
              precio: extraerPrecio(precioTexto),
              precioTexto: precioTexto,
              imagenUrl: imagenUrl ? normalizarUrl(imagenUrl, urlBusqueda) : null,
              urlProducto: urlProducto ? normalizarUrl(urlProducto, urlBusqueda) : null,
              fuente: 'SEGO',
              categoria: 'General'
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
  if (!precioTexto) return 0;
  
  // Eliminar símbolos de moneda y espacios
  const precioLimpio = precioTexto
    .replace(/[S\/\.\s]/g, '')
    .replace(',', '.');
  
  const precio = parseFloat(precioLimpio);
  return isNaN(precio) ? 0 : precio;
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
