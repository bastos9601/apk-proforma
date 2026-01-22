const { obtenerPreciosRealesSego, cerrarNavegador } = require('./servicios/sego-real-prices.servicio');

async function probarPreciosReales() {
  console.log('=== PROBANDO OBTENCIÓN DE PRECIOS REALES ===\n');
  console.log('NOTA: Se abrirá un navegador visible para evitar detección de bots\n');
  
  try {
    const productos = await obtenerPreciosRealesSego('camara');
    
    console.log(`\n=== RESULTADOS: ${productos.length} productos ===\n`);
    
    // Contar cuántos tienen precio real vs estimado
    const conPrecioReal = productos.filter(p => !p.precioEstimado).length;
    const conPrecioEstimado = productos.filter(p => p.precioEstimado).length;
    
    console.log(`Precios reales: ${conPrecioReal}`);
    console.log(`Precios estimados: ${conPrecioEstimado}\n`);
    
    productos.slice(0, 10).forEach((producto, index) => {
      console.log(`${index + 1}. ${producto.nombre}`);
      console.log(`   SKU: ${producto.sku}`);
      console.log(`   Precio base: S/ ${producto.precioBase.toFixed(2)}`);
      console.log(`   Precio con margen (+50%): S/ ${producto.precio.toFixed(2)}`);
      console.log(`   ${producto.precioEstimado ? '⚠️ ESTIMADO' : '✓ PRECIO REAL'}`);
      console.log('');
    });
    
    console.log('\n✓ Prueba completada');
    console.log('\nPresiona Ctrl+C para cerrar el navegador y salir');
    
    // Mantener el proceso vivo para que puedas ver el navegador
    // await new Promise(() => {});
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    // Esperar 5 segundos antes de cerrar
    console.log('\nCerrando en 5 segundos...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    await cerrarNavegador();
    process.exit(0);
  }
}

probarPreciosReales();
