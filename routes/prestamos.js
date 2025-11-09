const express = require('express');
const router = express.Router();
const prestamosCtrl = require('../controllers/prestamosController');

// 📚 Obtener préstamos
router.get('/', prestamosCtrl.obtenerPrestamos);

// 🔍 Buscar por nombre
router.get('/buscar', prestamosCtrl.buscarPrestamos);

// 📖 Detalle por ID
router.get('/detalle/:id', prestamosCtrl.detallePrestamo);

// ✅ Validar si usuario tiene préstamo vencido
router.get('/validar/:id', prestamosCtrl.validarPrestamoUsuario);

// 📨 Notificaciones por correo
router.get('/notificar/vencimientos', prestamosCtrl.notificarVencimientos);

// ➕ Nuevo préstamo
router.post('/', prestamosCtrl.agregarPrestamo);

// ❌ Eliminar préstamo (versión anterior, compatibilidad)
router.delete('/:id', prestamosCtrl.marcarComoDevuelto);

// 🟡 Nuevo: marcar préstamo como ENTREGADO (sin pagar deuda)
router.patch('/:id/entregado', prestamosCtrl.entregadoSinPago);

// 🟢 Nuevo: marcar préstamo como FINALIZADO (pagado)
router.patch('/:id/finalizar', prestamosCtrl.finalizarConPago);

module.exports = router;
