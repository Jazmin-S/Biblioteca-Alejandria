document.addEventListener('DOMContentLoaded', async () => {
  const API_URL = "http://localhost:3000/api";
  const tbody = document.getElementById('tbodyPrestamos');
  const buscarInput = document.getElementById('buscar');
  const btnBuscar = document.getElementById('btnBuscar');
  const btnExit = document.getElementById('btnExit');

  const modal = document.getElementById('modalDetalle');
  const modalCerrar = document.querySelector('.cerrar');
  const detalleContenido = document.getElementById('detalleContenido');

  const btnNuevo = document.getElementById('btnNuevo');
  const modalNuevo = document.getElementById('modalNuevoPrestamo');
  const cerrarNuevo = document.querySelector('.cerrarNuevo');
  const formNuevo = document.getElementById('formNuevoPrestamo');
  const usuarioSelect = document.getElementById('usuarioSelect');
  const fechaVencimiento = document.getElementById('fechaVencimiento');
  const mensajePrestamo = document.getElementById('mensajePrestamo');

  btnExit.addEventListener('click', () => {
    window.location.href = "http://127.0.0.1:3001/html/htmlAdmin/InicioAdmin.html";
  });

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

      renderPrestamosFiltrados(data);
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

  // 📖 Mostrar detalle préstamo
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

      const fechaPrestamo = new Date(data.fecha_prestamo);
      const fechaVenc = new Date(data.fecha_vencimiento);
      const hoy = new Date();

      let diasRetraso = Math.floor((hoy - fechaVenc) / (1000 * 60 * 60 * 24));
      if (diasRetraso < 0) diasRetraso = 0;

      let mensajeMulta = '';
      if (fechaVenc < fechaPrestamo) {
        mensajeMulta = `<p class="info-warn">⚠️ Fecha de vencimiento anterior al préstamo. Este registro se considera vencido o incorrecto.</p>`;
      } else if (diasRetraso > 0) {
        if (diasRetraso <= 3) {
          mensajeMulta = `<p class="info-ok">📗 ${diasRetraso} día(s) de retraso sin multa (3 días de gracia).</p>`;
        } else {
          mensajeMulta = `<p class="info-warn">⚠️ Retraso de ${diasRetraso} días. Multa de $3 por libro por día.</p>`;
        }
      } else {
        mensajeMulta = `<p class="info-ok">✅ Sin retraso.</p>`;
      }

      const filas = data.libros.map((l, i) => `
        <tr data-idprestamo="${l.id_prestamo}">
          <td>${i + 1}</td>
          <td>${l.titulo}</td>
          <td>${l.autor}</td>
          <td>${formatearFecha(data.fecha_vencimiento)}</td>
          <td>$${(diasRetraso > 3 ? (diasRetraso - 3) * 3 : 0).toFixed(2)}</td>
          <td><button class="btn-devolver-individual">📘 Finalizar</button></td>
        </tr>
      `).join('');

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

      document.querySelectorAll('.btn-devolver-individual').forEach(btn => {
        btn.addEventListener('click', async e => {
          const idPrestamo = e.target.closest('tr').dataset.idprestamo;
          if (!confirm(`¿Finalizar este préstamo?`)) return;

          try {
            const res = await fetch(`${API_URL}/prestamos/${idPrestamo}`, { method: 'DELETE' });
            const data = await res.json();
            mostrarPopup(data.mensaje || '✅ Libro devuelto correctamente.', 'success');
            e.target.closest('tr').remove();
            cargarPrestamos();
          } catch (err) {
            console.error(err);
            mostrarPopup('❌ No se pudo finalizar este préstamo.', 'error');
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

    mensajePrestamo.textContent = '';
    mensajePrestamo.style.display = 'none';

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
    } catch {
      usuarioSelect.innerHTML = '<option>Error al cargar</option>';
    }
  }

  // 🧩 Cargar libros
  let librosDisponibles = [];
  async function cargarLibros() {
    try {
      const res = await fetch(`${API_URL}/libros`);
      librosDisponibles = await res.json();
      mostrarLibros(librosDisponibles);
    } catch {
      document.getElementById('listaLibros').innerHTML = '<p>Error al cargar libros.</p>';
    }
  }

  function mostrarLibros(libros) {
    const lista = document.getElementById('listaLibros');
    if (!libros || libros.length === 0) {
      lista.innerHTML = '<p>No hay libros disponibles.</p>';
      return;
    }
    lista.innerHTML = libros.map(l => `
      <label class="libro-item">
        <input type="checkbox" value="${l.id_libro}">
        ${l.titulo} — <em>${l.autor}</em>
      </label>
    `).join('');
  }

  document.getElementById('buscadorLibros').addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    const filtrados = librosDisponibles.filter(l =>
      l.titulo.toLowerCase().includes(q) || l.autor.toLowerCase().includes(q)
    );
    mostrarLibros(filtrados);
  });

  // 💾 Guardar préstamo
  formNuevo.addEventListener('submit', async e => {
    e.preventDefault();
    const idUsuario = usuarioSelect.value;
    const checkboxes = document.querySelectorAll('#listaLibros input[type="checkbox"]:checked');
    const libros = Array.from(checkboxes).map(c => c.value);
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
        document.getElementById('listaLibros').innerHTML = '';
        modalNuevo.style.display = 'none';
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
    mensajePrestamo.style.display = 'block';
    mensajePrestamo.style.color = tipo === 'success' ? 'green' : 'red';
  }

  // 🟢🔴📋 FILTROS
  const filtroActivos = document.getElementById('filtroActivos');
  const filtroVencidos = document.getElementById('filtroVencidos');
  const filtroTodos = document.getElementById('filtroTodos');

  filtroVencidos.addEventListener('click', async () => {
    try {
      const res = await fetch(`${API_URL}/prestamos`);
      const data = await res.json();
      const hoy = new Date();
      const vencidos = data.filter(p => {
        const venc = new Date(p.fecha_vencimiento);
        const prest = new Date(p.fecha_prestamo);
        return venc < hoy || venc < prest;
      });
      renderPrestamosFiltrados(vencidos);
    } catch {
      tbody.innerHTML = `<tr><td colspan="6">Error al filtrar préstamos vencidos.</td></tr>`;
    }
  });

  filtroActivos.addEventListener('click', async () => {
    try {
      const res = await fetch(`${API_URL}/prestamos`);
      const data = await res.json();
      const hoy = new Date();
      const activos = data.filter(p => {
        const venc = new Date(p.fecha_vencimiento);
        const prest = new Date(p.fecha_prestamo);
        return venc >= hoy && venc >= prest;
      });
      renderPrestamosFiltrados(activos);
    } catch {
      tbody.innerHTML = `<tr><td colspan="6">Error al filtrar préstamos activos.</td></tr>`;
    }
  });

  filtroTodos.addEventListener('click', () => cargarPrestamos());

  // 🧩 Render tabla
  function renderPrestamosFiltrados(lista) {
    if (!Array.isArray(lista) || lista.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6">No hay préstamos para este filtro.</td></tr>`;
      return;
    }

    const hoy = new Date();
    tbody.innerHTML = lista.map(p => {
      const fechaVenc = new Date(p.fecha_vencimiento);
      const fechaPrest = new Date(p.fecha_prestamo);
      const diasRetraso = hoy > fechaVenc ? Math.floor((hoy - fechaVenc) / (1000 * 60 * 60 * 24)) : 0;
      const estado = fechaVenc < fechaPrest || fechaVenc < hoy
        ? '<span class="estado-vencido">Vencido</span>'
        : '<span class="estado-activo">Activo</span>';

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
  }

  // 💬 Popup
  const popup = document.getElementById('popupMensaje');
  const popupTexto = document.getElementById('popupTexto');
  const popupCerrar = document.getElementById('popupCerrar');

  function mostrarPopup(mensaje, tipo = 'success') {
    popupTexto.textContent = mensaje;
    popupTexto.style.color = tipo === 'error' ? '#c70000' : '#198754';
    popup.style.display = 'flex';
  }

  popupCerrar.addEventListener('click', () => popup.style.display = 'none');

  // 🔔 Enviar notificaciones manualmente
  const btnNotificar = document.getElementById('btnNotificar');
  if (btnNotificar) {
    btnNotificar.addEventListener('click', async () => {
      if (!confirm('¿Deseas enviar recordatorios de vencimiento por correo a los usuarios?')) return;

      try {
        const res = await fetch(`${API_URL}/prestamos/notificar/vencimientos`);
        const data = await res.json();

        if (data.success) {
          mostrarPopup(data.message || '✅ Notificaciones enviadas correctamente.');
        } else {
          mostrarPopup('❌ No se pudieron enviar las notificaciones.', 'error');
        }
      } catch (error) {
        console.error('Error al enviar notificaciones:', error);
        mostrarPopup('⚠️ Error al conectar con el servidor.', 'error');
      }
    });
  }

  // 📊 Contador de vencidos
  async function actualizarContadorVencidos() {
    try {
      const res = await fetch(`${API_URL}/prestamos`);
      const data = await res.json();
      const hoy = new Date();
      const vencidos = data.filter(p => {
        const venc = new Date(p.fecha_vencimiento);
        const prest = new Date(p.fecha_prestamo);
        return venc < hoy || venc < prest;
      }).length;

      if (btnNotificar) {
        btnNotificar.innerHTML = `<i class="fa-solid fa-envelope-circle-check"></i> Enviar recordatorios (${vencidos})`;
      }
    } catch {
      console.warn('No se pudo contar los préstamos vencidos.');
    }
  }

  actualizarContadorVencidos();
});
