const cloudinary = require('cloudinary').v2;

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Subir imagen a Cloudinary
 * @param {string} imagenBase64 - Imagen en formato base64
 * @param {string} carpeta - Carpeta donde guardar (opcional)
 * @returns {Promise<string>} URL de la imagen subida
 */
const subirImagen = async (imagenBase64, carpeta = 'bradatec/proformas') => {
  try {
    const resultado = await cloudinary.uploader.upload(imagenBase64, {
      folder: carpeta,
      resource_type: 'auto',
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto' }
      ]
    });
    
    return resultado.secure_url;
  } catch (error) {
    console.error('Error al subir imagen a Cloudinary:', error);
    throw new Error('No se pudo subir la imagen');
  }
};

/**
 * Eliminar imagen de Cloudinary
 * @param {string} publicId - ID público de la imagen
 */
const eliminarImagen = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
  }
};

module.exports = {
  cloudinary,
  subirImagen,
  eliminarImagen
};
