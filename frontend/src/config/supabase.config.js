import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';

/**
 * Configuración de Supabase
 * 
 * INSTRUCCIONES:
 * 1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard
 * 2. Ve a Settings > API
 * 3. Copia la URL del proyecto y la anon/public key
 * 4. Reemplaza los valores abajo
 */

// Credenciales de Supabase
const SUPABASE_URL = 'https://qfinablpaknitaytdgoj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmaW5hYmxwYWtuaXRheXRkZ29qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MDU4NDQsImV4cCI6MjA5MDI4MTg0NH0.Dn5sssgkCcY88uy-9_f7H0DHQdPUYkBlgkUwU-7txaE';

// Crear cliente de Supabase con AsyncStorage para persistencia
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-react-native',
    },
  },
});

// Exportar configuración para referencia
export const SUPABASE_CONFIG = {
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY,
};
