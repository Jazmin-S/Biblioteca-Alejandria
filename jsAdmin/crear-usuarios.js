// jsAdmin/crear-usuarios.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formUsuario");

  // Crear modal dinámico
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

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("usuario").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const contrasena = document.getElementById("contrasena").value.trim();
    const rol = document.getElementById("rol").value.trim().toLowerCase();

    // Validaciones
    if (!nombre || !correo || !contrasena || !rol) {
      showModal("Por favor completa todos los campos obligatorios.");
      return;
    }

    // ✅ Contraseña exactamente 8 caracteres, 1 mayúscula y 1 caracter especial
    const regexPassword = /^(?=.*[A-Z])(?=.*[!@#$%^&*.,\-])[A-Za-z\d!@#$%^&*.,\-]{8}$/;
    if (!regexPassword.test(contrasena)) {
      showModal("La contraseña debe tener exactamente 8 caracteres, incluir al menos una mayúscula y un carácter especial.");
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

        // Esperar 2 segundos y redirigir
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
