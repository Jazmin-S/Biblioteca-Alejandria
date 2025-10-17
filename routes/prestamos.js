const express = require('express');
const router = express.Router();
const prestamosController = require('../controllers/prestamosController');

router.get('/', prestamosController.obtenerPrestamos);
router.get('/:id', prestamosController.obtenerPrestamoPorId);
router.post('/', prestamosController.crearPrestamo);
router.delete('/:id', prestamosController.eliminarPrestamo);

module.exports = router;