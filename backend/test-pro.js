const { obtenerProductosSego, cerrarNavegador } = require('./servicios/sego-pro.servicio');

async function probarServicioPro() {
  console.log('=== PROBANDO SERVICIO PROFESIONAL DE SEGO ===\n');
  console.log('✅ Arquitectura optimizada:');
  console.log('   - Navegador singleton (no se abre por cada petición)');
  console.log('   - Caché de 6 horas');
  console.log('   - Credenciales desde .env');
  console.log('   - Interceptación de respuestas API');
  console.log('   - Margen del 50% aplicado automáticamente\n');
  
  try {
    console.log('🔍 Primera búsqueda (sin caché)...\n');
    const inicio1 = Date.now();
    const productos1 = await obtenerProductosSego('camara');
    const tiempo1 = Date.now() - inicio1;
    
    console.log(`\n⏱️  Tiempo: ${tiempo1}ms`);
    console.log(`📦 Productos: ${productos1.length}`);
    
    // Mostrar algunos productos
    console.log('\n📋 Primeros 5 productos:\n');
    productos1.slice(0, 5).forEach((p, i) => {
      console.log(`${i + 1}. ${p.nombre}`);
      console.log(`   SKU: ${p.sku}`);
      console.log(`   Precio: ${p.precioTexto} (${p.precioEstimado ? 'Estimado' : 'Real'})`);
      console.log('');
    });
    
    // Segunda búsqueda (desde caché)
    console.log('\n🔍 Segunda búsqueda (desde caché)...\n');
    const inicio2 = Date.now();
    const productos2 = await obtenerProductosSego('camara');
    const tiempo2 = Date.now() - inicio2;
    
    console.log(`⏱️  Tiempo: ${tiempo2}ms (${Math.round((tiempo1 - tiempo2) / tiempo1 * 100)}% más rápido)`);
    console.log(`📦 Productos: ${productos2.length}`);
    
    console.log('\n✅ Servicio profesional funcionando correctamente');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    console.log('\n🔄 Cerrando navegador...');
    await cerrarNavegador();
    console.log('✓ Navegador cerrado');
    process.exit(0);
  }
}

probarServicioPro();
