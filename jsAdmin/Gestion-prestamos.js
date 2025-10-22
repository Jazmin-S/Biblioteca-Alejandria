document.addEventListener('DOMContentLoaded', async () => {
  const API_URL = "http://localhost:3000/api";
  const tbody = document.getElementById('tbodyPrestamos');
  const buscarInput = document.getElementById('buscar');
  const btnBuscar = document.getElementById('btnBuscar');
  const btnExit = document.getElementById('btnExit');

  // Modal detalle
  const modal = document.getElementById('modalDetalle');
  const modalCerrar = document.querySelector('.cerrar');
  const detalleContenido = document.getElementById('detalleContenido');

  // Modal nuevo préstamo
  const btnNuevo = document.getElementById('btnNuevo');
  const modalNuevo = document.getElementById('modalNuevoPrestamo');
  const cerrarNuevo = document.querySelector('.cerrarNuevo');
  const formNuevo = document.getElementById('formNuevoPrestamo');
  const usuarioSelect = document.getElementById('usuarioSelect');
  const librosSelect = document.getElementById('librosSelect');
  const fechaVencimiento = document.getElementById('fechaVencimiento');
  const mensajePrestamo = document.getElementById('mensajePrestamo');

  // 🔙 Botón volver
  btnExit.addEventListener('click', () => {
    window.location.href = "http://127.0.0.1:3001/html/htmlAdmin/InicioAdmin.html";
  });

  // 📋 Cargar préstamos (tabla general sin multas ni retrasos)
  async function cargarPrestamos(nombre = '') {
    tbody.innerHTML = `<tr><td colspan="6" class="loading">Cargando...</td></tr>`;
    let url = `${API_URL}/prestamos`;
    if (nombre.trim() !== '') url = `${API_URL}/prestamos/buscar?nombre=${encodeURIComponent(nombre)}`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6">No se encontraron préstamos</td></tr>`;
        return;
      }

      const hoy = new Date();
      tbody.innerHTML = data.map(p => {
        const fechaPrestamo = new Date(p.fecha_prestamo);
        const fechaVenc = new Date(p.fecha_vencimiento);
        const diasRetraso = hoy > fechaVenc ? Math.floor((hoy - fechaVenc) / (1000 * 60 * 60 * 24)) : 0;
        const estado = hoy <= fechaVenc ? 
          '<span class="estado-activo">Activo</span>' : 
          '<span class="estado-vencido">Vencido</span>';
        
        const multaPorLibro = diasRetraso > 3 ? (diasRetraso - 3) * 3 : 0;
        const multaTotal = multaPorLibro * p.numero_prestamos;

        return `
          <tr data-ids="${p.ids_prestamos}" data-total="${multaTotal}">
            <td>${p.usuario}</td>
            <td>${p.numero_prestamos}</td>
            <td>${formatearFecha(p.fecha_prestamo)}</td>
            <td>${formatearFecha(p.fecha_vencimiento)}</td>
            <td>${estado}</td>
            <td>$${multaTotal.toFixed(2)}</td>
          </tr>
        `;
      }).join('');
    } catch (err) {
      console.error(err);
      tbody.innerHTML = `<tr><td colspan="6">Error al cargar datos</td></tr>`;
    }
  }

  btnBuscar.addEventListener('click', () => cargarPrestamos(buscarInput.value));
  cargarPrestamos();

  function formatearFecha(f) {
    return new Date(f).toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }

  // 📖 Mostrar detalle préstamo (con botón de finalizar por libro)
  tbody.addEventListener('click', async e => {
    const fila = e.target.closest('tr');
    if (!fila) return;
    const ids = fila.dataset.ids.split(',');

    try {
      const res = await fetch(`${API_URL}/prestamos/detalle/${ids.join(',')}`);
      const data = await res.json();

      if (data.error) {
        detalleContenido.innerHTML = `<p>${data.error}</p>`;
        modal.style.display = 'block';
        return;
      }

      const fechaVenc = new Date(data.fecha_vencimiento);
      const hoy = new Date();

      const diasRetraso = hoy > fechaVenc 
        ? Math.floor((hoy - fechaVenc) / (1000 * 60 * 60 * 24)) 
        : 0;

      const multaPorLibro = 3;
      const multaIndividual = diasRetraso > 3 ? (diasRetraso - 3) * multaPorLibro : 0;

      const filas = data.libros.map((l, i) => `
        <tr data-idprestamo="${l.id_prestamo}">

          <td>${i + 1}</td>
          <td>${l.titulo}</td>
          <td>${l.autor}</td>
          <td>${formatearFecha(data.fecha_vencimiento)}</td>
          <td>$${multaIndividual.toFixed(2)}</td>
          <td><button class="btn-devolver-individual">📘 Finalizar</button></td>
        </tr>
      `).join('');

      let mensajeMulta = '';
      if (diasRetraso > 0) {
        if (diasRetraso <= 3) {
          mensajeMulta = `<p class="info-ok">📗 El préstamo tiene ${diasRetraso} día(s) de retraso pero aún no genera multa (3 días de gracia).</p>`;
        } else {
          mensajeMulta = `<p class="info-warn">⚠️ Retraso de ${diasRetraso} días. Multa de $${multaPorLibro} por libro por día a partir del cuarto día.</p>`;
        }
      } else {
        mensajeMulta = `<p class="info-ok">✅ Sin retraso. Todo en orden.</p>`;
      }

      detalleContenido.innerHTML = `
        <p><b>👤 Usuario:</b> ${data.usuario}</p>
        <p><b>📅 Fecha préstamo:</b> ${formatearFecha(data.fecha_prestamo)}</p>
        ${mensajeMulta}
        <table class="tabla-libros">
          <thead><tr><th>#</th><th>Título</th><th>Autor</th><th>Vencimiento</th><th>Multa</th><th>Acción</th></tr></thead>
          <tbody>${filas}</tbody>
        </table>
      `;
      modal.style.display = 'block';

      // 🎯 Escuchar botones de devolución individual
      document.querySelectorAll('.btn-devolver-individual').forEach(btn => {
        btn.addEventListener('click', async e => {
          const idPrestamo = e.target.closest('tr').dataset.idprestamo;
          if (!confirm(`¿Finalizar el préstamo del libro seleccionado?`)) return;

          try {
            const res = await fetch(`${API_URL}/prestamos/${idPrestamo}`, { method: 'DELETE' });
            const data = await res.json();
            alert(data.mensaje || '✅ Libro devuelto correctamente.');
            e.target.closest('tr').remove(); // quitar fila del modal
            cargarPrestamos(); // actualizar tabla principal
          } catch (err) {
            console.error('Error al devolver préstamo:', err);
            alert('❌ No se pudo finalizar este préstamo.');
          }
        });
      });

    } catch (err) {
      console.error(err);
    }
  });

  modalCerrar.addEventListener('click', () => modal.style.display = 'none');
  window.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });

  // 🟢 Modal nuevo préstamo
  btnNuevo.addEventListener('click', async () => {
    modalNuevo.style.display = 'block';
    await cargarUsuarios();
    await cargarLibros();

    const hoy = new Date();
    hoy.setDate(hoy.getDate() + 15);
    fechaVencimiento.value = hoy.toISOString().split('T')[0];
  });

  cerrarNuevo.addEventListener('click', () => modalNuevo.style.display = 'none');
  window.addEventListener('click', e => { if (e.target === modalNuevo) modalNuevo.style.display = 'none'; });

  // 🧩 Cargar usuarios
  async function cargarUsuarios() {
    try {
      const res = await fetch(`${API_URL}/usuarios`);
      const data = await res.json();
      const usuarios = data.usuarios || data;
      usuarioSelect.innerHTML = '<option value="">Seleccione un usuario...</option>';
      usuarios.forEach(u => usuarioSelect.innerHTML += `<option value="${u.id_usuario}">${u.nombre}</option>`);
    } catch (err) {
      usuarioSelect.innerHTML = '<option>Error al cargar</option>';
    }
  }

  // 🧩 Cargar libros
  async function cargarLibros() {
    try {
      const res = await fetch(`${API_URL}/libros`);
      const libros = await res.json();
      librosSelect.innerHTML = '';
      libros.forEach(l => librosSelect.innerHTML += `<option value="${l.id_libro}">${l.titulo} - ${l.autor}</option>`);
    } catch (err) {
      librosSelect.innerHTML = '<option>Error al cargar</option>';
    }
  }

  // 💾 Guardar préstamo
  formNuevo.addEventListener('submit', async e => {
    e.preventDefault();
    const idUsuario = usuarioSelect.value;
    const libros = Array.from(librosSelect.selectedOptions).map(o => o.value);
    const fechaVenc = fechaVencimiento.value;

    if (!idUsuario || libros.length === 0 || !fechaVenc) {
      mostrarMensaje('⚠️ Complete todos los campos.', 'error');
      return;
    }

    try {
      const validarRes = await fetch(`${API_URL}/prestamos/validar/${idUsuario}`);
      const validarData = await validarRes.json();
      if (validarData.tieneVencido) {
        mostrarMensaje('🚫 Este usuario tiene un préstamo vencido.', 'error');
        return;
      }

      const res = await fetch(`${API_URL}/prestamos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_usuario: idUsuario, libros, fecha_vencimiento: fechaVenc })
      });

      const data = await res.json();
      if (res.ok) {
        mostrarMensaje('✅ Préstamo registrado correctamente.', 'success');
        formNuevo.reset();
        cargarPrestamos();
      } else {
        mostrarMensaje(`❌ Error: ${data.error}`, 'error');
      }
    } catch {
      mostrarMensaje('❌ Error al registrar préstamo.', 'error');
    }
  });

  function mostrarMensaje(txt, tipo) {
    mensajePrestamo.textContent = txt;
    mensajePrestamo.style.color = tipo === 'success' ? 'green' : 'red';
  }
});
