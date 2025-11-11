// 📁 routes/prestamos.js
const express = require('express');
const router = express.Router();
const prestamosCtrl = require('../controllers/prestamosController');

// 📚 Obtener todos los préstamos
router.get('/', prestamosCtrl.obtenerPrestamos);

// 🔍 Buscar préstamos por nombre
router.get('/buscar', prestamosCtrl.buscarPrestamos);

// 📖 Ver detalle de un préstamo por ID
router.get('/detalle/:id', prestamosCtrl.detallePrestamo);

// ✅ Validar si el usuario tiene préstamos vencidos
router.get('/validar/:id', prestamosCtrl.validarPrestamoUsuario);

// 📨 Enviar notificaciones por correo de vencimientos
router.get('/notificar/vencimientos', prestamosCtrl.notificarVencimientos);

// ➕ Agregar nuevo préstamo
router.post('/', prestamosCtrl.agregarPrestamo);

// 🟡 Marcar préstamo como ENTREGADO (sin pago)
router.patch('/:id/entregado', prestamosCtrl.entregadoSinPago);

// 🟢 Marcar préstamo como FINALIZADO (pagado)
router.patch('/:id/finalizar', prestamosCtrl.finalizarConPago);

// ❌ Marcar préstamo como DEVUELTO (compatibilidad con versiones anteriores)
router.delete('/:id', (req, res) => {
    try {
        const id = req.params.id;
        // Aquí puedes conectar con tu base de datos si aún quieres soportar esta acción
        // o simplemente devolver un mensaje de compatibilidad.
        res.json({ mensaje: `Ruta antigua: el préstamo con ID ${id} sería marcado como devuelto.` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al procesar la eliminación del préstamo' });
    }
});

module.exports = router;
