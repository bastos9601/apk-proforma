import axios from 'axios';
import { obtenerToken } from './auth.servicio';
import { API_ENDPOINTS } from '../config/api.config';

// URL del endpoint de configuración
const API_URL = API_ENDPOINTS.configuracion;

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
