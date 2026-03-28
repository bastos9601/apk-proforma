const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Servicio de scraping para Sego
 */

// Credenciales de Sego desde variables de entorno
const SEGO_USER = process.env.SEGO_USER;
const SEGO_PASS = process.env.SEGO_PASS;

let sessionCookies = null;
let sessionExpiry = null;

/**
 * Iniciar sesión en Sego y obtener cookies
 */
async function iniciarSesionSego() {
  try {
    console.log('Iniciando sesión en Sego...');
    
    const response = await axios.post('https://www.sego.com.pe/web/login', {
      login: SEGO_USER,
      password: SEGO_PASS,
      redirect: '/'
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      maxRedirects: 5,
      withCredentials: true
    });

    // Guardar cookies de sesión
    if (response.headers['set-cookie']) {
      sessionCookies = response.headers['set-cookie'];
      sessionExpiry = Date.now() + (30 * 60 * 1000); // 30 minutos
      console.log('Sesión iniciada exitosamente');
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error al iniciar sesión en Sego:', error.message);
    return false;
  }
}

/**
 * Verificar si la sesión está activa
 */
function sesionActiva() {
  return sessionCookies && sessionExpiry && Date.now() < sessionExpiry;
}

/**
 * Buscar productos en Sego
 */
async function buscarProductos(termino) {
  try {
    // Verificar sesión
    if (!sesionActiva()) {
      const loginExitoso = await iniciarSesionSego();
      if (!loginExitoso) {
        throw new Error('No se pudo iniciar sesión en Sego');
      }
    }

    console.log(`Buscando productos: ${termino}`);

    // Hacer búsqueda en Sego
    const response = await axios.get(`https://www.sego.com.pe/shop`, {
      params: {
        search: termino
      },
      headers: {
        'Cookie': sessionCookies ? sessionCookies.join('; ') : '',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    // Parsear HTML con Cheerio
    const $ = cheerio.load(response.data);
    const productos = [];

    // Buscar productos en la página
    $('.tp-product-item, .product-item, .oe_product').each((index, element) => {
      try {
        const $item = $(element);
        
        // Extraer información del producto
        const nombre = $item.find('.tp-product-title, .product-title, h6 a').first().text().trim();
        const textoCompleto = $item.text();
        
        // Extraer SKU
        const skuMatch = textoCompleto.match(/SKU[:\s]*([A-Z0-9\-]+)/i);
        const sku = skuMatch ? skuMatch[1] : '';
        
        // Extraer precio (buscar "Precio con IGV: $ XX.XX" o similar)
        let precio = 0;
        const precioIGVMatch = textoCompleto.match(/Precio\s+con\s+IGV[:\s]*\$\s*([\d,\.]+)/i);
        if (precioIGVMatch) {
          precio = parseFloat(precioIGVMatch[1].replace(/,/g, ''));
        } else {
          // Buscar cualquier precio con $
          const precioMatch = textoCompleto.match(/\$\s*([\d,\.]+)/);
          if (precioMatch) {
            precio = parseFloat(precioMatch[1].replace(/,/g, ''));
          }
        }
        
        // Extraer imagen
        const imagen = $item.find('img').first().attr('src') || '';
        let imagenUrl = '';
        if (imagen) {
          imagenUrl = imagen.startsWith('http') ? imagen : `https://www.sego.com.pe${imagen}`;
        }
        
        // Solo agregar si tiene nombre y precio válido
        if (nombre && precio > 0) {
          productos.push({
            id: index,
            nombre,
            sku,
            precioUSD: precio,
            imagenUrl
          });
        }
      } catch (error) {
        console.error('Error procesando producto:', error.message);
      }
    });

    console.log(`Productos encontrados: ${productos.length}`);
    return productos;

  } catch (error) {
    console.error('Error al buscar productos:', error.message);
    throw error;
  }
}

/**
 * Obtener detalles de un producto específico
 */
async function obtenerDetalleProducto(url) {
  try {
    if (!sesionActiva()) {
      await iniciarSesionSego();
    }

    const response = await axios.get(url, {
      headers: {
        'Cookie': sessionCookies ? sessionCookies.join('; ') : '',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    
    // Extraer información detallada
    const nombre = $('#product_detail h1, .product-title').first().text().trim();
    const descripcion = $('.product-description, #product_description').first().text().trim();
    const precioTexto = $('body').text();
    const precioMatch = precioTexto.match(/\$\s*([\d,\.]+)/);
    const precio = precioMatch ? parseFloat(precioMatch[1].replace(/,/g, '')) : 0;
    
    return {
      nombre,
      descripcion,
      precioUSD: precio
    };

  } catch (error) {
    console.error('Error al obtener detalle del producto:', error.message);
    throw error;
  }
}

module.exports = {
  buscarProductos,
  obtenerDetalleProducto,
  iniciarSesionSego
};
