const db = require('../MySQL/db');
const bcrypt = require('bcryptjs');

// ✅ Crear usuario (solo alumno o profesor)
exports.crearUsuario = (req, res) => {
  const { nombre, correo, contrasena, rol } = req.body;

  // Validar campos
  if (!nombre || !correo || !contrasena || !rol) {
    return res.status(400).json({ success: false, message: "Faltan datos obligatorios." });
  }

  if (!['alumno', 'profesor'].includes(rol)) {
    return res.status(400).json({ success: false, message: "Rol no permitido (solo alumno o profesor)." });
  }

  // Verificar si el correo ya existe
  const checkQuery = "SELECT id_usuario FROM usuario WHERE correo = ?";
  db.query(checkQuery, [correo], (err, rows) => {
    if (err) {
      console.error("❌ Error al verificar correo:", err.sqlMessage);
      return res.status(500).json({ success: false, message: "Error al verificar el correo." });
    }

    if (rows.length > 0) {
      return res.status(400).json({ success: false, message: "El correo ya está registrado." });
    }

    // Encriptar contraseña
    const hashedPassword = bcrypt.hashSync(contrasena, 10);

    const insertQuery = `
      INSERT INTO usuario (nombre, correo, contrasena, rol, num_prestamos)
      VALUES (?, ?, ?, ?, 0)
    `;

    db.query(insertQuery, [nombre, correo, hashedPassword, rol], (err, result) => {
      if (err) {
        console.error("❌ Error SQL al insertar:", err.sqlMessage);
        console.error("📦 Datos enviados:", { nombre, correo, hashedPassword, rol });
        return res.status(500).json({ success: false, message: "Error SQL: " + err.sqlMessage });
      }

      console.log("✅ Usuario creado correctamente con ID:", result.insertId);
      return res.json({ success: true, message: "Usuario registrado correctamente ✅", id: result.insertId });
    });
  });
};
