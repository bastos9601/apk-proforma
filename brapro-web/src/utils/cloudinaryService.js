/**
 * Servicio para subir imágenes directamente a Cloudinary
 * Sin necesidad de backend
 */

// Credenciales de Cloudinary
const CLOUDINARY_CLOUD_NAME = 'dp1dzunfp';
const CLOUDINARY_UPLOAD_PRESET = 'bradatec_unsigned';

/**
 * Subir imagen directamente a Cloudinary desde un archivo
 * @param {File} file - Archivo de imagen
 * @returns {string} URL de la imagen subida
 */
export const subirImagen = async (file) => {
  try {
    console.log('Subiendo imagen a Cloudinary...');
    
    // Validar tamaño (máximo 10MB)
    const tamanoMB = file.size / (1024 * 1024);
    console.log(`Tamaño de imagen: ${tamanoMB.toFixed(2)} MB`);
    
    if (tamanoMB > 10) {
      throw new Error('La imagen es demasiado grande. Máximo 10MB.');
    }
    
    // Crear FormData
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'bradatec/catalogo');
    
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
    throw new Error(error.message || 'Error al subir imagen a Cloudinary');
  }
};

/**
 * Validar que el archivo sea una imagen
 * @param {File} file - Archivo a validar
 * @returns {boolean} true si es una imagen válida
 */
export const esImagenValida = (file) => {
  const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return tiposPermitidos.includes(file.type);
};

/**
 * Obtener vista previa de la imagen
 * @param {File} file - Archivo de imagen
 * @returns {Promise<string>} URL de vista previa (base64)
 */
export const obtenerVistaPrevia = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
