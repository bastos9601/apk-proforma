const { 
  crearProforma, 
  obtenerProformasPorUsuario, 
  obtenerProformaPorId,
  actualizarPdfUrl,
  eliminarProforma 
} = require('../modelos/proforma.modelo');
const { 
  crearDetallesMultiples, 
  obtenerDetallesPorProforma,
  eliminarDetallesPorProforma 
} = require('../modelos/detalleProforma.modelo');

/**
 * Crear nueva proforma con sus detalles
 */
const crear = async (req, res) => {
  try {
    const { fecha, total, totalLetras, nombreCliente, descripcionServicio, detalles, pdfUrl } = req.body;
    const usuarioId = req.usuario.id;

    // Validaciones
    if (!fecha || !total || !totalLetras || !nombreCliente || !detalles || detalles.length === 0) {
      return res.status(400).json({ 
        error: 'Datos incompletos para crear la proforma' 
      });
    }

    // Crear proforma
    const proforma = await crearProforma(
      usuarioId, 
      fecha, 
      total, 
      totalLetras, 
      nombreCliente, 
      descripcionServicio || 'Por la presente ponemos a su consideración la cotización de instalación y reubicación',
      pdfUrl
    );

    // Preparar detalles con el ID de la proforma
    const detallesConProformaId = detalles.map(detalle => ({
      proforma_id: proforma.id,
      descripcion: detalle.descripcion,
      cantidad: detalle.cantidad,
      precio: detalle.precio,
      total: detalle.total,
      imagen_url: detalle.imagenUrl || null
    }));

    // Crear detalles
    const detallesCreados = await crearDetallesMultiples(detallesConProformaId);

    res.status(201).json({
      mensaje: 'Proforma creada exitosamente',
      proforma: {
        ...proforma,
        detalles: detallesCreados
      }
    });
  } catch (error) {
    console.error('Error al crear proforma:', error);
    res.status(500).json({ 
      error: 'Error al crear proforma',
      mensaje: error.message 
    });
  }
};

/**
 * Obtener todas las proformas del usuario
 */
const obtenerTodas = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const limite = parseInt(req.query.limite) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const proformas = await obtenerProformasPorUsuario(usuarioId, limite, offset);

    res.json({
      mensaje: 'Proformas obtenidas exitosamente',
      cantidad: proformas.length,
      proformas
    });
  } catch (error) {
    console.error('Error al obtener proformas:', error);
    res.status(500).json({ 
      error: 'Error al obtener proformas',
      mensaje: error.message 
    });
  }
};

/**
 * Obtener una proforma específica con sus detalles
 */
const obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    const proforma = await obtenerProformaPorId(id, usuarioId);
    
    if (!proforma) {
      return res.status(404).json({ 
        error: 'Proforma no encontrada' 
      });
    }

    const detalles = await obtenerDetallesPorProforma(id);

    res.json({
      mensaje: 'Proforma obtenida exitosamente',
      proforma: {
        ...proforma,
        detalles
      }
    });
  } catch (error) {
    console.error('Error al obtener proforma:', error);
    res.status(500).json({ 
      error: 'Error al obtener proforma',
      mensaje: error.message 
    });
  }
};

/**
 * Actualizar URL del PDF
 */
const actualizarPdf = async (req, res) => {
  try {
    const { id } = req.params;
    const { pdfUrl } = req.body;

    if (!pdfUrl) {
      return res.status(400).json({ 
        error: 'URL del PDF es requerida' 
      });
    }

    const proforma = await actualizarPdfUrl(id, pdfUrl);

    res.json({
      mensaje: 'PDF actualizado exitosamente',
      proforma
    });
  } catch (error) {
    console.error('Error al actualizar PDF:', error);
    res.status(500).json({ 
      error: 'Error al actualizar PDF',
      mensaje: error.message 
    });
  }
};

/**
 * Eliminar proforma
 */
const eliminar = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    // Eliminar detalles primero
    await eliminarDetallesPorProforma(id);
    
    // Eliminar proforma
    await eliminarProforma(id, usuarioId);

    res.json({
      mensaje: 'Proforma eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar proforma:', error);
    res.status(500).json({ 
      error: 'Error al eliminar proforma',
      mensaje: error.message 
    });
  }
};

module.exports = {
  crear,
  obtenerTodas,
  obtenerPorId,
  actualizarPdf,
  eliminar
};
