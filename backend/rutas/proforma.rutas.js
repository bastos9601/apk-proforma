const express = require('express');
const router = express.Router();
const { 
  crear, 
  obtenerTodas, 
  obtenerPorId, 
  actualizarPdf,
  eliminar 
} = require('../controladores/proforma.controlador');
const verificarToken = require('../middlewares/verificarToken');

// Todas las rutas requieren autenticación
router.use(verificarToken);

router.post('/', crear);
router.get('/', obtenerTodas);
router.get('/:id', obtenerPorId);
router.put('/:id/pdf', actualizarPdf);
router.delete('/:id', eliminar);

module.exports = router;
