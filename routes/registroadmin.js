const express = require('express');
const router = express.Router();
const registroController = require('../controllers/registroController');

// Ruta de registro
router.post('/registro', registroController.crearUsuario);

module.exports = router;
