const supabase = require('../configuracion/supabase');
const bcrypt = require('bcryptjs');

/**
 * Crear nuevo usuario
 */
const crearUsuario = async (correo, password) => {
  // Hash del password
  const passwordHash = await bcrypt.hash(password, 10);
  
  const { data, error } = await supabase
    .from('usuarios')
    .insert([
      { 
        correo: correo.toLowerCase(),
        password: passwordHash,
        fecha_creacion: new Date().toISOString()
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Buscar usuario por correo
 */
const buscarPorCorreo = async (correo) => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('correo', correo.toLowerCase())
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

/**
 * Buscar usuario por ID
 */
const buscarPorId = async (id) => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, correo, fecha_creacion')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Comparar password
 */
const compararPassword = async (password, passwordHash) => {
  return await bcrypt.compare(password, passwordHash);
};

module.exports = {
  crearUsuario,
  buscarPorCorreo,
  buscarPorId,
  compararPassword
};
