const express = require('express');
const router = express.Router();
const informesCtrl = require('../controllers/informesController');

router.get('/', informesCtrl.generarInformes);
router.get('/resumen', informesCtrl.generarResumenSolo);
router.get('/usuarios', informesCtrl.informeUsuarios);
router.get('/libros', informesCtrl.informeLibros);
router.get('/prestamos', informesCtrl.informePrestamos);
router.get('/vencidos-global', informesCtrl.informeVencidosGlobal); // ✅

module.exports = router;
