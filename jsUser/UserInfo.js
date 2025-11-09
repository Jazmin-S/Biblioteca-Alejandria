// ✅ Archivo: /public/jsUser/UserInfo.js
document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get("id") || localStorage.getItem("userId");

  const backBtn = document.getElementById("backBtn");
  const container = document.getElementById("prestamosContainer");

  if (!userId) {
    alert("No se encontró sesión activa");
    window.location.href = "/login.html";
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/api/informacion/completa/${userId}`);
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Error del servidor");

    // --- Mostrar datos ---
    document.getElementById("userNombre").textContent = data.usuario.nombre;
    document.getElementById("userCorreo").textContent = data.usuario.correo;
    document.getElementById("userRol").textContent = data.usuario.rol;
    document.getElementById("userDeuda").textContent = data.usuario.deudaTotal.toFixed(2);

    // --- Cargar préstamos ---
    if (data.prestamos.length === 0) {
      container.innerHTML = "<p>No tienes préstamos registrados.</p>";
    } else {
      container.innerHTML = data.prestamos.map(p => `
        <div class="prestamo-card ${p.estado.toLowerCase()}">
          <p><strong>Estado:</strong> ${p.estado}</p>
          <p><strong>Fecha préstamo:</strong> ${new Date(p.fecha).toLocaleDateString()}</p>
          <p><strong>Fecha vencimiento:</strong> ${p.fecha_vencimiento ? new Date(p.fecha_vencimiento).toLocaleDateString() : "Sin fecha"}</p>
          <p><strong>Libros:</strong> ${p.libros || "Ninguno"}</p>
          ${p.estado === "Vencido" ? `<p><strong>Días vencido:</strong> ${p.dias_vencido}</p>` : ""}
        </div>
      `).join('');
    }

    // --- Descripción y foto (guardadas localmente por ahora) ---
    const descArea = document.getElementById("userDescripcion");
    const btnGuardar = document.getElementById("btnGuardarDescripcion");
    const foto = document.getElementById("userFoto");
    const inputFoto = document.getElementById("inputFoto");
    const btnCambiarFoto = document.getElementById("btnCambiarFoto");

    // Cargar desde localStorage
    const perfilGuardado = JSON.parse(localStorage.getItem(`perfil_${userId}`)) || {};
    if (perfilGuardado.descripcion) descArea.value = perfilGuardado.descripcion;
    if (perfilGuardado.foto) foto.src = perfilGuardado.foto;

    // Guardar descripción
    btnGuardar.addEventListener("click", () => {
      perfilGuardado.descripcion = descArea.value;
      localStorage.setItem(`perfil_${userId}`, JSON.stringify(perfilGuardado));
      alert("✅ Descripción guardada correctamente");
    });

    // Cambiar foto
    btnCambiarFoto.addEventListener("click", () => inputFoto.click());
    inputFoto.addEventListener("change", e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        foto.src = ev.target.result;
        perfilGuardado.foto = ev.target.result;
        localStorage.setItem(`perfil_${userId}`, JSON.stringify(perfilGuardado));
      };
      reader.readAsDataURL(file);
    });

  } catch (err) {
    console.error("❌ Error:", err);
    alert("Error al conectar con el servidor");
  }

  // Volver
  backBtn.addEventListener("click", () => {
    window.location.href = "/html/htmlUser/InicioUser.html";
  });
});
