// ===== AgregarLibro.js =====
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-libro");
  const nombre = document.getElementById("nombre");
  const autor = document.getElementById("autor");
  const anio = document.getElementById("anio_edicion");
  const titulo = document.getElementById("titulo");
  const descripcion = document.getElementById("descripcion");
  const editorial = document.getElementById("editorial");
  const categoria = document.getElementById("categoria");
  const portada = document.getElementById("portada");

  // --- Vista previa (igual que antes) ---
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
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      status.textContent = "Formato no soportado.";
      portada.value = "";
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

  // --- Envío al backend con FormData ---
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("nombre", nombre.value);
    formData.append("titulo", titulo.value);
    formData.append("autor", autor.value);
    formData.append("anio_edicion", anio.value);
    formData.append("descripcion", descripcion.value);
    formData.append("editorial", editorial.value);
    formData.append("categoria", categoria.value);
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
