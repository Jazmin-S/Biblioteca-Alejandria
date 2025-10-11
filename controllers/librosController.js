const db = require('../MySQL/db');
const path = require('path');
const multer = require('multer');

// ==================== CONFIGURACIÓN DE MULTER ====================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../images/portadas'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ==================== CONTROLADOR ====================
const librosController = {
  uploadPortada: upload.single('portada'),

  // ==================== AGREGAR ====================
  agregarLibro: (req, res) => {
    const { nombre, titulo, autor, anio_edicion, descripcion, editorial, categoria, ejemplares } = req.body;
    const portada = req.file ? '/images/portadas/' + req.file.filename : null;

    if (!nombre || !titulo || !autor || !anio_edicion || !categoria) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const query = `
      INSERT INTO LIBRO (nombre, titulo, autor, anio_edicion, descripcion, editorial, id_categoria, portada, ejemplares)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      query,
      [nombre, titulo, autor, anio_edicion, descripcion || null, editorial || null, categoria, portada, ejemplares || 1],
      (err, result) => {
        if (err) {
          console.error('❌ Error al agregar libro:', err);
          return res.status(500).json({ error: 'Error en la base de datos' });
        }
        res.status(201).json({ success: true, mensaje: '📚 Libro agregado correctamente', libroId: result.insertId });
      }
    );
  },

  // ==================== LISTAR TODOS ====================
  listarLibros: (req, res) => {
    const query = `
      SELECT l.*, c.nombre AS categoria_nombre
      FROM LIBRO l
      LEFT JOIN CATEGORIA c ON l.id_categoria = c.id_categoria
      ORDER BY l.id_libro DESC
    `;
    db.query(query, (err, results) => {
      if (err) {
        console.error('❌ Error al listar libros:', err);
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      res.json(results);
    });
  },

  // ==================== OBTENER UNO ====================
  obtenerLibroPorId: (req, res) => {
    const { id } = req.params;
    const idNum = parseInt(id, 10);
    if (Number.isNaN(idNum)) return res.status(400).json({ error: 'ID inválido' });

    const query = `
      SELECT l.*, c.nombre AS categoria_nombre
      FROM LIBRO l
      LEFT JOIN CATEGORIA c ON l.id_categoria = c.id_categoria
      WHERE l.id_libro = ?
    `;
    db.query(query, [idNum], (err, results) => {
      if (err) {
        console.error('❌ Error al obtener libro:', err);
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      if (results.length === 0) return res.status(404).json({ error: 'Libro no encontrado' });
      res.json(results[0]);
    });
  },

  // ==================== EDITAR ====================
  editarLibro: (req, res) => {
    const { id } = req.params;
    const idNum = parseInt(id, 10);
    if (Number.isNaN(idNum)) return res.status(400).json({ error: 'ID inválido' });

    const { nombre, titulo, autor, anio_edicion, descripcion, editorial, categoria, ejemplares } = req.body;
    const portada = req.file ? '/images/portadas/' + req.file.filename : null;

    const query = `
      UPDATE LIBRO
      SET nombre = ?, titulo = ?, autor = ?, anio_edicion = ?, descripcion = ?, editorial = ?, id_categoria = ?, ejemplares = ?
      ${portada ? ', portada = ?' : ''}
      WHERE id_libro = ?
    `;

    const params = portada
      ? [nombre, titulo, autor, anio_edicion, descripcion, editorial, categoria, ejemplares, portada, idNum]
      : [nombre, titulo, autor, anio_edicion, descripcion, editorial, categoria, ejemplares, idNum];

    db.query(query, params, (err) => {
      if (err) {
        console.error('❌ Error al editar libro:', err);
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      res.json({ success: true, mensaje: '✏️ Libro actualizado correctamente' });
    });
  },

  // ==================== ELIMINAR ====================
  eliminarLibro: (req, res) => {
    const { id } = req.params;
    const idNum = parseInt(id, 10);
    if (Number.isNaN(idNum)) return res.status(400).json({ error: 'ID inválido' });

    const query = 'DELETE FROM LIBRO WHERE id_libro = ?';
    db.query(query, [idNum], (err, result) => {
      if (err) {
        // 🚨 Si el libro está referenciado en DETALLE_PRESTAMO
        if (err.code === 'ER_ROW_IS_REFERENCED_2') {
          return res.status(400).json({
            error: 'No se puede eliminar este libro porque está asociado a un préstamo.'
          });
        }
        console.error('❌ Error al eliminar libro:', err);
        return res.status(500).json({ error: 'Error en la base de datos' });
      }

      if (result.affectedRows === 0)
        return res.status(404).json({ error: 'Libro no encontrado' });

      res.json({ success: true, mensaje: '🗑️ Libro eliminado correctamente' });
    });
  },
};

module.exports = librosController;
