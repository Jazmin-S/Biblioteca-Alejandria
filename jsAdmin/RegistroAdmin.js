// RegistroAdmin.js - validación cliente y manejo de errores del servidor

const form = document.getElementById('registroForm');
const usuarioInput = document.getElementById('usuario');
const correoInput = document.getElementById('correo');
const contrasenaInput = document.getElementById('contrasena');
const contrasena2Input = document.getElementById('contrasena2');
const submitBtn = document.getElementById('submitBtn');

const usuarioError = document.getElementById('usuarioError');
const correoError = document.getElementById('correoError');
const contrasenaError = document.getElementById('contrasenaError');
const contrasena2Error = document.getElementById('contrasena2Error');
const formMessage = document.getElementById('formMessage');

function showError(el, msg) {
  el.textContent = msg;
  el.style.display = 'block';
}

function hideError(el) {
  el.textContent = '';
  el.style.display = 'none';
}

function showSuccessMessage(msg) {
  formMessage.innerHTML = `<div class="success">${msg}</div>`;
}
function showFormError(msg) {
  formMessage.innerHTML = `<div class="error">${msg}</div>`;
}
function clearFormMessage() {
  formMessage.innerHTML = '';
}

// Validar que la contraseña sea exactamente 8 dígitos numéricos
function isValidPassword(pw) {
  return /^\d{8}$/.test(pw);
}

// Validación en tiempo real
contrasenaInput.addEventListener('input', () => {
  clearFormMessage();
  const v = contrasenaInput.value.trim();
  if (v.length === 0) {
    showError(contrasenaError, 'La contraseña es obligatoria.');
  } else if (!/^\d*$/.test(v)) {
    showError(contrasenaError, 'Solo se permiten dígitos (0-9).');
  } else if (v.length !== 8) {
    showError(contrasenaError, 'La contraseña debe tener exactamente 8 dígitos.');
  } else if (!isValidPassword(v)) {
    showError(contrasenaError, 'Contraseña inválida. Debe ser exactamente 8 dígitos.');
  } else {
    hideError(contrasenaError);
  }
});

contrasena2Input.addEventListener('input', () => {
  clearFormMessage();
  if (contrasena2Input.value !== contrasenaInput.value) {
    showError(contrasena2Error, 'Las contraseñas no coinciden.');
  } else {
    hideError(contrasena2Error);
  }
});

correoInput.addEventListener('input', () => {
  clearFormMessage();
  hideError(correoError);
});

usuarioInput.addEventListener('input', () => {
  clearFormMessage();
  hideError(usuarioError);
});

// Submit handler
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearFormMessage();

  // limpiar errores previos
  hideError(usuarioError);
  hideError(correoError);
  hideError(contrasenaError);
  hideError(contrasena2Error);

  const usuario = usuarioInput.value.trim();
  const correo = correoInput.value.trim();
  const contrasena = contrasenaInput.value.trim();
  const contrasena2 = contrasena2Input.value.trim();
  const rol = document.getElementById('rol').value || 'bibliotecario';

  // Validaciones cliente
  let hasError = false;
  if (!usuario) {
    showError(usuarioError, 'El usuario es obligatorio.');
    hasError = true;
  }
  if (!correo) {
    showError(correoError, 'El correo es obligatorio.');
    hasError = true;
  } else {
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(correo)) {
      showError(correoError, 'Formato de correo inválido.');
      hasError = true;
    }
  }

  if (!contrasena) {
    showError(contrasenaError, 'La contraseña es obligatoria.');
    hasError = true;
  } else if (!isValidPassword(contrasena)) {
    showError(contrasenaError, 'La contraseña debe ser exactamente 8 dígitos numéricos (0-9).');
    hasError = true;
  }

  if (contrasena !== contrasena2) {
    showError(contrasena2Error, 'Las contraseñas no coinciden.');
    hasError = true;
  }

  if (hasError) {
    showFormError('Corrige los errores marcados antes de continuar.');
    return;
  }

  // desactivar botón para evitar envíos múltiples
  submitBtn.disabled = true;
  submitBtn.textContent = 'Registrando...';

  try {
    const response = await fetch('http://localhost:3000/api/registroadmin/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, correo, contrasena, rol })
    });

    const data = await response.json().catch(() => ({}));

    if (response.ok) {
      showSuccessMessage(data.message || 'Registro realizado con éxito.');
      form.reset();
    } else {
      const text = (data.message || data.error || '').toString();

      if (/duplicate|correo|ya existe/i.test(text)) {
        showError(correoError, text || 'El correo ya está registrado.');
        showFormError('Hay errores en el formulario.');
      } else if (/password|contraseñ|contrasena/i.test(text)) {
        showError(contrasenaError, text || 'Error con la contraseña.');
        showFormError('Hay errores en el formulario.');
      } else {
        showFormError(text || 'Ocurrió un error en el servidor.');
      }
    }
  } catch (err) {
    console.error(err);
    showFormError('❌ Error en el servidor. Comprueba que la API esté corriendo.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Registrar';
  }
});
