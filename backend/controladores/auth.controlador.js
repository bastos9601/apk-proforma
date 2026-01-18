const { crearUsuario, buscarPorCorreo, compararPassword } = require('../modelos/usuario.modelo');
const { generarToken } = require('../configuracion/jwt');

/**
 * Registrar nuevo usuario
 */
const registrar = async (req, res) => {
  try {
    const { correo, password } = req.body;

    // Validaciones
    if (!correo || !password) {
      return res.status(400).json({ 
        error: 'Correo y contraseña son requeridos' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'La contraseña debe tener al menos 6 caracteres' 
      });
    }

    // Verificar si el usuario ya existe
    const usuarioExistente = await buscarPorCorreo(correo);
    if (usuarioExistente) {
      return res.status(400).json({ 
        error: 'El correo ya está registrado' 
      });
    }

    // Crear usuario
    const nuevoUsuario = await crearUsuario(correo, password);

    // Generar token
    const token = generarToken({ 
      id: nuevoUsuario.id, 
      correo: nuevoUsuario.correo 
    });

    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      token,
      usuario: {
        id: nuevoUsuario.id,
        correo: nuevoUsuario.correo
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ 
      error: 'Error al registrar usuario',
      mensaje: error.message 
    });
  }
};

/**
 * Iniciar sesión
 */
const iniciarSesion = async (req, res) => {
  try {
    const { correo, password } = req.body;

    // Validaciones
    if (!correo || !password) {
      return res.status(400).json({ 
        error: 'Correo y contraseña son requeridos' 
      });
    }

    // Buscar usuario
    const usuario = await buscarPorCorreo(correo);
    if (!usuario) {
      return res.status(401).json({ 
        error: 'Credenciales inválidas' 
      });
    }

    // Verificar password
    const passwordValido = await compararPassword(password, usuario.password);
    if (!passwordValido) {
      return res.status(401).json({ 
        error: 'Credenciales inválidas' 
      });
    }

    // Generar token
    const token = generarToken({ 
      id: usuario.id, 
      correo: usuario.correo 
    });

    res.json({
      mensaje: 'Inicio de sesión exitoso',
      token,
      usuario: {
        id: usuario.id,
        correo: usuario.correo
      }
    });
  } catch (error) {
    console.error('Error en inicio de sesión:', error);
    res.status(500).json({ 
      error: 'Error al iniciar sesión',
      mensaje: error.message 
    });
  }
};

/**
 * Verificar token (obtener perfil)
 */
const verificarSesion = async (req, res) => {
  try {
    res.json({
      mensaje: 'Sesión válida',
      usuario: req.usuario
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Error al verificar sesión',
      mensaje: error.message 
    });
  }
};

module.exports = {
  registrar,
  iniciarSesion,
  verificarSesion
};
