const { chromium } = require('playwright-core');
require('dotenv').config();

async function testCookies() {
  console.log('🍪 Probando persistencia de cookies\n');
  
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
    console.log('✓ Login completado\n');
    
    // Guardar cookies
    const cookies = await context.cookies();
    console.log('🍪 Cookies después del login:');
    cookies.forEach(c => {
      console.log(`   - ${c.name}: ${c.value.substring(0, 20)}... (domain: ${c.domain}, httpOnly: ${c.httpOnly}, sameSite: ${c.sameSite})`);
    });
    
    // Navegar a búsqueda
    console.log('\n2️⃣ Navegando a búsqueda...');
    await page.goto('https://www.sego.com.pe/shop?search=disco%20duro%20purple%201tb', {
      waitUntil: 'networkidle'
    });
    await page.waitForTimeout(3000);
    
    // Verificar si hay precios
    const hayPrecios = await page.evaluate(() => {
      const texto = document.body.textContent;
      return {
        necesitaLogin: texto.includes('para ver precio'),
        tieneDolar: texto.includes('$'),
        tieneIGV: texto.includes('IGV')
      };
    });
    
    console.log('\n📊 Estado de la página:');
    console.log(`   - Necesita login: ${hayPrecios.necesitaLogin ? '❌ SÍ' : '✓ NO'}`);
    console.log(`   - Tiene precios ($): ${hayPrecios.tieneDolar ? '✓ SÍ' : '❌ NO'}`);
    console.log(`   - Tiene IGV: ${hayPrecios.tieneIGV ? '✓ SÍ' : '❌ NO'}`);
    
    // Screenshot
    await page.screenshot({ path: 'backend/test-cookies-screenshot.png', fullPage: true });
    console.log('\n📸 Screenshot: backend/test-cookies-screenshot.png');
    
    console.log('\n⏳ Esperando 10 segundos...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

testCookies();
