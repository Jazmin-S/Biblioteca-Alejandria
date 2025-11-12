const express = require('express');
const router = express.Router();
const registroUsuarioController = require('../controllers/registroUsuarioController');

// ⚙️ Ruta corregida (ya no incluye /api)
router.post('/registroUsuario', registroUsuarioController.crearUsuario);

module.exports = router;
