const supabase = require('../configuracion/supabase');

/**
 * Crear nueva proforma
 */
const crearProforma = async (usuarioId, fecha, total, totalLetras, nombreCliente, descripcionServicio, consideraciones = null, pdfUrl = null) => {
  const { data, error } = await supabase
    .from('proformas')
    .insert([
      {
        usuario_id: usuarioId,
        fecha,
        total,
        total_letras: totalLetras,
        nombre_cliente: nombreCliente,
        descripcion_servicio: descripcionServicio,
        consideraciones: consideraciones,
        pdf_url: pdfUrl
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Obtener proformas de un usuario
 */
const obtenerProformasPorUsuario = async (usuarioId, limite = 50, offset = 0) => {
  const { data, error } = await supabase
    .from('proformas')
    .select('*')
    .eq('usuario_id', usuarioId)
    .order('fecha', { ascending: false })
    .range(offset, offset + limite - 1);

  if (error) throw error;
  return data;
};

/**
 * Obtener proforma por ID
 */
const obtenerProformaPorId = async (id, usuarioId) => {
  const { data, error } = await supabase
    .from('proformas')
    .select('*')
    .eq('id', id)
    .eq('usuario_id', usuarioId)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Actualizar URL del PDF
 */
const actualizarPdfUrl = async (id, pdfUrl) => {
  const { data, error } = await supabase
    .from('proformas')
    .update({ pdf_url: pdfUrl })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Eliminar proforma
 */
const eliminarProforma = async (id, usuarioId) => {
  const { error } = await supabase
    .from('proformas')
    .delete()
    .eq('id', id)
    .eq('usuario_id', usuarioId);

  if (error) throw error;
  return true;
};

module.exports = {
  crearProforma,
  obtenerProformasPorUsuario,
  obtenerProformaPorId,
  actualizarPdfUrl,
  eliminarProforma
};
