// AdminLogin.js
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ Script de AdminLogin cargado");

  const loginForm = document.getElementById("login-form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const exitBtn = document.querySelector(".exit-btn");
  const createAccountBtn = document.getElementById("create-account-btn");
  const forgotPasswordBtn = document.getElementById("forgot-password-btn");
  const toggleBtn = document.getElementById("togglePass");

  // 👁️ Mostrar / ocultar contraseña
  toggleBtn.addEventListener("click", () => {
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      toggleBtn.textContent = "🙈";
    } else {
      passwordInput.type = "password";
      toggleBtn.textContent = "👁️";
    }
  });

  // 🔙 Botón salir
  exitBtn.addEventListener("click", () => {
    window.location.href = "/html/Biblioteca.html";
  });

  // 🔐 Login con validación
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      mostrarError("Por favor, complete todos los campos.");
      return;
    }

    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexCorreo.test(email)) {
      mostrarError("Debe ingresar un correo válido (ejemplo: usuario@gmail.com)");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Guardar sesión
        sessionStorage.setItem("usuario", JSON.stringify(data.usuario));
        sessionStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("usuarioId", data.usuario.id);
        localStorage.setItem("usuarioNombre", data.usuario.nombre);
        localStorage.setItem("usuarioRol", data.usuario.rol);

        mostrarExito("✅ Inicio de sesión exitoso. Redirigiendo...");

        setTimeout(() => {
          window.location.href = "/html/htmlAdmin/InicioAdmin.html";
        }, 2000);
      } else {
        mostrarError(data.message || "❌ Usuario o contraseña incorrectos");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      mostrarError("❌ Error al conectar con el servidor.");
    }
  });

  // 🧾 Crear cuenta
  createAccountBtn.addEventListener("click", () => {
    window.location.href = "/html/htmlAdmin/RegistroAdmin.html";
  });

  // 🔑 Recuperar contraseña
  forgotPasswordBtn.addEventListener("click", () => {
    window.location.href = "/html/recuperar-contraseña.html";
  });

  // ⚠️ Funciones de mensajes
  function mostrarError(mensaje) {
    limpiarMensajes();
    const div = document.createElement("div");
    div.className = "error-message";
    div.textContent = mensaje;
    loginForm.appendChild(div);
  }

  function mostrarExito(mensaje) {
    limpiarMensajes();
    const div = document.createElement("div");
    div.className = "success-message";
    div.textContent = mensaje;
    loginForm.appendChild(div);
  }

  function limpiarMensajes() {
    document.querySelectorAll(".error-message, .success-message").forEach(e => e.remove());
  }
});
