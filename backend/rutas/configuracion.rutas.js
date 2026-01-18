const express = require('express');
const router = express.Router();
const { obtener, actualizar } = require('../controladores/configuracion.controlador');
const verificarToken = require('../middlewares/verificarToken');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Obtener configuración
router.get('/', obtener);

// Actualizar configuración
router.put('/', actualizar);

module.exports = router;
