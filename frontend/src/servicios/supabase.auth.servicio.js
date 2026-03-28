import { supabase } from '../config/supabase.config';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Registrar nuevo usuario con Supabase Auth
 */
export const registrar = async (correo, password) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: correo,
      password: password,
    });

    if (error) throw error;

    // Guardar información del usuario
    if (data.user) {
      await AsyncStorage.setItem('usuario', JSON.stringify({
        id: data.user.id,
        correo: data.user.email,
      }));
    }

    return {
      success: true,
      usuario: data.user,
      session: data.session,
    };
  } catch (error) {
    console.error('Error al registrar:', error);
    throw { error: error.message || 'Error al registrar usuario' };
  }
};

/**
 * Iniciar sesión con Supabase Auth
 */
export const iniciarSesion = async (correo, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: correo,
      password: password,
    });

    if (error) throw error;

    // Guardar información del usuario
    if (data.user) {
      await AsyncStorage.setItem('usuario', JSON.stringify({
        id: data.user.id,
        correo: data.user.email,
      }));
    }

    return {
      success: true,
      usuario: data.user,
      session: data.session,
    };
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    throw { error: error.message || 'Error al iniciar sesión' };
  }
};

/**
 * Cerrar sesión
 */
export const cerrarSesion = async () => {
  try {
    await supabase.auth.signOut();
    await AsyncStorage.removeItem('usuario');
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
  }
};

/**
 * Obtener sesión actual
 */
export const obtenerSesion = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  } catch (error) {
    console.error('Error al obtener sesión:', error);
    return null;
  }
};

/**
 * Obtener usuario actual
 */
export const obtenerUsuario = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return null;
  }
};

/**
 * Verificar si hay sesión activa
 */
export const verificarSesion = async () => {
  try {
    const session = await obtenerSesion();
    return session !== null;
  } catch (error) {
    return false;
  }
};

/**
 * Enviar código de recuperación por correo
 */
export const enviarCodigoRecuperacion = async (correo) => {
  try {
    // Generar código usando función SQL
    const { data, error } = await supabase.rpc('generar_codigo_recuperacion', {
      p_email: correo
    });

    if (error) throw error;

    const codigo = data;

    // Aquí deberías enviar el código por correo
    // Por ahora, lo mostramos en consola (en producción, usa un servicio de email)
    console.log(`Código de recuperación para ${correo}: ${codigo}`);
    
    // TODO: Integrar con servicio de email (SendGrid, AWS SES, etc.)
    // Ejemplo:
    // await enviarEmail(correo, 'Código de Recuperación', `Tu código es: ${codigo}`);

    return {
      success: true,
      mensaje: 'Se ha enviado un código de 6 dígitos a tu correo electrónico.',
      codigo: codigo, // SOLO PARA DESARROLLO - Remover en producción
    };
  } catch (error) {
    console.error('Error al enviar código:', error);
    throw { error: error.message || 'Error al enviar código de recuperación' };
  }
};

/**
 * Verificar código de recuperación
 */
export const verificarCodigoRecuperacion = async (correo, codigo) => {
  try {
    const { data, error } = await supabase.rpc('verificar_codigo_recuperacion', {
      p_email: correo,
      p_codigo: codigo
    });

    if (error) throw error;

    if (!data) {
      throw { error: 'Código inválido o expirado' };
    }

    return {
      success: true,
      valido: data,
    };
  } catch (error) {
    console.error('Error al verificar código:', error);
    throw { error: error.message || 'Código inválido o expirado' };
  }
};

/**
 * Cambiar contraseña con código verificado (usando Edge Function)
 */
export const cambiarPasswordConCodigo = async (correo, codigo, nuevaPassword) => {
  try {
    // Llamar a la Edge Function de Supabase
    const { data, error } = await supabase.functions.invoke('cambiar-password', {
      body: {
        email: correo,
        codigo: codigo,
        nuevaPassword: nuevaPassword
      }
    });

    if (error) throw error;

    if (data.error) {
      throw { error: data.error };
    }

    return {
      success: true,
      mensaje: 'Contraseña actualizada exitosamente',
    };
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    throw { error: error.message || 'Error al cambiar contraseña' };
  }
};
