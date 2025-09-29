// routes/libros.js
const express = require('express');
const router = express.Router();
const librosController = require('../controllers/librosController');

// === RUTAS DE LIBROS ===

// POST /api/libros → agregar un libro con multer
router.post(
  '/libros',
  librosController.uploadPortada,  // 👈 procesa FormData y archivo
  librosController.agregarLibro
);

// GET /api/libros → listar todos los libros
router.get('/libros', librosController.listarLibros);

module.exports = router;
