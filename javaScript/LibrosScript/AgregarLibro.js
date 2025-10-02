// ===== AgregarLibro.js =====
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-libro");
  const categoriaSelect = document.getElementById("categoria");
  const portada = document.getElementById("portada");

  // --- Cargar categorías ---
  fetch("http://localhost:3000/api/categorias")
    .then(res => res.json())
    .then(data => {
      data.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat.id_categoria;
        option.textContent = cat.nombre;
        categoriaSelect.appendChild(option);
      });
    })
    .catch(err => {
      console.error("❌ Error cargando categorías:", err);
      alert("Error al cargar categorías");
    });

  // --- Vista previa portada ---
  const previewWrap = document.createElement("div");
  const img = new Image();
  img.alt = "Vista previa de la portada";
  const status = document.createElement("div");
  status.textContent = "Sin archivo seleccionado";
  previewWrap.appendChild(img);
  previewWrap.appendChild(status);
  portada.insertAdjacentElement("afterend", previewWrap);

  portada.addEventListener("change", () => {
    const file = portada.files && portada.files[0];
    if (!file) {
      img.src = "";
      status.textContent = "Sin archivo seleccionado";
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      status.textContent = "La imagen supera 3 MB.";
      portada.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = e => { img.src = e.target.result; status.textContent = file.name; };
    reader.readAsDataURL(file);
  });

  // --- Enviar formulario ---
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    if (portada.files.length > 0) {
      formData.append("portada", portada.files[0]);
    }

    try {
      const res = await fetch("http://localhost:3000/api/libros", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        alert("📚 Libro agregado correctamente");
        form.reset();
        img.src = "";
        status.textContent = "Sin archivo seleccionado";
      } else {
        alert("⚠️ Error: " + (data.error || "No se pudo guardar el libro"));
      }
    } catch (err) {
      console.error("❌ Error en fetch:", err);
      alert("Error de conexión con el servidor.");
    }
  });
});
