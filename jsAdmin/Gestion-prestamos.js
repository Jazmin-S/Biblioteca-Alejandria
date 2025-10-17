// ==============================================
// 📚 GESTIÓN DE PRÉSTAMOS - FRONTEND
// ==============================================

// Redirección al panel principal
document.getElementById('btnExit').addEventListener('click', () => {
  window.location.href = '/html/htmlAdmin/inicioAdmin.html';
});

// Variables globales
let prestamosGlobal = [];

// Buscar préstamos
document.getElementById('btnBuscar').addEventListener('click', filtrarPrestamos);
document.getElementById('buscar').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') filtrarPrestamos();
});

// Filtrar por nombre de usuario
function filtrarPrestamos() {
  const termino = document.getElementById('buscar').value.toLowerCase().trim();
  const filtrados = prestamosGlobal.filter(p => p.usuario.toLowerCase().includes(termino));
  mostrarPrestamos(filtrados);
}

// Cargar préstamos desde el backend
document.addEventListener('DOMContentLoaded', async () => {
  await cargarPrestamos();
});

async function cargarPrestamos() {
  const tbody = document.getElementById('tbodyPrestamos');
  tbody.innerHTML = `<tr><td colspan="6" class="loading">Cargando préstamos...</td></tr>`;

  try {
    const response = await fetch('http://localhost:3000/api/prestamos');
    const data = await response.json();

    if (data.success) {
      prestamosGlobal = data.prestamos;
      mostrarPrestamos(prestamosGlobal);
    } else {
      mostrarError("Error al cargar préstamos: " + data.message);
    }
  } catch (error) {
    mostrarError("❌ Error al conectar con el servidor");
    console.error("Error al cargar préstamos:", error);
  }
}

// Mostrar los préstamos en la tabla
function mostrarPrestamos(prestamos) {
  const tbody = document.getElementById('tbodyPrestamos');

  if (!prestamos || prestamos.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="vacio">No hay préstamos registrados.</td></tr>`;
    return;
  }

  tbody.innerHTML = prestamos.map(p => `
    <tr class="${p.estado === 'Vencido' ? 'vencido' : 'activo'}">
      <td>${p.usuario}</td>
      <td>${p.num_prestamos}</td>
      <td>${p.fecha_prestamo}</td>
      <td>${p.fecha_vencimiento}</td>
      <td><span class="estado ${p.estado.toLowerCase()}">${p.estado}</span></td>
      <td>$${p.total_pagar ? p.total_pagar.toFixed(2) : '0.00'}</td>
    </tr>
  `).join('');
}

// Mostrar mensaje de error
function mostrarError(mensaje) {
  const tbody = document.getElementById('tbodyPrestamos');
  tbody.innerHTML = `<tr><td colspan="6" class="error">${mensaje}</td></tr>`;
}
