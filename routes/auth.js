const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// === RUTAS DE AUTENTICACIÓN ===

// POST /api/verificar-correo - Verificar si un correo existe
router.post('/verificar-correo', authController.verificarCorreo);

// POST /api/actualizar-contrasena - Actualizar contraseña
router.post('/actualizar-contrasena', authController.actualizarContrasena);

// POST /api/login - Iniciar sesión
router.post('/login', authController.login);

module.exports = router;