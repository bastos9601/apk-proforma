const { obtenerProductosSego, cerrarNavegador } = require('./servicios/sego-pro.servicio');

async function probarPreciosCorrectos() {
  console.log('=== VERIFICANDO CÁLCULO DE PRECIOS ===\n');
  console.log('Fórmula: Precio Final = Precio Sego (con IGV) × 1.5\n');
  console.log('Ejemplo esperado:');
  console.log('  Disco Duro Purple WD 1TB');
  console.log('  Precio Sego: S/ 98.42');
  console.log('  Con margen (+50%): S/ 98.42 × 1.5 = S/ 147.63\n');
  
  try {
    console.log('Buscando "disco" en Sego...\n');
    const productos = await obtenerProductosSego('disco');
    
    console.log(`Encontrados ${productos.length} productos\n`);
    
    // Buscar el disco duro Purple
    const discoPurple = productos.find(p => 
      p.nombre.toLowerCase().includes('purple') || 
      p.nombre.toLowerCase().includes('wd') ||
      p.nombre.toLowerCase().includes('disco')
    );
    
    if (discoPurple) {
      console.log('✓ Disco encontrado:');
      console.log(`  Nombre: ${discoPurple.nombre}`);
      console.log(`  SKU: ${discoPurple.sku}`);
      console.log(`  Precio base (Sego): S/ ${discoPurple.precioBase.toFixed(2)}`);
      console.log(`  Precio final (+50%): S/ ${discoPurple.precio.toFixed(2)}`);
      console.log(`  Precio mostrado: ${discoPurple.precioTexto}`);
      console.log(`  ¿Es estimado?: ${discoPurple.precioEstimado ? 'Sí' : 'No (precio real)'}`);
      
      // Verificar cálculo
      const precioEsperado = discoPurple.precioBase * 1.5;
      const calculoCorrecto = Math.abs(discoPurple.precio - precioEsperado) < 0.01;
      
      console.log(`\n${calculoCorrecto ? '✅' : '❌'} Cálculo ${calculoCorrecto ? 'CORRECTO' : 'INCORRECTO'}`);
      
      if (discoPurple.precioBase === 98.42) {
        console.log('✅ Precio base coincide con el ejemplo (S/ 98.42)');
        console.log(`✅ Precio final esperado: S/ 147.63`);
        console.log(`✅ Precio final calculado: S/ ${discoPurple.precio.toFixed(2)}`);
      }
    } else {
      console.log('⚠️ No se encontró el disco Purple en los resultados');
      console.log('\nPrimeros 5 productos encontrados:');
      productos.slice(0, 5).forEach((p, i) => {
        console.log(`\n${i + 1}. ${p.nombre}`);
        console.log(`   Precio base: S/ ${p.precioBase.toFixed(2)}`);
        console.log(`   Precio final: S/ ${p.precio.toFixed(2)}`);
        console.log(`   Cálculo: ${p.precioBase.toFixed(2)} × 1.5 = ${(p.precioBase * 1.5).toFixed(2)}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await cerrarNavegador();
    process.exit(0);
  }
}

probarPreciosCorrectos();
