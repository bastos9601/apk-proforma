const { chromium } = require('playwright-core');
require('dotenv').config();

async function debugPrecioHTML() {
  console.log('🔍 Analizando HTML de Sego para encontrar precios...\n');
  
  const browser = await chromium.launch({ headless: false }); // headless: false para ver qué pasa
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    // Login
    console.log('1️⃣ Iniciando sesión...');
    await page.goto('https://www.sego.com.pe/web/login', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('input[name="login"]');
    await page.fill('input[name="login"]', process.env.SEGO_USER);
    await page.fill('input[name="password"]', process.env.SEGO_PASS);
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      page.click('button[type="submit"]')
    ]);
    console.log('✓ Login completado\n');
    
    // Buscar producto
    console.log('2️⃣ Buscando "disco duro purple 1tb"...');
    await page.goto('https://www.sego.com.pe/shop?search=disco%20duro%20purple%201tb', {
      waitUntil: 'networkidle'
    });
    
    await page.waitForSelector('.tp-product-item', { timeout: 10000 });
    await page.waitForTimeout(3000); // Esperar a que carguen los precios
    
    console.log('✓ Página cargada\n');
    
    // Extraer HTML del primer producto
    console.log('3️⃣ Extrayendo HTML del primer producto...\n');
    const htmlProducto = await page.evaluate(() => {
      const item = document.querySelector('.tp-product-item');
      if (!item) return null;
      
      return {
        html: item.innerHTML,
        texto: item.textContent,
        clases: item.className
      };
    });
    
    if (!htmlProducto) {
      console.log('❌ No se encontró ningún producto');
      await browser.close();
      return;
    }
    
    console.log('📄 HTML COMPLETO:');
    console.log('═'.repeat(100));
    console.log(htmlProducto.html);
    console.log('═'.repeat(100));
    
    console.log('\n📝 TEXTO COMPLETO:');
    console.log('═'.repeat(100));
    console.log(htmlProducto.texto);
    console.log('═'.repeat(100));
    
    // Buscar todos los elementos que contengan "$"
    console.log('\n💰 ELEMENTOS CON PRECIOS ($):');
    console.log('═'.repeat(100));
    const elementosConPrecio = await page.evaluate(() => {
      const item = document.querySelector('.tp-product-item');
      if (!item) return [];
      
      const elementos = [];
      const walker = document.createTreeWalker(
        item,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );
      
      let node;
      while (node = walker.nextNode()) {
        const texto = node.textContent.trim();
        if (texto.includes('$') || texto.toLowerCase().includes('precio')) {
          elementos.push({
            texto: texto,
            padre: node.parentElement.tagName,
            clases: node.parentElement.className
          });
        }
      }
      
      return elementos;
    });
    
    elementosConPrecio.forEach((el, i) => {
      console.log(`${i + 1}. [${el.padre}.${el.clases}] ${el.texto}`);
    });
    console.log('═'.repeat(100));
    
    // Esperar 10 segundos para que puedas ver la página
    console.log('\n⏳ Esperando 10 segundos para que puedas inspeccionar la página...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

debugPrecioHTML();
