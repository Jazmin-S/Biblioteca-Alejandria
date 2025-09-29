// InicioAdmin.js
document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ Script de InicioAdmin cargado");

    const exitBtn = document.querySelector(".exit-btn");

    // Botón EXIT → regresar al login de administrador
    if (exitBtn) {
        exitBtn.addEventListener("click", () => {
            window.location.href = "/html/htmlAdmin/AdminLogin.html";
        });
    }


    // Botones del menú lateral
    const btnAgregar = document.getElementById("btn-agregar");
    if (btnAgregar) {
        btnAgregar.addEventListener("click", () => {
            window.location.href = "/html/htmlLibros/AgregarLibro.html";
        });
    }

    const btnUsuarios = document.getElementById("btn-usuarios");
    if (btnUsuarios) {
        btnUsuarios.addEventListener("click", () => {
            window.location.href = "/html/htmlAdmin/editar-usuarios.html";
        });
    }

    const btnPrestamos = document.getElementById("btn-prestamos");
    if (btnPrestamos) {
        btnPrestamos.addEventListener("click", () => {
            window.location.href = "/html/htmlAdmin/Prestamos.html";
        });
    }

    // Menú emergente
    const menuBtn = document.querySelector(".menu-btn");
    const popupMenu = document.getElementById("popupMenu");
    const closePopup = document.querySelector(".close-popup");

    if (menuBtn && popupMenu) {
        menuBtn.addEventListener("click", () => {
            popupMenu.style.display = "flex";
        });
    }

    if (closePopup && popupMenu) {
        closePopup.addEventListener("click", () => {
            popupMenu.style.display = "none";
        });
    }

    if (popupMenu) {
        window.addEventListener("click", (event) => {
            if (event.target === popupMenu) {
                popupMenu.style.display = "none";
            }
        });
    }
    // === Mostrar libros ya agregados ===
async function cargarLibros() {
    try {
        const res = await fetch("http://localhost:3000/api/libros");
        const data = await res.json();

        if (!res.ok) {
            console.error("⚠️ Error al obtener libros:", data);
            return;
        }

        const contenedor = document.getElementById("contenedor-libros");
        contenedor.innerHTML = "";

        if (data.length === 0) {
            contenedor.innerHTML = "<p>No hay libros agregados aún.</p>";
            return;
        }

        data.forEach(libro => {
            const card = document.createElement("div");
            card.className = "card-libro";

            // Imagen de portada
            const img = document.createElement("img");
            img.src = libro.portada ? libro.portada : "https://via.placeholder.com/120x180?text=Sin+Portada";
            img.alt = libro.titulo;

            // Título
            const titulo = document.createElement("p");
            titulo.textContent = libro.titulo;

            card.appendChild(img);
            card.appendChild(titulo);

            contenedor.appendChild(card);
        });
    } catch (err) {
        console.error("❌ Error cargando libros:", err);
    }
}

// Ejecutar cuando cargue la página
cargarLibros();

    
});

