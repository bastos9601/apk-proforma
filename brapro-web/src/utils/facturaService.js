import { supabase } from '../config/supabase';

/**
 * Obtener siguiente número de factura
 */
export const obtenerSiguienteNumeroFactura = async () => {
  try {
    const { data, error } = await supabase.rpc('obtener_siguiente_numero_factura');
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al obtener siguiente número:', error);
    throw error;
  }
};

/**
 * Crear factura desde proforma
 */
export const crearFacturaDesdeProforma = async (proforma, datosAdicionales = {}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const numeroFactura = await obtenerSiguienteNumeroFactura();

    const total = parseFloat(proforma.total);
    const subtotal = total / 1.18;
    const igv = total - subtotal;

    const fechaVencimiento = datosAdicionales.fecha_vencimiento || 
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const { convertirNumeroALetras } = await import('./numeroALetras');
    const totalLetras = convertirNumeroALetras(total);

    const { data: factura, error: errorFactura } = await supabase
      .from('facturas')
      .insert([{
        numero_factura: numeroFactura,
        proforma_id: proforma.id,
        usuario_id: user.id,
        cliente_nombre: datosAdicionales.cliente_nombre || proforma.nombre_cliente,
        cliente_ruc: datosAdicionales.cliente_ruc || '',
        cliente_direccion: datosAdicionales.cliente_direccion || '',
        subtotal: subtotal.toFixed(2),
        igv: igv.toFixed(2),
        total: total.toFixed(2),
        total_letras: totalLetras,
        fecha_emision: new Date().toISOString().split('T')[0],
        fecha_vencimiento: fechaVencimiento,
        estado_pago: 'pendiente',
        observaciones: datosAdicionales.observaciones || null,
      }])
      .select()
      .single();

    if (errorFactura) throw errorFactura;

    if (proforma.detalle_proforma && proforma.detalle_proforma.length > 0) {
      const detalles = proforma.detalle_proforma.map((detalle, index) => ({
        factura_id: factura.id,
        descripcion: detalle.descripcion,
        cantidad: detalle.cantidad,
        precio_unitario: detalle.precio,
        subtotal: detalle.total,
        imagen_url: detalle.imagen_url,
        orden: index,
      }));

      const { error: errorDetalles } = await supabase
        .from('factura_detalles')
        .insert(detalles);

      if (errorDetalles) throw errorDetalles;
    }

    await supabase
      .from('proformas')
      .update({ 
        estado: 'facturada',
        tipo_documento: 'factura',
        fecha_estado: new Date().toISOString(),
      })
      .eq('id', proforma.id);

    return factura;
  } catch (error) {
    console.error('Error al crear factura:', error);
    throw error;
  }
};

/**
 * Obtener todas las facturas del usuario
 */
export const obtenerFacturas = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('facturas')
      .select(`
        *,
        factura_detalles (*),
        proformas (numero_proforma)
      `)
      .eq('usuario_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al obtener facturas:', error);
    throw error;
  }
};

/**
 * Obtener factura por ID
 */
export const obtenerFacturaPorId = async (id) => {
  try {
    const { data, error } = await supabase
      .from('facturas')
      .select(`
        *,
        factura_detalles (*),
        proformas (numero_proforma)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al obtener factura:', error);
    throw error;
  }
};

/**
 * Marcar factura como pagada
 */
export const marcarFacturaPagada = async (id, metodoPago, notasPago = null) => {
  try {
    const { data, error } = await supabase
      .from('facturas')
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
    console.error('Error al marcar factura como pagada:', error);
    throw error;
  }
};

/**
 * Eliminar factura
 */
export const eliminarFactura = async (id) => {
  try {
    const { error } = await supabase
      .from('facturas')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar factura:', error);
    throw error;
  }
};

/**
 * Obtener estadísticas de facturas
 */
export const obtenerEstadisticasFacturas = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase.rpc('obtener_estadisticas_facturas', {
      p_usuario_id: user.id,
    });

    if (error) throw error;
    
    return data[0] || {
      total_facturas: 0,
      facturas_pendientes: 0,
      facturas_pagadas: 0,
      facturas_vencidas: 0,
      total_por_cobrar: 0,
      total_cobrado: 0,
    };
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    throw error;
  }
};
