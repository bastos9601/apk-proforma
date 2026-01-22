const { chromium } = require('playwright-core');

async function debugPlaywright() {
  console.log('=== DEBUG PLAYWRIGHT ===\n');
  
  let browser = null;
  
  try {
    console.log('Iniciando navegador...');
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log('Navegando a login...');
    await page.goto('https://www.sego.com.pe/web/login', { waitUntil: 'networkidle', timeout: 30000 });

    console.log('Iniciando sesión...');
    await page.fill('input[name="login"]', 'Bradatecsrl@gmail.com');
    await page.fill('input[name="password"]', '20608918371');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    console.log('Navegando a búsqueda...');
    await page.goto('https://www.sego.com.pe/shop?search=camara', { waitUntil: 'networkidle', timeout: 30000 });
    
    await page.waitForSelector('.tp-product-item', { timeout: 10000 });

    console.log('\n=== HTML DEL PRIMER PRODUCTO ===\n');
    const primerProductoHTML = await page.evaluate(() => {
      const item = document.querySelector('.tp-product-item');
      return item ? item.innerHTML : 'No se encontró producto';
    });
    
    console.log(primerProductoHTML.substring(0, 2000));
    
    console.log('\n\n=== TEXTO COMPLETO DEL PRIMER PRODUCTO ===\n');
    const textoCompleto = await page.evaluate(() => {
      const item = document.querySelector('.tp-product-item');
      return item ? item.textContent : 'No se encontró producto';
    });
    
    console.log(textoCompleto);

    await browser.close();
  } catch (error) {
    console.error('Error:', error.message);
    if (browser) await browser.close();
  }
}

debugPlaywright();
