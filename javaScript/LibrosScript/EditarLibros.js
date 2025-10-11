document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.getElementById("tbody-libros");
  const popupForm = document.getElementById("popup-formulario");
  const popupEliminar = document.getElementById("popup-eliminar");
  const popupMensaje = document.getElementById("popup-mensaje");
  const mensajeTitulo = document.getElementById("mensaje-titulo");
  const mensajeTexto = document.getElementById("mensaje-texto");
  const btnCerrarMensaje = document.getElementById("btn-cerrar-mensaje");

  const form = document.getElementById("form-libro");
  const previewPortada = document.getElementById("preview-portada");
  const inputPortada = document.getElementById("portada");
  const inputBusqueda = document.getElementById("input-busqueda");
  const selectCategoria = document.getElementById("categoria");

  let libroSeleccionado = null;
  let libros = [];

  async function cargarCategorias() {
    try {
      const res = await fetch("http://localhost:3000/api/categorias");
      const categorias = await res.json();
      selectCategoria.innerHTML = `<option value="">-- Selecciona una categoría --</option>`;
      categorias.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c.id_categoria;
        opt.textContent = c.nombre;
        selectCategoria.appendChild(opt);
      });
    } catch (err) {
      console.error("❌ Error cargando categorías:", err);
    }
  }

  async function cargarLibros() {
    try {
      const res = await fetch("http://localhost:3000/api/libros");
      libros = await res.json();
      renderLibros(libros);
    } catch (err) {
      console.error("❌ Error cargando libros:", err);
    }
  }

  function renderLibros(lista) {
    tbody.innerHTML = "";
    lista.forEach(l => {
      const id = l.id_libro;
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${l.nombre ?? ""}</td>
        <td>${l.autor ?? ""}</td>
        <td>${l.anio_edicion ?? ""}</td>
        <td>${l.categoria_nombre ?? ""}</td>
        <td>${l.ejemplares ?? 0}</td>
        <td>
          <button class="btn-control editar" data-id="${id}">✏️</button>
          <button class="btn-eliminar" data-id="${id}">🗑️</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  inputBusqueda.addEventListener("input", () => {
    const texto = inputBusqueda.value.toLowerCase();
    const filtrados = libros.filter(l =>
      (l.nombre ?? "").toLowerCase().includes(texto) ||
      (l.autor ?? "").toLowerCase().includes(texto) ||
      (l.anio_edicion ?? "").toString().includes(texto) ||
      (l.categoria_nombre ?? "").toLowerCase().includes(texto)
    );
    renderLibros(filtrados);
  });

  tbody.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-id]");
    if (!btn) return;
    const id = btn.dataset.id;
    libroSeleccionado = id;

    if (btn.classList.contains("editar")) {
      abrirEditar(id);
    } else if (btn.classList.contains("btn-eliminar")) {
      popupEliminar.style.display = "flex";
    }
  });

  async function abrirEditar(id) {
    try {
      const res = await fetch(`http://localhost:3000/api/libros/${id}`);
      const libro = await res.json();

      document.getElementById("id_libro").value = libro.id_libro;
      document.getElementById("nombre").value = libro.nombre ?? "";
      document.getElementById("titulo").value = libro.titulo ?? "";
      document.getElementById("autor").value = libro.autor ?? "";
      document.getElementById("anio_edicion").value = libro.anio_edicion ?? "";
      document.getElementById("descripcion").value = libro.descripcion ?? "";
      document.getElementById("editorial").value = libro.editorial ?? "";
      document.getElementById("ejemplares").value = libro.ejemplares ?? 1;
      selectCategoria.value = libro.id_categoria ?? "";
      previewPortada.src = libro.portada ? libro.portada : "";

      popupForm.style.display = "flex";
    } catch (err) {
      console.error("❌ Error al obtener libro:", err);
    }
  }

  inputPortada.addEventListener("change", () => {
    const file = inputPortada.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => previewPortada.src = e.target.result;
      reader.readAsDataURL(file);
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!libroSeleccionado) return;

    try {
      const formData = new FormData(form);
      const res = await fetch(`http://localhost:3000/api/libros/${libroSeleccionado}`, {
        method: "PUT",
        body: formData
      });

      if (!res.ok) throw new Error(await res.text());

      mostrarMensaje("✅ Éxito", "Libro actualizado correctamente");
      popupForm.style.display = "none";
      cargarLibros();
    } catch (err) {
      mostrarMensaje("❌ Error", "Error al actualizar el libro.");
    }
  });

  // 🗑️ Eliminar libro con popup
  document.getElementById("btn-confirmar-eliminar").addEventListener("click", async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/libros/${libroSeleccionado}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        mostrarMensaje("⚠️ No se puede eliminar", data.error || "Error al eliminar el libro.");
      } else {
        mostrarMensaje("✅ Eliminado", data.mensaje);
        cargarLibros();
      }

      popupEliminar.style.display = "none";
    } catch (err) {
      mostrarMensaje("❌ Error", "Error inesperado al eliminar el libro.");
    }
  });

  document.getElementById("btn-cancelar-eliminar").addEventListener("click", () => popupEliminar.style.display = "none");
  document.getElementById("btn-cancelar-form").addEventListener("click", () => popupForm.style.display = "none");

  // 🎨 Mostrar mensajes bonitos
  function mostrarMensaje(titulo, texto) {
    mensajeTitulo.textContent = titulo;
    mensajeTexto.textContent = texto;

    popupMensaje.classList.remove("success", "error", "warning");

    if (titulo.includes("✅") || titulo.includes("Éxito") || titulo.includes("Eliminado")) {
      popupMensaje.classList.add("success");
    } else if (titulo.includes("⚠️") || titulo.includes("Advertencia") || titulo.includes("No se puede")) {
      popupMensaje.classList.add("warning");
      popupMensaje.setAttribute("data-icon", "⚠️");
    } else {
      popupMensaje.classList.add("error");
      popupMensaje.setAttribute("data-icon", "❌");
    }

    popupMensaje.style.display = "flex";
  }

  btnCerrarMensaje.addEventListener("click", () => popupMensaje.style.display = "none");

  cargarCategorias().then(cargarLibros);
});
