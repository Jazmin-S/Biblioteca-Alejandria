document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ Script de InicioAdmin cargado");

  // === Botón EXIT ===
  document.querySelector(".exit-btn")?.addEventListener("click", () => {
    window.location.href = "/html/htmlAdmin/AdminLogin.html";
  });

  // === Navegación directa desde icono de editar ===
  document.querySelector('.icons img[alt="editar"]')?.addEventListener("click", () => {
    window.location.href = "/html/htmlLibros/EditarLibros.html";
  });

  // === Menú lateral ===
  document.getElementById("btn-agregar")?.addEventListener("click", () => {
    window.location.href = "/html/htmlLibros/AgregarLibro.html";
  });

  document.getElementById("btn-usuarios")?.addEventListener("click", () => {
    window.location.href = "/html/htmlAdmin/editar-usuarios.html";
  });

  document.getElementById("btn-prestamos")?.addEventListener("click", () => {
    window.location.href = "/html/htmlAdmin/Prestamos.html";
  });

  // === Popup Menú ===
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

      // Mostrar tarjetas
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

      // Opciones en filtro de libros
      selectFiltro.innerHTML = `<option value="">-- Todos los libros --</option>`;
      categorias.forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat.nombre;
        opt.textContent = cat.nombre;
        selectFiltro.appendChild(opt);
      });

      // Lista de categorías (con editar y eliminar)
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

  // === Modal Editar Categoría ===
  const popupEditar = document.getElementById("popupEditarCategoria");
  const cerrarEditar = document.getElementById("cerrarEditarCategoria");
  const formEditar = document.getElementById("formEditarCategoria");
  const editId = document.getElementById("editIdCategoria");
  const editNombre = document.getElementById("editNombreCategoria");
  const editPortada = document.getElementById("editPortadaCategoria");
  const previewEdit = document.getElementById("previewEditPortada");

  cerrarEditar?.addEventListener("click", () => popupEditar.style.display = "none");

  // Abrir modal editar categoría
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

  // Preview de nueva portada al editar
  editPortada?.addEventListener("change", () => {
    const file = editPortada.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => previewEdit.src = e.target.result;
      reader.readAsDataURL(file);
    }
  });

  // Guardar edición
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

  // Buscar libros
  document.querySelector(".btn.buscar")?.addEventListener("click", () => {
    const texto = document.getElementById("inputBuscar").value.toLowerCase();
    const filtrados = librosData.filter(l => l.titulo?.toLowerCase().includes(texto));
    renderLibros(filtrados);
  });

  // Filtrar libros por categoría
  selectFiltro?.addEventListener("change", () => {
    const categoria = selectFiltro.value;
    if (!categoria) return renderLibros(librosData);
    const filtrados = librosData.filter(l => l.categoria_nombre?.toLowerCase() === categoria.toLowerCase());
    renderLibros(filtrados);
  });

  // === Inicial ===
  cargarCategorias();
  cargarLibros();
});
