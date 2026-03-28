const express = require('express');
const router = express.Router();
const { buscarProductos, obtenerDetalleProducto } = require('../servicios/sego.scraper.servicio');

/**
 * Buscar productos en Sego
 * GET /api/sego/buscar?termino=camara
 */
router.get('/buscar', async (req, res) => {
  try {
    const { termino } = req.query;

    if (!termino) {
      return res.status(400).json({ error: 'Falta el parámetro "termino"' });
    }

    const productos = await buscarProductos(termino);

    res.json({
      success: true,
      cantidad: productos.length,
      productos
    });

  } catch (error) {
    console.error('Error en búsqueda:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al buscar productos'
    });
  }
});

/**
 * Obtener detalle de un producto
 * POST /api/sego/detalle
 */
router.post('/detalle', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'Falta la URL del producto' });
    }

    const detalle = await obtenerDetalleProducto(url);

    res.json({
      success: true,
      producto: detalle
    });

  } catch (error) {
    console.error('Error al obtener detalle:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al obtener detalle'
    });
  }
});

module.exports = router;
