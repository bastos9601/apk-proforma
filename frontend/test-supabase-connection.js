/**
 * Script de prueba para verificar la conexión con Supabase
 * Ejecutar con: node test-supabase-connection.js
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://qfinablpaknitaytdgoj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmaW5hYmxwYWtuaXRheXRkZ29qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MDU4NDQsImV4cCI6MjA5MDI4MTg0NH0.Dn5sssgkCcY88uy-9_f7H0DHQdPUYkBlgkUwU-7txaE';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
  console.log('🔍 Probando conexión con Supabase...');
  console.log('URL:', SUPABASE_URL);
  console.log('');

  try {
    // Probar conexión básica
    console.log('1️⃣ Probando conexión básica...');
    const { data, error } = await supabase.from('proformas').select('count');
    
    if (error) {
      console.error('❌ Error:', error.message);
      console.error('Código:', error.code);
      console.error('Detalles:', error.details);
      
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        console.log('\n⚠️  La tabla "proformas" no existe.');
        console.log('📋 Necesitas ejecutar el script SQL en Supabase:');
        console.log('   1. Ve a https://supabase.com/dashboard');
        console.log('   2. Abre SQL Editor');
        console.log('   3. Ejecuta SUPABASE_DATABASE_NUEVA.sql');
      }
    } else {
      console.log('✅ Conexión exitosa!');
      console.log('📊 Datos:', data);
    }

    // Probar autenticación
    console.log('\n2️⃣ Probando sistema de autenticación...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('❌ Error en auth:', authError.message);
    } else {
      console.log('✅ Sistema de autenticación funcionando');
      console.log('📝 Sesión actual:', authData.session ? 'Activa' : 'No hay sesión');
    }

    console.log('\n✅ Prueba completada!');
    console.log('\n📌 Siguiente paso:');
    console.log('   Si viste errores de "relation does not exist", ejecuta el SQL.');
    console.log('   Si todo está OK, prueba registrar un usuario en la app.');

  } catch (error) {
    console.error('\n❌ Error de red o conexión:');
    console.error('Mensaje:', error.message);
    console.error('\n🔍 Posibles causas:');
    console.log('   1. El proyecto de Supabase está pausado');
    console.log('   2. La URL o API key son incorrectas');
    console.log('   3. Problemas de red/firewall');
    console.log('\n📋 Verifica en: https://supabase.com/dashboard');
  }
}

testConnection();
