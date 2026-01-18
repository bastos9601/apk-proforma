const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRutas = require('./rutas/auth.rutas');
const proformaRutas = require('./rutas/proforma.rutas');
const imagenRutas = require('./rutas/imagen.rutas');
const productoRutas = require('./rutas/producto.rutas');
const configuracionRutas = require('./rutas/configuracion.rutas');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Aumentar límite para imágenes
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Rutas
app.use('/api/auth', authRutas);
app.use('/api/proformas', proformaRutas);
app.use('/api/imagenes', imagenRutas);
app.use('/api/productos', productoRutas);
app.use('/api/configuracion', configuracionRutas);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    mensaje: 'API BRADATEC - Sistema de Proformas',
    version: '1.0.0',
    estado: 'activo'
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    mensaje: err.message 
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
});
