const db = require('../MySQL/db');

const authController = {
    verificarCorreo: (req, res) => {
        const { correo } = req.body;
        if (!correo) return res.status(400).json({ error: 'Correo requerido' });

        const query = 'SELECT id_usuario FROM USUARIO WHERE correo = ?';
        db.execute(query, [correo], (err, results) => {
            if (err) return res.status(500).json({ error: 'Error del servidor' });
            if (results.length > 0) res.json({ existe: true, mensaje: 'Correo encontrado' });
            else res.json({ existe: false, mensaje: 'Correo no registrado' });
        });
    },

    actualizarContrasena: (req, res) => {
        const { correo, nuevaContrasena } = req.body;

        if (!correo || !nuevaContrasena) {
            return res.status(400).json({ success: false, message: 'Datos incompletos' });
        }

        const query = 'UPDATE USUARIO SET contrasena = ? WHERE correo = ?';
        db.execute(query, [nuevaContrasena, correo], (err, result) => {
            if (err) return res.status(500).json({ success: false, message: 'Error del servidor' });

            if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

            console.log(`✅ Contraseña actualizada para: ${correo}`);
            res.json({ success: true });
        });
    },

    login: (req, res) => {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ success: false, message: 'Faltan campos' });

        const query = 'SELECT id_usuario, correo, contrasena, nombre, rol FROM USUARIO WHERE correo = ?';
        db.execute(query, [email], (err, results) => {
            if (err) return res.status(500).json({ success: false, message: 'Error del servidor' });
            if (results.length === 0) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
            
            const usuario = results[0];
            if (password !== usuario.contrasena) {
                return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
            }

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