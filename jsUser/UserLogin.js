// =========================
// 🧠 LOGIN DE USUARIO - BIBLIOTECA ALEJANDRÍA
// =========================
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formLogin");
  const mensaje = document.getElementById("mensaje");
  const togglePassword = document.getElementById("togglePassword");
  const inputPassword = document.getElementById("contrasena");
  const exitBtn = document.getElementById("exitBtn");
  const crearCuentaBtn = document.getElementById("create-account-btn");

  // =========================
  // 👁️ Mostrar / ocultar contraseña
  // =========================
  togglePassword.addEventListener("click", () => {
    const tipo = inputPassword.type === "password" ? "text" : "password";
    inputPassword.type = tipo;
    togglePassword.textContent = tipo === "password" ? "👁️" : "🙈";
  });

  // =========================
  // 🚪 Botón Salir
  // =========================
  exitBtn.addEventListener("click", () => {
    window.location.href = "/html/Biblioteca.html";
  });

  // =========================
  // 🧾 Envío del formulario
  // =========================
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const correo = document.getElementById("correo").value.trim().toLowerCase();
    const contrasena = inputPassword.value.trim();

    // Validación básica
    if (!correo || !contrasena) {
      mostrarMensaje("⚠️ Ingresa tu correo y contraseña.", "yellow");
      return;
    }

    try {
      // ✅ Conexión correcta con tu backend que usa /api
      const response = await fetch("http://localhost:3000/api/loginUsuario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, contrasena }),
      });

      // Si el servidor no responde correctamente
      if (!response.ok) {
        mostrarMensaje("⚠️ No se pudo contactar con el servidor.", "red");
        return;
      }

      const data = await response.json();

      // =========================
      // 🔐 Resultado del login
      // =========================
      if (data.success) {
        const usuario = data.usuario;
        mostrarMensaje("✅ Bienvenido " + usuario.nombre, "lightgreen");

        // Guardar usuario en localStorage
        localStorage.setItem("usuario", JSON.stringify(usuario));

        // Redirigir después de 1 segundo
        setTimeout(() => {
          window.location.href = "/html/htmlUser/InicioUser.html";
        }, 1000);
      } else {
        mostrarMensaje("❌ " + (data.message || "Usuario o contraseña incorrectos."), "red");
      }
    } catch (error) {
      console.error("Error al conectar con el servidor:", error);
      mostrarMensaje("⚠️ Error en la conexión con el servidor.", "red");
    }
  });

  // =========================
  // 🧩 Crear cuenta
  // =========================
  if (crearCuentaBtn) {
    crearCuentaBtn.addEventListener("click", () => {
      window.location.href = "/html/htmlUser/RegisterUser.html";
    });
  }

  // =========================
  // 💬 Función para mostrar mensajes
  // =========================
  function mostrarMensaje(texto, color) {
    mensaje.textContent = texto;
    mensaje.style.color = color;
  }
});
