const { chromium } = require('playwright-core');
require('dotenv').config();

async function buscarPrecios() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Login
    await page.goto('https://www.sego.com.pe/web/login');
    await page.waitForSelector('input[name="login"]');
    await page.fill('input[name="login"]', process.env.SEGO_USER);
    await page.fill('input[name="password"]', process.env.SEGO_PASS);
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      page.click('button[type="submit"]')
    ]);
    console.log('✓ Login\n');
    
    // Buscar
    await page.goto('https://www.sego.com.pe/shop?search=disco%20duro%20purple%201tb', {
      waitUntil: 'networkidle'
    });
    await page.waitForTimeout(8000); // Esperar JavaScript
    
    // Buscar TODOS los textos con $
    const preciosEncontrados = await page.evaluate(() => {
      const todosLosTextos = [];
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );
      
      let node;
      while (node = walker.nextNode()) {
        const texto = node.textContent.trim();
        if (texto.includes('$') && texto.length < 200) {
          todosLosTextos.push({
            texto: texto,
            padre: node.parentElement.tagName,
            clase: node.parentElement.className,
            html: node.parentElement.outerHTML.substring(0, 300)
          });
        }
      }
      
      return todosLosTextos;
    });
    
    console.log('💰 TODOS LOS TEXTOS CON "$":');
    console.log('═'.repeat(100));
    preciosEncontrados.forEach((p, i) => {
      console.log(`\n${i + 1}. ${p.texto}`);
      console.log(`   Tag: <${p.padre}> Clase: "${p.clase}"`);
      console.log(`   HTML: ${p.html}`);
    });
    console.log('═'.repeat(100));
    
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

buscarPrecios();
