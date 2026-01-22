const { buscarProductosSego, limpiarCache } = require('./servicios/scraper.servicio');

async function probarScraper() {
  console.log('=== PROBANDO SCRAPER DE SEGO ===\n');
  
  // Limpiar caché primero
  console.log('Limpiando caché...');
  limpiarCache();
  
  try {
    console.log('\nBuscando "camara" en Sego...\n');
    const productos = await buscarProductosSego('camara');
    
    console.log(`\n=== RESULTADOS: ${productos.length} productos ===\n`);
    
    productos.slice(0, 5).forEach((producto, index) => {
      console.log(`${index + 1}. ${producto.nombre}`);
      console.log(`   Precio base: S/ ${producto.precioBase.toFixed(2)}`);
      console.log(`   Precio con margen (+50%): S/ ${producto.precio.toFixed(2)}`);
      console.log(`   Texto mostrado: ${producto.precioTexto}`);
      console.log('');
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

probarScraper();
