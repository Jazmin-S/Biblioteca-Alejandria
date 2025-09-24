// Obtener email de la URL
const urlParams = new URLSearchParams(window.location.search);
const email = urlParams.get('email');

// Elementos del DOM
const form = document.getElementById('formNuevaContrasena');
const nuevaContrasenaInput = document.getElementById('nuevaContrasena');
const confirmarContrasenaInput = document.getElementById('confirmarContrasena');
const cambiarContrasenaBtn = document.getElementById('cambiarContrasenaBtn');
const messageDiv = document.getElementById('message');
const strengthMeter = document.getElementById('strengthMeter');

// Requisitos de contraseña
const lengthReq = document.getElementById('lengthReq');
const upperReq = document.getElementById('upperReq');
const lowerReq = document.getElementById('lowerReq');
const numberReq = document.getElementById('numberReq');
const specialReq = document.getElementById('specialReq');

// Mostrar mensajes
function showMessage(text, type) {
  messageDiv.textContent = text;
  messageDiv.className = `message ${type}`;
  messageDiv.style.display = 'block';
  if (type === 'success') {
    setTimeout(() => { messageDiv.style.display = 'none'; }, 5000);
  }
}

// Validar contraseña
function validatePassword(password) {
  return password.length >= 8 &&
         /[A-Z]/.test(password) &&
         /[a-z]/.test(password) &&
         /[0-9]/.test(password) &&
         /[^A-Za-z0-9]/.test(password);
}

// Actualizar barra de fortaleza
function updatePasswordStrength(password) {
  let strength = 0;
  if (password.length >= 8) strength += 20;
  if (/[A-Z]/.test(password)) strength += 20;
  if (/[a-z]/.test(password)) strength += 20;
  if (/[0-9]/.test(password)) strength += 20;
  if (/[^A-Za-z0-9]/.test(password)) strength += 20;

  strengthMeter.className = 'strength-meter';
  if (strength <= 33) strengthMeter.classList.add('strength-weak');
  else if (strength <= 66) strengthMeter.classList.add('strength-medium');
  else strengthMeter.classList.add('strength-strong');

  updateRequirements(password);
}

// Actualizar requisitos visuales
function updateRequirements(password) {
  password.length >= 8 ? lengthReq.classList.add('valid') : lengthReq.classList.remove('valid');
  /[A-Z]/.test(password) ? upperReq.classList.add('valid') : upperReq.classList.remove('valid');
  /[a-z]/.test(password) ? lowerReq.classList.add('valid') : lowerReq.classList.remove('valid');
  /[0-9]/.test(password) ? numberReq.classList.add('valid') : numberReq.classList.remove('valid');
  /[^A-Za-z0-9]/.test(password) ? specialReq.classList.add('valid') : specialReq.classList.remove('valid');
}

// Evento de actualización en tiempo real
nuevaContrasenaInput.addEventListener('input', function() {
  updatePasswordStrength(this.value);
});

// Envío del formulario
form.addEventListener('submit', async function(e) {
  e.preventDefault();
  const nuevaContrasena = nuevaContrasenaInput.value;
  const confirmarContrasena = confirmarContrasenaInput.value;

  if (nuevaContrasena !== confirmarContrasena) {
    showMessage('Las contraseñas no coinciden.', 'error');
    return;
  }

  if (!validatePassword(nuevaContrasena)) {
    showMessage('La contraseña no cumple con los requisitos.', 'error');
    return;
  }

  cambiarContrasenaBtn.disabled = true;
  cambiarContrasenaBtn.innerHTML = '<span class="icon">⏳</span> Actualizando...';

  try {
    const response = await fetch('http://localhost:3000/api/actualizar-contrasena', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo: email, nuevaContrasena })
    });

    const result = await response.json();
    if (result.success) {
      showMessage('¡Contraseña actualizada correctamente! Serás redirigido al inicio de sesión.', 'success');
      setTimeout(() => { window.location.href = 'Biblioteca.html'; }, 3000);
    } else {
      showMessage('Error al actualizar la contraseña.', 'error');
      cambiarContrasenaBtn.disabled = false;
      cambiarContrasenaBtn.innerHTML = 'Cambiar contraseña';
    }
  } catch (err) {
    console.error(err);
    showMessage('Error de conexión con el servidor.', 'error');
    cambiarContrasenaBtn.disabled = false;
    cambiarContrasenaBtn.innerHTML = 'Cambiar contraseña';
  }
});
