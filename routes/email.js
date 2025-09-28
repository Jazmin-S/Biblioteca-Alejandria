const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');

// POST /api/enviar-codigo - Enviar código de verificación por email
router.post('/enviar-codigo', emailController.enviarCodigoVerificacion);

module.exports = router;