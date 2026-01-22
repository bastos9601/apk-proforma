const { buscarProductosSegoAxios } = require('./servicios/sego-axios.servicio');

async function probarAxios() {
  console.log('=== PROBANDO AXIOS CON COOKIES ===\n');
  
  try {
    console.log('Buscando "camara" en Sego con axios...\n');
    const productos = await buscarProductosSegoAxios('camara');
    
    console.log(`\n=== RESULTADOS: ${productos.length} productos ===\n`);
    
    productos.slice(0, 5).forEach((producto, index) => {
      console.log(`${index + 1}. ${producto.nombre}`);
      console.log(`   SKU: ${producto.sku}`);
      console.log(`   Precio base: S/ ${producto.precioBase.toFixed(2)}`);
      console.log(`   Precio con margen (+50%): S/ ${producto.precio.toFixed(2)}`);
      console.log(`   Precio estimado: ${producto.precioEstimado ? 'Sí' : 'No (precio real)'}`);
      console.log('');
    });
    
    console.log('\n✓ Prueba completada exitosamente');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    process.exit(0);
  }
}

probarAxios();
