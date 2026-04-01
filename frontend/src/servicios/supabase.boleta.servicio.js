import { supabase } from '../config/supabase.config';

/**
 * Obtener siguiente número de boleta
 */
export const obtenerSiguienteNumeroBoleta = async () => {
  try {
    const { data, error } = await supabase.rpc('obtener_siguiente_numero_boleta');
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al obtener siguiente número:', error);
    throw error;
  }
};

/**
 * Crear boleta desde proforma
 */
export const crearBoletaDesdeProforma = async (proforma, datosAdicionales = {}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    // Obtener siguiente número de boleta
    const numeroBoleta = await obtenerSiguienteNumeroBoleta();

    // El total de la proforma YA INCLUYE IGV
    const total = parseFloat(proforma.total);
    const subtotal = total / 1.18;
    const igv = total - subtotal;

    // Importar función para convertir número a letras
    const { convertirNumeroALetras } = await import('../utilidades/convertirNumeroALetras');
    const totalLetras = convertirNumeroALetras(total);

    // Crear la boleta
    const { data: boleta, error: errorBoleta } = await supabase
      .from('boletas')
      .insert([{
        numero_boleta: numeroBoleta,
        proforma_id: proforma.id,
        usuario_id: user.id,
        cliente_nombre: datosAdicionales.cliente_nombre || proforma.nombre_cliente || 'Cliente',
        cliente_dni: datosAdicionales.cliente_dni || null,
        subtotal: subtotal.toFixed(2),
        igv: igv.toFixed(2),
        total: total.toFixed(2),
        total_letras: totalLetras,
        fecha_emision: new Date().toISOString().split('T')[0],
        estado_pago: 'pendiente',
        observaciones: datosAdicionales.observaciones || null,
      }])
      .select()
      .single();

    if (errorBoleta) throw errorBoleta;

    // Copiar detalles de la proforma a la boleta
    if (proforma.detalle_proforma && proforma.detalle_proforma.length > 0) {
      const detalles = proforma.detalle_proforma.map((detalle, index) => ({
        boleta_id: boleta.id,
        descripcion: detalle.descripcion,
        cantidad: detalle.cantidad,
        precio_unitario: detalle.precio,
        subtotal: detalle.total,
        imagen_url: detalle.imagen_url,
        orden: index,
      }));

      const { error: errorDetalles } = await supabase
        .from('boleta_detalles')
        .insert(detalles);

      if (errorDetalles) throw errorDetalles;
    }

    // Actualizar estado de la proforma a "facturada" y guardar tipo de documento
    await supabase
      .from('proformas')
      .update({ 
        estado: 'facturada',
        tipo_documento: 'boleta',
        fecha_estado: new Date().toISOString(),
      })
      .eq('id', proforma.id);

    return boleta;
  } catch (error) {
    console.error('Error al crear boleta:', error);
    throw error;
  }
};

/**
 * Obtener todas las boletas del usuario
 */
export const obtenerBoletas = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('boletas')
      .select(`
        *,
        boleta_detalles (*),
        proformas (numero_proforma)
      `)
      .eq('usuario_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al obtener boletas:', error);
    throw error;
  }
};

/**
 * Obtener boleta por ID
 */
export const obtenerBoletaPorId = async (id) => {
  try {
    const { data, error } = await supabase
      .from('boletas')
      .select(`
        *,
        boleta_detalles (*),
        proformas (numero_proforma)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al obtener boleta:', error);
    throw error;
  }
};

/**
 * Marcar boleta como pagada
 */
export const marcarBoletaPagada = async (id, metodoPago, notasPago = null) => {
  try {
    const { data, error } = await supabase
      .from('boletas')
      .update({
        estado_pago: 'pagada',
        metodo_pago: metodoPago,
        fecha_pago: new Date().toISOString().split('T')[0],
        notas_pago: notasPago,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al marcar boleta como pagada:', error);
    throw error;
  }
};

/**
 * Anular boleta
 */
export const anularBoleta = async (id, motivo = null) => {
  try {
    const { data, error } = await supabase
      .from('boletas')
      .update({
        estado_pago: 'anulada',
        notas_pago: motivo,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al anular boleta:', error);
    throw error;
  }
};

/**
 * Eliminar boleta
 */
export const eliminarBoleta = async (id) => {
  try {
    const { error } = await supabase
      .from('boletas')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar boleta:', error);
    throw error;
  }
};

/**
 * Obtener estadísticas de boletas
 */
export const obtenerEstadisticasBoletas = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase.rpc('obtener_estadisticas_boletas', {
      p_usuario_id: user.id,
    });

    if (error) throw error;
    
    return data[0] || {
      total_boletas: 0,
      boletas_pendientes: 0,
      boletas_pagadas: 0,
      total_por_cobrar: 0,
      total_cobrado: 0,
    };
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    throw error;
  }
};
