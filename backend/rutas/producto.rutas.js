const express = require('express');
const router = express.Router();
const { 
  obtenerProductos, 
  buscarProductos,
  crearProducto,
  eliminarProducto,
  obtenerProducto,
  limpiarCacheProductos
} = require('../controladores/producto.controlador');
const verificarToken = require('../middlewares/verificarToken');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Obtener todos los productos (propios + SEGO)
router.get('/', obtenerProductos);

// Buscar productos (propios + SEGO)
router.get('/buscar', buscarProductos);

// Crear producto en catálogo propio
router.post('/', crearProducto);

// Eliminar producto del catálogo propio
router.delete('/:id', eliminarProducto);

// Obtener producto específico
router.get('/:nombre', obtenerProducto);

// Limpiar caché (útil para desarrollo)
router.post('/cache/limpiar', limpiarCacheProductos);

module.exports = router;
