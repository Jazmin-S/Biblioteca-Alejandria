const db = require('../MySQL/db');
const bcrypt = require('bcryptjs');


exports.crearUsuario = (req, res) => {
  const { usuario, correo, contrasena, rol } = req.body;

  if (!usuario || !correo || !contrasena) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  // Hashear contraseña
  const hashedPassword = bcrypt.hashSync(contrasena, 10);

  // Insertar en BD
  const query = `
    INSERT INTO USUARIO (nombre, correo, contrasena, rol, num_prestamos)
    VALUES (?, ?, ?, ?, 0)
  `;

  db.query(query, [usuario, correo, hashedPassword, rol], (err, result) => {
    if (err) {
      console.error('❌ Error al registrar usuario:', err);
      return res.status(500).json({ error: 'Error en el servidor' });
    }
    res.json({ message: 'Usuario registrado correctamente ✅', id: result.insertId });
  });
};
