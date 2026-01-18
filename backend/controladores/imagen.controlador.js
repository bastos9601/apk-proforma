const { subirImagen } = require('../configuracion/cloudinary');

/**
 * Subir imagen a Cloudinary
 */
const subir = async (req, res) => {
  try {
    const { imagen, carpeta } = req.body;

    if (!imagen) {
      return res.status(400).json({ 
        error: 'No se proporcionó ninguna imagen' 
      });
    }

    // Subir imagen a Cloudinary
    const url = await subirImagen(imagen, carpeta);

    res.json({
      mensaje: 'Imagen subida exitosamente',
      url
    });
  } catch (error) {
    console.error('Error al subir imagen:', error);
    res.status(500).json({ 
      error: 'Error al subir imagen',
      mensaje: error.message 
    });
  }
};

module.exports = {
  subir
};
