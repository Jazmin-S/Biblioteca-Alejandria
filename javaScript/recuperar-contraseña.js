const sendEmailBtn = document.getElementById('sendEmailBtn');
const modal = document.getElementById('modalCodigo');
const cerrarModal = document.getElementById('cerrarModal');
const validarCodigoBtn = document.getElementById('validarCodigoBtn');
const codigoInput = document.getElementById('codigoInput');
const formRecuperar = document.getElementById('formRecuperar');

console.log('✅ Script cargado');

// Almacenar código temporalmente
let codigoGenerado = '';
let emailUsuario = '';

// Función para generar código de 6 dígitos
function generarCodigo() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Función para mostrar u ocultar el modal
function toggleModal(mostrar) {
    if (mostrar) {
        modal.classList.remove('hidden');
        console.log('🔓 Modal mostrado');
    } else {
        modal.classList.add('hidden');
        console.log('🔒 Modal ocultado');
    }
}

// Event listener para el formulario
formRecuperar.addEventListener('submit', async function(e) {
    e.preventDefault();
    console.log('📧 Formulario enviado');
    
    const email = document.getElementById('email').value.trim();
    console.log('📨 Email ingresado:', email);
    
    if (!email) {
        alert('❌ Ingresa un correo válido.');
        return;
    }
    
    // Validar que sea correo institucional UV
    if (!email.endsWith('@uv.mx') && !email.endsWith('@estudiantes.uv.mx')) {
        alert('❌ Solo se permiten correos institucionales UV (@uv.mx o @estudiantes.uv.mx)');
        return;
    }

    try {
        console.log('🔄 Enviando solicitud a /api/verificar-correo...');

        const response = await fetch('http://localhost:3000/api/verificar-correo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo: email })
        });

        console.log('📥 Respuesta recibida. Status:', response.status);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log('📋 Datos recibidos del servidor:', data);

        if (!data.existe) {
            alert('❌ No existe un usuario registrado con este correo electrónico.');
            return;
        }

        // Generar código
        codigoGenerado = generarCodigo();
        emailUsuario = email;
        console.log('🔑 Código generado:', codigoGenerado);

        // Mostrar el código en un alert para pruebas
        alert(`🔐 CÓDIGO DE PRUEBA: ${codigoGenerado}\n\nPara: ${email}\n\nEn producción, esto se enviaría por correo automáticamente.`);

        // Mostrar modal para ingresar código
        toggleModal(true);
        codigoInput.focus();
        
        // Expirar código después de 10 minutos
        setTimeout(() => {
            if (codigoGenerado !== '') {
                codigoGenerado = '';
                alert('⏰ El código ha expirado. Solicita uno nuevo.');
                toggleModal(false);
                codigoInput.value = '';
            }
        }, 10 * 60 * 1000);

    } catch (error) {
        console.error('❌ Error completo:', error);
        alert('⚠️ No se pudo verificar el correo. Revisa la consola para más detalles.');
    }
});

// Cerrar modal con la X
cerrarModal.addEventListener('click', () => {
    console.log('❌ Cerrando modal');
    toggleModal(false);
    codigoInput.value = '';
});

// Validar código
validarCodigoBtn.addEventListener('click', () => {
    const codigo = codigoInput.value.trim();
    console.log('🔍 Validando código:', codigo);
    
    if (codigo.length !== 6) {
        alert('❌ El código debe tener 6 caracteres.');
        codigoInput.focus();
        return;
    }
    
    if (codigo !== codigoGenerado) {
        alert('❌ Código incorrecto. Verifica el código.');
        codigoInput.value = '';
        codigoInput.focus();
        return;
    }
    
    alert('✅ Código validado correctamente. Ahora puedes crear una nueva contraseña.');
    toggleModal(false);
    codigoInput.value = '';
    codigoGenerado = '';
    
    // Redirigir a página de nueva contraseña
    window.location.href = './nueva-contraseña.html?email=' + encodeURIComponent(emailUsuario);
});

// Permitir validar con Enter
codigoInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        validarCodigoBtn.click();
    }
});

// Cerrar modal haciendo clic fuera
modal.addEventListener('click', function(e) {
    if (e.target === modal) {
        toggleModal(false);
        codigoInput.value = '';
    }
});

console.log('🎯 Event listeners configurados');
