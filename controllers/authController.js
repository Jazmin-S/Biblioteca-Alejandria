// ✅ authController.js corregido y mejorado
const db = require('../MySQL/db');
const bcrypt = require('bcryptjs'); // Asegúrate de tenerlo instalado: npm install bcryptjs

const authController = {
    // 🔍 Verifica si el correo existe
    verificarCorreo: (req, res) => {
        const { correo } = req.body;
        if (!correo) return res.status(400).json({ error: 'Correo requerido' });

        const query = 'SELECT id_usuario FROM USUARIO WHERE correo = ?';
        db.execute(query, [correo], (err, results) => {
            if (err) {
                console.error('❌ Error en verificarCorreo:', err);
                return res.status(500).json({ error: 'Error del servidor' });
            }
            if (results.length > 0) {
                res.json({ existe: true, mensaje: 'Correo encontrado' });
            } else {
                res.json({ existe: false, mensaje: 'Correo no registrado' });
            }
        });
    },

    // 🔐 Actualiza contraseña y la guarda cifrada
    actualizarContrasena: (req, res) => {
        const { correo, nuevaContrasena } = req.body;

        if (!correo || !nuevaContrasena) {
            return res.status(400).json({ success: false, message: 'Datos incompletos' });
        }

        const hashed = bcrypt.hashSync(nuevaContrasena, 10);
        const query = 'UPDATE USUARIO SET contrasena = ? WHERE correo = ?';
        db.execute(query, [hashed, correo], (err, result) => {
            if (err) {
                console.error('❌ Error en actualizarContrasena:', err);
                return res.status(500).json({ success: false, message: 'Error del servidor' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
            }

            res.json({ success: true, message: 'Contraseña actualizada correctamente' });
        });
    },

    // 🚀 LOGIN CORREGIDO: acepta contraseñas cifradas o antiguas en texto plano
    login: (req, res) => {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ success: false, message: 'Faltan campos' });

        const query = 'SELECT id_usuario, correo, contrasena, nombre, rol FROM USUARIO WHERE correo = ?';
        db.execute(query, [email], async (err, results) => {
            if (err) {
                console.error('❌ Error en login:', err);
                return res.status(500).json({ success: false, message: 'Error del servidor' });
            }

            if (results.length === 0) {
                console.log(`❌ Usuario no encontrado: ${email}`);
                return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
            }

            const usuario = results[0];
            let passwordValida = false;

            // ✅ Si la contraseña está hasheada (bcrypt empieza con $2a$ o $2b$)
            if (usuario.contrasena.startsWith('$2a$') || usuario.contrasena.startsWith('$2b$')) {
                passwordValida = bcrypt.compareSync(password, usuario.contrasena);
            } else {
                // ⚠️ Si está en texto plano, compara directo y luego la cifra automáticamente
                if (password === usuario.contrasena) {
                    passwordValida = true;
                    const hashed = bcrypt.hashSync(password, 10);
                    // 🔁 Actualiza automáticamente la BD para futuras veces
                    db.execute('UPDATE USUARIO SET contrasena = ? WHERE id_usuario = ?', [hashed, usuario.id_usuario]);
                    console.log(`🔄 Contraseña de ${email} fue cifrada automáticamente.`);
                }
            }

            if (!passwordValida) {
                console.log(`❌ Contraseña incorrecta para: ${email}`);
                return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
            }

            console.log(`✅ Login exitoso para: ${email}`);
            res.json({
                success: true,
                usuario: {
                    id: usuario.id_usuario,
                    correo: usuario.correo,
                    nombre: usuario.nombre,
                    rol: usuario.rol
                }
            });
        });
    }
};

module.exports = authController;
