const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Importar rutas modularizadas
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Logger middleware
app.use((req, res, next) => {
    console.log(`${new Date().toLocaleTimeString()} - ${req.method} ${req.path}`);
    next();
});

// Usar rutas modularizadas
app.use('/api', routes);

// Rutas de archivos estáticos
app.get('/recuperar-contraseña.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'recuperar-contraseña.html'));
});

app.get('/', (req, res) => {
    res.send('Servidor de Biblioteca de Alejandría funcionando ✅');
});

// Ruta de salud del servidor
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        message: 'Servidor funcionando correctamente'
    });
});

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Middleware de errores global
app.use((error, req, res, next) => {
    console.error('❌ Error del servidor:', error);
    res.status(500).json({ 
        error: 'Error interno del servidor',
        message: error.message
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log('📁 Rutas modularizadas cargadas correctamente');
});

require('dotenv').config();

console.log('🔧 Configuración cargada:');
console.log(`   Puerto: ${process.env.PORT}`);
console.log(`   Entorno: ${process.env.NODE_ENV}`);
console.log(`   Email User: ${process.env.EMAIL_USER || 'No configurado'}`);