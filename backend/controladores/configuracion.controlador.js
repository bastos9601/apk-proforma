const { 
  obtenerConfiguracion, 
  actualizarConfiguracion 
} = require('../modelos/configuracion.modelo');

/**
 * Obtener configuración del usuario
 */
const obtener = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const configuracion = await obtenerConfiguracion(usuarioId);

    res.json({
      mensaje: 'Configuración obtenida exitosamente',
      configuracion
    });
  } catch (error) {
    console.error('Error al obtener configuración:', error);
    res.status(500).json({ 
      error: 'Error al obtener configuración',
      mensaje: error.message 
    });
  }
};

/**
 * Actualizar configuración
 */
const actualizar = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const datos = req.body;

    // Validar que no se envíe usuario_id
    delete datos.usuario_id;
    delete datos.id;
    delete datos.created_at;

    const configuracion = await actualizarConfiguracion(usuarioId, datos);

    res.json({
      mensaje: 'Configuración actualizada exitosamente',
      configuracion
    });
  } catch (error) {
    console.error('Error al actualizar configuración:', error);
    res.status(500).json({ 
      error: 'Error al actualizar configuración',
      mensaje: error.message 
    });
  }
};

module.exports = {
  obtener,
  actualizar
};
