const nodemailer = require('nodemailer');

const emailController = {
    enviarCodigoVerificacion: async (req, res) => {
        const { correo, codigo } = req.body;

        // Validar datos
        if (!correo || !codigo) {
            return res.status(400).json({
                success: false,
                message: 'Correo y código requeridos'
            });
        }

        try {
            // Configuración del transportador (emisor fijo desde .env)
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,  // correo fijo emisor (ej: abiblioteca05@gmail.com)
                    pass: process.env.EMAIL_PASS   // app password de Google
                }
            });

            // Opciones del correo
            const mailOptions = {
                from: `"Biblioteca de Alejandría" <${process.env.EMAIL_USER}>`,
                to: correo, // correo dinámico (usuario desde DB o form)
                subject: 'Código de verificación',
                html: `
                    <h2>🔑 Recuperación de contraseña</h2>
                    <p>Hola, hemos recibido una solicitud para recuperar tu contraseña.</p>
                    <p>Tu código de verificación es:</p>
                    <h1 style="color:blue; text-align:center;">${codigo}</h1>
                    <p>Este código expirará en <b>10 minutos</b>.</p>
                `
            };

            // Enviar el correo
            await transporter.sendMail(mailOptions);

            console.log(`✅ Código enviado exitosamente a: ${correo}`);

            res.json({
                success: true,
                message: `Código enviado correctamente a ${correo}. Revisa tu bandeja de entrada.`
            });

        } catch (error) {
            console.error('❌ Error al enviar correo:', error);
            res.status(500).json({
                success: false,
                message: 'Error al enviar el código de verificación'
            });
        }
    }
};

module.exports = emailController;
