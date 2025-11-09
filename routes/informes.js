const express = require('express');
const router = express.Router();
const informesCtrl = require('../controllers/informesController');

// ✅ Soporta las dos formas:

// 1) Raíz: /api/informes?year=YYYY&month=MM  → devuelve TODO (resumen + tablas)
router.get('/', informesCtrl.generarInformes);

// 2) Endpoints separados (compatibles con tu frontend actual):
router.get('/resumen', informesCtrl.generarResumenSolo);
router.get('/usuarios', informesCtrl.informeUsuarios);
router.get('/libros', informesCtrl.informeLibros);
router.get('/prestamos', informesCtrl.informePrestamos);

module.exports = router;