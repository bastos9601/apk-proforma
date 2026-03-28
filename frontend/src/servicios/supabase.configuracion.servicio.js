import { supabase } from '../config/supabase.config';

/**
 * Obtener configuración del usuario
 */
export const obtenerConfiguracion = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('configuracion')
      .select('*')
      .eq('usuario_id', user.id)
      .single();

    if (error) {
      // Si no existe configuración, retornar null
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error al obtener configuración:', error);
    throw error;
  }
};

/**
 * Crear o actualizar configuración
 */
export const guardarConfiguracion = async (config) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    // Verificar si ya existe configuración
    const { data: existente } = await supabase
      .from('configuracion')
      .select('id')
      .eq('usuario_id', user.id)
      .single();

    if (existente) {
      // Actualizar
      const { data, error } = await supabase
        .from('configuracion')
        .update({
          nombre_empresa: config.nombre_empresa,
          nombre_sistema: config.nombre_sistema,
          representante: config.representante,
          ruc: config.ruc,
          direccion: config.direccion,
          telefono: config.telefono,
          email: config.email,
          cuenta_banco: config.cuenta_banco,
          cci: config.cci,
          tipo_cambio: config.tipo_cambio,
          logo_url: config.logo_url,
          logo_bcp_url: config.logo_bcp_url,
          updated_at: new Date().toISOString(),
        })
        .eq('usuario_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Crear
      const { data, error } = await supabase
        .from('configuracion')
        .insert([{
          usuario_id: user.id,
          nombre_empresa: config.nombre_empresa,
          nombre_sistema: config.nombre_sistema,
          representante: config.representante,
          ruc: config.ruc,
          direccion: config.direccion,
          telefono: config.telefono,
          email: config.email,
          cuenta_banco: config.cuenta_banco,
          cci: config.cci,
          tipo_cambio: config.tipo_cambio,
          logo_url: config.logo_url,
          logo_bcp_url: config.logo_bcp_url,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error('Error al guardar configuración:', error);
    throw error;
  }
};
