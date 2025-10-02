document.addEventListener("DOMContentLoaded", () => {
  console.log("📖 editar-libros.js cargado");

  const tbody = document.getElementById("tbody-libros");
  const popupForm = document.getElementById("popup-formulario");
  const popupEliminar = document.getElementById("popup-eliminar");
  const form = document.getElementById("form-libro");
  const previewPortada = document.getElementById("preview-portada");
  const inputPortada = document.getElementById("portada");
  const inputBusqueda = document.getElementById("input-busqueda");
  const selectCategoria = document.getElementById("categoria");

  let libroSeleccionado = null;
  let libros = []; 
  let categorias = [];

  // Cargar categorías
  async function cargarCategorias() {
    try {
      const res = await fetch("http://localhost:3000/api/categorias");
      categorias = await res.json();
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

  // Cargar libros
  async function cargarLibros() {
    try {
      const res = await fetch("http://localhost:3000/api/libros");
      libros = await res.json();
      renderLibros(libros);
    } catch (err) {
      console.error("❌ Error cargando libros:", err);
    }
  }

  // Renderizar libros en tabla
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
        <td>
          <button class="btn-control editar" data-id="${id}">✏️</button>
          <button class="btn-eliminar" data-id="${id}">🗑️</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // 🔎 Filtrar libros
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

  // Delegación eventos (editar/eliminar)
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
      selectCategoria.value = libro.id_categoria ?? "";
      previewPortada.src = libro.portada ? libro.portada : "";

      popupForm.style.display = "flex";
    } catch (err) {
      console.error("❌ Error al obtener libro:", err);
    }
  }

  // Vista previa portada
  inputPortada.addEventListener("change", () => {
    const file = inputPortada.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        previewPortada.src = e.target.result; 
      };
      reader.readAsDataURL(file);
    }
  });

  // Guardar cambios
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

      alert("✅ Libro actualizado");
      popupForm.style.display = "none";
      cargarLibros();
    } catch (err) {
      console.error("❌ Error guardando libro:", err);
      alert("Error al actualizar el libro.");
    }
  });

  // Eliminar
  document.getElementById("btn-confirmar-eliminar").addEventListener("click", async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/libros/${libroSeleccionado}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error(await res.text());

      alert("✅ Libro eliminado");
      popupEliminar.style.display = "none";
      cargarLibros();
    } catch (err) {
      console.error("❌ Error eliminando libro:", err);
    }
  });

  // Cancelar popups
  document.getElementById("btn-cancelar-eliminar").addEventListener("click", () => {
    popupEliminar.style.display = "none";
  });
  document.getElementById("btn-cancelar-form").addEventListener("click", () => {
    popupForm.style.display = "none";
  });

  // Inicial
  cargarCategorias().then(() => cargarLibros());
});
