// routes/informacion.js
const express = require('express');
const router = express.Router();
const informacionController = require('../controllers/informacionController');

router.get('/informacion/:id', informacionController.obtenerInformacion);
router.get('/informacion', informacionController.listarUsuarios);
router.put('/informacion/:id', informacionController.actualizarInformacion);
router.get('/informacion/completa/:id', informacionController.obtenerDatosCompletos);

module.exports = router;
