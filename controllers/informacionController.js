// controllers/informacionController.js
const db = require('../MySQL/db');

// ✅ Obtener información básica del usuario
exports.obtenerInformacion = (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT id_usuario, nombre, correo, rol, num_prestamos
    FROM usuario
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
    FROM usuario;
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
    UPDATE usuario
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

// ✅ Obtener datos completos del usuario, préstamos y deudas
exports.obtenerDatosCompletos = (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT 
      u.id_usuario,
      u.nombre,
      u.correo,
      u.rol,
      p.id_prestamo,
      p.fecha,
      p.fecha_vencimiento,
      IF(p.fecha_vencimiento < CURDATE(), 'Vencido', 'Activo') AS estado,
      DATEDIFF(CURDATE(), p.fecha_vencimiento) AS dias_vencido,
      GROUP_CONCAT(l.titulo SEPARATOR ', ') AS libros
    FROM usuario u
    LEFT JOIN prestamo p ON u.id_usuario = p.id_usuario
    LEFT JOIN detalle_prestamo dp ON p.id_prestamo = dp.id_prestamo
    LEFT JOIN libro l ON dp.id_libro = l.id_libro
    WHERE u.id_usuario = ?
    GROUP BY p.id_prestamo;
  `;

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('❌ Error al obtener datos completos del usuario:', err);
      return res.status(500).json({ error: 'Error del servidor' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado o sin préstamos' });
    }

    // 💰 Calcular deuda total ($10 por día vencido)
    let deudaTotal = 0;
    results.forEach(p => {
      if (p.estado === 'Vencido' && p.dias_vencido > 0) {
        deudaTotal += p.dias_vencido * 10;
      }
    });

    res.json({
      usuario: {
        id: results[0].id_usuario,
        nombre: results[0].nombre,
        correo: results[0].correo,
        rol: results[0].rol,
        deudaTotal
      },
      prestamos: results.map(p => ({
        id_prestamo: p.id_prestamo,
        fecha: p.fecha,
        fecha_vencimiento: p.fecha_vencimiento,
        estado: p.estado,
        dias_vencido: p.dias_vencido,
        libros: p.libros
      }))
    });
  });
};
