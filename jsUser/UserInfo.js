// =============================
// Archivo: /jsUser/UserInfo.js
// PERFIL DE USUARIO
// =============================

document.addEventListener("DOMContentLoaded", async () => {
  let userId = localStorage.getItem("usuarioId");

  if (!userId) {
    alert("⚠️ No hay sesión activa.");
    window.location.href = "/html/htmlUser/UserLogin.html";
    return;
  }

  // Detectar servidor
  let baseURL = "";
  const origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001"
  ];

  for (const o of origins) {
    try {
      const r = await fetch(`${o}/api/status`);
      if (r.ok) {
        baseURL = o;
        break;
      }
    } catch {}
  }

  if (!baseURL) {
    alert("❌ No se pudo conectar al servidor.");
    return;
  }

  // =============================
  // CARGAR INFORMACIÓN DEL USUARIO
  // =============================
  async function cargarDatos() {
    const res = await fetch(`${baseURL}/api/info/completa/${userId}`);
    const data = await res.json();

    const usuario = data.usuario;
    const prestamos = data.prestamos;

    document.getElementById("userNombre").textContent = usuario.nombre;
    document.getElementById("userCorreo").textContent = usuario.correo;
    document.getElementById("userRol").textContent = usuario.rol;
    document.getElementById("userDeuda").textContent = usuario.deudaTotal;

    // FOTO
    const userFoto = document.getElementById("userFoto");
    if (usuario.foto) {
      userFoto.src = `${baseURL}${usuario.foto}?t=${Date.now()}`;
    }

    // DESCRIPCIÓN
    document.getElementById("userDescripcion").value = usuario.descripcion || "";

    // PRÉSTAMOS
    const container = document.getElementById("prestamosContainer");
    container.innerHTML = "";

    if (prestamos.length === 0) {
      container.innerHTML = `<div class="no-prestamos">No tienes préstamos registrados.</div>`;
      return;
    }

    prestamos.forEach(p => {
      const div = document.createElement("div");

      // Aplicar CLASES DEL CSS según estado ✨
      if (p.estado === "Vencido") div.classList.add("prestamo-card", "vencido");
      else div.classList.add("prestamo-card", "activo");

      div.innerHTML = `
        <p><strong>ID:</strong> ${p.id_prestamo}</p>
        <p><strong>Fecha:</strong> ${p.fecha.split("T")[0]}</p>
        <p><strong>Vencimiento:</strong> ${p.fecha_vencimiento.split("T")[0]}</p>
        <p><strong>Libros:</strong> ${p.libros}</p>
        <p><strong>Estado:</strong> 
          <span class="estado ${p.estado === "Vencido" ? "vencido" : "activo"}">
            ${p.estado}
          </span>
        </p>
      `;

      container.appendChild(div);
    });
  }

  await cargarDatos();

  // =============================
  // GUARDAR DESCRIPCIÓN
  // =============================
  document.getElementById("btnGuardarDescripcion").onclick = async () => {
    const descripcion = document.getElementById("userDescripcion").value;

    await fetch(`${baseURL}/api/info/descripcion/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ descripcion })
    });

    alert("Descripción guardada correctamente.");
    cargarDatos();
  };

  // =============================
  // CAMBIAR FOTO
  // =============================
  const btnFoto = document.getElementById("btnCambiarFoto");
  const inputFoto = document.getElementById("inputFoto");

  btnFoto.onclick = () => inputFoto.click();

  inputFoto.onchange = async () => {
    const archivo = inputFoto.files[0];
    if (!archivo) return;

    const formData = new FormData();
    formData.append("foto", archivo);

    const res = await fetch(`${baseURL}/api/info/foto/${userId}`, {
      method: "PUT",
      body: formData,
    });

    const data = await res.json();

    if (data.error) {
      alert("❌ Error al subir imagen");
      return;
    }

    alert("✔ Foto actualizada");
    cargarDatos();
  };

  // =============================
  // BOTÓN DE REGRESAR
  // =============================
  document.getElementById("backBtn").onclick = () => {
    window.location.href = "/html/htmlUser/InicioUser.html";
  };

});
