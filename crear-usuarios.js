// jsAdmin/crear-usuario.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formUsuario");

  if (!form) {
    console.error("❌ No se encontró el formulario con id='formUsuario'");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // 🔹 Capturar valores del formulario
    const nombre = document.getElementById("usuario").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const domicilio = document.getElementById("domicilio").value.trim();
    const contrasena = document.getElementById("contrasena").value.trim();
    let rol = document.getElementById("rol").value.trim().toLowerCase(); // normalizar

    // 🔹 Validaciones básicas
    if (!nombre || !correo || !contrasena || !rol) {
      alert("Por favor completa todos los campos obligatorios.");
      return;
    }

    // Validación de contraseña (mínimo 8 caracteres y un carácter especial)
    const regexPassword = /^(?=.*[!@#$%^&*.,\-]).{8,}$/;
    if (!regexPassword.test(contrasena)) {
      alert("⚠️ La contraseña debe tener al menos 8 caracteres y un caracter especial.");
      return;
    }

    // 🔹 Preparar cuerpo de la petición
    const usuarioData = {
      nombre,
      correo,
      contrasena,
      rol,
      domicilio
    };

    console.log("📤 Enviando datos al servidor:", usuarioData);

    try {
      // 🔹 Enviar petición al backend
      const response = await fetch("http://localhost:3000/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuarioData),
      });

      const data = await response.json();

      console.log("📥 Respuesta del servidor:", data);

      if (data.success) {
        alert("✅ Usuario creado exitosamente");
        form.reset();
      } else {
        alert("⚠️ " + data.message);
      }
    } catch (error) {
      console.error("❌ Error al registrar usuario:", error);
      alert("❌ Error al registrar usuario. Revisa la consola para más detalles.");
    }
  });
});
