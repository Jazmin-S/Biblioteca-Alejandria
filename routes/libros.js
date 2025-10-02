// routes/libros.js
const express = require('express');
const router = express.Router();
const librosController = require('../controllers/librosController');

// === RUTAS DE LIBROS ===

// POST /api/libros → agregar un libro con multer
router.post(
  '/libros',
  librosController.uploadPortada,  // procesa FormData y archivo
  librosController.agregarLibro
);

// GET /api/libros → listar todos los libros
router.get('/libros', librosController.listarLibros);

// GET /api/libros/:id → obtener un libro por ID
router.get('/libros/:id', librosController.obtenerLibroPorId);

// PUT /api/libros/:id → editar un libro (con opción de nueva portada)
router.put(
  '/libros/:id',
  librosController.uploadPortada,
  librosController.editarLibro
);

// DELETE /api/libros/:id → eliminar un libro
router.delete('/libros/:id', librosController.eliminarLibro);

module.exports = router;
