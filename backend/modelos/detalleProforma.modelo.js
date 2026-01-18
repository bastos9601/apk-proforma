const supabase = require('../configuracion/supabase');

/**
 * Crear detalle de proforma (ítem)
 */
const crearDetalle = async (proformaId, descripcion, cantidad, precio, total, imagenUrl) => {
  const { data, error } = await supabase
    .from('detalle_proforma')
    .insert([
      {
        proforma_id: proformaId,
        descripcion,
        cantidad,
        precio,
        total,
        imagen_url: imagenUrl
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Crear múltiples detalles
 */
const crearDetallesMultiples = async (detalles) => {
  const { data, error } = await supabase
    .from('detalle_proforma')
    .insert(detalles)
    .select();

  if (error) throw error;
  return data;
};

/**
 * Obtener detalles de una proforma
 */
const obtenerDetallesPorProforma = async (proformaId) => {
  const { data, error } = await supabase
    .from('detalle_proforma')
    .select('*')
    .eq('proforma_id', proformaId)
    .order('id', { ascending: true });

  if (error) throw error;
  return data;
};

/**
 * Eliminar detalles de una proforma
 */
const eliminarDetallesPorProforma = async (proformaId) => {
  const { error } = await supabase
    .from('detalle_proforma')
    .delete()
    .eq('proforma_id', proformaId);

  if (error) throw error;
  return true;
};

module.exports = {
  crearDetalle,
  crearDetallesMultiples,
  obtenerDetallesPorProforma,
  eliminarDetallesPorProforma
};
