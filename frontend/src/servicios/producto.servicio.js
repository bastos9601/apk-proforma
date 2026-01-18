import axios from 'axios';
import { obtenerToken } from './auth.servicio';

// URL base de tu API - CAMBIAR según tu configuración
const API_URL = 'http://10.89.85.82:3000/api/productos';

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
 * Obtener todos los productos de SEGO
 */
export const obtenerProductos = async () => {
  try {
    const headers = await obtenerHeaders();
    const respuesta = await axios.get(API_URL, { headers });
    return respuesta.data;
  } catch (error) {
    throw error.response?.data || { error: 'Error al obtener productos' };
  }
};

/**
 * Buscar productos por término
 */
export const buscarProductos = async (termino) => {
  try {
    const headers = await obtenerHeaders();
    const respuesta = await axios.get(`${API_URL}/buscar?q=${encodeURIComponent(termino)}`, { headers });
    return respuesta.data;
  } catch (error) {
    throw error.response?.data || { error: 'Error al buscar productos' };
  }
};

/**
 * Obtener producto específico
 */
export const obtenerProductoPorNombre = async (nombre) => {
  try {
    const headers = await obtenerHeaders();
    const respuesta = await axios.get(`${API_URL}/${encodeURIComponent(nombre)}`, { headers });
    return respuesta.data;
  } catch (error) {
    throw error.response?.data || { error: 'Error al obtener producto' };
  }
};

/**
 * Guardar producto en catálogo propio
 */
export const guardarProductoCatalogo = async (producto) => {
  try {
    const headers = await obtenerHeaders();
    const respuesta = await axios.post(API_URL, producto, { headers });
    return respuesta.data;
  } catch (error) {
    throw error.response?.data || { error: 'Error al guardar producto' };
  }
};

/**
 * Eliminar producto del catálogo propio
 */
export const eliminarProductoCatalogo = async (id) => {
  try {
    const headers = await obtenerHeaders();
    const respuesta = await axios.delete(`${API_URL}/${id}`, { headers });
    return respuesta.data;
  } catch (error) {
    throw error.response?.data || { error: 'Error al eliminar producto' };
  }
};
