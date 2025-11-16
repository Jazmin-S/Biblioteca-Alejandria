// controllers/loginUsuarioController.js
const db = require('../MySQL/db');
const bcrypt = require('bcrypt');

exports.loginUsuario = async (req, res) => {
  const { correo, contrasena } = req.body;

  console.log('🔐 Intentando login para:', correo);

  try {
    const query = 'SELECT * FROM usuario WHERE correo = ?';

    db.query(query, [correo], async (err, results) => {
      if (err) {
        console.error('❌ Error en consulta:', err);
        return res.status(500).json({ success: false, message: 'Error del servidor' });
      }

      if (results.length === 0) {
        console.log('❌ Usuario no encontrado:', correo);
        return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
      }

      const usuario = results[0];
      console.log('✅ Usuario encontrado:', usuario.nombre);

      const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);

      if (!contrasenaValida) {
        console.log('❌ Contraseña incorrecta para:', correo);
        return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
      }

      console.log('✅ Login exitoso para:', usuario.nombre);

      return res.json({
        success: true,
        message: 'Login exitoso',
        usuario: {
          id_usuario: usuario.id_usuario,
          nombre: usuario.nombre,
          correo: usuario.correo,
          rol: usuario.rol,
          foto: usuario.foto,
          num_prestamos: usuario.num_prestamos
        }
      });
    });
  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};
