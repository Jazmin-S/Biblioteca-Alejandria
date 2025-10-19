// info.js — versión mejorada con cambio de imagen y bio
document.addEventListener('DOMContentLoaded', async () => {
  const nombreEl = document.getElementById('nombre');
  const correoEl = document.getElementById('correo');
  const rolEl = document.getElementById('rol');
  const prestamosEl = document.getElementById('prestamos');
  const volverBtn = document.getElementById('btn-volver');
  const fotoEl = document.getElementById('foto');
  const fotoInput = document.getElementById('fotoInput');
  const bioText = document.getElementById('bioText');
  const editarBioBtn = document.getElementById('editarBioBtn');
  const guardarBioBtn = document.getElementById('guardarBioBtn');

  const userId = localStorage.getItem('usuarioId');
  const rolUsuario = localStorage.getItem('usuarioRol');

  if (!userId) {
    nombreEl.textContent = '⚠️ No hay usuario en sesión';
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/api/informacion/${userId}`);
    if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);

    const data = await res.json();
    if (data.error) {
      nombreEl.textContent = 'Usuario no encontrado';
      return;
    }

    // Mostrar datos del usuario
    nombreEl.textContent = data.nombre;
    correoEl.textContent = data.correo;
    rolEl.textContent = data.rol;
    prestamosEl.textContent = data.num_prestamos;

    // Cargar imagen y bio personalizadas si existen
    const userFoto = localStorage.getItem('usuarioFoto');
    const userBio = localStorage.getItem('usuarioBio');
    if (userFoto) fotoEl.src = userFoto;
    if (userBio) bioText.value = userBio;

  } catch (err) {
    console.error('❌ Error al cargar el perfil:', err);
    nombreEl.textContent = 'Error al conectar con el servidor';
  }

  // 🖼️ Cambiar foto de perfil
  fotoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        fotoEl.src = reader.result;
        localStorage.setItem('usuarioFoto', reader.result); // Guarda la foto localmente
      };
      reader.readAsDataURL(file);
    }
  });

  // ✏️ Editar descripción
  editarBioBtn.addEventListener('click', () => {
    bioText.removeAttribute('readonly');
    bioText.focus();
    editarBioBtn.hidden = true;
    guardarBioBtn.hidden = false;
  });

  // 💾 Guardar descripción
  guardarBioBtn.addEventListener('click', () => {
    const nuevaBio = bioText.value.trim();
    localStorage.setItem('usuarioBio', nuevaBio);
    bioText.setAttribute('readonly', true);
    editarBioBtn.hidden = false;
    guardarBioBtn.hidden = true;
  });

  // 🔙 Botón volver al inicio
  volverBtn.addEventListener('click', () => {
    if (rolUsuario === 'bibliotecario') {
      window.location.href = '/html/htmlAdmin/InicioAdmin.html';
    } else {
      window.location.href = '/html/Biblioteca.html';
    }
  });
});
