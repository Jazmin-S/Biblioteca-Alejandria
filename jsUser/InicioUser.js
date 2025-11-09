// ✅ Archivo: /public/jsUser/InicioUser.js
document.addEventListener("DOMContentLoaded", () => {
  const exitBtn = document.getElementById("exitBtn");
  const contenedorCategorias = document.getElementById("contenedor-categorias");
  const contenedorLibros = document.getElementById("contenedor-libros");
  const selectFiltro = document.getElementById("selectFiltro");
  const inputBuscar = document.getElementById("inputBuscar");
  const btnBuscar = document.querySelector(".btn.buscar");
  const userIcon = document.querySelector(".icon");
  const userNameHeader = document.getElementById("userNameHeader");

  console.log("✅ Script InicioUser cargado");

  // =========================
  // 🔐 Utilidades de sesión
  // =========================
  function getUserIdFromStorage() {
    const directId = localStorage.getItem("userId");
    if (directId) return directId;

    const usuarioStr = localStorage.getItem("usuario");
    if (usuarioStr) {
      try {
        const usuario = JSON.parse(usuarioStr);
        if (usuario?.id_usuario) return usuario.id_usuario;
      } catch (e) {
        console.warn("No se pudo parsear localStorage.usuario");
      }
    }
    return null;
  }

  // =========================
  // 🧑‍💻 Mostrar nombre en header
  // =========================
  (function mostrarNombreUsuario() {
    try {
      const usuarioStr = localStorage.getItem("usuario");
      if (usuarioStr) {
        const usuario = JSON.parse(usuarioStr);
        if (usuario?.nombre) {
          userNameHeader.textContent = usuario.nombre;
          return;
        }
      }
      const userId = getUserIdFromStorage();
      if (userId) {
        fetch(`http://localhost:3000/api/informacion/${userId}`)
          .then(r => r.json())
          .then(data => {
            if (data?.nombre) userNameHeader.textContent = data.nombre;
          })
          .catch(() => console.warn("⚠️ No se pudo obtener nombre de usuario"));
      }
    } catch (err) {
      console.warn("⚠️ Error al mostrar nombre del usuario:", err);
    }
  })();

  // Que el nombre también lleve al perfil
  function irAlPerfil() {
    const userId = getUserIdFromStorage();
    if (!userId) {
      alert("No se encontró la sesión del usuario. Inicia sesión nuevamente.");
      window.location.href = "/html/htmlUser/UserLogin.html";
      return;
    }
    window.location.href = `/html/htmlUser/UserInfo.html?id=${encodeURIComponent(userId)}`;
  }
  userIcon?.addEventListener("click", irAlPerfil);
  userNameHeader?.addEventListener("click", irAlPerfil);

  // =========================
  // 🚪 Salir
  // =========================
  exitBtn?.addEventListener("click", () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("userId");
    window.location.href = "/html/htmlUser/UserLogin.html";
  });

  // =========================
  // 📚 Cargar categorías
  // =========================
  let librosData = [];

  async function cargarCategorias() {
    try {
      const res = await fetch("http://localhost:3000/api/categorias");
      if (!res.ok) throw new Error("No existe /api/categorias");
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

      // Filtro
      selectFiltro.innerHTML = `<option value="">-- Todas las categorías --</option>`;
      categorias.forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat.nombre;
        opt.textContent = cat.nombre;
        selectFiltro.appendChild(opt);
      });
    } catch (err) {
      console.warn("⚠️ No se pudo cargar /api/categorias, usaré categorías derivadas de los libros.");
    }
  }

  // =========================
  // 📖 Cargar libros
  // =========================
  async function cargarLibros() {
    try {
      const res = await fetch("http://localhost:3000/api/libros");
      if (!res.ok) throw new Error("No se pudo obtener /api/libros");
      librosData = await res.json();
      renderLibros(librosData);

      if (!selectFiltro.options.length || selectFiltro.options.length === 1) {
        renderCategoriasDesdeLibros(librosData);
      }
    } catch (err) {
      console.error("❌ Error cargando libros:", err);
      contenedorLibros.innerHTML = "<p>Error al cargar libros.</p>";
    }
  }

  function renderLibros(libros) {
    contenedorLibros.innerHTML = "";
    if (!libros.length) {
      contenedorLibros.innerHTML = "<p>No hay libros disponibles.</p>";
      return;
    }

    libros.forEach(libro => {
      const card = document.createElement("div");
      card.className = "card-libro";
      card.innerHTML = `
        <img src="${libro.portada || 'https://via.placeholder.com/120x180?text=Sin+Portada'}" alt="${libro.titulo}">
        <h3>${libro.titulo || "Sin título"}</h3>
        <small>${libro.categoria_nombre || "Sin categoría"}</small>
      `;
      card.addEventListener("click", () => mostrarDetalle(libro));
      contenedorLibros.appendChild(card);
    });
  }

  function renderCategoriasDesdeLibros(libros) {
    const categorias = [...new Set(libros.map(l => l.categoria_nombre).filter(Boolean))];
    selectFiltro.innerHTML = `<option value="">-- Todas las categorías --</option>`;
    categorias.forEach(cat => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      selectFiltro.appendChild(opt);
    });
  }

  // =========================
  // 🔎 Buscar / Filtrar
  // =========================
  function aplicarFiltro() {
    const texto = (inputBuscar.value || "").toLowerCase().trim();
    const categoria = (selectFiltro.value || "").toLowerCase().trim();

    let filtrados = librosData;

    if (texto) {
      filtrados = filtrados.filter(l => (l.titulo || "").toLowerCase().includes(texto));
    }
    if (categoria) {
      filtrados = filtrados.filter(l => (l.categoria_nombre || "").toLowerCase() === categoria);
    }

    renderLibros(filtrados);
  }

  btnBuscar?.addEventListener("click", aplicarFiltro);
  inputBuscar?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") aplicarFiltro();
  });
  selectFiltro?.addEventListener("change", aplicarFiltro);

  // =========================
  // 📘 Popup detalle libro
  // =========================
  function mostrarDetalle(libro) {
    document.getElementById("detalleTitulo").textContent = libro.titulo || "Sin título";
    document.getElementById("detalleEditorial").textContent = libro.editorial || "Desconocida";
    document.getElementById("detalleAutor").textContent = libro.autor || "Desconocido";
    document.getElementById("detalleCategoria").textContent = libro.categoria_nombre || "Sin categoría";
    document.getElementById("detalleAnio").textContent = libro.anio_edicion || "N/A";
    document.getElementById("detalleEjemplares").textContent = libro.ejemplares ?? "0";
    document.getElementById("detalleDescripcion").textContent = libro.descripcion || "Sin descripción";
    document.getElementById("popupDetalle").style.display = "flex";
  }

  document.querySelector(".close-detalle")?.addEventListener("click", () => {
    document.getElementById("popupDetalle").style.display = "none";
  });

  // =========================
  // 🚀 Carga inicial
  // =========================
  cargarCategorias();
  cargarLibros();
});
