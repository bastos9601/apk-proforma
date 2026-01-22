const { chromium } = require('playwright-core');
require('dotenv').config();

async function debugPrecioDetallado() {
  console.log('🔍 Debug detallado de precios Sego\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    // Login
    console.log('1️⃣ Login...');
    await page.goto('https://www.sego.com.pe/web/login', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('input[name="login"]');
    await page.fill('input[name="login"]', process.env.SEGO_USER);
    await page.fill('input[name="password"]', process.env.SEGO_PASS);
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      page.click('button[type="submit"]')
    ]);
    console.log('✓ Login completado\n');
    
    // Buscar
    console.log('2️⃣ Buscando producto...');
    await page.goto('https://www.sego.com.pe/shop?search=disco%20duro%20purple%201tb', {
      waitUntil: 'networkidle'
    });
    await page.waitForSelector('.tp-product-item', { timeout: 10000 });
    await page.waitForTimeout(5000); // Esperar más tiempo
    console.log('✓ Página cargada\n');
    
    // Extraer TODO el HTML del producto
    console.log('3️⃣ Extrayendo HTML...\n');
    const info = await page.evaluate(() => {
      const item = document.querySelector('.tp-product-item');
      if (!item) return null;
      
      // Buscar TODOS los elementos que contengan texto con "$" o "precio"
      const elementosConPrecio = [];
      const walker = document.createTreeWalker(item, NodeFilter.SHOW_ELEMENT);
      
      let node;
      while (node = walker.nextNode()) {
        const texto = node.textContent.trim();
        if (texto.includes('$') || texto.toLowerCase().includes('precio') || 
            texto.toLowerCase().includes('igv') || texto.match(/\d+\.\d+/)) {
          elementosConPrecio.push({
            tag: node.tagName,
            clase: node.className,
            id: node.id,
            texto: texto.substring(0, 200),
            innerHTML: node.innerHTML.substring(0, 300)
          });
        }
      }
      
      return {
        textoCompleto: item.textContent,
        html: item.innerHTML,
        elementosConPrecio
      };
    });
    
    if (!info) {
      console.log('❌ No se encontró producto');
      await browser.close();
      return;
    }
    
    console.log('📝 TEXTO COMPLETO DEL PRODUCTO:');
    console.log('═'.repeat(100));
    console.log(info.textoCompleto);
    console.log('═'.repeat(100));
    
    console.log('\n💰 ELEMENTOS QUE CONTIENEN PRECIOS O NÚMEROS:');
    console.log('═'.repeat(100));
    info.elementosConPrecio.forEach((el, i) => {
      console.log(`\n${i + 1}. <${el.tag}> clase="${el.clase}" id="${el.id}"`);
      console.log(`   Texto: ${el.texto}`);
      console.log(`   HTML: ${el.innerHTML}`);
    });
    console.log('═'.repeat(100));
    
    // Tomar screenshot
    await page.screenshot({ path: 'backend/debug-sego-screenshot.png', fullPage: true });
    console.log('\n📸 Screenshot guardado en: backend/debug-sego-screenshot.png');
    
    console.log('\n⏳ Esperando 15 segundos para que puedas inspeccionar...');
    await page.waitForTimeout(15000);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

debugPrecioDetallado();
