const axios = require('axios');
const cheerio = require('cheerio');

// Credenciales de Sego (configurar en Netlify Environment Variables)
const SEGO_USER = process.env.SEGO_USER || 'Bradatecsrl@gmail.com';
const SEGO_PASS = process.env.SEGO_PASS || '20608918371';

let sessionCookies = null;
let sessionExpiry = null;

/**
 * Iniciar sesión en Sego
 */
async function iniciarSesionSego() {
  try {
    console.log('Iniciando sesión en Sego...');
    
    const response = await axios.post('https://www.sego.com.pe/web/login', 
      `login=${encodeURIComponent(SEGO_USER)}&password=${encodeURIComponent(SEGO_PASS)}&redirect=/`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        maxRedirects: 5
      }
    );

    if (response.headers['set-cookie']) {
      sessionCookies = response.headers['set-cookie'];
      sessionExpiry = Date.now() + (30 * 60 * 1000);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error al iniciar sesión:', error.message);
    return false;
  }
}

/**
 * Buscar productos en Sego
 */
async function buscarProductos(termino) {
  try {
    // Verificar sesión
    if (!sessionCookies || !sessionExpiry || Date.now() >= sessionExpiry) {
      await iniciarSesionSego();
    }

    console.log(`Buscando: ${termino}`);

    const response = await axios.get('https://www.sego.com.pe/shop', {
      params: { search: termino },
      headers: {
        'Cookie': sessionCookies ? sessionCookies.join('; ') : '',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const productos = [];

    // Buscar productos con múltiples selectores
    const selectores = [
      '.oe_product',
      '.o_wsale_product_grid_wrapper',
      '.tp-product-item',
      '.product-item',
      'div[itemtype="http://schema.org/Product"]'
    ];

    selectores.forEach(selector => {
      $(selector).each((index, element) => {
        try {
          const $item = $(element);
          
          // Extraer nombre del producto
          const nombre = $item.find('h6 a, .o_wsale_product_name, .tp-product-title, .product-title').first().text().trim();
          
          if (!nombre) return; // Si no hay nombre, saltar
          
          const textoCompleto = $item.text();
          
          // Extraer SKU
          const skuMatch = textoCompleto.match(/SKU[:\s]*([A-Z0-9\-]+)/i) || 
                          textoCompleto.match(/Código[:\s]*([A-Z0-9\-]+)/i);
          const sku = skuMatch ? skuMatch[1] : '';
          
          // Extraer precio (buscar múltiples formatos)
          let precio = 0;
          
          // Intentar encontrar precio con IGV
          const precioIGVMatch = textoCompleto.match(/Precio\s+con\s+IGV[:\s]*\$\s*([\d,\.]+)/i);
          if (precioIGVMatch) {
            precio = parseFloat(precioIGVMatch[1].replace(/,/g, ''));
          } else {
            // Buscar precio en span o div específico
            const precioElemento = $item.find('.oe_currency_value, .product-price, .price').first().text();
            const precioMatch = precioElemento.match(/([\d,\.]+)/);
            if (precioMatch) {
              precio = parseFloat(precioMatch[1].replace(/,/g, ''));
            } else {
              // Buscar cualquier precio con símbolo $
              const precioGeneral = textoCompleto.match(/\$\s*([\d,\.]+)/);
              if (precioGeneral) {
                precio = parseFloat(precioGeneral[1].replace(/,/g, ''));
              }
            }
          }
          
          // Extraer imagen
          let imagenUrl = '';
          const imagen = $item.find('img').first();
          const imgSrc = imagen.attr('src') || imagen.attr('data-src') || imagen.attr('data-lazy') || '';
          
          if (imgSrc) {
            if (imgSrc.startsWith('http')) {
              imagenUrl = imgSrc;
            } else if (imgSrc.startsWith('/')) {
              imagenUrl = `https://www.sego.com.pe${imgSrc}`;
            } else {
              imagenUrl = `https://www.sego.com.pe/${imgSrc}`;
            }
          }
          
          // Solo agregar si tiene nombre y precio válido
          if (nombre && precio > 0) {
            // Verificar que no esté duplicado
            const existe = productos.some(p => p.nombre === nombre && p.precioUSD === precio);
            if (!existe) {
              productos.push({
                id: productos.length,
                nombre,
                sku,
                precioUSD: precio,
                imagenUrl
              });
            }
          }
        } catch (error) {
          console.error('Error procesando producto:', error.message);
        }
      });
    });

    console.log(`Productos encontrados: ${productos.length}`);
    return productos;
  } catch (error) {
    console.error('Error al buscar:', error.message);
    throw error;
  }
}

/**
 * Handler de Netlify Function
 */
exports.handler = async (event, context) => {
  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Manejar preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const termino = event.queryStringParameters?.termino;

    if (!termino) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Falta el parámetro "termino"' 
        })
      };
    }

    const productos = await buscarProductos(termino);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        cantidad: productos.length,
        productos
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message || 'Error al buscar productos'
      })
    };
  }
};
