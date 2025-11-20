// javaScript/info.js (ADMIN)
document.addEventListener("DOMContentLoaded", async () => {
  const userId = localStorage.getItem("usuarioId");

  if (!userId) {
    alert("⚠️ No se encontró la sesión.");
    window.location.href = "/html/htmlAdmin/InicioAdmin.html";
    return;
  }

  const baseURL = "http://localhost:3000";

  // =============================
  // CARGAR DATOS COMPLETOS
  // =============================
  let data;
  try {
    const res = await fetch(`${baseURL}/api/info/completa/${userId}`);
    data = await res.json();
  } catch (err) {
    console.error("❌ Error obteniendo datos:", err);
    return;
  }

  const usuario = data.usuario;
  const prestamos = data.prestamos;

  // =============================
  // MOSTRAR DATOS PERSONALES
  // =============================
  document.getElementById("userNombre").textContent = usuario.nombre;
  document.getElementById("userCorreo").textContent = usuario.correo;
  document.getElementById("userRol").textContent = usuario.rol;
  document.getElementById("userDeuda").textContent = usuario.deudaTotal;

  const userFoto = document.getElementById("userFoto");
  userFoto.src = `${baseURL}${usuario.foto}?t=${Date.now()}`;

  const txtDescripcion = document.getElementById("userDescripcion");
  txtDescripcion.value = usuario.descripcion || "";

  // =============================
  // BOTÓN REGRESAR
  // =============================
  document.getElementById("backBtn").onclick = () => {
    window.location.href = "/html/htmlAdmin/InicioAdmin.html";
  };

  // =============================
  // FORMATEAR FECHAS (DD/MM/YYYY)
  // =============================
  function formatearFecha(fechaISO) {
    const fecha = new Date(fechaISO);
    if (isNaN(fecha.getTime())) return fechaISO; // por si viene null o raro
    const dia = String(fecha.getDate()).padStart(2, "0");
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
  }

  // =============================
  // MOSTRAR PRÉSTAMOS
  // =============================
  const container = document.getElementById("prestamosContainer");
  container.innerHTML = "";

  if (!prestamos || prestamos.length === 0) {
    container.innerHTML = `<p class="no-prestamos">No tienes préstamos registrados.</p>`;
  } else {
    prestamos.forEach((p) => {
      const card = document.createElement("div");
      card.classList.add("prestamo-card");

      // Estado normalizado a minúsculas para las clases CSS
      const estadoLower = (p.estado || "").toLowerCase(); // "vencido" o "activo"

      if (estadoLower === "vencido") {
        card.classList.add("vencido");
      } else if (estadoLower === "activo") {
        card.classList.add("activo");
      }

      card.innerHTML = `
        <p><strong>ID Préstamo:</strong> ${p.id_prestamo}</p>
        <p><strong>Fecha:</strong> ${formatearFecha(p.fecha)}</p>
        <p><strong>Fecha Vencimiento:</strong> ${formatearFecha(p.fecha_vencimiento)}</p>
        <p><strong>Estado:</strong> 
          <span class="estado ${estadoLower}">
            ${p.estado}
          </span>
        </p>
        <p><strong>Libros:</strong> ${p.libros || "Sin libros"}</p>
      `;

      container.appendChild(card);
    });
  }

  // =============================
  // GUARDAR DESCRIPCION
  // =============================
  document.getElementById("btnGuardarDescripcion").onclick = async () => {
    await fetch(`${baseURL}/api/info/descripcion/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ descripcion: txtDescripcion.value }),
    });

    alert("Descripción actualizada");
  };

  // =============================
  // CAMBIAR FOTO
  // =============================
  document.getElementById("btnCambiarFoto").onclick = () =>
    document.getElementById("inputFoto").click();

  document.getElementById("inputFoto").onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("foto", file);

    const resFoto = await fetch(`${baseURL}/api/info/foto/${userId}`, {
      method: "PUT",
      body: formData,
    });

    const respuesta = await resFoto.json();
    userFoto.src = `${baseURL}${respuesta.ruta}?t=${Date.now()}`;
  };
});
