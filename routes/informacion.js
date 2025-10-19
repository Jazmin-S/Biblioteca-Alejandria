// routes/informacion.js
const express = require('express');
const router = express.Router();
const informacionController = require('../controllers/informacionController');

// ✅ Rutas principales
router.get('/informacion/:id', informacionController.obtenerInformacion);
router.get('/informacion', informacionController.listarUsuarios);
router.put('/informacion/:id', informacionController.actualizarInformacion);

// ✅ Nueva ruta para obtener datos del usuario activo (simulada)
router.get('/informacion/sesion/:id', informacionController.obtenerInformacion);

module.exports = router;
