/**
 * Configuración de la API
 * Cambiar API_BASE_URL según el entorno
 */

// URL del backend local (desarrollo)
export const API_BASE_URL = 'http://10.89.85.82:3000';

// URL del backend en Render (producción)
// export const API_BASE_URL = 'https://bradatec-backend.onrender.com';

// URLs de los endpoints
export const API_ENDPOINTS = {
  auth: `${API_BASE_URL}/api/auth`,
  proformas: `${API_BASE_URL}/api/proformas`,
  productos: `${API_BASE_URL}/api/productos`,
  imagenes: `${API_BASE_URL}/api/imagenes`,
  configuracion: `${API_BASE_URL}/api/configuracion`,
};
