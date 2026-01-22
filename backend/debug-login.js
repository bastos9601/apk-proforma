const axios = require('axios');
const cheerio = require('cheerio');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');

async function debugLogin() {
  console.log('=== DEBUG LOGIN SEGO ===\n');
  
  const jar = new CookieJar();
  const client = wrapper(axios.create({
    jar,
    withCredentials: true,
    maxRedirects: 0,
    validateStatus: (status) => status >= 200 && status < 400,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  }));

  try {
    // Paso 1: Obtener página de login
    console.log('1. Obteniendo página de login...');
    const loginPage = await client.get('https://www.sego.com.pe/web/login');
    const $ = cheerio.load(loginPage.data);
    
    // Buscar todos los campos del formulario
    console.log('\n2. Campos del formulario encontrados:');
    $('form input').each((i, el) => {
      const name = $(el).attr('name');
      const type = $(el).attr('type');
      const value = $(el).attr('value');
      console.log(`   - ${name} (${type}): ${value || '(vacío)'}`);
    });
    
    const csrfToken = $('input[name="csrf_token"]').val();
    console.log(`\n3. CSRF Token: ${csrfToken}`);
    
    // Paso 2: Intentar login
    console.log('\n4. Intentando login...');
    const loginData = new URLSearchParams({
      'login': 'Bradatecsrl@gmail.com',
      'password': '20608918371',
      'csrf_token': csrfToken || ''
    });
    
    try {
      const loginResponse = await client.post(
        'https://www.sego.com.pe/web/login',
        loginData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Referer': 'https://www.sego.com.pe/web/login',
            'Origin': 'https://www.sego.com.pe'
          }
        }
      );
      
      console.log(`\n5. Respuesta del login:`);
      console.log(`   Status: ${loginResponse.status}`);
      console.log(`   URL final: ${loginResponse.request.res.responseUrl || loginResponse.config.url}`);
      
      // Verificar si hay mensaje de error
      const $response = cheerio.load(loginResponse.data);
      const errorMsg = $response('.alert-danger, .o_error_detail').text().trim();
      if (errorMsg) {
        console.log(`   ⚠️ Error: ${errorMsg}`);
      }
      
      // Verificar si sigue mostrando el formulario de login
      const hasLoginForm = loginResponse.data.includes('name="login"');
      console.log(`   ¿Sigue mostrando formulario?: ${hasLoginForm ? 'Sí' : 'No'}`);
      
      // Mostrar cookies
      const cookies = await jar.getCookies('https://www.sego.com.pe');
      console.log(`\n6. Cookies (${cookies.length}):`);
      cookies.forEach(c => console.log(`   - ${c.key}`));
      
    } catch (redirectError) {
      console.log(`\n5. Redirección detectada (esto es bueno):`);
      console.log(`   Status: ${redirectError.response?.status}`);
      console.log(`   Location: ${redirectError.response?.headers?.location}`);
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

debugLogin();
