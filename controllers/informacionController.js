// controllers/informacionController.js
const db = require('../MySQL/db');

// ✅ Obtener información de un usuario por ID
exports.obtenerInformacion = (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT id_usuario, nombre, correo, rol, num_prestamos
    FROM USUARIO
    WHERE id_usuario = ?;
  `;

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('❌ Error al obtener información del usuario:', err);
      return res.status(500).json({ error: 'Error del servidor' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(results[0]);
  });
};

// ✅ Listar todos los usuarios
exports.listarUsuarios = (req, res) => {
  const query = `
    SELECT id_usuario, nombre, correo, rol, num_prestamos
    FROM USUARIO;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Error al listar usuarios:', err);
      return res.status(500).json({ error: 'Error del servidor' });
    }

    res.json(results);
  });
};

// ✅ Actualizar información del usuario
exports.actualizarInformacion = (req, res) => {
  const { id } = req.params;
  const { nombre, correo, rol } = req.body;

  const query = `
    UPDATE USUARIO
    SET nombre = ?, correo = ?, rol = ?
    WHERE id_usuario = ?;
  `;

  db.query(query, [nombre, correo, rol, id], (err) => {
    if (err) {
      console.error('❌ Error al actualizar usuario:', err);
      return res.status(500).json({ error: 'Error al actualizar el usuario' });
    }

    res.json({ mensaje: '✅ Usuario actualizado correctamente' });
  });
};
