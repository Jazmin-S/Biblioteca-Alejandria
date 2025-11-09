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

  const filtroActivos = document.getElementById('filtroActivos');
  const filtroVencidos = document.getElementById('filtroVencidos');
  const filtroTodos = document.getElementById('filtroTodos');
  const btnNotificar = document.getElementById('btnNotificar');

  // ⬅️ Botón Volver
  btnExit.addEventListener('click', () => {
    window.location.href = "/html/htmlAdmin/InicioAdmin.html";
  });

  // 🧾 Cargar préstamos
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
  if (!f) return '';
  const fecha = new Date(f);
  // Evitar desfase de zona horaria
  fecha.setMinutes(fecha.getMinutes() + fecha.getTimezoneOffset());
  return fecha.toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' });
}


  /* ------------------------
     📖 Mostrar detalle préstamo
  ------------------------ */
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

      const hoy = new Date();
      let diasRetrasoGlobal = 0;
      let hayFechaInvalida = false;

      data.libros.forEach(l => {
        const venc = new Date(l.fecha_vencimiento || data.fecha_vencimiento);
        const prest = new Date(data.fecha_prestamo);
        if (venc < prest) hayFechaInvalida = true;
        const dias = Math.floor((hoy - venc) / (1000 * 60 * 60 * 24));
        if (dias > diasRetrasoGlobal) diasRetrasoGlobal = dias;
      });

      let mensajeMulta = '';
      if (hayFechaInvalida) {
        mensajeMulta = `<p class="info-warn">⚠️ Uno o más préstamos tienen fecha de vencimiento anterior al préstamo.</p>`;
      } else if (diasRetrasoGlobal > 0) {
        if (diasRetrasoGlobal <= 3) {
          mensajeMulta = `<p class="info-ok">📗 ${diasRetrasoGlobal} día(s) de retraso sin multa (3 días de gracia).</p>`;
        } else {
          mensajeMulta = `<p class="info-warn">⚠️ Retraso de ${diasRetrasoGlobal} días. Multa de $3 por libro por día.</p>`;
        }
      } else {
        mensajeMulta = `<p class="info-ok">✅ Sin retraso.</p>`;
      }

      // 🧱 Calcular multa y estado por libro
      const filas = data.libros.map((l, i) => {
        const venc = new Date(l.fecha_vencimiento);
        const prest = new Date(data.fecha_prestamo);
        const hoy = new Date();
        let dias = Math.floor((hoy - venc) / (1000 * 60 * 60 * 24));
        if (dias < 0) dias = 0;
        const multa = dias > 3 ? (dias - 3) * 3 : 0;
        const filaClass = venc < hoy ? 'fila-vencida' : '';

        return `
          <tr data-idprestamo="${l.id_prestamo}" class="${filaClass}">
            <td>${i + 1}</td>
            <td>${l.titulo}</td>
            <td>${l.autor}</td>
            <td>${formatearFecha(l.fecha_vencimiento)}</td>
            <td>$${multa.toFixed(2)}</td>
            <td class="acciones">
              <button class="btn-entregado">📗 Entregado</button>
              <button class="btn-finalizado">💰 Finalizado</button>
            </td>
          </tr>
        `;
      }).join('');

      detalleContenido.innerHTML = `
        <p><b>👤 Usuario:</b> ${data.usuario}</p>
        <p><b>📅 Fecha préstamo:</b> ${formatearFecha(data.fecha_prestamo)}</p>
        ${mensajeMulta}
        <table class="tabla-libros">
          <thead><tr><th>#</th><th>Título</th><th>Autor</th><th>Vencimiento</th><th>Multa</th><th>Acción</th></tr></thead>
          <tbody>${filas}</tbody>
        </table>
        <p class="ayuda-acciones">🛈 <b>Entregado</b>: Devuelve sin pagar. | <b>Finalizado</b>: Devuelve y paga.</p>
      `;
      modal.style.display = 'block';

      // 🔁 Helper PATCH → DELETE
      async function devolverConFallback(urlPatch, msgOk, msgErr) {
        try {
          let res = await fetch(urlPatch, { method: 'PATCH' });
          let data = await res.json();
          if (!res.ok) throw { status: res.status, data };
          mostrarPopup(data.mensaje || msgOk, 'success');
          return true;
        } catch (e) {
          if (e.status === 404 || e.status === 405) {
            try {
              const urlDelete = urlPatch.replace(/\/(entregado|finalizar)$/, '');
              const resDel = await fetch(urlDelete, { method: 'DELETE' });
              const dataDel = await resDel.json();
              if (!resDel.ok) throw dataDel;
              mostrarPopup(dataDel.mensaje || msgOk + ' (compat).', 'success');
              return true;
            } catch {
              mostrarPopup(msgErr, 'error');
              return false;
            }
          } else {
            mostrarPopup(msgErr, 'error');
            return false;
          }
        }
      }

      // 🟡 ENTREGADO
      document.querySelectorAll('.btn-entregado').forEach(btn => {
        btn.addEventListener('click', async e => {
          const idPrestamo = e.target.closest('tr').dataset.idprestamo;
          if (!confirm('📗 Marcar como entregado sin pagar deuda?')) return;
          const ok = await devolverConFallback(
            `${API_URL}/prestamos/${idPrestamo}/entregado`,
            '✅ Libro entregado.',
            '❌ No se pudo marcar como entregado.'
          );
          if (ok) { e.target.closest('tr').remove(); cargarPrestamos(); }
        });
      });

      // 🟢 FINALIZADO
      document.querySelectorAll('.btn-finalizado').forEach(btn => {
        btn.addEventListener('click', async e => {
          const idPrestamo = e.target.closest('tr').dataset.idprestamo;
          if (!confirm('💰 Marcar como finalizado (devuelto y pagado)?')) return;
          const ok = await devolverConFallback(
            `${API_URL}/prestamos/${idPrestamo}/finalizar`,
            '✅ Libro devuelto y deuda liquidada.',
            '❌ No se pudo finalizar este préstamo.'
          );
          if (ok) { e.target.closest('tr').remove(); cargarPrestamos(); }
        });
      });

    } catch (err) {
      console.error(err);
    }
  });

  modalCerrar.addEventListener('click', () => modal.style.display = 'none');
  window.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });

  /* ------------------------
     ➕ NUEVO PRÉSTAMO
  ------------------------ */
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

  async function cargarUsuarios() {
    try {
      const res = await fetch(`${API_URL}/usuarios`);
      const data = await res.json();
      usuarioSelect.innerHTML = '<option value="">Seleccione un usuario...</option>';
      (data.usuarios || data).forEach(u => {
        usuarioSelect.innerHTML += `<option value="${u.id_usuario}">${u.nombre}</option>`;
      });
    } catch {
      usuarioSelect.innerHTML = '<option>Error al cargar usuarios</option>';
    }
  }

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
    if (!libros.length) {
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

    if (!idUsuario || !libros.length || !fechaVenc) {
      mostrarMensaje('⚠️ Complete todos los campos.', 'error');
      return;
    }

    try {
      const validar = await fetch(`${API_URL}/prestamos/validar/${idUsuario}`);
      const v = await validar.json();
      if (v.tieneVencido) {
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

  /* ------------------------
     📋 Render de la tabla principal
  ------------------------ */
  function renderPrestamosFiltrados(lista) {
    if (!Array.isArray(lista) || !lista.length) {
      tbody.innerHTML = `<tr><td colspan="6">No hay préstamos.</td></tr>`;
      return;
    }

    const hoy = new Date();
    tbody.innerHTML = lista.map(p => {
      const fechaVenc = new Date(p.fecha_vencimiento);
      const fechaPrest = new Date(p.fecha_prestamo);
      const diasRetraso = hoy > fechaVenc ? Math.floor((hoy - fechaVenc) / (1000 * 60 * 60 * 24)) : 0;
      const estado = fechaVenc < hoy ? '<span class="estado-vencido">Vencido</span>' : '<span class="estado-activo">Activo</span>';
      const multa = diasRetraso > 3 ? (diasRetraso - 3) * 3 * p.numero_prestamos : 0;

      return `
        <tr data-ids="${p.ids_prestamos}">
          <td>${p.usuario}</td>
          <td>${p.numero_prestamos}</td>
          <td>${formatearFecha(p.fecha_prestamo)}</td>
          <td>${formatearFecha(p.fecha_vencimiento)}</td>
          <td>${estado}</td>
          <td>$${multa.toFixed(2)}</td>
        </tr>`;
    }).join('');
  }

  // Filtros
  filtroActivos.addEventListener('click', async () => {
    const res = await fetch(`${API_URL}/prestamos`);
    const data = await res.json();
    const hoy = new Date();
    const activos = data.filter(p => new Date(p.fecha_vencimiento) >= hoy);
    renderPrestamosFiltrados(activos);
  });

  filtroVencidos.addEventListener('click', async () => {
    const res = await fetch(`${API_URL}/prestamos`);
    const data = await res.json();
    const hoy = new Date();
    const vencidos = data.filter(p => new Date(p.fecha_vencimiento) < hoy);
    renderPrestamosFiltrados(vencidos);
  });

  filtroTodos.addEventListener('click', () => cargarPrestamos());

  /* ------------------------
     📬 Enviar notificaciones
  ------------------------ */
  if (btnNotificar) {
    btnNotificar.addEventListener('click', async () => {
      if (!confirm('¿Enviar recordatorios de vencimiento?')) return;
      const res = await fetch(`${API_URL}/prestamos/notificar/vencimientos`);
      const data = await res.json();
      mostrarPopup(data.message || 'Notificaciones enviadas.');
    });
  }

  // Popup simple
  const popup = document.getElementById('popupMensaje');
  const popupTexto = document.getElementById('popupTexto');
  const popupCerrar = document.getElementById('popupCerrar');

  function mostrarPopup(mensaje, tipo = 'success') {
    popupTexto.textContent = mensaje;
    popupTexto.style.color = tipo === 'error' ? '#c70000' : '#198754';
    popup.style.display = 'flex';
  }

  popupCerrar.addEventListener('click', () => popup.style.display = 'none');

  // Contador de vencidos
  async function actualizarContadorVencidos() {
    try {
      const res = await fetch(`${API_URL}/prestamos`);
      const data = await res.json();
      const hoy = new Date();
      const vencidos = data.filter(p => new Date(p.fecha_vencimiento) < hoy).length;
      if (btnNotificar) btnNotificar.innerHTML = `📨 Enviar recordatorios (${vencidos})`;
    } catch {}
  }

  actualizarContadorVencidos();
});
