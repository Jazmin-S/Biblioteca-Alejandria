// UserLogin.js
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ Script de UserLogin cargado");

  const form = document.getElementById("formLogin");
  const correoInput = document.getElementById("correo");
  const passwordInput = document.getElementById("contrasena");
  const exitBtn = document.getElementById("exitBtn");
  const createAccountBtn = document.getElementById("create-account-btn");
  const toggleBtn = document.getElementById("togglePassword");
  const forgotPasswordBtn = document.getElementById("forgot-password-btn"); // por si lo tienes
  const mensaje = document.getElementById("mensaje");

  // 👁️ Mostrar / ocultar contraseña
  if (toggleBtn && passwordInput) {
    toggleBtn.addEventListener("click", () => {
      if (passwordInput.type === "password") {
        passwordInput.type = "text";
        toggleBtn.textContent = "🙈";
      } else {
        passwordInput.type = "password";
        toggleBtn.textContent = "👁️";
      }
    });
  }

  // 🔙 Botón salir
  if (exitBtn) {
    exitBtn.addEventListener("click", () => {
      window.location.href = "/html/Biblioteca.html";
    });
  }

  // 🔐 Login de usuario con validación (similar a AdminLogin.js)
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      limpiarMensajes();

      const correo = (correoInput?.value || "").trim().toLowerCase();
      const contrasena = (passwordInput?.value || "").trim();

      if (!correo || !contrasena) {
        mostrarError("Por favor, completa todos los campos.");
        return;
      }

      const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regexCorreo.test(correo)) {
        mostrarError("Debe ingresar un correo válido (ejemplo: usuario@gmail.com)");
        return;
      }

      try {
        const response = await fetch("http://localhost:3000/api/loginUsuario", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ correo, contrasena }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          const usuario = data.usuario || {};

          // Guardar sesión (similar a AdminLogin.js)
          sessionStorage.setItem("usuario", JSON.stringify(usuario));
          sessionStorage.setItem("isLoggedIn", "true");
          if (usuario.id_usuario || usuario.id) {
            localStorage.setItem("usuarioId", usuario.id_usuario || usuario.id);
          }
          if (usuario.nombre) {
            localStorage.setItem("usuarioNombre", usuario.nombre);
          }
          if (usuario.rol) {
            localStorage.setItem("usuarioRol", usuario.rol);
          }

          mostrarExito("✅ Inicio de sesión exitoso. Redirigiendo...");

          setTimeout(() => {
            window.location.href = "/html/htmlUser/InicioUser.html";
          }, 2000);
        } else {
          mostrarError(data.message || "❌ Usuario o contraseña incorrectos");
        }
      } catch (error) {
        console.error("Error de conexión:", error);
        mostrarError("❌ Error al conectar con el servidor.");
      }
    });
  }

  // 🧾 Crear cuenta
  if (createAccountBtn) {
    createAccountBtn.addEventListener("click", () => {
      window.location.href = "/html/htmlUser/RegistroUsuario.html";
    });
  }

  // 🔑 Recuperar contraseña (si tienes esa página para usuarios)
  if (forgotPasswordBtn) {
    forgotPasswordBtn.addEventListener("click", () => {
      window.location.href = "/html/recuperar-contraseña.html";
    });
  }

  // ⚠️ Mensajes (igual estilo que AdminLogin.js pero usando #mensaje)
  function mostrarError(texto) {
    if (!mensaje) return;
    mensaje.textContent = texto;
    mensaje.className = "error-message";
  }

  function mostrarExito(texto) {
    if (!mensaje) return;
    mensaje.textContent = texto;
    mensaje.className = "success-message";
  }

  function limpiarMensajes() {
    if (!mensaje) return;
    mensaje.textContent = "";
    mensaje.className = "";
  }
});
