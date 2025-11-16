// ✅ Archivo: /jsUser/UserInfo.js
document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  let userId = urlParams.get("id") || localStorage.getItem("usuarioId");

  const backBtn = document.getElementById("backBtn");
  const container = document.getElementById("prestamosContainer");

  if (!userId) {
    alert("⚠️ No se encontró la sesión del usuario.");
    window.location.href = "/html/htmlUser/UserLogin.html";
    return;
  }

  let baseURL = "";
  try { if ((await fetch("http://localhost:3001/api/status")).ok) baseURL = "http://localhost:3001"; } catch {}
  try { if (!baseURL && (await fetch("http://localhost:3000/api/status")).ok) baseURL = "http://localhost:3000"; } catch {}

  if (!baseURL) return alert("❌ No se puede conectar al servidor.");

  try {
    const res = await fetch(`${baseURL}/api/informacion/completa/${userId}`);
    const data = await res.json();

    const usuario = data.usuario;

    // Datos usuario
    document.getElementById("userNombre").textContent = usuario.nombre;
    document.getElementById("userCorreo").textContent = usuario.correo;
    document.getElementById("userRol").textContent = usuario.rol;
    document.getElementById("userDeuda").textContent = usuario.deudaTotal?.toFixed(2) || "0.00";

    // Foto
    document.getElementById("userFoto").src =
      usuario.foto ? `${baseURL}${usuario.foto}?t=${Date.now()}` : "/images/default-profile.png";

    // Descripción
    document.getElementById("userDescripcion").value = usuario.descripcion || "";

    // 🔥 FILTRAR PRÉSTAMOS VACÍOS
    let prestamosValidos = (data.prestamos || []).filter(p =>
      p && (p.libros || p.fecha || p.fecha_vencimiento || p.estado)
    );

    if (prestamosValidos.length === 0) {
      container.innerHTML = `<div class="no-prestamos"><p>No hay préstamos.</p></div>`;
    } else {
      container.innerHTML = prestamosValidos
        .map((p) => {

          const fechaPrestamo = p.fecha ? new Date(p.fecha) : null;
          const fechaVencimiento = p.fecha_vencimiento ? new Date(p.fecha_vencimiento) : null;

          let estado = p.estado ? p.estado.toLowerCase() : "activo";
          if (fechaVencimiento && new Date() > fechaVencimiento) estado = "vencido";

          return `
          <div class="prestamo-card ${estado}">
            <h3>${p.libros || "Libro sin nombre"}</h3>
            <p><strong>ID Préstamo:</strong> ${p.id_prestamo || "N/A"}</p>
            <p><strong>Estado:</strong> <span class="estado ${estado}">${estado}</span></p>
            <p><strong>Fecha préstamo:</strong> ${fechaPrestamo ? fechaPrestamo.toLocaleDateString() : "No disponible"}</p>
            <p><strong>Vencimiento:</strong> ${fechaVencimiento ? fechaVencimiento.toLocaleDateString() : "No disponible"}</p>
          </div>`;
        })
        .join("");
    }

  } catch (err) {
    container.innerHTML = `<div class="no-prestamos"><p>Error al cargar los datos.</p></div>`;
  }

  // Botón volver
  backBtn.addEventListener("click", () => {
    window.location.href = "/html/htmlUser/InicioUser.html";
  });
});
