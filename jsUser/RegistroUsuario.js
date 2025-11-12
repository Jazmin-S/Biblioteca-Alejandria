document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formRegistro");
  const mensaje = document.getElementById("mensaje");
  const volverBtn = document.getElementById("volverBtn");
  const passwordInput = document.getElementById("contrasena");
  const togglePassword = document.getElementById("togglePassword");
  const eyeOpen = document.getElementById("eyeOpen");
  const eyeClosed = document.getElementById("eyeClosed");

  // 👁️ Mostrar / ocultar contraseña
  togglePassword.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    eyeOpen.style.display = isPassword ? "none" : "inline";
    eyeClosed.style.display = isPassword ? "inline" : "none";
  });

  // 🧠 Validar contraseña en tiempo real
  passwordInput.addEventListener("input", () => {
    const valor = passwordInput.value;
    const regexMayuscula = /[A-Z]/;
    const regexEspecial = /[!@#$%^&*(),.?":{}|<>]/;

    const lenCheck = document.getElementById("len-check");
    const upperCheck = document.getElementById("upper-check");
    const specialCheck = document.getElementById("special-check");
    const bars = [
      document.getElementById("bar1"),
      document.getElementById("bar2"),
      document.getElementById("bar3"),
    ];

    let puntos = 0;

    if (valor.length === 8) {
      lenCheck.textContent = "✔ 8 caracteres";
      lenCheck.style.color = "green";
      puntos++;
    } else {
      lenCheck.textContent = "✖ 8 caracteres";
      lenCheck.style.color = "red";
    }

    if (regexMayuscula.test(valor)) {
      upperCheck.textContent = "✔ Mayúscula";
      upperCheck.style.color = "green";
      puntos++;
    } else {
      upperCheck.textContent = "✖ Mayúscula";
      upperCheck.style.color = "red";
    }

    if (regexEspecial.test(valor)) {
      specialCheck.textContent = "✔ Carácter especial";
      specialCheck.style.color = "green";
      puntos++;
    } else {
      specialCheck.textContent = "✖ Carácter especial";
      specialCheck.style.color = "red";
    }

    // Actualiza barras de fuerza
    const colores = ["#ff4d4d", "#ffb84d", "#4caf50"];
    bars.forEach((bar, i) => {
      bar.style.backgroundColor = i < puntos ? colores[puntos - 1] : "#e0e0e0";
      bar.style.transition = "background-color 0.3s";
    });
  });

  // 🧾 Enviar datos al backend
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const correo = document.getElementById("correo").value.trim().toLowerCase();
    const contrasena = passwordInput.value.trim();
    const rol = document.getElementById("rol").value;

    if (!nombre || !correo || !contrasena || !rol) {
      mostrarMensaje("⚠️ Todos los campos son obligatorios.", "red");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/registroUsuario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, correo, contrasena, rol }),
      });

      const data = await res.json();

      if (data.success) {
        mostrarMensaje("✅ " + data.message, "green");
        setTimeout(() => {
          window.location.href = "/html/htmlUser/UserLogin.html";
        }, 1500);
      } else {
        mostrarMensaje("❌ " + (data.message || "Error al registrar usuario."), "red");
      }
    } catch (error) {
      console.error("Error al conectar con el servidor:", error);
      mostrarMensaje("⚠️ Error en la conexión con el servidor.", "red");
    }
  });

  // 🔙 Botón volver
  volverBtn.addEventListener("click", () => {
    window.location.href = "/html/htmlUser/UserLogin.html";
  });

  function mostrarMensaje(texto, color) {
    mensaje.textContent = texto;
    mensaje.style.color = color;
  }
});
