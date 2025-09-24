const express = require('express');
const router = express.Router();

// Importar todas las rutas
const usuarioRoutes = require('./usuarios');
const authRoutes = require('./auth');

// Combinar rutas
router.use(usuarioRoutes);
router.use(authRoutes);

module.exports = router;