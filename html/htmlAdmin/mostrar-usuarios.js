// =====================================================
// 📋 MOSTRAR, BUSCAR, EDITAR Y ELIMINAR USUARIOS
// =====================================================

async function cargarUsuarios() {
  try {
    const response = await fetch("http://localhost:3000/api/usuarios");
    const data = await response.json();

    if (!data.success) {
      mostrarPopupMensaje("⚠️ Error al cargar usuarios:<br>" + data.message, "error");
      return;
    }

    const tbody = document.querySelector("#tbody-usuarios");
    tbody.innerHTML = "";
    data.usuarios.forEach(user => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${escapeHTML(user.nombre)}</td>
        <td>${escapeHTML(user.correo)}</td>
        <td>${escapeHTML(user.rol)}</td>
        <td>${user.prestamos || 0}</td>
        <td>
          <button class="btn-editar" data-id="${user.id_usuario}" title="Editar usuario">✏️</button>
          <button class="btn-ver-prestamos" data-id="${user.id_usuario}" title="Ver préstamos">📚</button>
          <button class="btn-eliminar" data-id="${user.id_usuario}" title="Eliminar usuario">🗑️</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    agregarEventosTabla();
  } catch (err) {
    console.error("Error al cargar usuarios:", err);
    mostrarPopupMensaje("⚠️ No se pudo conectar con el servidor.", "error");
  }
}

// =====================================================
// 🧩 FUNCIONES DE TABLA
// =====================================================
function agregarEventosTabla() {
  // 🗑️ Eliminar usuario
  document.querySelectorAll(".btn-eliminar").forEach(btn => {
    btn.addEventListener("click", e => {
      const userId = e.target.dataset.id;
      const userName = e.target.closest("tr").querySelector("td:first-child").textContent;
      mostrarPopupEliminar(userId, userName);
    });
  });

  // ✏️ Editar usuario
  document.querySelectorAll(".btn-editar").forEach(btn => {
    btn.addEventListener("click", e => {
      const userId = e.target.dataset.id;
      window.location.href = `/html/htmlAdmin/editar-datos.html?id=${userId}`;
    });
  });

  // 📚 Ver préstamos
  document.querySelectorAll(".btn-ver-prestamos").forEach(btn => {
    btn.addEventListener("click", e => {
      const userId = e.target.dataset.id;
      verPrestamosUsuario(userId);
    });
  });
}

// =====================================================
// 🗑️ POPUP PERSONALIZADO DE ELIMINACIÓN
// =====================================================
function mostrarPopupEliminar(id, nombre) {
  const popup = document.getElementById("popup-eliminar");
  const mensaje = document.getElementById("popup-message");
  const btnCancelar = document.getElementById("btn-cancelar-eliminar");
  const btnConfirmar = document.getElementById("btn-confirmar-eliminar");

  mensaje.innerHTML = `¿Estás seguro de eliminar al usuario <strong>"${nombre}"</strong>?`;
  popup.style.display = "flex";

  btnCancelar.onclick = () => (popup.style.display = "none");
  btnConfirmar.onclick = async () => {
    await eliminarUsuario(id);
    popup.style.display = "none";
  };
  popup.onclick = e => {
    if (e.target === popup) popup.style.display = "none";
  };
}

// =====================================================
// 🗑️ ELIMINAR USUARIO (versión robusta con manejo total de errores)
// =====================================================
async function eliminarUsuario(userId) {
  try {
    const res = await fetch(`http://localhost:3000/api/usuarios/${userId}`, { method: "DELETE" });

    // ⚠️ Si el servidor responde con error (400, 409, 500...)
    if (!res.ok) {
      let mensajeError = "No se pudo eliminar el usuario.";
      try {
        const errorData = await res.json();
        if (errorData.message) mensajeError = errorData.message;
      } catch {
        const textData = await res.text();
        if (textData) mensajeError = textData;
      }

      mostrarPopupMensaje("❌ No se pudo eliminar:<br>" + mensajeError, "error");
      return;
    }

    // ✅ Si fue exitoso
    const result = await res.json();
    if (result.success) {
      mostrarPopupMensaje("✅ Usuario eliminado correctamente", "exito");
      cargarUsuarios();
    } else {
      const mensaje = result.message || "Error desconocido.";
      mostrarPopupMensaje("❌ No se pudo eliminar:<br>" + mensaje, "error");
    }
  } catch (err) {
    console.error("Error al eliminar usuario:", err);
    mostrarPopupMensaje("⚠️ No se pudo conectar con el servidor.", "error");
  }
}

// =====================================================
// 📚 VER PRÉSTAMOS DEL USUARIO
// =====================================================
async function verPrestamosUsuario(id) {
  const popup = document.getElementById("popup-prestamos");
  const contenido = document.getElementById("contenido-prestamos");
  const btnCerrar = document.getElementById("btn-cerrar-prestamos");

  try {
    const resp = await fetch(`http://localhost:3000/api/usuarios/${id}/detalle`);
    const data = await resp.json();
    if (!data.success) {
      contenido.innerHTML = `<p>Error al obtener los préstamos del usuario.</p>`;
    } else {
      let html = `
        <p><strong>Nombre:</strong> ${data.usuario.nombre}</p>
        <p><strong>Correo:</strong> ${data.usuario.correo}</p>
        <p><strong>Rol:</strong> ${data.usuario.rol}</p>
        <hr/>
      `;
      if (data.prestamos.length === 0) {
        html += `<p>Este usuario no tiene préstamos activos.</p>`;
      } else {
        html += `<ul>`;
        data.prestamos.forEach(p => {
          html += `
            <li>
              <strong>${p.titulo}</strong><br/>
              Autor: ${p.autor}<br/>
              Categoría: ${p.categoria}<br/>
              Fecha préstamo: ${p.fecha_prestamo.split("T")[0]}
            </li><br/>
          `;
        });
        html += `</ul>`;
      }
      contenido.innerHTML = html;
    }
    popup.style.display = "flex";
    btnCerrar.onclick = () => (popup.style.display = "none");
    popup.onclick = e => {
      if (e.target === popup) popup.style.display = "none";
    };
  } catch (err) {
    console.error("Error al cargar préstamos:", err);
    contenido.innerHTML = `<p>Error al conectar con el servidor.</p>`;
    popup.style.display = "flex";
  }
}

// =====================================================
// 🔍 BUSCAR USUARIOS
// =====================================================
function buscarUsuarios() {
  const termino = document.getElementById("buscar").value.toLowerCase();
  const filas = document.querySelectorAll("tbody tr");
  filas.forEach(fila => {
    const textoFila = fila.textContent.toLowerCase();
    fila.style.display = textoFila.includes(termino) ? "" : "none";
  });
}

// =====================================================
// ⚠️ POPUP DE MENSAJES (ERROR / ÉXITO / INFO)
// =====================================================
function mostrarPopupMensaje(mensaje, tipo = "info") {
  const popup = document.createElement("div");
  popup.className = "popup-overlay";
  popup.innerHTML = `
    <div class="popup popup-mensaje ${tipo}">
      <h2>${tipo === "error" ? "Error" : tipo === "exito" ? "Éxito" : "Mensaje"}</h2>
      <p>${mensaje}</p>
      <div class="popup-buttons">
        <button class="btn-aceptar" id="btn-cerrar-mensaje">Aceptar</button>
      </div>
    </div>
  `;
  document.body.appendChild(popup);
  popup.style.display = "flex";

  const btnCerrar = popup.querySelector("#btn-cerrar-mensaje");
  btnCerrar.onclick = () => popup.remove();
  popup.onclick = e => { if (e.target === popup) popup.remove(); };
}

// =====================================================
// 🧰 FUNCIONES AUXILIARES
// =====================================================
function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// =====================================================
// 🚀 EVENTOS GLOBALES
// =====================================================
document.addEventListener("DOMContentLoaded", () => {
  cargarUsuarios();

  const buscarInput = document.getElementById("buscar");
  if (buscarInput) buscarInput.addEventListener("input", buscarUsuarios);

  const btnAgregar = document.getElementById("btn-agregar");
  if (btnAgregar) {
    btnAgregar.addEventListener("click", () => {
      window.location.href = "/html/htmlAdmin/Crear-usuario.html";
    });
  }
});
