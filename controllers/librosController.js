const db = require('../MySQL/db');
const path = require('path');
const multer = require('multer');

// Configuración de multer → guarda en /images/portadas
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../images/portadas'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

const librosController = {
    // Middleware para subida de imagen
    uploadPortada: upload.single('portada'),

    agregarLibro: (req, res) => {
        const { nombre, titulo, autor, anio_edicion, descripcion, editorial, categoria } = req.body;
        const portada = req.file ? '/images/portadas/' + req.file.filename : null;

        if (!nombre || !titulo || !autor || !anio_edicion || !categoria) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }

        const query = `
            INSERT INTO LIBRO (nombre, titulo, autor, anio_edicion, descripcion, editorial, categoria, portada) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(
            query,
            [nombre, titulo, autor, anio_edicion, descripcion || null, editorial || null, categoria, portada],
            (err, result) => {
                if (err) {
                    console.error('❌ Error al agregar libro:', err);
                    return res.status(500).json({ error: 'Error en la base de datos' });
                }

                console.log(`✅ Libro agregado: ${nombre} - ${titulo} (${autor})`);
                res.status(201).json({
                    success: true,
                    mensaje: '📚 Libro agregado correctamente',
                    libroId: result.insertId
                });
            }
        );
    },

    listarLibros: (req, res) => {
        const query = 'SELECT * FROM LIBRO ORDER BY id_libro DESC';
        db.query(query, (err, results) => {
            if (err) {
                console.error('❌ Error al listar libros:', err);
                return res.status(500).json({ error: 'Error en la base de datos' });
            }
            res.json(results);
        });
    }
};

module.exports = librosController;
