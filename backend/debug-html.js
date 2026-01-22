const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function debugHTML() {
  try {
    console.log('Obteniendo HTML de Sego...');
    
    const response = await axios.get('https://www.sego.com.pe/shop?search=camara', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data);
    
    // Buscar el primer producto
    const primerProducto = $('.tp-product-item').first();
    
    if (primerProducto.length > 0) {
      console.log('\n=== HTML DEL PRIMER PRODUCTO ===\n');
      console.log(primerProducto.html());
      
      // Guardar en archivo
      fs.writeFileSync('producto-debug.html', primerProducto.html());
      console.log('\nHTML guardado en producto-debug.html');
    } else {
      console.log('No se encontró ningún producto con .tp-product-item');
      
      // Guardar todo el HTML
      fs.writeFileSync('pagina-completa.html', response.data);
      console.log('HTML completo guardado en pagina-completa.html');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugHTML();
