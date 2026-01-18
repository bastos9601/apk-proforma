// Script para probar el backend
const axios = require('axios');

const API_URL = 'http://10.89.85.82:3000';

async function probarBackend() {
  console.log('=== PROBANDO BACKEND ===\n');

  try {
    // 1. Probar que el servidor está corriendo
    console.log('1. Probando conexión al servidor...');
    const health = await axios.get(`${API_URL}/`);
    console.log('✅ Servidor funcionando:', health.data);
    console.log('');

    // 2. Probar registro
    console.log('2. Probando registro de usuario...');
    const correoTest = `test${Date.now()}@test.com`;
    const registro = await axios.post(`${API_URL}/api/auth/registro`, {
      correo: correoTest,
      password: 'test123'
    });
    console.log('✅ Usuario registrado:', correoTest);
    const token = registro.data.token;
    console.log('✅ Token recibido:', token.substring(0, 20) + '...');
    console.log('');

    // 3. Probar login
    console.log('3. Probando login...');
    const login = await axios.post(`${API_URL}/api/auth/login`, {
      correo: correoTest,
      password: 'test123'
    });
    console.log('✅ Login exitoso');
    console.log('');

    // 4. Probar búsqueda de productos
    console.log('4. Probando búsqueda de productos...');
    const productos = await axios.get(`${API_URL}/api/productos/buscar?q=camara`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Productos encontrados:', productos.data.cantidad);
    console.log('');

    console.log('=== TODAS LAS PRUEBAS PASARON ===');
    console.log('\nAhora puedes:');
    console.log('1. Cerrar sesión en la app');
    console.log('2. Registrarte de nuevo');
    console.log('3. Todo debería funcionar correctamente');

  } catch (error) {
    console.error('❌ ERROR:', error.response?.data || error.message);
    console.log('\nVerifica que:');
    console.log('- El backend esté corriendo (npm start)');
    console.log('- La base de datos esté configurada correctamente');
    console.log('- Las tablas existan en Supabase');
  }
}

probarBackend();
