import axios from 'axios';
import { obtenerToken } from './auth.servicio';
import { API_ENDPOINTS } from '../config/api.config';

// URL del endpoint de productos
const API_URL = API_ENDPOINTS.productos;

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

/**
 * Actualizar producto del catálogo propio
 */
export const actualizarProductoCatalogo = async (id, producto) => {
  try {
    const headers = await obtenerHeaders();
    const respuesta = await axios.put(`${API_URL}/${id}`, producto, { headers });
    return respuesta.data;
  } catch (error) {
    throw error.response?.data || { error: 'Error al actualizar producto' };
  }
};

/**
 * Obtener solo productos del catálogo propio
 */
export const obtenerCatalogo = async () => {
  try {
    const headers = await obtenerHeaders();
    const respuesta = await axios.get(`${API_URL}/catalogo`, { headers });
    return respuesta.data;
  } catch (error) {
    throw error.response?.data || { error: 'Error al obtener catálogo' };
  }
};
