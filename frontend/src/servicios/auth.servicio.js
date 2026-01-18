import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// URL base de tu API - CAMBIAR según tu configuración
const API_URL = 'http://10.89.85.82:3000/api/auth';

/**
 * Registrar nuevo usuario
 */
export const registrar = async (correo, password) => {
  try {
    const respuesta = await axios.post(`${API_URL}/registro`, {
      correo,
      password
    });

    // Guardar token
    if (respuesta.data.token) {
      await AsyncStorage.setItem('token', respuesta.data.token);
      await AsyncStorage.setItem('usuario', JSON.stringify(respuesta.data.usuario));
    }

    return respuesta.data;
  } catch (error) {
    throw error.response?.data || { error: 'Error al registrar usuario' };
  }
};

/**
 * Iniciar sesión
 */
export const iniciarSesion = async (correo, password) => {
  try {
    const respuesta = await axios.post(`${API_URL}/login`, {
      correo,
      password
    });

    // Guardar token
    if (respuesta.data.token) {
      await AsyncStorage.setItem('token', respuesta.data.token);
      await AsyncStorage.setItem('usuario', JSON.stringify(respuesta.data.usuario));
    }

    return respuesta.data;
  } catch (error) {
    throw error.response?.data || { error: 'Error al iniciar sesión' };
  }
};

/**
 * Cerrar sesión
 */
export const cerrarSesion = async () => {
  try {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('usuario');
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
  }
};

/**
 * Obtener token guardado
 */
export const obtenerToken = async () => {
  try {
    return await AsyncStorage.getItem('token');
  } catch (error) {
    console.error('Error al obtener token:', error);
    return null;
  }
};

/**
 * Obtener usuario guardado
 */
export const obtenerUsuario = async () => {
  try {
    const usuario = await AsyncStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return null;
  }
};
