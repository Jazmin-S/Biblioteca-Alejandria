const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware IMPORTANTE
app.use(cors()); // Permite peticiones desde el navegador
app.use(express.json()); // Para parsear JSON
app.use(express.static(__dirname)); // Servir archivos estáticos

// Configuración de la base de datos (ajusta según tu configuración)
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Tu password de MySQL
    database: 'biblioteca_alejandria' // Asegúrate de que esta BD existe
});

// Conectar a la base de datos
db.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        return;
    }
    console.log('✅ Conectado a la base de datos MySQL');
});

// Configuración de Nodemailer (modo prueba para evitar configuración de email)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'test@example.com', // No necesario en modo prueba
        pass: 'password'
    },
    // Modo desarrollo: muestra el email en la consola en lugar de enviarlo
    logger: true,
    debug: true
});

// **RUTA CRÍTICA: Verificar correo** 
app.post('/api/verificar-correo', (req, res) => {
    console.log('📥 Petición recibida en /api/verificar-correo');
    console.log('📋 Body recibido:', req.body);
    
    const { correo } = req.body;
    
    if (!correo) {
        console.log('❌ Error: Correo no proporcionado');
        return res.status(400).json({ error: 'Correo requerido' });
    }

    // SIMULACIÓN - siempre retorna true para testing
    // En producción, reemplaza con la consulta real a la BD
    console.log('🔍 Simulando verificación para:', correo);
    
    // Simular delay de base de datos
    setTimeout(() => {
        res.json({ 
            existe: true, 
            mensaje: 'Correo verificado (modo simulación)',
            correo: correo
        });
    }, 1000);
    
    /* 
    // CÓDIGO REAL PARA PRODUCCIÓN:
    const query = 'SELECT id FROM usuarios WHERE correo = ?';
    
    db.execute(query, [correo], (err, results) => {
        if (err) {
            console.error('❌ Error en la consulta:', err);
            return res.status(500).json({ error: 'Error del servidor' });
        }
        
        console.log('📊 Resultados de BD:', results);
        
        if (results.length > 0) {
            res.json({ existe: true, mensaje: 'Correo encontrado' });
        } else {
            res.json({ existe: false, mensaje: 'Correo no registrado' });
        }
    });
    */
});

// Ruta para la página principal de recuperación
app.get('/recuperar-contraseña.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'recuperar-contraseña.html'));
});

// Ruta raíz
app.get('/', (req, res) => {
    res.send('Servidor de Biblioteca de Alejandría funcionando ✅');
});

// Ruta de prueba para verificar que el servidor funciona
app.get('/api/test', (req, res) => {
    res.json({ mensaje: '✅ Servidor funcionando correctamente', timestamp: new Date() });
});

// Manejo de errores para rutas no encontradas
app.use((req, res) => {
    console.log(`❌ Ruta no encontrada: ${req.originalUrl}`);
    res.status(404).json({ error: 'Ruta no encontrada' });
});


// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📧 Ruta de verificación: http://localhost:${PORT}/api/verificar-correo`);
    console.log(`🔧 Ruta de prueba: http://localhost:${PORT}/api/test`);
});