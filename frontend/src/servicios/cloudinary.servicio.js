import axios from 'axios';
import { obtenerToken } from './auth.servicio';

// URL base de tu API - CAMBIAR según tu configuración
const API_URL = 'http://10.89.85.82:3000/api/imagenes';

/**
 * Subir imagen a Cloudinary a través del backend
 */
export const subirImagen = async (imagenUri) => {
  try {
    const token = await obtenerToken();
    
    // Convertir imagen a base64 con compresión
    const imagenBase64 = await convertirImagenABase64(imagenUri);
    
    const respuesta = await axios.post(
      `${API_URL}/subir`,
      {
        imagen: imagenBase64,
        carpeta: 'bradatec/proformas'
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000 // 60 segundos de timeout
      }
    );

    return respuesta.data.url;
  } catch (error) {
    console.error('Error al subir imagen:', error);
    if (error.code === 'ECONNABORTED') {
      throw { error: 'Tiempo de espera agotado. La imagen es muy grande.' };
    }
    throw error.response?.data || { error: 'Error al subir imagen' };
  }
};

/**
 * Convertir imagen a base64 con compresión
 */
const convertirImagenABase64 = async (uri) => {
  try {
    // Si la URI ya es base64, devolverla directamente
    if (uri.startsWith('data:')) {
      return uri;
    }

    const respuesta = await fetch(uri);
    const blob = await respuesta.blob();
    
    // Verificar tamaño del blob
    const tamanoMB = blob.size / (1024 * 1024);
    console.log(`Tamaño de imagen: ${tamanoMB.toFixed(2)} MB`);
    
    if (tamanoMB > 10) {
      throw new Error('La imagen es demasiado grande. Por favor selecciona una imagen más pequeña (máximo 10MB).');
    }
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error al convertir imagen:', error);
    throw error;
  }
};
