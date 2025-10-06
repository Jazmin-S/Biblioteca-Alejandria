// Variables globales
let usuarios = [];
let usuarioEditando = null;
let usuarioAEliminar = null;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    inicializarEventos();
    cargarUsuarios();
});

// Configurar event listeners
function inicializarEventos() {
    // Botones principales
    document.getElementById('btn-agregar').addEventListener('click', mostrarFormularioAgregar);
    document.getElementById('btn-buscar').addEventListener('click', buscarUsuarios);
    document.getElementById('buscar').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') buscarUsuarios();
    });

    // Popup de eliminación
    document.getElementById('btn-cancelar-eliminar').addEventListener('click', cerrarPopupEliminar);
    document.getElementById('btn-confirmar-eliminar').addEventListener('click', confirmarEliminacion);

    // Formulario
    document.getElementById('btn-cancelar-form').addEventListener('click', cerrarFormulario);
    document.getElementById('form-usuario').addEventListener('submit', enviarFormulario);

    // Botones de acción múltiple
    document.getElementById('btn-eliminar-multiple').addEventListener('click', eliminarUsuariosSeleccionados);
}

// Cargar usuarios desde el servidor
async function cargarUsuarios() {
    try {
        mostrarLoading(true);
        
        const response = await fetch('http://localhost:3000/api/usuarios');
        const data = await response.json();
        
        if (data.success) {
            usuarios = data.usuarios;
            mostrarUsuarios(usuarios);
            mostrarMensaje('Usuarios cargados correctamente', 'exito');
        } else {
            throw new Error(data.message || 'Error al cargar usuarios');
        }
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
        mostrarMensaje('Error al cargar usuarios: ' + error.message, 'error');
    } finally {
        mostrarLoading(false);
    }
}

// Mostrar usuarios en la tabla
function mostrarUsuarios(listaUsuarios) {
    const tbody = document.getElementById('tbody-usuarios');
    
    if (listaUsuarios.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="loading">No se encontraron usuarios</td></tr>';
        return;
    }

    tbody.innerHTML = listaUsuarios.map(usuario => `
        <tr data-id="${usuario.id_usuario}">
            <td>${escapeHTML(usuario.nombre)}</td>
            <td>${escapeHTML(usuario.correo)}</td>
            <td>${escapeHTML(usuario.rol)}</td>
            <td>${usuario.prestamos || 0}</td>
            <td>
                <button class="btn-accion btn-editar" onclick="editarUsuario(${usuario.id_usuario})" title="Editar">✏️</button>
                <button class="btn-accion btn-eliminar" onclick="mostrarPopupEliminar(${usuario.id_usuario})" title="Eliminar">🗑️</button>
                <input type="checkbox" class="usuario-checkbox" onchange="actualizarBotonesMultiples()" value="${usuario.id_usuario}">
            </td>
        </tr>
    `).join('');
}

// Buscar usuarios
function buscarUsuarios() {
    const termino = document.getElementById('buscar').value.toLowerCase().trim();
    
    if (termino === '') {
        mostrarUsuarios(usuarios);
        return;
    }

    const usuariosFiltrados = usuarios.filter(usuario => 
        usuario.nombre.toLowerCase().includes(termino) ||
        usuario.correo.toLowerCase().includes(termino) ||
        usuario.rol.toLowerCase().includes(termino)
    );
    
    mostrarUsuarios(usuariosFiltrados);
}

// Mostrar formulario para agregar usuario
function mostrarFormularioAgregar() {
    usuarioEditando = null;
    document.getElementById('titulo-formulario').textContent = 'Agregar Usuario';
    document.getElementById('form-usuario').reset();
    document.getElementById('popup-formulario').style.display = 'flex';
}

// Editar usuario existente
function editarUsuario(id) {
    usuarioEditando = usuarios.find(u => u.id_usuario === id);
    
    if (usuarioEditando) {
        document.getElementById('titulo-formulario').textContent = 'Editar Usuario';
        document.getElementById('nombre').value = usuarioEditando.nombre;
        document.getElementById('correo').value = usuarioEditando.correo;
        document.getElementById('contrasena').value = ''; // No mostrar contraseña actual
        document.getElementById('rol').value = usuarioEditando.rol;
        document.getElementById('popup-formulario').style.display = 'flex';
    }
}

// Cerrar formulario
function cerrarFormulario() {
    document.getElementById('popup-formulario').style.display = 'none';
    usuarioEditando = null;
}

// Enviar formulario (agregar/editar)
async function enviarFormulario(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = {
        nombre: formData.get('nombre'),
        correo: formData.get('correo'),
        contrasena: formData.get('contrasena'),
        rol: formData.get('rol')
    };

    // Validaciones básicas
    if (!data.nombre || !data.correo || !data.rol) {
        mostrarMensaje('Todos los campos son obligatorios', 'error');
        return;
    }

    if (!data.contrasena && !usuarioEditando) {
        mostrarMensaje('La contraseña es obligatoria para nuevos usuarios', 'error');
        return;
    }

    try {
        const url = usuarioEditando 
            ? `http://localhost:3000/api/usuarios/${usuarioEditando.id_usuario}`
            : 'http://localhost:3000/api/usuarios';

        const method = usuarioEditando ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        
        if (result.success) {
            mostrarMensaje(
                usuarioEditando ? 'Usuario actualizado correctamente' : 'Usuario agregado correctamente', 
                'exito'
            );
            cerrarFormulario();
            await cargarUsuarios();
        } else {
            throw new Error(result.message || 'Error en la operación');
        }
    } catch (err) {
        console.error('Error:', err);
        mostrarMensaje('Error: ' + err.message, 'error');
    }
}

// Mostrar popup de eliminación
function mostrarPopupEliminar(id) {
    const usuario = usuarios.find(u => u.id_usuario === id);
    if (usuario) {
        usuarioAEliminar = id;
        document.getElementById('popup-message').textContent = 
            `¿Estás seguro de que deseas eliminar al usuario "${usuario.nombre}" (${usuario.correo})?`;
        document.getElementById('popup-eliminar').style.display = 'flex';
    }
}

// Cerrar popup de eliminación
function cerrarPopupEliminar() {
    document.getElementById('popup-eliminar').style.display = 'none';
    usuarioAEliminar = null;
}

// Confirmar eliminación de usuario
async function confirmarEliminacion() {
    if (!usuarioAEliminar) return;

    try {
        const response = await fetch(`http://localhost:3000/api/usuarios/${usuarioAEliminar}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json'
            }
        });

        const result = await response.json();
        
        if (result.success) {
            mostrarMensaje('Usuario eliminado correctamente', 'exito');
            cerrarPopupEliminar();
            await cargarUsuarios();
        } else {
            throw new Error(result.message || 'Error al eliminar usuario');
        }
    } catch (error) {
        console.error('Error al eliminar:', error);
        mostrarMensaje('Error al eliminar usuario: ' + error.message, 'error');
    } finally {
        usuarioAEliminar = null;
    }
}

// Funciones para selección múltiple
function actualizarBotonesMultiples() {
    const checkboxes = document.querySelectorAll('.usuario-checkbox:checked');
    const btnEliminarMultiple = document.getElementById('btn-eliminar-multiple');
    
    if (checkboxes.length > 0) {
        btnEliminarMultiple.style.display = 'flex';
        btnEliminarMultiple.innerHTML = `<span class="icon">🗑️</span> Eliminar (${checkboxes.length})`;
    } else {
        btnEliminarMultiple.style.display = 'none';
    }
}

async function eliminarUsuariosSeleccionados() {
    const checkboxes = document.querySelectorAll('.usuario-checkbox:checked');
    const ids = Array.from(checkboxes).map(cb => cb.value);
    
    if (ids.length === 0) return;
    
    if (!confirm(`¿Estás seguro de que deseas eliminar ${ids.length} usuario(s)?`)) {
        return;
    }

    try {
        // Eliminar uno por uno (podría optimizarse con un endpoint batch)
        for (const id of ids) {
            const response = await fetch(`http://localhost:3000/api/usuarios/${id}`, {
                method: 'DELETE'
            });
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(`Error eliminando usuario ID ${id}: ${result.message}`);
            }
        }
        
        mostrarMensaje(`${ids.length} usuario(s) eliminado(s) correctamente`, 'exito');
        await cargarUsuarios();
    } catch (error) {
        console.error('Error al eliminar múltiples usuarios:', error);
        mostrarMensaje('Error al eliminar usuarios: ' + error.message, 'error');
    }
}

// Utilidades
function mostrarMensaje(mensaje, tipo) {
    // Remover mensajes anteriores
    const mensajesAnteriores = document.querySelectorAll('.mensaje');
    mensajesAnteriores.forEach(msg => msg.remove());
    
    const divMensaje = document.createElement('div');
    divMensaje.className = `mensaje mensaje-${tipo}`;
    divMensaje.textContent = mensaje;
    
    document.querySelector('.header').after(divMensaje);
    
    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
        if (divMensaje.parentNode) {
            divMensaje.remove();
        }
    }, 5000);
}

function mostrarLoading(mostrar) {
    const tbody = document.getElementById('tbody-usuarios');
    if (mostrar) {
        tbody.innerHTML = '<tr><td colspan="5" class="loading">Cargando usuarios...</td></tr>';
    }
}

function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formUsuario");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("usuario").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const domicilio = document.getElementById("domicilio").value.trim();
    const contrasena = document.getElementById("contrasena").value.trim();
    const rol = document.getElementById("rol").value;

    if (!nombre || !correo || !contrasena || !rol) {
      alert("Por favor completa todos los campos obligatorios.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, correo, contrasena, rol, domicilio }),
      });

      const data = await response.json();

      if (data.success) {
        alert("✅ Usuario creado exitosamente");
        form.reset();
      } else {
        alert("⚠️ " + data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Error al registrar usuario");
    }
  });
});


// Hacer funciones disponibles globalmente
window.editarUsuario = editarUsuario;
window.mostrarPopupEliminar = mostrarPopupEliminar;
window.actualizarBotonesMultiples = actualizarBotonesMultiples;