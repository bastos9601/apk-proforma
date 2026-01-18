const express = require('express');
const router = express.Router();
const { subir } = require('../controladores/imagen.controlador');
const verificarToken = require('../middlewares/verificarToken');

// Todas las rutas requieren autenticación
router.use(verificarToken);

router.post('/subir', subir);

module.exports = router;
