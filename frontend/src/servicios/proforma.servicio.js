import axios from 'axios';
import { obtenerToken } from './auth.servicio';
import { API_ENDPOINTS } from '../config/api.config';

// URL del endpoint de proformas
const API_URL = API_ENDPOINTS.proformas;

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
 * Crear nueva proforma
 */
export const crearProforma = async (proformaData) => {
  try {
    const headers = await obtenerHeaders();
    const respuesta = await axios.post(API_URL, proformaData, { headers });
    return respuesta.data;
  } catch (error) {
    throw error.response?.data || { error: 'Error al crear proforma' };
  }
};

/**
 * Obtener todas las proformas
 */
export const obtenerProformas = async (limite = 50, offset = 0) => {
  try {
    const headers = await obtenerHeaders();
    const respuesta = await axios.get(`${API_URL}?limite=${limite}&offset=${offset}`, { headers });
    return respuesta.data;
  } catch (error) {
    throw error.response?.data || { error: 'Error al obtener proformas' };
  }
};

/**
 * Obtener proforma por ID
 */
export const obtenerProformaPorId = async (id) => {
  try {
    const headers = await obtenerHeaders();
    const respuesta = await axios.get(`${API_URL}/${id}`, { headers });
    return respuesta.data;
  } catch (error) {
    throw error.response?.data || { error: 'Error al obtener proforma' };
  }
};

/**
 * Actualizar URL del PDF
 */
export const actualizarPdfUrl = async (id, pdfUrl) => {
  try {
    const headers = await obtenerHeaders();
    const respuesta = await axios.put(`${API_URL}/${id}/pdf`, { pdfUrl }, { headers });
    return respuesta.data;
  } catch (error) {
    throw error.response?.data || { error: 'Error al actualizar PDF' };
  }
};

/**
 * Eliminar proforma
 */
export const eliminarProforma = async (id) => {
  try {
    const headers = await obtenerHeaders();
    const respuesta = await axios.delete(`${API_URL}/${id}`, { headers });
    return respuesta.data;
  } catch (error) {
    throw error.response?.data || { error: 'Error al eliminar proforma' };
  }
};
