const sendEmailBtn = document.getElementById('sendEmailBtn');
const modal = document.getElementById('modalCodigo');
const cerrarModal = document.getElementById('cerrarModal');
const validarCodigoBtn = document.getElementById('validarCodigoBtn');
const codigoInput = document.getElementById('codigoInput');

sendEmailBtn.addEventListener('click', function(e) {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  if (!email) return alert('Ingresa un correo válido.');
  modal.classList.remove('hidden');
  codigoInput.focus();
});

cerrarModal.addEventListener('click', () => {
  modal.classList.add('hidden');
  codigoInput.value = '';
});

validarCodigoBtn.addEventListener('click', () => {
  const codigo = codigoInput.value.trim();
  if (codigo.length !== 6) return alert('El código debe tener 6 caracteres.');
  alert('Código validado correctamente.');
  modal.classList.add('hidden');
  codigoInput.value = '';
});
