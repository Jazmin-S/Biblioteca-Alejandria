// jsAdmin/crear-usuarios.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formUsuario");

  if (!form) {
    console.error("❌ No se encontró el formulario con id='formUsuario'");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // ✅ Capturar valores correctos
    const nombre = document.getElementById("usuario").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const contrasena = document.getElementById("contrasena").value.trim();
    const rol = document.getElementById("rol").value.trim().toLowerCase();

    // Validar
    if (!nombre || !correo || !contrasena || !rol) {
      alert("Por favor completa todos los campos obligatorios.");
      return;
    }

    const regexPassword = /^(?=.*[!@#$%^&*.,\-]).{8,}$/;
    if (!regexPassword.test(contrasena)) {
      alert("⚠️ La contraseña debe tener al menos 8 caracteres y un caracter especial.");
      return;
    }

    // 🔹 Enviar datos al backend
    const usuarioData = { nombre, correo, contrasena, rol };

    console.log("📤 Enviando datos al servidor:", usuarioData);

    try {
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
