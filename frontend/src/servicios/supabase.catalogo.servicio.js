import { supabase } from '../config/supabase.config';

/**
 * Obtener todos los productos del catálogo del usuario
 */
export const obtenerProductosCatalogo = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('catalogo_productos')
      .select('*')
      .eq('usuario_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al obtener productos:', error);
    throw error;
  }
};

/**
 * Crear producto en el catálogo
 */
export const crearProductoCatalogo = async (producto) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('catalogo_productos')
      .insert([{
        usuario_id: user.id,
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precio: producto.precio,
        imagen_url: producto.imagen_url,
        sku: producto.sku,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al crear producto:', error);
    throw error;
  }
};

/**
 * Actualizar producto del catálogo
 */
export const actualizarProductoCatalogo = async (id, producto) => {
  try {
    const { data, error } = await supabase
      .from('catalogo_productos')
      .update({
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precio: producto.precio,
        imagen_url: producto.imagen_url,
        sku: producto.sku,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    throw error;
  }
};

/**
 * Eliminar producto del catálogo
 */
export const eliminarProductoCatalogo = async (id) => {
  try {
    const { error } = await supabase
      .from('catalogo_productos')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    throw error;
  }
};

/**
 * Buscar productos por nombre
 */
export const buscarProductos = async (termino) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('catalogo_productos')
      .select('*')
      .eq('usuario_id', user.id)
      .ilike('nombre', `%${termino}%`)
      .order('nombre');

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al buscar productos:', error);
    throw error;
  }
};
