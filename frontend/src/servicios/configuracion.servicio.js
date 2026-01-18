import axios from 'axios';
import { obtenerToken } from './auth.servicio';

// URL base de tu API
const API_URL = 'http://10.89.85.82:3000/api/configuracion';

/**
 * Obtener headers con token de autenticación
 */
const obtenerHeaders = async () => {
  const token = await obtenerToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

/**
 * Obtener configuración del usuario
 */
export const obtenerConfiguracion = async () => {
  try {
    const headers = await obtenerHeaders();
    const respuesta = await axios.get(API_URL, { headers });
    return respuesta.data;
  } catch (error) {
    throw error.response?.data || { error: 'Error al obtener configuración' };
  }
};

/**
 * Actualizar configuración
 */
export const actualizarConfiguracion = async (datos) => {
  try {
    const headers = await obtenerHeaders();
    const respuesta = await axios.put(API_URL, datos, { headers });
    return respuesta.data;
  } catch (error) {
    throw error.response?.data || { error: 'Error al actualizar configuración' };
  }
};
