/**
 * Servicio para subir imágenes directamente a Cloudinary
 * Sin necesidad de backend
 */

// Credenciales de Cloudinary (desde el .env del backend)
const CLOUDINARY_CLOUD_NAME = 'dp1dzunfp';
const CLOUDINARY_UPLOAD_PRESET = 'bradatec_unsigned'; // Necesitarás crear este preset

/**
 * Subir imagen directamente a Cloudinary
 */
export const subirImagen = async (imagenUri) => {
  try {
    console.log('Subiendo imagen a Cloudinary...');
    
    // Convertir imagen a base64
    const imagenBase64 = await convertirImagenABase64(imagenUri);
    
    // Crear FormData
    const formData = new FormData();
    formData.append('file', imagenBase64);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'bradatec/proformas');
    
    // Subir a Cloudinary
    const respuesta = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!respuesta.ok) {
      const error = await respuesta.json();
      console.error('Error de Cloudinary:', error);
      throw new Error(error.error?.message || 'Error al subir imagen');
    }

    const data = await respuesta.json();
    console.log('Imagen subida exitosamente:', data.secure_url);
    
    return data.secure_url;
  } catch (error) {
    console.error('Error al subir imagen:', error);
    throw { error: error.message || 'Error al subir imagen a Cloudinary' };
  }
};

/**
 * Convertir imagen a base64
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
      throw new Error('La imagen es demasiado grande. Máximo 10MB.');
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
