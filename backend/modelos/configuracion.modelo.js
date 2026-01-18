const supabase = require('../configuracion/supabase');

/**
 * Obtener configuración del usuario
 */
const obtenerConfiguracion = async (usuarioId) => {
  const { data, error } = await supabase
    .from('configuracion_sistema')
    .select('*')
    .eq('usuario_id', usuarioId)
    .single();

  if (error) {
    // Si no existe, crear configuración por defecto
    if (error.code === 'PGRST116') {
      return await crearConfiguracionPorDefecto(usuarioId);
    }
    throw error;
  }
  return data;
};

/**
 * Crear configuración por defecto
 */
const crearConfiguracionPorDefecto = async (usuarioId) => {
  const { data, error } = await supabase
    .from('configuracion_sistema')
    .insert([
      {
        usuario_id: usuarioId,
        nombre_empresa: 'BRADATEC',
        nombre_sistema: 'BRADATEC',
        representante: 'ING. DAVID POLO',
        ruc: '20608918371',
        direccion: 'JIRON ZAVALA 501',
        telefono: '969142875',
        email: 'bradatecsrl@gmail.com',
        cuenta_banco: '480-77406530-0-76',
        cci: '002-480-177406530076-25'
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Actualizar configuración
 */
const actualizarConfiguracion = async (usuarioId, datos) => {
  const { data, error } = await supabase
    .from('configuracion_sistema')
    .update({
      ...datos,
      updated_at: new Date().toISOString()
    })
    .eq('usuario_id', usuarioId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

module.exports = {
  obtenerConfiguracion,
  crearConfiguracionPorDefecto,
  actualizarConfiguracion
};
