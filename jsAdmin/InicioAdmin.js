document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ Script de InicioAdmin cargado");

  // === Botón EXIT ===
  document.querySelector(".exit-btn")?.addEventListener("click", () => {
    window.location.href = "/html/htmlAdmin/AdminLogin.html";
  });

  // === Navegación directa ===
  document.querySelector('.icons img[alt="editar"]')?.addEventListener("click", () => {
    window.location.href = "/html/htmlLibros/EditarLibros.html";
  });

  document.getElementById("btn-agregar")?.addEventListener("click", () => {
    window.location.href = "/html/htmlLibros/AgregarLibro.html";
  });

  document.getElementById("btn-usuarios")?.addEventListener("click", () => {
    window.location.href = "/html/htmlAdmin/editar-usuarios.html";
  });

  document.getElementById("btn-prestamos")?.addEventListener("click", () => {
    window.location.href = "/html/htmlAdmin/Gestion-prestamos.html";
  });

  // ⬇️ BLOQUE DE REPORTE CORREGIDO Y ACTUALIZADO ⬇️
  document.getElementById("btn-reporte")?.addEventListener("click", async () => {
    // Ocultar el menú popup
    // (Necesitamos definir popupMenu antes, lo muevo más abajo)
    
    // Usar la librería que cargamos en el HTML
    const { jsPDF } = window.jspdf;

    alert("Generando reporte detallado... por favor espera.");

    try {
      // 1. Llamar a nuestro endpoint (que ahora trae listas)
      const res = await fetch("http://localhost:3000/api/reportes");
      if (!res.ok) throw new Error("No se pudo obtener el reporte del servidor");
      
      const stats = await res.json();
      
      // 2. Crear el documento PDF
      const doc = new jsPDF();
      const fecha = new Date().toLocaleDateString('es-MX', { 
        year: 'numeric', month: 'long', day: 'numeric' 
      });
      const pageHeight = doc.internal.pageSize.getHeight();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let y = margin; // Posición Y inicial

      // === FUNCIÓN AUXILIAR DE PAGINACIÓN ===
      // Esta función comprueba si 'y' se pasó del límite y añade una página
      function checkPageBreak(yPos) {
        if (yPos >= pageHeight - margin) {
          doc.addPage();
          return margin; // Reinicia 'y' al margen superior
        }
        return yPos; // Continúa en la misma página
      }

      // === FUNCIÓN AUXILIAR PARA TÍTULOS ===
      function addTitle(doc, yPos, text) {
        yPos = checkPageBreak(yPos + 10); // Espacio antes del título
        doc.setFontSize(18);
        doc.text(text, margin, yPos);
        doc.setLineWidth(0.5);
        doc.line(margin, yPos + 2, pageWidth - margin, yPos + 2); // Línea divisoria
        doc.setFontSize(12);
        return yPos + 12; // Nueva posición Y
      }

      // === INICIO DEL DOCUMENTO ===

      // --- PÁGINA 1: PORTADA Y RESUMEN ---
      doc.setFontSize(24);
      doc.text("Reporte General de Biblioteca", pageWidth / 2, y, { align: 'center' });
      y += 10;
      doc.setFontSize(12);
      doc.text(`Fecha de generación: ${fecha}`, pageWidth / 2, y, { align: 'center' });
      y += 15;
      
      doc.setFontSize(16);
      doc.text(" Resumen General", margin, y);
      y += 8;

      doc.setFontSize(12);
      doc.text(`Total de Títulos Únicos: ${stats.total_libros}`, margin + 5, y);
      y += 7;
      doc.text(`Total de Ejemplares (Stock): ${stats.total_ejemplares}`, margin + 5, y);
      y += 7;
      doc.text(`Total de Usuarios Registrados: ${stats.total_usuarios}`, margin + 5, y);
      y += 12;
      doc.text(`Préstamos Actualmente Activos: ${stats.prestamos_activos}`, margin + 5, y);
      y += 7;
      doc.text(`Préstamos Vencidos (sin entregar): ${stats.prestamos_vencidos}`, margin + 5, y);
      y += 10;
      
      doc.setFontSize(14);
      doc.text(`Monto Total de Adeudos (Vencidos): $${stats.monto_total_adeudos} MXN`, margin, y);
      y += 10;

      // --- PÁGINA 2: PRÉSTAMOS VENCIDOS ---
      doc.addPage();
      y = addTitle(doc, margin, "Listado de Préstamos Vencidos");

      if (stats.lista_vencidos.length === 0) {
        doc.text("No hay préstamos vencidos.", margin, y);
      }
      stats.lista_vencidos.forEach((p, i) => {
        y = checkPageBreak(y + 5); // Espacio entre préstamos
        doc.setFontSize(12).setFont(undefined, 'bold');
        doc.text(`${i + 1}. Usuario: ${p.nombre}`, margin, y);
        y += 6;
        doc.setFontSize(10).setFont(undefined, 'normal');
        doc.text(`  Fecha Vencimiento: ${new Date(p.fecha_vencimiento).toLocaleDateString('es-MX')}`, margin, y);
        y += 5;
        doc.text(`  Días de Retraso: ${p.dias_retraso}`, margin, y);
        y += 5;
        doc.text(`  Libros (${p.numero_libros}): ${p.libros}`, margin, y, { maxWidth: pageWidth - (margin * 2) });
        y += 10; // Espacio extra por si 'libros' ocupa varias líneas
      });

      // --- PÁGINA 3: PRÉSTAMOS ACTIVOS (VIGENTES) ---
      y = addTitle(doc, y, "Listado de Préstamos Activos (Vigentes)");

      if (stats.lista_activos.length === 0) {
        doc.text("No hay préstamos vigentes.", margin, y);
      }
      stats.lista_activos.forEach((p, i) => {
        y = checkPageBreak(y + 5);
        doc.setFontSize(12).setFont(undefined, 'bold');
        doc.text(`${i + 1}. Usuario: ${p.nombre}`, margin, y);
        y += 6;
        doc.setFontSize(10).setFont(undefined, 'normal');
        doc.text(`  Fecha Vencimiento: ${new Date(p.fecha_vencimiento).toLocaleDateString('es-MX')}`, margin, y);
        y += 5;
        doc.text(`  Libros: ${p.libros}`, margin, y, { maxWidth: pageWidth - (margin * 2) });
        y += 10; 
      });

      // --- PÁGINA 4: LISTA DE USUARIOS CON ADEUDOS ---
      y = addTitle(doc, y, "Listado de Usuarios con Adeudos");

      if (stats.lista_deudores.length === 0) {
        doc.text("Ningún usuario tiene adeudos actualmente.", margin, y);
      }
      stats.lista_deudores.forEach((u, i) => {
        y = checkPageBreak(y + 7);
        // (Usa 'u.correo' como corregimos)
        doc.text(`${i + 1}. ${u.nombre} - ${u.correo || 'N/A'}`, margin, y);
      });

      // --- PÁGINA 5: LISTA DE TODOS LOS USUARIOS ---
      y = addTitle(doc, y, "Listado de Todos los Usuarios");

      if (stats.lista_usuarios.length === 0) {
        doc.text("No hay usuarios registrados.", margin, y);
      }
      stats.lista_usuarios.forEach((u, i) => {
        y = checkPageBreak(y + 7);
        // (Usa 'u.correo' como corregimos)
        doc.text(`${i + 1}. ${u.nombre} - ${u.correo || 'N/A'}`, margin, y);
      });

      // --- ❗ NUEVA PÁGINA: LISTA DE LIBROS DISPONIBLES ---
      y = addTitle(doc, y, "Listado de Libros Disponibles");

      if (stats.lista_libros_disponibles.length === 0) {
        doc.text("No hay libros disponibles en este momento.", margin, y);
      }
      stats.lista_libros_disponibles.forEach((l, i) => {
        y = checkPageBreak(y + 7);
        doc.text(`${i + 1}. ${l.titulo} (Autor: ${l.autor}) - ${l.ejemplares} ejemplares`, margin, y, { maxWidth: pageWidth - (margin * 2) });
      });

      // --- ❗ NUEVA PÁGINA: LISTA DE CATEGORÍAS ---
      y = addTitle(doc, y, "Listado de Categorías");

      if (stats.lista_categorias.length === 0) {
        doc.text("No hay categorías registradas.", margin, y);
      }
      stats.lista_categorias.forEach((c, i) => {
        y = checkPageBreak(y + 7);
        doc.text(`${i + 1}. ${c.nombre}`, margin, y);
      });

      // 3. Guardar el archivo
      doc.save(`Reporte_Detallado_Biblioteca_${new Date().toISOString().split('T')[0]}.pdf`);

    } catch (err) {
      console.error("❌ Error al generar PDF:", err);
      alert("❌ Hubo un error al generar el reporte detallado. Revisa la consola.");
    }
  });
  // ⬆️ FIN DEL BLOQUE DE REPORTE ⬆️


  document.getElementById("btn-perfil")?.addEventListener("click", () => {
    window.location.href = "/html/info.html";
  });

  document.querySelector('.icons img[alt="usuario"]')?.addEventListener("click", () => {
    window.location.href = "/html/info.html";
  });


  // === Popup Menú ===
  // (Definición movida aquí para que 'btn-reporte' la pueda usar)
  const menuBtn = document.querySelector(".menu-btn");
  const popupMenu = document.getElementById("popupMenu");
  menuBtn?.addEventListener("click", () => popupMenu.style.display = "flex");
  document.querySelector(".close-popup")?.addEventListener("click", () => {
    popupMenu.style.display = "none";
  });

  // === Variables ===
  const contenedorCategorias = document.getElementById("contenedor-categorias");
  const selectFiltro = document.getElementById("selectFiltro");
  const listaCategoriasDiv = document.getElementById("listaCategorias");

  // === Cargar categorías ===
  async function cargarCategorias() {
    try {
      const res = await fetch("http://localhost:3000/api/categorias");
      const categorias = await res.json();

      contenedorCategorias.innerHTML = "";
      categorias.forEach(cat => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
          <img src="${cat.portada || 'https://via.placeholder.com/120x180?text=Sin+Portada'}" alt="${cat.nombre}">
          <p>${cat.nombre}</p>
        `;
        contenedorCategorias.appendChild(card);
      });

      selectFiltro.innerHTML = `<option value="">-- Todos los libros --</option>`;
      categorias.forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat.nombre;
        opt.textContent = cat.nombre;
        selectFiltro.appendChild(opt);
      });

      listaCategoriasDiv.innerHTML = "";
      categorias.forEach(cat => {
        const div = document.createElement("div");
        div.style.display = "flex";
        div.style.alignItems = "center";
        div.style.justifyContent = "space-between";
        div.style.margin = "8px 0";
        div.innerHTML = `
          <div style="display:flex;align-items:center;gap:8px;">
            <img src="${cat.portada || 'https://via.placeholder.com/50x70?text=No+Img'}" 
                 width="50" height="70" style="object-fit:cover;border-radius:6px;">
            <span>${cat.nombre}</span>
          </div>
          <div>
            <button data-id="${cat.id_categoria}" data-nombre="${cat.nombre}" data-portada="${cat.portada}" class="btn-editar-cat">🖊️</button>
            <button data-id="${cat.id_categoria}" class="btn-eliminar-cat">🗑️</button>
          </div>
        `;
        listaCategoriasDiv.appendChild(div);
      });
    } catch (err) {
      console.error("❌ Error cargando categorías:", err);
    }
  }

  // === Modal Categorías ===
  const popupCategorias = document.getElementById("popupCategorias");
  document.getElementById("btn-gestionar-categorias")?.addEventListener("click", () => {
    popupCategorias.style.display = "flex";
  });
  document.getElementById("cerrarCategorias")?.addEventListener("click", () => {
    popupCategorias.style.display = "none";
  });

  // === Editar categoría ===
  const popupEditar = document.getElementById("popupEditarCategoria");
  const cerrarEditar = document.getElementById("cerrarEditarCategoria");
  const formEditar = document.getElementById("formEditarCategoria");
  const editId = document.getElementById("editIdCategoria");
  const editNombre = document.getElementById("editNombreCategoria");
  const editPortada = document.getElementById("editPortadaCategoria");
  const previewEdit = document.getElementById("previewEditPortada");

  cerrarEditar?.addEventListener("click", () => popupEditar.style.display = "none");

  listaCategoriasDiv?.addEventListener("click", e => {
    if (e.target.classList.contains("btn-editar-cat")) {
      const id = e.target.dataset.id;
      const nombre = e.target.dataset.nombre;
      const portada = e.target.dataset.portada;

      editId.value = id;
      editNombre.value = nombre;
      previewEdit.src = portada || "https://via.placeholder.com/80x100?text=Sin+Portada";
      editPortada.value = "";

      popupEditar.style.display = "flex";
    }
  });

  editPortada?.addEventListener("change", () => {
    const file = editPortada.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => previewEdit.src = e.target.result;
      reader.readAsDataURL(file);
    }
  });

  formEditar?.addEventListener("submit", async e => {
    e.preventDefault();
    const id = editId.value;
    const formData = new FormData(formEditar);

    try {
      const res = await fetch(`http://localhost:3000/api/categorias/${id}`, {
        method: "PUT",
        body: formData
      });
      if (!res.ok) throw new Error("Error al actualizar categoría");
      alert("✅ Categoría actualizada");
      popupEditar.style.display = "none";
      cargarCategorias();
    } catch (err) {
      console.error(err);
      alert("❌ Error al actualizar categoría");
    }
  });

  // === Agregar categoría ===
  document.getElementById("formCategoria")?.addEventListener("submit", async e => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const res = await fetch("http://localhost:3000/api/categorias", {
        method: "POST",
        body: formData
      });
      if (!res.ok) throw new Error("Error al guardar categoría");
      alert("✅ Categoría agregada");
      e.target.reset();
      cargarCategorias();
    } catch (err) {
      console.error(err);
      alert("❌ Error al guardar categoría");
    }
  });

  // === Eliminar categoría ===
  listaCategoriasDiv?.addEventListener("click", async e => {
    if (e.target.classList.contains("btn-eliminar-cat")) {
      const id = e.target.dataset.id;
      if (!confirm("¿Eliminar categoría?")) return;
      try {
        const res = await fetch(`http://localhost:3000/api/categorias/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Error al eliminar categoría");
        alert("🗑️ Categoría eliminada");
        cargarCategorias();
      } catch (err) {
        console.error(err);
        alert("❌ Error al eliminar categoría");
      }
    }
  });

  // === Libros ===
  let librosData = [];
  async function cargarLibros() {
    try {
      const res = await fetch("http://localhost:3000/api/libros");
      librosData = await res.json();
      renderLibros(librosData);
    } catch (err) {
      console.error("❌ Error cargando libros:", err);
    }
  }

  function renderLibros(libros) {
    const contenedor = document.getElementById("contenedor-libros");
    contenedor.innerHTML = "";
    if (libros.length === 0) {
      contenedor.innerHTML = "<p>No se encontraron libros.</p>";
      return;
    }
    libros.forEach(libro => {
      const card = document.createElement("div");
      card.className = "card-libro";
      card.innerHTML = `
        <img src="${libro.portada || 'https://via.placeholder.com/120x180?text=Sin+Portada'}" alt="${libro.titulo}">
        <p>${libro.titulo}</p>
      `;
      contenedor.appendChild(card);
    });
  }

  // === Mostrar detalle ===
  function mostrarDetalle(libro) {
    document.getElementById("detalleTitulo").textContent = libro.titulo || "Sin título";
    document.getElementById("detalleEditorial").textContent = libro.editorial || "Desconocida";
    document.getElementById("detalleAutor").textContent = libro.autor || "Desconocido";
    document.getElementById("detalleCategoria").textContent = libro.categoria_nombre || "Sin categoría";
    document.getElementById("detalleAnio").textContent = libro.anio_edicion || "N/A";
    document.getElementById("detalleEjemplares").textContent = libro.ejemplares || "0";
    document.getElementById("detalleDescripcion").textContent = libro.descripcion || "Sin descripción";
    document.getElementById("popupDetalle").style.display = "flex";
  }

  document.querySelector(".close-detalle")?.addEventListener("click", () => {
    document.getElementById("popupDetalle").style.display = "none";
  });

  document.getElementById("contenedor-libros")?.addEventListener("click", (e) => {
    const card = e.target.closest(".card-libro");
    if (!card) return;
    const titulo = card.querySelector("p").textContent;
    const libro = librosData.find(l => l.titulo === titulo);
    if (libro) mostrarDetalle(libro);
  });

  document.querySelector(".btn.buscar")?.addEventListener("click", () => {
    const texto = document.getElementById("inputBuscar").value.toLowerCase();
    const filtrados = librosData.filter(l => l.titulo?.toLowerCase().includes(texto));
    renderLibros(filtrados);
  });

  selectFiltro?.addEventListener("change", () => {
    const categoria = selectFiltro.value;
    if (!categoria) return renderLibros(librosData);
    const filtrados = librosData.filter(l => l.categoria_nombre?.toLowerCase() === categoria.toLowerCase());
    renderLibros(filtrados);
  });

  cargarCategorias();
  cargarLibros();
});