const { chromium } = require('playwright-core');
require('dotenv').config();

async function testProductoIndividual() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Login
    console.log('1️⃣ Login...');
    await page.goto('https://www.sego.com.pe/web/login');
    await page.waitForSelector('input[name="login"]');
    await page.fill('input[name="login"]', process.env.SEGO_USER);
    await page.fill('input[name="password"]', process.env.SEGO_PASS);
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      page.click('button[type="submit"]')
    ]);
    console.log('✓ Login\n');
    
    // Ir directamente a la página del producto
    console.log('2️⃣ Abriendo página del producto...');
    await page.goto('https://www.sego.com.pe/shop/se-hdd1tb-disco-duro-purple-wd-1-tera-sata-459', {
      waitUntil: 'networkidle'
    });
    await page.waitForTimeout(5000);
    
    // Buscar precios
    const precios = await page.evaluate(() => {
      const texto = document.body.textContent;
      const preciosEncontrados = [];
      
      // Buscar todos los textos con $
      const matches = texto.match(/\$\s*[\d,\.]+/g);
      if (matches) {
        matches.forEach(m => preciosEncontrados.push(m));
      }
      
      // Buscar "Precio con IGV"
      const matchIGV = texto.match(/Precio con IGV[:\s]*\$\s*([\d,\.]+)/i);
      
      return {
        todosLosPrecios: preciosEncontrados,
        precioConIGV: matchIGV ? matchIGV[0] : null,
        necesitaLogin: texto.includes('para ver precio'),
        textoCompleto: texto.substring(0, 2000)
      };
    });
    
    console.log('\n📊 RESULTADOS:');
    console.log('═'.repeat(80));
    console.log('Necesita login:', precios.necesitaLogin ? '❌ SÍ' : '✓ NO');
    console.log('Precio con IGV:', precios.precioConIGV || '❌ NO ENCONTRADO');
    console.log('\nTodos los precios encontrados:');
    precios.todosLosPrecios.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p}`);
    });
    console.log('═'.repeat(80));
    
    console.log('\n📸 Screenshot: backend/producto-individual.png');
    await page.screenshot({ path: 'backend/producto-individual.png', fullPage: true });
    
    console.log('\n⏳ Esperando 10 segundos...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

testProductoIndividual();
