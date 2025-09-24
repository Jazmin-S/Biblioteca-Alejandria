const express = require('express');
const cors = require('cors');
const path = require('path');

// Importar rutas modularizadas
const routes = require('./routes');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Usar rutas modularizadas
app.use('/api', routes);

// Rutas de archivos estáticos
app.get('/recuperar-contraseña.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'recuperar-contraseña.html'));
});

app.get('/', (req, res) => {
    res.send('Servidor de Biblioteca de Alejandría funcionando ✅');
});

app.get('/api/test', (req, res) => {
    res.json({ mensaje: '✅ Servidor funcionando correctamente', timestamp: new Date() });
});

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log('📁 Rutas modularizadas cargadas correctamente');
});