// =============================
//  INICIOUSER.JS COMPLETO
// =============================
document.addEventListener("DOMContentLoaded", async () => {
  console.log("✅ InicioUser.js cargado");

  // =============================
  // REFERENCIAS DEL DOM
  // =============================
  const exitBtn = document.getElementById("exitBtn");
  const contenedorCategorias = document.getElementById("contenedor-categorias");
  const contenedorLibros = document.getElementById("contenedor-libros");
  const selectFiltro = document.getElementById("selectFiltro");
  const inputBuscar = document.getElementById("inputBuscar");
  const btnBuscar = document.querySelector(".btn.buscar");
  const userIcon = document.querySelector(".icon");
  const userNameHeader = document.getElementById("userNameHeader");

  // =============================
  // OBTENER ID DEL USUARIO
  // =============================
  let userId =
    localStorage.getItem("usuarioId") ||
    JSON.parse(localStorage.getItem("usuario") || "{}").id_usuario;

  if (!userId) {
    alert("⚠ No se encontró la sesión del usuario");
    window.location.href = "/html/htmlUser/UserLogin.html";
    return;
  }

  // =============================
  // DETECTAR SERVIDOR DISPONIBLE
  // =============================
  async function detectarServidor() {
    const servidores = [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3001",
    ];

    for (let s of servidores) {
      try {
        const res = await fetch(`${s}/api/status`);
        if (res.ok) return s;
      } catch {}
    }
    return null;
  }

  const baseURL = await detectarServidor();

  if (!baseURL) {
    alert("❌ No se pudo conectar al backend.");
    return;
  }

  // =============================
  // CARGAR NOMBRE DEL USUARIO
  // =============================
  async function cargarNombreUsuario() {
    try {
      const res = await fetch(`${baseURL}/api/info/completa/${userId}`);

      if (!res.ok) {
        console.error("❌ Error al obtener datos del usuario");
        userNameHeader.textContent = "Usuario";
        return;
      }

      const data = await res.json();

      if (data.usuario?.nombre) {
        userNameHeader.textContent = data.usuario.nombre;
      } else {
        userNameHeader.textContent = "Usuario";
      }
    } catch (err) {
      console.error("Error al cargar usuario:", err);
      userNameHeader.textContent = "Usuario";
    }
  }

  await cargarNombreUsuario();

  // =============================
  // IR AL PERFIL
  // =============================
  function irAlPerfil() {
    window.location.href = `/html/htmlUser/UserInfo.html?id=${userId}`;
  }

  userIcon?.addEventListener("click", irAlPerfil);
  userNameHeader?.addEventListener("click", irAlPerfil);

  // =============================
  // CERRAR SESIÓN
  // =============================
  exitBtn?.addEventListener("click", () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("usuarioId");
    window.location.href = "/html/htmlUser/UserLogin.html";
  });

  // =============================
  // VARIABLES GLOBALES
  // =============================
  let librosData = [];

  // =============================
  // CARGAR CATEGORÍAS
  // =============================
  async function cargarCategorias() {
    try {
      const res = await fetch(`${baseURL}/api/categorias`);
      if (!res.ok) throw new Error("No existe endpoint /api/categorias");

      const categorias = await res.json();
      contenedorCategorias.innerHTML = "";

      categorias.forEach((cat) => {
        const card = document.createElement("div");
        card.className = "card";
        card.dataset.idCategoria = String(cat.id_categoria);

        card.innerHTML = `
          <img src="${cat.portada || "https://via.placeholder.com/120x180"}" alt="${cat.nombre}">
          <p>${cat.nombre}</p>
        `;

        card.addEventListener("click", () => {
          filtrarPorCategoriaId(cat.id_categoria);
          document
            .querySelector(".mas-leidos")
            ?.scrollIntoView({ behavior: "smooth" });
        });

        contenedorCategorias.appendChild(card);
      });

      // Agregar categorías al select
      selectFiltro.innerHTML = '<option value="">-- Todas las categorías --</option>';
      categorias.forEach((cat) => {
        const opt = document.createElement("option");
        opt.value = cat.id_categoria;
        opt.textContent = cat.nombre;
        selectFiltro.appendChild(opt);
      });
    } catch (err) {
      console.error("❌ Error al cargar categorías:", err);
    }
  }

  // =============================
  // CARGAR LIBROS
  // =============================
  async function cargarLibros() {
    try {
      const res = await fetch(`${baseURL}/api/libros`);
      if (!res.ok) throw new Error("Error en /api/libros");

      librosData = await res.json();
      renderLibros(librosData);
    } catch (err) {
      console.error("❌ Error al cargar libros:", err);
      contenedorLibros.innerHTML = "<p>Error al cargar libros.</p>";
    }
  }

  function renderLibros(libros) {
    contenedorLibros.innerHTML = "";

    if (!libros.length) {
      contenedorLibros.innerHTML = "<p>No se encontraron libros.</p>";
      return;
    }

    libros.forEach((libro) => {
      const card = document.createElement("div");
      card.className = "card-libro";

      card.innerHTML = `
        <img src="${libro.portada || "https://via.placeholder.com/120x180"}">
        <p>${libro.titulo}</p>
      `;

      card.addEventListener("click", () => mostrarDetalle(libro));

      contenedorLibros.appendChild(card);
    });
  }

  // =============================
  // FILTROS
  // =============================
  function aplicarFiltro() {
    let filtrados = [...librosData];

    const texto = inputBuscar.value.toLowerCase().trim();
    const idCategoria = selectFiltro.value;

    if (idCategoria) {
      filtrados = filtrados.filter(
        (l) => String(l.id_categoria) === String(idCategoria)
      );
    }

    if (texto) {
      filtrados = filtrados.filter((l) =>
        l.titulo.toLowerCase().includes(texto)
      );
    }

    renderLibros(filtrados);
  }

  // 🔥 FUNCIÓN QUE FALTABA Y CAUSABA ERROR
  function filtrarPorCategoriaId(idCategoria) {
    selectFiltro.value = String(idCategoria);
    aplicarFiltro();
  }

  btnBuscar.addEventListener("click", aplicarFiltro);
  inputBuscar.addEventListener("keydown", (e) => {
    if (e.key === "Enter") aplicarFiltro();
  });
  selectFiltro.addEventListener("change", aplicarFiltro);

  // =============================
  // DETALLE DEL LIBRO
  // =============================
  function mostrarDetalle(libro) {
    const popup = document.getElementById("popupDetalle");
    popup.style.display = "flex";

    document.getElementById("detalleTitulo").textContent = libro.titulo;
    document.getElementById("detalleEditorial").textContent = libro.editorial;
    document.getElementById("detalleAutor").textContent = libro.autor;
    document.getElementById("detalleCategoria").textContent =
      libro.categoria_nombre;
    document.getElementById("detalleAnio").textContent = libro.anio_edicion;
    document.getElementById("detalleEjemplares").textContent =
      libro.ejemplares;
    document.getElementById("detalleDescripcion").textContent =
      libro.descripcion;
  }

  document.querySelector(".close-detalle")?.addEventListener("click", () => {
    document.getElementById("popupDetalle").style.display = "none";
  });

  // =============================
  // CARGA INICIAL
  // =============================
  cargarCategorias();
  cargarLibros();
});
