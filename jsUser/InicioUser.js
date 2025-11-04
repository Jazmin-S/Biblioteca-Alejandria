document.addEventListener("DOMContentLoaded", () => {


    const exitBtn = document.getElementById("exitBtn");

    exitBtn.addEventListener("click", () => {
      localStorage.removeItem("usuario");  //Limpia el campo
      window.location.href = "/html/htmlUser/UserLogin.html";    //Redirige al login de usuario
    });

  console.log("✅ Script de InicioUser cargado");
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