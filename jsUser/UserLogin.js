document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formLogin");
  const mensaje = document.getElementById("mensaje");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const correo = document.getElementById("correo").value.trim();
    const contrasena = document.getElementById("contrasena").value.trim();

    // Validación básica
    if (!correo || !contrasena) {
      mensaje.textContent = "⚠️ Ingresa tu correo y contraseña.";
      mensaje.style.color = "red";
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/loginUsuario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, contrasena }),
      });

      const data = await response.json();

      if (data.success) {
        const { usuario } = data;

        // Validar roles permitidos
        if (usuario.rol === "alumno" || usuario.rol === "profesor") {
          mensaje.textContent = "✅ Bienvenido " + usuario.nombre;
          mensaje.style.color = "green";

          // Guardar en localStorage
          localStorage.setItem("usuario", JSON.stringify(usuario));

          // Redirigir a home
          setTimeout(() => {
            window.location.href = "/html/htmlUser/InicioUser.html";
          }, 1000);
        } else {
          mensaje.textContent = "🚫 Solo alumnos o profesores pueden ingresar.";
          mensaje.style.color = "red";
        }
      } else {
        mensaje.textContent = "❌ " + data.message;
        mensaje.style.color = "red";
      }
    } catch (error) {
      console.error("Error al conectar con el servidor:", error);
      mensaje.textContent = "⚠️ Error al conectar con el servidor.";
      mensaje.style.color = "red";
    }
  });
});
