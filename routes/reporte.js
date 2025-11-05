const express = require('express');
const router = express.Router();
const reporteCtrl = require('../controllers/reporteController');

// Ruta base: /api/reportes
router.get('/', reporteCtrl.generarReporte);

module.exports = router;