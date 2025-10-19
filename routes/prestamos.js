const express = require('express');
const router = express.Router();
const prestamosCtrl = require('../controllers/prestamosController');

// Rutas base: /api/prestamos
router.get('/', prestamosCtrl.obtenerPrestamos);
router.get('/buscar', prestamosCtrl.buscarPrestamos);
router.get('/detalle/:id', prestamosCtrl.detallePrestamo);
router.get('/validar/:id', prestamosCtrl.validarPrestamoUsuario);
router.post('/', prestamosCtrl.agregarPrestamo);

module.exports = router;
