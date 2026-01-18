const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Faltan credenciales de Supabase en las variables de entorno');
}

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
