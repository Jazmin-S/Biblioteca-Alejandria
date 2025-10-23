// jsAdmin/crear-usuarios.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formUsuario");

  // === Modal dinámico ===
  const modal = document.createElement("div");
  modal.id = "modal";
  modal.classList.add("modal");
  modal.innerHTML = `
    <div class="modal-content">
      <p id="modal-message"></p>
      <button id="closeModal">Cerrar</button>
    </div>
  `;
  document.body.appendChild(modal);

  const modalMessage = document.getElementById("modal-message");
  const closeModal = document.getElementById("closeModal");

  function showModal(message, success = false) {
    modalMessage.textContent = message;
    modal.classList.add("show");
    modal.classList.toggle("success", success);
  }

  closeModal.addEventListener("click", () => {
    modal.classList.remove("show");
  });

  // === Mostrar/Ocultar contraseña ===
  const togglePassword = document.getElementById("togglePassword");
  const inputPassword = document.getElementById("contrasena");
  togglePassword.addEventListener("click", () => {
    const tipo = inputPassword.type === "password" ? "text" : "password";
    inputPassword.type = tipo;
    togglePassword.textContent = tipo === "password" ? "👁️" : "🔐";
  });

  // === Validación dinámica ===
  const reglas = {
    len: document.getElementById("len"),
    mayus: document.getElementById("mayus"),
    minus: document.getElementById("minus"),
    num: document.getElementById("num"),
    esp: document.getElementById("esp"),
  };

  inputPassword.addEventListener("input", () => {
    const val = inputPassword.value;

    toggleRule(reglas.len, val.length === 8);
    toggleRule(reglas.mayus, /[A-Z]/.test(val));
    toggleRule(reglas.minus, /[a-z]/.test(val));
    toggleRule(reglas.num, /\d/.test(val));
    toggleRule(reglas.esp, /[!@#$%^&*.,\-]/.test(val));
  });

  function toggleRule(element, condition) {
    if (condition) {
      element.classList.remove("invalid");
      element.classList.add("valid");
    } else {
      element.classList.remove("valid");
      element.classList.add("invalid");
    }
  }

  // === Botón regresar ===
  document.getElementById('btnExit').addEventListener('click', () => {
    window.location.href = '/html/htmlAdmin/editar-usuarios.html';
  });

  // === Envío del formulario ===
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("usuario").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const contrasena = inputPassword.value.trim();
    const rol = document.getElementById("rol").value.trim().toLowerCase();

    if (!nombre || !correo || !contrasena || !rol) {
      showModal("Por favor completa todos los campos obligatorios.");
      return;
    }

    const valido =
      contrasena.length === 8 &&
      /[A-Z]/.test(contrasena) &&
      /[a-z]/.test(contrasena) &&
      /\d/.test(contrasena) &&
      /[!@#$%^&*.,\-]/.test(contrasena);

    if (!valido) {
      showModal("⚠️ La contraseña no cumple con todos los requisitos.");
      return;
    }

    const usuarioData = { nombre, correo, contrasena, rol };

    try {
      const response = await fetch("http://localhost:3000/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuarioData),
      });

      const data = await response.json();

      if (data.success) {
        showModal("✅ Usuario creado exitosamente. Redirigiendo...", true);
        form.reset();
        setTimeout(() => {
          window.location.href = "/html/htmlAdmin/editar-usuarios.html";
        }, 1000);
      } else {
        showModal("⚠️ " + (data.message || "Error al crear usuario."));
      }
    } catch (error) {
      console.error("❌ Error al registrar usuario:", error);
      showModal("❌ Error de conexión con el servidor.");
    }
  });
});
