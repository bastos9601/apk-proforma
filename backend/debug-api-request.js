const { chromium } = require('playwright-core');
require('dotenv').config();

async function debugAPIRequest() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Interceptar REQUEST con body
  page.on('request', request => {
    const url = request.url();
    if (url.includes('get_product_data')) {
      console.log('\n📤 REQUEST a get_product_data:');
      console.log('   URL:', url);
      console.log('   Method:', request.method());
      console.log('   Headers:', JSON.stringify(request.headers(), null, 2));
      
      const postData = request.postData();
      if (postData) {
        console.log('   POST Data:', postData);
      }
    }
  });
  
  // Interceptar RESPONSE
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('get_product_data')) {
      console.log('\n📥 RESPONSE de get_product_data:');
      console.log('   Status:', response.status());
      
      try {
        const data = await response.json();
        console.log('   Data:', JSON.stringify(data, null, 2));
      } catch (e) {
        console.log('   No es JSON');
      }
    }
  });
  
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
    
    // Buscar
    console.log('2️⃣ Buscando...');
    await page.goto('https://www.sego.com.pe/shop?search=disco%20duro%20purple%201tb', {
      waitUntil: 'networkidle'
    });
    
    console.log('\n3️⃣ Esperando 15 segundos...\n');
    await page.waitForTimeout(15000);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

debugAPIRequest();
