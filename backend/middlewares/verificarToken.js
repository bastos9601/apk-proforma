const { verificarToken } = require('../configuracion/jwt');

/**
 * Middleware para verificar token JWT
 */
const verificarTokenMiddleware = (req, res, next) => {
  try {
    // Obtener token del header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        error: 'No se proporcionó token de autenticación' 
      });
    }

    // Formato esperado: "Bearer TOKEN"
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Formato de token inválido' 
      });
    }

    // Verificar token
    const decoded = verificarToken(token);
    
    // Agregar datos del usuario al request
    req.usuario = decoded;
    
    next();
  } catch (error) {
    return res.status(401).json({ 
      error: 'Token inválido o expirado',
      mensaje: error.message 
    });
  }
};

module.exports = verificarTokenMiddleware;
