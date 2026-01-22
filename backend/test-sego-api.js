const axios = require('axios');

async function testSegoAPI() {
  try {
    console.log('Probando API JSON de Sego...\n');
    
    // Intentar obtener productos en formato JSON
    const urls = [
      'https://www.sego.com.pe/shop?search=camara',
      'https://www.sego.com.pe/shop/products?search=camara',
      'https://www.sego.com.pe/api/products?search=camara',
      'https://www.sego.com.pe/shop?search=camara&json=1'
    ];
    
    for (const url of urls) {
      try {
        console.log(`Probando: ${url}`);
        const response = await axios.get(url, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0'
          },
          timeout: 5000
        });
        
        console.log(`Status: ${response.status}`);
        console.log(`Content-Type: ${response.headers['content-type']}`);
        
        if (response.headers['content-type']?.includes('json')) {
          console.log('¡Encontrada API JSON!');
          console.log(JSON.stringify(response.data, null, 2).substring(0, 500));
        }
        console.log('---\n');
      } catch (error) {
        console.log(`Error: ${error.message}\n`);
      }
    }
  } catch (error) {
    console.error('Error general:', error.message);
  }
}

testSegoAPI();
