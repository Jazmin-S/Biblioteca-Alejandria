document.addEventListener("DOMContentLoaded", () => {
  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  
  const now = new Date();
  const mesActual = now.getMonth() + 1;
  const anioActual = now.getFullYear();

  const $ = (s) => document.querySelector(s);
  const setText = (id, v) => (document.getElementById(id).textContent = v ?? "");

  const selectMes = $("#selectMes");
  const inputAnio = $("#inputAnio");
  const btnAplicar = $("#btnAplicar");
  const btnVolver = $("#btnVolver");
  const btnPDFGeneral = $("#btnPDFGeneral");

  selectMes.value = String(mesActual);
  inputAnio.value = String(anioActual);

  btnVolver.addEventListener("click", () => window.location.href = "/html/htmlAdmin/InicioAdmin.html");

  const API_BASE = "http://localhost:3000";
  const API = {
    resumen: (y, m) => `${API_BASE}/api/informes/resumen?year=${y}&month=${m}`,
    usuarios: (y, m) => `${API_BASE}/api/informes/usuarios?year=${y}&month=${m}`,
    libros: (y, m) => `${API_BASE}/api/informes/libros?year=${y}&month=${m}`,
    prestamos: (y, m) => `${API_BASE}/api/informes/prestamos?year=${y}&month=${m}`
  };

  const state = { resumen: { kpis: {}, prestamos_por_dia: [], top_libros: [] }, usuarios: [], prestamos: [], libros: [] };

  async function getJSON(url) { 
    const r = await fetch(url); 
    if (!r.ok) throw new Error(r.status); 
    return r.json(); 
  }

  async function cargar() {
    const y = inputAnio.value || anioActual, m = selectMes.value || mesActual;
    try {
      await Promise.all([cargarResumen(y, m), cargarUsuarios(y, m), cargarPrestamos(y, m), cargarLibros(y, m)]);
    } catch (e) { console.error(e); }
  }

  async function cargarResumen(y, m) {
    const d = await getJSON(API.resumen(y, m));
    state.resumen = d;
    setText("kpiUsuarios", d.kpis?.usuarios_totales ?? 0);
    setText("kpiLibros", d.kpis?.libros_totales ?? 0);
    setText("kpiPrestamosMes", d.kpis?.prestamos_mes ?? 0);
    $("#tblPrestamosDia tbody").innerHTML = d.prestamos_por_dia?.length ? d.prestamos_por_dia.map(r => `<tr><td>${r.dia}</td><td>${r.total}</td></tr>`).join("") : `<tr><td colspan='2'>Sin datos</td></tr>`;
    $("#tblTopLibros tbody").innerHTML = d.top_libros?.length ? d.top_libros.map(r => `<tr><td>${r.titulo}</td><td>${r.autor || "N/A"}</td><td>${r.total}</td></tr>`).join("") : `<tr><td colspan='3'>Sin datos</td></tr>`;
  }

  async function cargarUsuarios(y, m) { 
    const d = await getJSON(API.usuarios(y, m)); 
    state.usuarios = d; 
    $("#tblUsuarios tbody").innerHTML = d.length ? d.map(u => `<tr><td>${u.id_usuario}</td><td>${u.nombre}</td><td>${u.correo}</td><td>${u.rol}</td><td>${u.prestamos_mes}</td></tr>`).join("") : `<tr><td colspan='5'>Sin datos</td></tr>`; 
  }

  async function cargarPrestamos(y, m) { 
    const d = await getJSON(API.prestamos(y, m)); 
    state.prestamos = d; 
    $("#tblPrestamos tbody").innerHTML = d.length ? d.map(p => `<tr><td>${p.id_prestamo}</td><td>${p.fecha}</td><td>${p.fecha_vencimiento || "N/A"}</td><td>${p.usuario || "N/A"}</td><td>${p.libros}</td></tr>`).join("") : `<tr><td colspan='5'>Sin datos</td></tr>`; 
  }

  async function cargarLibros(y, m) { 
    const d = await getJSON(API.libros(y, m)); 
    state.libros = d; 
    $("#tblLibros tbody").innerHTML = d.length ? d.map(l => `<tr><td>${l.id_libro}</td><td>${l.titulo}</td><td>${l.autor}</td><td>${l.categoria || "N/A"}</td><td>${l.ejemplares}</td><td>${l.prestamos_mes}</td></tr>`).join("") : `<tr><td colspan='6'>Sin datos</td></tr>`; 
  }

  // ========== FUNCIÓN PARA PDFs INDIVIDUALES ==========
  function exportarTablaPDF(titulo, tablaId, desc) {
    console.log(`Generando PDF para: ${titulo}, tabla: ${tablaId}`);
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const fecha = new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" }).format(new Date());
    
    // Header
    doc.setFillColor(101, 31, 50);
    doc.rect(0, 0, pageW, 100, "F");
    
    // Título
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(titulo, 40, 45);
    
    // Información
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Biblioteca de Alejandría`, 40, 65);
    doc.text(`Generado: ${fecha}`, 40, 80);
    
    // Descripción
    if (desc) {
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(9);
      doc.text(desc, 40, 100, { maxWidth: pageW - 80 });
    }
    
    // Crear datos de la tabla manualmente
    const tabla = document.getElementById(tablaId);
    if (!tabla) {
      console.error(`No se encontró la tabla con ID: ${tablaId}`);
      alert(`Error: No se pudo encontrar la tabla ${tablaId}`);
      return;
    }
    
    const headers = [];
    const rows = [];
    
    // Obtener headers
    const headerCells = tabla.querySelectorAll('thead th');
    headerCells.forEach(cell => {
      headers.push(cell.textContent.trim());
    });
    
    // Obtener datos
    const dataRows = tabla.querySelectorAll('tbody tr');
    dataRows.forEach(row => {
      const rowData = [];
      const cells = row.querySelectorAll('td');
      cells.forEach(cell => {
        rowData.push(cell.textContent.trim());
      });
      if (rowData.length > 0) rows.push(rowData);
    });
    
    // Si no hay datos, mostrar mensaje
    if (rows.length === 0) {
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(12);
      doc.text("No hay datos disponibles para mostrar", 40, desc ? 140 : 120);
    } else {
      // Generar tabla con autoTable
      doc.autoTable({
        head: [headers],
        body: rows,
        startY: desc ? 120 : 100,
        theme: "grid",
        headStyles: { 
          fillColor: [101, 31, 50],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "center"
        },
        bodyStyles: { textColor: [40, 40, 40], fontSize: 9 },
        alternateRowStyles: { fillColor: [248, 232, 232] },
        styles: { fontSize: 9, cellPadding: 6 },
        margin: { left: 40, right: 40 }
      });
    }
    
    // Footer
    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 30 : 150;
    doc.setDrawColor(101, 31, 50);
    doc.setLineWidth(1);
    doc.line(40, finalY, pageW - 40, finalY);
    doc.setTextColor(101, 31, 50);
    doc.setFontSize(8);
    doc.text(`Página 1 de 1 - Biblioteca de Alejandría - ${fecha.split(",")[0]}`, pageW / 2, finalY + 15, { align: "center" });
    
    doc.save(`${titulo.replace(/\s+/g, "_")}.pdf`);
    console.log(`PDF ${titulo} generado exitosamente`);
  }

  // ========== CONFIGURACIÓN DE BOTONES INDIVIDUALES ==========
  function configurarBotonesPDF() {
    const botones = document.querySelectorAll(".btnPDF");
    console.log(`Encontrados ${botones.length} botones PDF`);
    
    botones.forEach(btn => {
      // Remover event listeners existentes para evitar duplicados
      btn.replaceWith(btn.cloneNode(true));
    });
    
    // Volver a obtener los botones después del clone
    const nuevosBotones = document.querySelectorAll(".btnPDF");
    
    nuevosBotones.forEach(btn => {
      btn.addEventListener("click", function(e) {
        e.preventDefault();
        const target = this.dataset.target;
        console.log(`Click en botón PDF: ${target}`);
        
        switch(target) {
          case "general":
            // Se mantiene para compatibilidad, pero el General ahora está en btnPDFGeneral
            exportarTablaPDF("Prestamos_por_Dia", "tblPrestamosDia", "Detalle diario de la actividad de préstamos");
            setTimeout(() => {
              exportarTablaPDF("Top_Libros_Mas_Prestados", "tblTopLibros", "Ranking de libros más solicitados");
            }, 1000);
            break;
          case "usuarios":
            exportarTablaPDF("Reporte_de_Usuarios", "tblUsuarios", "Lista completa de usuarios registrados");
            break;
          case "prestamos":
            exportarTablaPDF("Historial_de_Prestamos", "tblPrestamos", "Registro detallado de todos los préstamos");
            break;
          case "libros":
            exportarTablaPDF("Inventario_de_Libros", "tblLibros", "Catálogo completo de libros con categorías");
            break;
          default:
            console.error(`Target desconocido: ${target}`);
        }
      });
    });
  }

  // ========== PDF GENERAL COMPLETO (CORREGIDO) ==========
  btnPDFGeneral.addEventListener("click", async function() {
    console.log("Generando PDF General...");
    const { jsPDF } = window.jspdf;
    const y = inputAnio.value || anioActual;
    const m = Number(selectMes.value || mesActual);
    const periodo = `${monthNames[m - 1]} ${y}`;
    const fechaGen = new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" }).format(new Date());

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    // ======= PORTADA =======
    doc.setFillColor(101, 31, 50);
    doc.rect(0, 0, pageW, pageH, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(36);
    doc.text("INFORME GENERAL", pageW / 2, 250, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(20);
    doc.text("Biblioteca de Alejandría", pageW / 2, 290, { align: "center" });
    doc.setFontSize(16);
    doc.text(periodo, pageW / 2, 320, { align: "center" });

    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(2);
    doc.line(pageW / 2 - 80, 340, pageW / 2 + 80, 340);

    doc.setFontSize(11);
    doc.text(`Generado: ${fechaGen}`, pageW / 2, 460, { align: "center" });
    doc.text("Sistema de Gestión Bibliotecaria", pageW / 2, 480, { align: "center" });

    // ======= PÁGINA 2: RESUMEN EJECUTIVO =======
    doc.addPage();
    doc.setFillColor(101, 31, 50);
    doc.rect(0, 0, pageW, 80, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("Resumen Ejecutivo", 40, 45);
    doc.setDrawColor(212, 175, 55);
    doc.line(40, 55, pageW - 40, 55);

    const kpis = [
      { label: "Usuarios Registrados", value: state.resumen.kpis?.usuarios_totales ?? 0, color: [139, 0, 0] },
      { label: "Libros en Inventario", value: state.resumen.kpis?.libros_totales ?? 0, color: [178, 34, 34] },
      { label: "Préstamos del Mes", value: state.resumen.kpis?.prestamos_mes ?? 0, color: [165, 42, 42] }
    ];

    const kpiBoxW = 150, kpiBoxH = 100, kpiGap = 30;
    const kpiStartX = (pageW - (kpiBoxW * 3 + kpiGap * 2)) / 2;
    const kpiY = 120;

    kpis.forEach((kpi, i) => {
      const x = kpiStartX + i * (kpiBoxW + kpiGap);
      doc.setFillColor(...kpi.color);
      doc.roundedRect(x, kpiY, kpiBoxW, kpiBoxH, 10, 10, "F");
      doc.setDrawColor(212, 175, 55);
      doc.roundedRect(x, kpiY, kpiBoxW, kpiBoxH, 10, 10, "S");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(26);
      doc.text(kpi.value.toString(), x + kpiBoxW / 2, kpiY + 45, { align: "center" });
      doc.setFontSize(10);
      doc.text(kpi.label, x + kpiBoxW / 2, kpiY + 70, { align: "center", maxWidth: kpiBoxW - 20 });
    });

    doc.setFontSize(11);
    doc.setTextColor(40, 40, 40);
    doc.text("Resumen general de actividad de la biblioteca durante el periodo seleccionado,", 40, 260);
    doc.text("incluyendo usuarios, libros, préstamos y categorías.", 40, 275);

    // ======= PRESTAMOS POR DÍA =======
    doc.addPage();
    doc.setFillColor(101, 31, 50);
    doc.rect(0, 0, pageW, 70, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Préstamos por Día", 40, 40);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    const prestamosDia = state.resumen.prestamos_por_dia ?? [];
    if (prestamosDia.length) {
      const data = prestamosDia.map(p => [p.dia, p.total]);
      doc.autoTable({
        head: [["Día", "Total"]],
        body: data,
        startY: 80,
        theme: "grid",
        headStyles: { fillColor: [101, 31, 50], textColor: 255 },
        alternateRowStyles: { fillColor: [248, 232, 232] }
      });
    } else {
      doc.text("Sin datos de préstamos por día.", 40, 90);
    }

    // ======= TOP LIBROS =======
    doc.addPage();
    doc.setFillColor(101, 31, 50);
    doc.rect(0, 0, pageW, 70, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text("Top Libros Más Prestados", 40, 40);
    const topLibros = state.resumen.top_libros ?? [];
    if (topLibros.length) {
      const data = topLibros.map(l => [l.titulo, l.autor || "N/A", l.total]);
      doc.autoTable({
        head: [["Título", "Autor", "Total"]],
        body: data,
        startY: 80,
        theme: "grid",
        headStyles: { fillColor: [101, 31, 50], textColor: 255 },
        alternateRowStyles: { fillColor: [248, 232, 232] }
      });
    } else {
      doc.text("Sin datos de libros más prestados.", 40, 90);
    }

    // ======= USUARIOS =======
    doc.addPage();
    doc.setFillColor(101, 31, 50);
    doc.rect(0, 0, pageW, 70, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text("Usuarios Registrados", 40, 40);
    const usuarios = state.usuarios ?? [];
    if (usuarios.length) {
      const data = usuarios.map(u => [u.id_usuario, u.nombre, u.correo, u.rol, u.prestamos_mes]);
      doc.autoTable({
        head: [["ID", "Nombre", "Correo", "Rol", "Préstamos"]],
        body: data,
        startY: 80,
        theme: "grid",
        headStyles: { fillColor: [101, 31, 50], textColor: 255 },
        alternateRowStyles: { fillColor: [248, 232, 232] }
      });
    } else {
      doc.text("Sin usuarios registrados para este periodo.", 40, 90);
    }

    // ======= PRÉSTAMOS =======
    doc.addPage();
    doc.setFillColor(101, 31, 50);
    doc.rect(0, 0, pageW, 70, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text("Historial de Préstamos", 40, 40);
    const prestamos = state.prestamos ?? [];
    if (prestamos.length) {
      const data = prestamos.map(p => [p.id_prestamo, p.fecha, p.fecha_vencimiento || "N/A", p.usuario || "N/A", p.libros]);
      doc.autoTable({
        head: [["ID", "Fecha", "Vencimiento", "Usuario", "Libros"]],
        body: data,
        startY: 80,
        theme: "grid",
        headStyles: { fillColor: [101, 31, 50], textColor: 255 },
        alternateRowStyles: { fillColor: [248, 232, 232] }
      });
    } else {
      doc.text("Sin préstamos registrados.", 40, 90);
    }

    // ======= LIBROS =======
    doc.addPage();
    doc.setFillColor(101, 31, 50);
    doc.rect(0, 0, pageW, 70, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text("Inventario de Libros", 40, 40);
    const libros = state.libros ?? [];
    if (libros.length) {
      const data = libros.map(l => [l.id_libro, l.titulo, l.autor, l.categoria || "N/A", l.ejemplares, l.prestamos_mes]);
      doc.autoTable({
        head: [["ID", "Título", "Autor", "Categoría", "Ejemplares", "Préstamos"]],
        body: data,
        startY: 80,
        theme: "grid",
        headStyles: { fillColor: [101, 31, 50], textColor: 255 },
        alternateRowStyles: { fillColor: [248, 232, 232] }
      });
    } else {
      doc.text("Sin libros registrados.", 40, 90);
    }

    // ======= GUARDAR =======
    doc.save(`Informe_General_${y}_${String(m).padStart(2, "0")}.pdf`);
    console.log("PDF General completo generado exitosamente");
  });

  // ========== INICIALIZACIÓN ==========
  btnAplicar.addEventListener("click", function() {
    cargar();
    // Reconfigurar botones después de cargar datos
    setTimeout(configurarBotonesPDF, 500);
  });

  // Configurar botones al cargar la página
  setTimeout(configurarBotonesPDF, 1000);
  cargar();
});
