import { supabase } from '../config/supabase.config';

/**
 * Obtener todas las proformas del usuario actual
 */
export const obtenerProformas = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('proformas')
      .select(`
        *,
        detalle_proforma (*)
      `)
      .eq('usuario_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al obtener proformas:', error);
    throw error;
  }
};

/**
 * Obtener una proforma por ID
 */
export const obtenerProformaPorId = async (id) => {
  try {
    const { data, error } = await supabase
      .from('proformas')
      .select(`
        *,
        detalle_proforma (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al obtener proforma:', error);
    throw error;
  }
};

/**
 * Crear nueva proforma
 */
export const crearProforma = async (proformaData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    // Calcular fecha de validez (5 días por defecto si no se especifica)
    const fechaValidez = proformaData.fecha_validez || 
      new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Crear la proforma
    const { data: proforma, error: errorProforma } = await supabase
      .from('proformas')
      .insert([{
        usuario_id: user.id,
        fecha: proformaData.fecha,
        total: proformaData.total,
        total_letras: proformaData.total_letras,
        numero_proforma: proformaData.numero_proforma,
        nombre_cliente: proformaData.nombre_cliente,
        descripcion_servicio: proformaData.descripcion_servicio,
        consideraciones: proformaData.consideraciones,
        fecha_validez: fechaValidez,
        estado: 'pendiente', // Estado inicial
        fecha_estado: new Date().toISOString(),
      }])
      .select()
      .single();

    if (errorProforma) throw errorProforma;

    // Crear los detalles
    if (proformaData.detalles && proformaData.detalles.length > 0) {
      const detalles = proformaData.detalles.map(detalle => ({
        proforma_id: proforma.id,
        descripcion: detalle.descripcion,
        cantidad: detalle.cantidad,
        precio: detalle.precio,
        total: detalle.total,
        imagen_url: detalle.imagen_url,
      }));

      const { error: errorDetalles } = await supabase
        .from('detalle_proforma')
        .insert(detalles);

      if (errorDetalles) throw errorDetalles;
    }

    return proforma;
  } catch (error) {
    console.error('Error al crear proforma:', error);
    throw error;
  }
};

/**
 * Actualizar proforma
 */
export const actualizarProforma = async (id, proformaData) => {
  try {
    const updateData = {
      fecha: proformaData.fecha,
      total: proformaData.total,
      total_letras: proformaData.total_letras,
      numero_proforma: proformaData.numero_proforma,
      descripcion_servicio: proformaData.descripcion_servicio,
      consideraciones: proformaData.consideraciones,
    };

    // Agregar fecha_validez si se proporciona
    if (proformaData.fecha_validez) {
      updateData.fecha_validez = proformaData.fecha_validez;
    }

    const { data, error } = await supabase
      .from('proformas')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Actualizar detalles si se proporcionan
    if (proformaData.detalles) {
      // Eliminar detalles existentes
      await supabase
        .from('detalle_proforma')
        .delete()
        .eq('proforma_id', id);

      // Insertar nuevos detalles
      const detalles = proformaData.detalles.map(detalle => ({
        proforma_id: id,
        descripcion: detalle.descripcion,
        cantidad: detalle.cantidad,
        precio: detalle.precio,
        total: detalle.total,
        imagen_url: detalle.imagen_url,
      }));

      await supabase
        .from('detalle_proforma')
        .insert(detalles);
    }

    return data;
  } catch (error) {
    console.error('Error al actualizar proforma:', error);
    throw error;
  }
};

/**
 * Eliminar proforma
 */
export const eliminarProforma = async (id) => {
  try {
    const { error } = await supabase
      .from('proformas')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar proforma:', error);
    throw error;
  }
};

/**
 * Cambiar estado de proforma
 */
export const cambiarEstadoProforma = async (id, nuevoEstado, notas = null) => {
  try {
    const { data, error } = await supabase
      .from('proformas')
      .update({
        estado: nuevoEstado,
        fecha_estado: new Date().toISOString(),
        notas_estado: notas,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    throw error;
  }
};

/**
 * Obtener proformas filtradas por estado
 */
export const obtenerProformasPorEstado = async (estado = null) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    let query = supabase
      .from('proformas')
      .select(`
        *,
        detalle_proforma (*)
      `)
      .eq('usuario_id', user.id)
      .order('created_at', { ascending: false });

    // Si se especifica un estado, filtrar por él
    if (estado) {
      query = query.eq('estado', estado);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al obtener proformas por estado:', error);
    throw error;
  }
};

/**
 * Obtener estadísticas de estados
 */
export const obtenerEstadisticasEstados = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('proformas')
      .select('estado')
      .eq('usuario_id', user.id);

    if (error) throw error;

    // Contar por estado
    const estadisticas = {
      pendiente: 0,
      enviada: 0,
      aprobada: 0,
      rechazada: 0,
      facturada: 0,
      total: data.length,
    };

    data.forEach(proforma => {
      if (estadisticas.hasOwnProperty(proforma.estado)) {
        estadisticas[proforma.estado]++;
      }
    });

    return estadisticas;
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    throw error;
  }
};

/**
 * Buscar proformas con filtros avanzados
 */
export const buscarProformas = async (filtros = {}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    let query = supabase
      .from('proformas')
      .select(`
        *,
        detalle_proforma (*)
      `)
      .eq('usuario_id', user.id);

    // Filtro por texto (busca en nombre_cliente, numero_proforma, descripcion_servicio)
    if (filtros.texto) {
      query = query.or(`nombre_cliente.ilike.%${filtros.texto}%,numero_proforma.ilike.%${filtros.texto}%,descripcion_servicio.ilike.%${filtros.texto}%`);
    }

    // Filtro por estado
    if (filtros.estado) {
      query = query.eq('estado', filtros.estado);
    }

    // Filtro por rango de fechas
    if (filtros.fechaDesde) {
      query = query.gte('fecha', filtros.fechaDesde);
    }
    if (filtros.fechaHasta) {
      query = query.lte('fecha', filtros.fechaHasta);
    }

    // Filtro por rango de montos
    if (filtros.montoMin) {
      query = query.gte('total', filtros.montoMin);
    }
    if (filtros.montoMax) {
      query = query.lte('total', filtros.montoMax);
    }

    // Ordenamiento
    const ordenCampo = filtros.ordenCampo || 'created_at';
    const ordenDireccion = filtros.ordenDireccion === 'asc';
    query = query.order(ordenCampo, { ascending: ordenDireccion });

    const { data, error } = await query;

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al buscar proformas:', error);
    throw error;
  }
};

/**
 * Obtener proformas próximas a vencer (últimos 3 días de validez)
 */
export const obtenerProformasPorVencer = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const hoy = new Date().toISOString().split('T')[0];
    const tresDiasDespues = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('proformas')
      .select(`
        *,
        detalle_proforma (*)
      `)
      .eq('usuario_id', user.id)
      .not('fecha_validez', 'is', null)
      .gte('fecha_validez', hoy)
      .lte('fecha_validez', tresDiasDespues)
      .in('estado', ['pendiente', 'enviada'])
      .order('fecha_validez', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al obtener proformas por vencer:', error);
    throw error;
  }
};

/**
 * Obtener proformas vencidas
 */
export const obtenerProformasVencidas = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const hoy = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('proformas')
      .select(`
        *,
        detalle_proforma (*)
      `)
      .eq('usuario_id', user.id)
      .not('fecha_validez', 'is', null)
      .lt('fecha_validez', hoy)
      .in('estado', ['pendiente', 'enviada'])
      .order('fecha_validez', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al obtener proformas vencidas:', error);
    throw error;
  }
};

/**
 * Calcular días restantes de validez
 */
export const calcularDiasValidez = (fechaValidez) => {
  if (!fechaValidez) return null;
  
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  const validez = new Date(fechaValidez);
  validez.setHours(0, 0, 0, 0);
  
  const diferencia = validez - hoy;
  const dias = Math.ceil(diferencia / (1000 * 60 * 60 * 24));
  
  return dias;
};

/**
 * Verificar si una proforma está vencida
 */
export const estaVencida = (fechaValidez) => {
  if (!fechaValidez) return false;
  const dias = calcularDiasValidez(fechaValidez);
  return dias !== null && dias < 0;
};

/**
 * Verificar si una proforma está por vencer (3 días o menos)
 */
export const estaPorVencer = (fechaValidez) => {
  if (!fechaValidez) return false;
  const dias = calcularDiasValidez(fechaValidez);
  return dias !== null && dias >= 0 && dias <= 3;
};
