const { 
  obtenerProductosSego, 
  buscarProductosSego,
  obtenerProductoPorNombre,
  limpiarCache
} = require('../servicios/scraper.servicio');
const supabase = require('../configuracion/supabase');

/**
 * Obtener todos los productos (catálogo propio + SEGO)
 */
const obtenerProductos = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    
    // Obtener productos del catálogo propio
    const { data: productosPropios, error } = await supabase
      .from('catalogo_productos')
      .select('*')
      .eq('usuario_id', usuarioId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Obtener productos de SEGO
    const productosSego = await obtenerProductosSego();
    
    // Formatear productos propios
    const productosFormateados = productosPropios.map(p => ({
      id: p.id,
      nombre: p.nombre,
      descripcion: p.descripcion,
      precio: parseFloat(p.precio),
      imagenUrl: p.imagen_url,
      sku: p.sku,
      origen: 'propio'
    }));
    
    // Combinar ambos catálogos
    const todosProductos = [
      ...productosFormateados,
      ...productosSego.map(p => ({ ...p, origen: 'sego' }))
    ];
    
    res.json({
      mensaje: 'Productos obtenidos exitosamente',
      cantidad: todosProductos.length,
      propios: productosFormateados.length,
      sego: productosSego.length,
      productos: todosProductos
    });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ 
      error: 'Error al obtener productos',
      mensaje: error.message
    });
  }
};

/**
 * Buscar productos por término (catálogo propio + SEGO)
 */
const buscarProductos = async (req, res) => {
  try {
    const { q } = req.query;
    const usuarioId = req.usuario.id;
    
    if (!q) {
      return res.status(400).json({ 
        error: 'Parámetro de búsqueda requerido',
        ejemplo: '/api/productos/buscar?q=camara'
      });
    }

    // Buscar en catálogo propio
    const { data: productosPropios, error } = await supabase
      .from('catalogo_productos')
      .select('*')
      .eq('usuario_id', usuarioId)
      .or(`nombre.ilike.%${q}%,descripcion.ilike.%${q}%,sku.ilike.%${q}%`);
    
    if (error) throw error;
    
    // Buscar en SEGO
    const productosSego = await buscarProductosSego(q);
    
    // Formatear productos propios
    const productosFormateados = productosPropios.map(p => ({
      id: p.id,
      nombre: p.nombre,
      descripcion: p.descripcion,
      precio: parseFloat(p.precio),
      imagenUrl: p.imagen_url,
      sku: p.sku,
      origen: 'propio'
    }));
    
    // Combinar resultados
    const todosProductos = [
      ...productosFormateados,
      ...productosSego.map(p => ({ ...p, origen: 'sego' }))
    ];
    
    res.json({
      mensaje: 'Búsqueda completada',
      termino: q,
      cantidad: todosProductos.length,
      propios: productosFormateados.length,
      sego: productosSego.length,
      productos: todosProductos
    });
  } catch (error) {
    console.error('Error al buscar productos:', error);
    res.status(500).json({ 
      error: 'Error al buscar productos',
      mensaje: error.message 
    });
  }
};

/**
 * Crear producto en catálogo propio
 */
const crearProducto = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const { nombre, descripcion, precio, imagenUrl, sku } = req.body;
    
    // Validar datos
    if (!nombre || !descripcion || !precio || !imagenUrl) {
      return res.status(400).json({ 
        error: 'Datos incompletos',
        requeridos: ['nombre', 'descripcion', 'precio', 'imagenUrl']
      });
    }
    
    // Insertar producto
    const { data, error } = await supabase
      .from('catalogo_productos')
      .insert([{
        usuario_id: usuarioId,
        nombre,
        descripcion,
        precio: parseFloat(precio),
        imagen_url: imagenUrl,
        sku: sku || null
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(201).json({
      mensaje: 'Producto agregado al catálogo',
      producto: {
        id: data.id,
        nombre: data.nombre,
        descripcion: data.descripcion,
        precio: parseFloat(data.precio),
        imagenUrl: data.imagen_url,
        sku: data.sku
      }
    });
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ 
      error: 'Error al crear producto',
      mensaje: error.message 
    });
  }
};

/**
 * Eliminar producto del catálogo propio
 */
const eliminarProducto = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const { id } = req.params;
    
    const { error } = await supabase
      .from('catalogo_productos')
      .delete()
      .eq('id', id)
      .eq('usuario_id', usuarioId);
    
    if (error) throw error;
    
    res.json({
      mensaje: 'Producto eliminado del catálogo'
    });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ 
      error: 'Error al eliminar producto',
      mensaje: error.message 
    });
  }
};

/**
 * Obtener producto específico
 */
const obtenerProducto = async (req, res) => {
  try {
    const { nombre } = req.params;
    
    const producto = await obtenerProductoPorNombre(decodeURIComponent(nombre));
    
    res.json({
      mensaje: 'Producto encontrado',
      producto
    });
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(404).json({ 
      error: 'Producto no encontrado',
      mensaje: error.message 
    });
  }
};

/**
 * Limpiar caché de productos
 */
const limpiarCacheProductos = async (req, res) => {
  try {
    limpiarCache();
    
    res.json({
      mensaje: 'Caché limpiado exitosamente',
      nota: 'Los productos se volverán a cargar en la próxima petición'
    });
  } catch (error) {
    console.error('Error al limpiar caché:', error);
    res.status(500).json({ 
      error: 'Error al limpiar caché',
      mensaje: error.message 
    });
  }
};

module.exports = {
  obtenerProductos,
  buscarProductos,
  crearProducto,
  eliminarProducto,
  obtenerProducto,
  limpiarCacheProductos
};
