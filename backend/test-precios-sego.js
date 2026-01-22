const { obtenerProductosSego } = require('./servicios/sego-pro.servicio');

async function testearPrecios() {
  console.log('🧪 Probando extracción de precios de Sego...\n');
  
  try {
    // Buscar disco duro que mencionó el usuario
    console.log('📦 Buscando "disco duro purple 1tb"...\n');
    const productos = await obtenerProductosSego('disco duro purple 1tb');
    
    console.log('\n📊 RESULTADOS:');
    console.log('═'.repeat(80));
    
    if (productos.length === 0) {
      console.log('❌ No se encontraron productos');
      return;
    }
    
    productos.forEach((p, i) => {
      console.log(`\n${i + 1}. ${p.nombre}`);
      console.log(`   SKU: ${p.sku}`);
      console.log(`   Precio Base: S/ ${p.precioBase.toFixed(2)}`);
      console.log(`   Precio Final (+50%): ${p.precioTexto}`);
      console.log(`   Estimado: ${p.precioEstimado ? '⚠️ SÍ (no se pudo extraer precio real)' : '✓ NO (precio real de Sego)'}`);
    });
    
    console.log('\n═'.repeat(80));
    console.log(`\n✓ Total: ${productos.length} productos encontrados`);
    
    // Verificar si hay precios reales
    const preciosReales = productos.filter(p => !p.precioEstimado);
    const preciosEstimados = productos.filter(p => p.precioEstimado);
    
    console.log(`✓ Precios reales: ${preciosReales.length}`);
    console.log(`⚠️ Precios estimados: ${preciosEstimados.length}`);
    
    if (preciosEstimados.length > 0) {
      console.log('\n⚠️ ADVERTENCIA: Algunos productos tienen precios estimados.');
      console.log('   Esto significa que el scraper no pudo extraer el precio real de Sego.');
      console.log('   Posibles causas:');
      console.log('   - El login no funcionó correctamente');
      console.log('   - Los selectores CSS cambiaron');
      console.log('   - La página no cargó completamente');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testearPrecios();
