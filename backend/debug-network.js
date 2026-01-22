const { chromium } = require('playwright-core');
require('dotenv').config();

async function debugNetwork() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const peticionesAPI = [];
  
  // Interceptar TODAS las peticiones
  page.on('request', request => {
    const url = request.url();
    if (url.includes('product') || url.includes('price') || url.includes('shop') || url.includes('api')) {
      console.log(`📤 REQUEST: ${request.method()} ${url}`);
    }
  });
  
  // Interceptar TODAS las respuestas
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('product') || url.includes('price') || url.includes('shop') || url.includes('api')) {
      console.log(`📥 RESPONSE: ${response.status()} ${url}`);
      
      const contentType = response.headers()['content-type'] || '';
      if (contentType.includes('json')) {
        try {
          const data = await response.json();
          peticionesAPI.push({ url, data });
          console.log(`   ✓ JSON capturado`);
        } catch (e) {
          // No es JSON válido
        }
      }
    }
  });
  
  try {
    // Login
    console.log('1️⃣ Login...\n');
    await page.goto('https://www.sego.com.pe/web/login');
    await page.waitForSelector('input[name="login"]');
    await page.fill('input[name="login"]', process.env.SEGO_USER);
    await page.fill('input[name="password"]', process.env.SEGO_PASS);
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      page.click('button[type="submit"]')
    ]);
    console.log('\n✓ Login completado\n');
    
    // Buscar
    console.log('2️⃣ Buscando productos...\n');
    await page.goto('https://www.sego.com.pe/shop?search=disco%20duro%20purple%201tb', {
      waitUntil: 'networkidle'
    });
    
    console.log('\n3️⃣ Esperando 10 segundos para capturar peticiones...\n');
    await page.waitForTimeout(10000);
    
    console.log('\n📊 PETICIONES API CAPTURADAS:');
    console.log('═'.repeat(100));
    if (peticionesAPI.length === 0) {
      console.log('❌ No se capturaron peticiones API con JSON');
    } else {
      peticionesAPI.forEach((p, i) => {
        console.log(`\n${i + 1}. ${p.url}`);
        console.log(`   Data:`, JSON.stringify(p.data, null, 2).substring(0, 500));
      });
    }
    console.log('═'.repeat(100));
    
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

debugNetwork();
