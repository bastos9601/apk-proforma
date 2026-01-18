const express = require('express');
const router = express.Router();
const { registrar, iniciarSesion, verificarSesion } = require('../controladores/auth.controlador');
const verificarToken = require('../middlewares/verificarToken');

// Rutas públicas
router.post('/registro', registrar);
router.post('/login', iniciarSesion);

// Rutas protegidas
router.get('/verificar', verificarToken, verificarSesion);

module.exports = router;
