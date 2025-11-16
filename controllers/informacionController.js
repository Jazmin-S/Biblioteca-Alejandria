const db = require('../MySQL/db');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

// ==========================================
// 📦 CONFIGURACIÓN DE MULTER PARA SUBIR FOTOS
// ==========================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'Images');
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `user_${Date.now()}${ext}`;
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

exports.uploadFoto = upload.single('foto');

// ==========================================
// ✅ Obtener información básica del usuario
// ==========================================
exports.obtenerInformacion = (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT id_usuario, nombre, correo, rol, num_prestamos, foto
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

// ==========================================
// ✅ Listar todos los usuarios
// ==========================================
exports.listarUsuarios = (req, res) => {
  const query = `
    SELECT id_usuario, nombre, correo, rol, num_prestamos, foto
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

// ==========================================
// ✅ Actualizar información del usuario
// ==========================================
exports.actualizarInformacion = (req, res) => {
  const { id } = req.params;
  const { nombre, correo, rol } = req.body;

  const query = `
    UPDATE usuario
    SET nombre = ?, correo = ?, rol = ?
    WHERE id_usuario = ?;
  `;

  db.query(query, [nombre, correo, rol, id], (err, result) => {
    if (err) {
      console.error('❌ Error al actualizar usuario:', err);
      return res.status(500).json({ error: 'Error al actualizar el usuario' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ mensaje: '✅ Usuario actualizado correctamente' });
  });
};

// ==========================================
// ✅ Subir o actualizar la foto del usuario
// ==========================================
exports.subirFoto = (req, res) => {
  const { id } = req.params;

  if (!req.file) {
    return res.status(400).json({ error: 'No se recibió ninguna imagen' });
  }

  const imagePath = `/Images/${req.file.filename}`;

  const query = `UPDATE usuario SET foto = ? WHERE id_usuario = ?;`;

  db.query(query, [imagePath, id], (err, result) => {
    if (err) {
      console.error('❌ Error al guardar foto en BD:', err);
      fs.unlinkSync(req.file.path);
      return res.status(500).json({ error: 'Error al guardar foto en la base de datos' });
    }

    if (result.affectedRows === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ 
      mensaje: '✅ Foto actualizada correctamente', 
      path: imagePath 
    });
  });
};

// ==========================================
// ✅ Obtener datos completos del usuario (CORREGIDO)
// ==========================================
exports.obtenerDatosCompletos = (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT 
      u.id_usuario,
      u.nombre,
      u.correo,
      u.rol,
      u.foto,
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
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // 🟢 Filtrar préstamos reales (sin préstamos fantasma)
    const prestamosReales = results.filter(p => p.id_prestamo !== null);

    // 🟢 Calcular deuda solo en préstamos reales
    let deudaTotal = 0;
    prestamosReales.forEach(p => {
      if (p.estado === 'Vencido' && p.dias_vencido > 0) {
        deudaTotal += p.dias_vencido * 3;
      }
    });

    // 🟢 Preparar objeto final
    const prestamos = prestamosReales.map(p => ({
      id_prestamo: p.id_prestamo,
      fecha: p.fecha,
      fecha_vencimiento: p.fecha_vencimiento,
      estado: p.estado,
      dias_vencido: p.dias_vencido,
      libros: p.libros
    }));

    res.json({
      usuario: {
        id: results[0].id_usuario,
        nombre: results[0].nombre,
        correo: results[0].correo,
        rol: results[0].rol,
        foto: results[0].foto,
        deudaTotal
      },
      prestamos
    });
  });
};

// ==========================================
// ✅ Manejo de errores de Multer
// ==========================================
exports.manejarErrorMulter = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'El archivo es demasiado grande (máximo 5MB)' });
    }
  }
  res.status(500).json({ error: err.message });
};
