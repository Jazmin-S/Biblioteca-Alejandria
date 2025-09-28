const express = require('express');
const router = express.Router();

// Importar todas las rutas
const usuarioRoutes = require('./usuarios');
const authRoutes = require('./auth');
const emailRoutes = require('./email');
const registroAdminRoutes = require('./registroadmin');

// Combinar rutas
router.use(usuarioRoutes);
router.use(authRoutes);
router.use(emailRoutes);
router.use('/registroadmin', registroAdminRoutes);

// Ruta de prueba API (quitar la duplicada del server.js)
router.get('/test', (req, res) => {
    res.json({ 
        mensaje: '✅ Servidor funcionando correctamente', 
        timestamp: new Date(),
        version: '1.0.0'
    });
});

module.exports = router;