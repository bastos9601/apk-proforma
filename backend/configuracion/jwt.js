const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secreto_temporal_cambiar_en_produccion';
const JWT_EXPIRACION = '7d'; // Token válido por 7 días

/**
 * Generar token JWT
 * @param {object} payload - Datos a incluir en el token
 * @returns {string} Token generado
 */
const generarToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRACION });
};

/**
 * Verificar token JWT
 * @param {string} token - Token a verificar
 * @returns {object} Datos decodificados del token
 */
const verificarToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Token inválido o expirado');
  }
};

module.exports = {
  generarToken,
  verificarToken,
  JWT_SECRET
};
