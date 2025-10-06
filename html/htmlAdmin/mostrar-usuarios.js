// mostrar-usuarios.js - VERSIÓN CORREGIDA
async function cargarUsuarios() {
  try {
    const response = await fetch("http://localhost:3000/api/usuarios");
    const data = await response.json();

    if (data.success) {
      const tbody = document.querySelector("tbody");
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

      // ✅ Agregar listeners para botones eliminar
      tbody.querySelectorAll(".btn-eliminar").forEach(btn => {
        btn.addEventListener("click", async (e) => {
          const userId = e.target.dataset.id;
          const userName = e.target.closest("tr").querySelector("td:first-child").textContent;
          
          if (confirm(`¿Estás seguro de eliminar al usuario "${userName}"?`)) {
            await eliminarUsuario(userId);
          }
        });
      });

      // ✅ Agregar listeners para botones editar
      tbody.querySelectorAll(".btn-editar").forEach(btn => {
        btn.addEventListener("click", async (e) => {
          const userId = e.target.dataset.id;
          await editarUsuario(userId);
        });
      });

      // ✅ Agregar listeners para botón "Ver préstamos"
      tbody.querySelectorAll(".btn-ver-prestamos").forEach(btn => {
        btn.addEventListener("click", async (e) => {
          const userId = e.target.dataset.id;
          await verPrestamosUsuario(userId);
        });
      });

    } else {
      alert("Error al cargar usuarios: " + data.message);
    }
  } catch (err) {
    console.error("Error:", err);
    alert("⚠ No se pudo conectar al servidor");
  }
}

// Función para eliminar usuario
async function eliminarUsuario(userId) {
  try {
    const res = await fetch(`http://localhost:3000/api/usuarios/${userId}`, {
      method: "DELETE"
    });
    
    const result = await res.json();
    
    if (result.success) {
      alert("✅ Usuario eliminado correctamente");
      cargarUsuarios(); // recargar tabla
    } else {
      alert("❌ No se pudo eliminar: " + result.message);
    }
  } catch (err) {
    console.error("Error:", err);
    alert("⚠ Error al conectar con el servidor");
  }
}

// Función para editar usuario (redirigir a formulario de edición)
async function editarUsuario(userId) {
  window.location.href = `/html/htmlAdmin/editar-datos.html?id=${userId}`;

}

// Función utilitaria para evitar XSS
function escapeHTML(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Cargar usuarios cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", cargarUsuarios);

// Opcional: Función para buscar usuarios
function buscarUsuarios() {
  const termino = document.getElementById('buscar').value.toLowerCase();
  const filas = document.querySelectorAll('tbody tr');
  
  filas.forEach(fila => {
    const textoFila = fila.textContent.toLowerCase();
    fila.style.display = textoFila.includes(termino) ? '' : 'none';
  });
}

// Si tienes un campo de búsqueda, agregar este evento
document.addEventListener('DOMContentLoaded', function() {
  const buscarInput = document.getElementById('buscar');
  if (buscarInput) {
    buscarInput.addEventListener('input', buscarUsuarios);
  }
});

// =====================================================
// 📚 LÓGICA DEL POPUP DE PRÉSTAMOS
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

    // Cerrar popup
    btnCerrar.onclick = () => popup.style.display = "none";
    popup.onclick = (e) => {
      if (e.target === popup) popup.style.display = "none";
    };

  } catch (err) {
    console.error("Error:", err);
    contenido.innerHTML = `<p>Error al conectar con el servidor.</p>`;
    popup.style.display = "flex";
  }
}
