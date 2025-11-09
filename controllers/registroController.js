const db = require('../MySQL/db');
const bcrypt = require('bcryptjs');

exports.crearUsuario = (req, res) => {
  const { usuario, correo, contrasena, rol } = req.body;

  if (!usuario || !correo || !contrasena) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  // Validar que no exista ya el correo
  const checkQuery = 'SELECT id_usuario FROM USUARIO WHERE correo = ?';
  db.query(checkQuery, [correo], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error en la base de datos' });
    if (rows.length > 0) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    // Crear usuario nuevo
    const hashedPassword = bcrypt.hashSync(contrasena, 10);
    const insertQuery = `
      INSERT INTO USUARIO (nombre, correo, contrasena, rol, num_prestamos)
      VALUES (?, ?, ?, ?, 0)
    `;
    db.query(insertQuery, [usuario, correo, hashedPassword, rol], (err, result) => {
      if (err) {
        console.error('❌ Error al registrar usuario:', err);
        return res.status(500).json({ error: 'Error al insertar usuario' });
      }
      res.json({ message: 'Usuario registrado correctamente ✅', id: result.insertId });
    });
  });
};
