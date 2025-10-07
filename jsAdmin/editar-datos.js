document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const idUsuario = params.get("id");

  if (!idUsuario) {
    alert("❌ No se especificó un usuario para editar.");
    window.location.href = "/html/htmlAdmin/editar-usuarios.html";
    return;
  }

  const form = document.getElementById("formUsuario");

  // 🔹 Cargar datos del usuario al iniciar
  try {
    const response = await fetch(`http://localhost:3000/api/usuarios/${idUsuario}`);
    const data = await response.json();

    if (!data.success) {
      alert("❌ No se encontró el usuario.");
      return;
    }

    const user = data.usuario;
    document.getElementById("usuario").value = user.nombre || "";
    document.getElementById("correo").value = user.correo || "";
    document.getElementById("rol").value = user.rol || "alumno";
  } catch (error) {
    console.error("Error al obtener datos del usuario:", error);
    alert("⚠ No se pudieron cargar los datos del usuario.");
  }

  // 🔹 Guardar los cambios
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("usuario").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const rol = document.getElementById("rol").value;
    const contrasenaInput = document.getElementById("contrasena");
    const contrasena = contrasenaInput ? contrasenaInput.value.trim() : "";

    if (!nombre || !correo || !rol) {
      alert("Por favor completa todos los campos obligatorios.");
      return;
    }

    // 🔒 Si hay contraseña nueva, se valida
    if (contrasena && (contrasena.length < 8 || !/[!@#$%^&*.,_-]/.test(contrasena))) {
      alert("La contraseña debe tener al menos 8 caracteres y un símbolo especial.");
      return;
    }

    try {
      // Si la contraseña está vacía, no la mandamos al servidor
      const body = contrasena ? { nombre, correo, contrasena, rol } : { nombre, correo, rol };

      const res = await fetch(`http://localhost:3000/api/usuarios/${idUsuario}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await res.json();

      if (result.success) {
        alert("✅ Usuario actualizado correctamente.");
        window.location.href = "/html/htmlAdmin/editar-usuarios.html";
      } else {
        alert("❌ No se pudo actualizar: " + result.message);
      }

    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      alert("⚠ Error al conectar con el servidor.");
    }
  });
});
