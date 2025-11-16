// Archivo: /jsAdmin/Informes.js
document.addEventListener("DOMContentLoaded", async () => {
  const API_BASE = "http://localhost:3000";

  const $ = (selector) => document.querySelector(selector);

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value ?? "";
  };

  const selectMes = $("#selectMes");
  const inputAnio = $("#inputAnio");
  const btnAplicar = $("#btnAplicar");
  const btnVolver = $("#btnVolver");

  const now = new Date();
  if (selectMes) selectMes.value = String(now.getMonth() + 1);
  if (inputAnio) inputAnio.value = String(now.getFullYear());

  // ===== Helpers de red y fechas =====
  async function getJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  function esVencido(fechaVencimiento) {
    if (!fechaVencimiento) return false;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const v = new Date(fechaVencimiento);
    v.setHours(0, 0, 0, 0);
    return v < hoy;
  }

  function badgeEstado(p) {
    if (Number(p.entregado) === 1) {
      return `<span class="status status-ok">Entregado</span>`;
    }
    if (esVencido(p.fecha_vencimiento)) {
      return `<span class="status status-warn">Vencido</span>`;
    }
    return `<span class="status status-neutral">En curso</span>`;
  }

  // ===== Resumen (KPIs + tablas compactas) =====
  async function cargarResumen(y, m) {
    const data = await getJSON(
      `${API_BASE}/api/informes/resumen?year=${y}&month=${m}`
    );

    setText("kpiUsuarios", data.kpis?.usuarios_totales ?? 0);
    setText("kpiLibros", data.kpis?.libros_totales ?? 0);
    setText("kpiPrestamosMes", data.kpis?.prestamos_mes ?? 0);

    const pxd = data.prestamos_por_dia ?? [];
    const cuerpoDia = document.querySelector("#tblPrestamosDia tbody");
    if (cuerpoDia) {
      cuerpoDia.innerHTML = pxd.length
        ? pxd
            .map(
              (r) => `
          <tr>
            <td>${r.dia}</td>
            <td>${r.usuario || "N/A"}</td>
            <td>${r.libro || "N/A"}</td>
            <td>${r.cantidad || 1}</td>
          </tr>`
            )
            .join("")
        : `<tr><td colspan="4">Sin datos</td></tr>`;
    }

    const top = data.top_libros ?? [];
    const cuerpoTop = document.querySelector("#tblTopLibros tbody");
    if (cuerpoTop) {
      cuerpoTop.innerHTML = top.length
        ? top
            .map(
              (r) => `
          <tr>
            <td>${r.titulo}</td>
            <td>${r.autor || "N/A"}</td>
            <td>${r.total}</td>
          </tr>`
            )
            .join("")
        : `<tr><td colspan="3">Sin datos</td></tr>`;
    }
  }

  // ===== Préstamos del mes (y filtrados) =====
  async function cargarPrestamos(y, m) {
    const data = await getJSON(
      `${API_BASE}/api/informes/prestamos?year=${y}&month=${m}`
    );

    // Tabla principal
    const cuerpoPrest = document.querySelector("#tblPrestamos tbody");
    if (cuerpoPrest) {
      cuerpoPrest.innerHTML = data.length
        ? data
            .map(
              (p) => `
            <tr>
              <td>${p.id_prestamo}</td>
              <td>${p.fecha}</td>
              <td>${p.fecha_vencimiento || "N/A"}</td>
              <td>${p.usuario || "N/A"}</td>
              <td>${p.libros}</td>
              <td>${badgeEstado(p)}</td>
            </tr>`
            )
            .join("")
        : `<tr><td colspan="6">Sin préstamos este mes</td></tr>`;
    }

    // Entregados
    const entregados = data.filter((p) => Number(p.entregado) === 1);
    const cuerpoEnt = document.querySelector("#tblPrestamosEntregados tbody");
    if (cuerpoEnt) {
      cuerpoEnt.innerHTML = entregados.length
        ? entregados
            .map(
              (p) => `
            <tr>
              <td>${p.id_prestamo}</td>
              <td>${p.fecha}</td>
              <td>${p.fecha_vencimiento || "N/A"}</td>
              <td>${p.usuario || "N/A"}</td>
              <td>${p.libros}</td>
              <td>✅ Entregado</td>
            </tr>`
            )
            .join("")
        : `<tr><td colspan="6">Sin préstamos entregados este mes</td></tr>`;
    }

    // Vencidos del mes
    const vencidos = data.filter(
      (p) => Number(p.entregado) === 0 && esVencido(p.fecha_vencimiento)
    );
    const cuerpoVenc = document.querySelector("#tblPrestamosVencidos tbody");
    if (cuerpoVenc) {
      cuerpoVenc.innerHTML = vencidos.length
        ? vencidos
            .map(
              (p) => `
            <tr>
              <td>${p.id_prestamo}</td>
              <td>${p.fecha}</td>
              <td>${p.fecha_vencimiento || "N/A"}</td>
              <td>${p.usuario || "N/A"}</td>
              <td>${p.libros}</td>
              <td>⚠️ Vencido</td>
            </tr>`
            )
            .join("")
        : `<tr><td colspan="6">Sin préstamos vencidos este mes</td></tr>`;
    }

    setText("chipEntregados", entregados.length);
    setText("chipVencidos", vencidos.length);
    setText("kpiEntregados", entregados.length);
    setText("kpiVencidosMes", vencidos.length);
  }

  // ===== Usuarios =====
  async function cargarUsuarios(y, m) {
    const data = await getJSON(
      `${API_BASE}/api/informes/usuarios?year=${y}&month=${m}`
    );
    const cuerpo = document.querySelector("#tblUsuarios tbody");
    if (cuerpo) {
      cuerpo.innerHTML = data.length
        ? data
            .map(
              (u) => `
          <tr>
            <td>${u.id_usuario}</td>
            <td>${u.nombre}</td>
            <td>${u.correo}</td>
            <td>${u.rol || "N/A"}</td>
            <td>${u.prestamos_mes}</td>
          </tr>`
            )
            .join("")
        : `<tr><td colspan="5">Sin usuarios registrados</td></tr>`;
    }
  }

  // ===== Libros (catálogo completo) =====
  async function cargarLibros() {
    const data = await getJSON(`${API_BASE}/api/informes/libros`);
    const cuerpo = document.querySelector("#tblLibros tbody");
    if (cuerpo) {
      cuerpo.innerHTML = data.length
        ? data
            .map(
              (l) => `
          <tr>
            <td>${l.id_libro}</td>
            <td>${l.titulo}</td>
            <td>${l.autor}</td>
            <td>${l.categoria || "N/A"}</td>
            <td>${l.ejemplares}</td>
            <td>${l.total_prestamos}</td>
          </tr>`
            )
            .join("")
        : `<tr><td colspan="6">Sin libros registrados</td></tr>`;
    }
  }

  // ===== Préstamos vencidos globalmente =====
  async function cargarVencidosGlobal() {
    const data = await getJSON(`${API_BASE}/api/informes/vencidos-global`);
    const cuerpo = document.querySelector("#tblVencidosGlobal tbody");
    if (cuerpo) {
      cuerpo.innerHTML = data.length
        ? data
            .map(
              (p) => `
          <tr>
            <td>${p.id_prestamo}</td>
            <td>${p.fecha}</td>
            <td>${p.fecha_vencimiento}</td>
            <td>${p.usuario}</td>
            <td>${p.libros}</td>
            <td>${p.mes_prestamo}</td>
            <td>⚠️ Vencido</td>
          </tr>`
            )
            .join("")
        : `<tr><td colspan="7">Sin préstamos vencidos actualmente</td></tr>`;
    }

    setText("chipVencidosGlobal", data.length);
    setText("kpiVencidosGlobal", data.length);
  }

  // ===== Cargar todo el tablero =====
  async function cargarTodo() {
    const y = inputAnio?.value || now.getFullYear();
    const m = selectMes?.value || now.getMonth() + 1;

    try {
      await Promise.all([
        cargarResumen(y, m),
        cargarPrestamos(y, m),
        cargarUsuarios(y, m),
        cargarLibros(),
        cargarVencidosGlobal(),
      ]);
    } catch (err) {
      console.error("Error al cargar datos:", err);
    }
  }

  if (btnAplicar) {
    btnAplicar.addEventListener("click", (e) => {
      e.preventDefault();
      cargarTodo();
    });
  }

  if (btnVolver) {
    btnVolver.addEventListener("click", (e) => {
      e.preventDefault();
      window.history.back();
    });
  }

  // ======= GENERAR PDF INSTITUCIONAL (CON PORTADA COLOR VINO) =======
  const btnPDF =
    $("#btnGenerarPDF") ||
    $("#btnReporteGeneral") ||
    $("#btnImprimirReporte");

  if (btnPDF) {
    btnPDF.addEventListener("click", generarPDFGeneral);
  }

  async function generarPDFGeneral() {
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      const COLOR_VINO = [110, 0, 40];

      // ===== Datos de periodo =====
      const nowLocal = new Date();
      const anio = inputAnio?.value || nowLocal.getFullYear();
      const mesSeleccionado = Number(
        selectMes?.value || nowLocal.getMonth() + 1
      );
      const mesNombre = new Date(anio, mesSeleccionado - 1).toLocaleString(
        "es-MX",
        { month: "long" }
      );
      const fechaGen = new Date().toLocaleString("es-MX", {
        dateStyle: "medium",
        timeStyle: "short",
      });

      // ================= PORTADA =================
      // Franja superior vino
      doc.setFillColor(COLOR_VINO[0], COLOR_VINO[1], COLOR_VINO[2]);
      doc.rect(0, 0, pageWidth, 35, "F");

      // Títulos en la franja
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.text("Biblioteca de Alejandría", pageWidth / 2, 18, {
        align: "center",
      });

      doc.setFontSize(16);
      doc.text("Informe General", pageWidth / 2, 28, { align: "center" });

      // Texto central
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      const mesTitulo =
        mesNombre.charAt(0).toUpperCase() + mesNombre.slice(1);
      doc.text(`${mesTitulo} ${anio}`, pageWidth / 2, pageHeight / 2 - 10, {
        align: "center",
      });

      doc.setFontSize(11);
      doc.text(
        "Sistema de Gestión Bibliotecaria",
        pageWidth / 2,
        pageHeight / 2,
        { align: "center" }
      );

      doc.setFontSize(10);
      doc.text(
        `Generado: ${fechaGen}`,
        pageWidth / 2,
        pageHeight / 2 + 8,
        { align: "center" }
      );

      // Pie de portada
      doc.setDrawColor(COLOR_VINO[0], COLOR_VINO[1], COLOR_VINO[2]);
      doc.setLineWidth(0.5);
      doc.line(25, pageHeight - 30, pageWidth - 25, pageHeight - 30);

      doc.setFontSize(9);
      doc.text(
        "Este documento contiene el resumen ejecutivo, estadísticas de préstamos, usuarios, catálogo e información de vencidos.",
        pageWidth / 2,
        pageHeight - 22,
        { align: "center", maxWidth: pageWidth - 40 }
      );

      // ===== Nueva página para el contenido =====
      doc.addPage();

      // ===== Resumen Ejecutivo (segunda página) =====
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(COLOR_VINO[0], COLOR_VINO[1], COLOR_VINO[2]);
      doc.text("Resumen Ejecutivo", 14, 20);

      const usuarios = document
        .getElementById("kpiUsuarios")
        ?.textContent.trim() || "0";
      const libros =
        document.getElementById("kpiLibros")?.textContent.trim() || "0";
      const prestamos =
        document.getElementById("kpiPrestamosMes")?.textContent.trim() || "0";

      const kpiLabels = [
        "Usuarios Registrados",
        "Libros en Inventario",
        "Préstamos del Mes",
      ];
      const kpiValues = [usuarios, libros, prestamos];

      const boxMarginX = 14;
      const totalBoxWidth = pageWidth - boxMarginX * 2;
      const boxWidth = totalBoxWidth / 3 - 4;
      const boxHeight = 22;
      const boxY = 26;

      doc.setFont("helvetica", "bold");
      for (let i = 0; i < 3; i++) {
        const x = boxMarginX + i * (boxWidth + 4);

        // Caja vino
        doc.setFillColor(COLOR_VINO[0], COLOR_VINO[1], COLOR_VINO[2]);
        doc.roundedRect(x, boxY, boxWidth, boxHeight, 2, 2, "F");

        // Texto dentro (blanco)
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.text(String(kpiValues[i]), x + boxWidth / 2, boxY + 9, {
          align: "center",
        });

        doc.setFontSize(9);
        doc.text(kpiLabels[i], x + boxWidth / 2, boxY + 17, {
          align: "center",
        });
      }

      // Texto explicativo del resumen
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(
        "Resumen general de la actividad de la biblioteca durante el periodo seleccionado, incluyendo usuarios, libros, préstamos y vencidos.",
        14,
        boxY + boxHeight + 8,
        { maxWidth: pageWidth - 28 }
      );

      // ===== Config base para autoTable =====
      const autoTableOptionsBase = {
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 2 },
        headStyles: {
          fillColor: COLOR_VINO,
          textColor: [255, 255, 255],
        },
      };

      function runAutoTableWithBase(options) {
        doc.autoTable({
          ...autoTableOptionsBase,
          ...options,
          styles: {
            ...autoTableOptionsBase.styles,
            ...(options.styles || {}),
          },
          headStyles: {
            ...autoTableOptionsBase.headStyles,
            ...(options.headStyles || {}),
          },
        });
      }

      // ===== Tablas desde el HTML =====
      await agregarTablaDesdeHTML(
        doc,
        runAutoTableWithBase,
        "tblPrestamosDia",
        "Préstamos por Día"
      );
      await agregarTablaDesdeHTML(
        doc,
        runAutoTableWithBase,
        "tblTopLibros",
        "Top Libros Más Prestados"
      );
      await agregarTablaDesdeHTML(
        doc,
        runAutoTableWithBase,
        "tblUsuarios",
        "Usuarios Registrados"
      );
      await agregarTablaDesdeHTML(
        doc,
        runAutoTableWithBase,
        "tblPrestamos",
        "Historial de Préstamos"
      );
      await agregarTablaDesdeHTML(
        doc,
        runAutoTableWithBase,
        "tblLibros",
        "Inventario de Libros"
      );
      await agregarTablaDesdeHTML(
        doc,
        runAutoTableWithBase,
        "tblVencidosGlobal",
        "Préstamos Vencidos Globales"
      );

      // ===== Pie de página con paginado en TODAS las páginas =====
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(120, 120, 120);
        doc.text(`Página ${i} de ${pageCount}`, pageWidth - 25, pageHeight - 10);
      }

      // Descargar el PDF
      doc.save(`Informe_General_${anio}_${mesSeleccionado}.pdf`);
    } catch (err) {
      console.error("Error generando PDF:", err);
      alert("Error al generar el PDF. Revisa la consola.");
    }
  }

  // ===== Utilidad para convertir tablas HTML a autoTable =====
  async function agregarTablaDesdeHTML(
    doc,
    autoTableRunner,
    idTabla,
    titulo
  ) {
    const tabla = document.getElementById(idTabla);
    if (!tabla) return;

    const head = [];
    const body = [];

    const ths = tabla.querySelectorAll("thead th");
    if (ths.length > 0) {
      head.push([...ths].map((th) => th.textContent.trim()));
    }

    const filas = tabla.querySelectorAll("tbody tr");
    filas.forEach((tr) => {
      const celdas = [...tr.querySelectorAll("td")].map((td) => {
        let texto = td.textContent.trim();
        // limpiamos emojis que rompen el PDF
        texto = texto
          .replace("⚠️", "")
          .replace("✅", "")
          .replace(/\s+/g, " ")
          .trim();
        return texto;
      });
      if (celdas.length) body.push(celdas);
    });

    if (!body.length) return;

    // Empujamos un poco más hacia abajo para que NO se monte con el texto anterior
    const startY = doc.lastAutoTable
      ? doc.lastAutoTable.finalY + 14
      : 110;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(titulo, 14, startY - 4);

    autoTableRunner({
      startY,
      head,
      body,
    });
  }

  // ===== Carga inicial =====
  await cargarTodo();
});
