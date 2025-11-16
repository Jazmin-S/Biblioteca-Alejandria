// Archivo: /javaScript/info.js
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

  // =============================
  // DETECTAR SERVIDOR DISPONIBLE
  // =============================
  let baseURL = "";
  const origins = [
    "http://localhost:3000",
    "http://localhost:3001", 
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001"
  ];

  for (const origin of origins) {
    try {
      const response = await fetch(`${origin}/api/status`);
      if (response.ok) {
        baseURL = origin;
        console.log(`✅ Servidor encontrado: ${baseURL}`);
        break;
      }
    } catch (error) {
      console.log(`❌ No se pudo conectar a: ${origin}`);
    }
  }

  if (!baseURL) {
    alert("❌ No se puede conectar al servidor. Verifica que el servidor esté ejecutándose.");
    return;
  }

  try {
    // =============================
    // CARGAR INFORMACIÓN COMPLETA
    // =============================
    console.log(`📥 Cargando información del usuario ${userId} desde: ${baseURL}`);
    const res = await fetch(`${baseURL}/api/informacion/completa/${userId}`);
    
    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    const usuario = data.usuario;

    // Datos básicos
    document.getElementById("userNombre").textContent = usuario.nombre;
    document.getElementById("userCorreo").textContent = usuario.correo;
    document.getElementById("userRol").textContent = usuario.rol;
    document.getElementById("userDeuda").textContent =
      usuario.deudaTotal?.toFixed(2) || "0.00";

    // FOTO
    document.getElementById("userFoto").src = usuario.foto
      ? `${baseURL}${usuario.foto}?t=${Date.now()}`
      : "/images/default-profile.png";

    // =============================
    // DESCRIPCIÓN - CARGAR
    // =============================
    document.getElementById("userDescripcion").value =
      usuario.descripcion || "";

    // =============================
    // DESCRIPCIÓN - GUARDAR (MEJORADO)
    // =============================
    document
      .getElementById("btnGuardarDescripcion")
      .addEventListener("click", async () => {
        const nuevaDescripcion = document
          .getElementById("userDescripcion")
          .value;

        console.log(`💾 Guardando descripción: "${nuevaDescripcion}" para usuario ${userId}`);

        try {
          const res = await fetch(`${baseURL}/api/info/descripcion/${userId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ descripcion: nuevaDescripcion }),
          });

          const data = await res.json();

          if (!res.ok) {
            console.error("❌ Error del servidor:", data);
            throw new Error(data.error || `Error ${res.status} al guardar`);
          }

          alert("✅ Descripción guardada correctamente");
          console.log("✅ Descripción guardada:", data);
        } catch (error) {
          console.error("❌ Error al guardar descripción:", error);
          alert(`Error al guardar la descripción: ${error.message}`);
        }
      });

    // =============================
    // PRÉSTAMOS
    // =============================
    let prestamosValidos = (data.prestamos || []).filter(
      (p) => p && (p.libros || p.fecha || p.fecha_vencimiento || p.estado)
    );

    if (prestamosValidos.length === 0) {
      container.innerHTML =
        '<div class="no-prestamos"><p>No hay préstamos.</p></div>';
    } else {
      container.innerHTML = prestamosValidos
        .map((p) => {
          const fechaPrestamo = p.fecha ? new Date(p.fecha) : null;
          const fechaVencimiento = p.fecha_vencimiento
            ? new Date(p.fecha_vencimiento)
            : null;

          let estado = p.estado ? p.estado.toLowerCase() : "activo";
          if (fechaVencimiento && new Date() > fechaVencimiento) {
            estado = "vencido";
          }

          return `
          <div class="prestamo-card ${estado}">
            <h3>${p.libros || "Libro sin nombre"}</h3>
            <p><strong>ID Préstamo:</strong> ${p.id_prestamo || "N/A"}</p>
            <p><strong>Estado:</strong> <span class="estado ${estado}">${estado}</span></p>
            <p><strong>Fecha préstamo:</strong> ${
              fechaPrestamo
                ? fechaPrestamo.toLocaleDateString()
                : "No disponible"
            }</p>
            <p><strong>Vencimiento:</strong> ${
              fechaVencimiento
                ? fechaVencimiento.toLocaleDateString()
                : "No disponible"
            }</p>
          </div>`;
        })
        .join("");
    }
  } catch (err) {
    console.error("❌ Error al cargar datos:", err);
    container.innerHTML =
      '<div class="no-prestamos"><p>Error al cargar los datos.</p></div>';
  }

  // =============================
  // VOLVER AL INICIO
  // =============================
  backBtn.addEventListener("click", () => {
    window.location.href = "/html/htmlUser/InicioUser.html";
  });
});