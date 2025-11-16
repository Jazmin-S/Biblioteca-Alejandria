// ✅ Archivo: /public/jsUser/InicioUser.js
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ Script InicioUser cargado");

  // =========================
  // 🔗 Referencias al DOM
  // =========================
  const exitBtn = document.getElementById("exitBtn");
  const contenedorCategorias = document.getElementById("contenedor-categorias");
  const contenedorLibros = document.getElementById("contenedor-libros");
  const selectFiltro = document.getElementById("selectFiltro");
  const inputBuscar = document.getElementById("inputBuscar");
  const btnBuscar = document.querySelector(".btn.buscar");
  const userIcon = document.querySelector(".icon");
  const userNameHeader = document.getElementById("userNameHeader");

  // =========================
  // 🔐 Manejo correcto de sesión
  // =========================
  function getUserIdFromStorage() {
    // ✔ ID directo guardado en login
    const id = localStorage.getItem("usuarioId");
    if (id) return id;

    // ✔ Objeto usuario guardado en login
    const usuarioStr = localStorage.getItem("usuario");
    if (usuarioStr) {
      try {
        const usuario = JSON.parse(usuarioStr);
        if (usuario?.id_usuario) return usuario.id_usuario;
      } catch (e) {
        console.warn("⚠️ No se pudo parsear localStorage.usuario");
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
          .then((r) => r.json())
          .then((data) => {
            if (data?.nombre) {
              userNameHeader.textContent = data.nombre;
            }
          })
          .catch(() => console.warn("⚠️ No se pudo obtener nombre del usuario"));
      }
    } catch (err) {
      console.warn("⚠️ Error al mostrar nombre:", err);
    }
  })();

  // =========================
  // 👤 Ir al perfil
  // =========================
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
  // 🚪 Cerrar sesión (corregido)
  // =========================
  exitBtn?.addEventListener("click", () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("usuarioId");  // ✔ antes borrabas userId → incorrecto
    window.location.href = "/html/htmlUser/UserLogin.html";
  });

  // =========================
  // 📚 Variables globales
  // =========================
  let librosData = [];

  // =========================
  // 📂 Cargar categorías
  // =========================
  async function cargarCategorias() {
    try {
      const res = await fetch("http://localhost:3000/api/categorias");
      if (!res.ok) throw new Error("No existe endpoint /api/categorias");
      const categorias = await res.json();

      contenedorCategorias.innerHTML = "";
      categorias.forEach((cat) => {
        const card = document.createElement("div");
        card.className = "card";
        card.dataset.idCategoria = String(cat.id_categoria);
        card.dataset.nombreCategoria = cat.nombre;

        card.innerHTML = `
          <img src="${cat.portada || "https://via.placeholder.com/120x180"}" alt="${cat.nombre}">
          <p>${cat.nombre}</p>
        `;

        card.addEventListener("click", () => {
          filtrarPorCategoriaId(cat.id_categoria);
          document.querySelector(".mas-leidos")?.scrollIntoView({ behavior: "smooth" });
        });

        contenedorCategorias.appendChild(card);
      });

      // Opciones del select
      selectFiltro.innerHTML = '<option value="">-- Todas las categorías --</option>';
      categorias.forEach((cat) => {
        const opt = document.createElement("option");
        opt.value = cat.id_categoria;
        opt.textContent = cat.nombre;
        selectFiltro.appendChild(opt);
      });
    } catch (err) {
      console.error("❌ Error cargando categorías:", err);
    }
  }

  // =========================
  // 📖 Cargar libros
  // =========================
  async function cargarLibros() {
    try {
      const res = await fetch("http://localhost:3000/api/libros");
      if (!res.ok) throw new Error("Error en /api/libros");
      librosData = await res.json();
      renderLibros(librosData);
    } catch (err) {
      console.error("❌ Error cargando libros:", err);
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

  // =========================
  // 🔍 Filtros
  // =========================
  function aplicarFiltro() {
    let filtrados = [...librosData];

    const texto = inputBuscar.value.toLowerCase().trim();
    const idCategoria = selectFiltro.value;

    if (idCategoria) {
      filtrados = filtrados.filter((l) => String(l.id_categoria) === idCategoria);
    }

    if (texto) {
      filtrados = filtrados.filter((l) =>
        l.titulo.toLowerCase().includes(texto)
      );
    }

    renderLibros(filtrados);
  }

  btnBuscar.addEventListener("click", aplicarFiltro);
  inputBuscar.addEventListener("keydown", (e) => e.key === "Enter" && aplicarFiltro());
  selectFiltro.addEventListener("change", aplicarFiltro);

  // =========================
  // 📘 Popup detalle libro
  // =========================
  function mostrarDetalle(libro) {
    const popup = document.getElementById("popupDetalle");
    popup.style.display = "flex";

    document.getElementById("detalleTitulo").textContent = libro.titulo;
    document.getElementById("detalleEditorial").textContent = libro.editorial;
    document.getElementById("detalleAutor").textContent = libro.autor;
    document.getElementById("detalleCategoria").textContent = libro.categoria_nombre;
    document.getElementById("detalleAnio").textContent = libro.anio_edicion;
    document.getElementById("detalleEjemplares").textContent = libro.ejemplares;
    document.getElementById("detalleDescripcion").textContent = libro.descripcion;
  }

  document.querySelector(".close-detalle").addEventListener("click", () => {
    document.getElementById("popupDetalle").style.display = "none";
  });

  // =========================
  // 🚀 Carga inicial
  // =========================
  cargarCategorias();
  cargarLibros();
});
