document.getElementById("formUsuario").addEventListener("submit", async function(e) {
    e.preventDefault();

    const data = {
        nombre: document.getElementById("usuario").value,
        correo: document.getElementById("correo").value,
        domicilio: document.getElementById("domicilio").value,
        contrasena: document.getElementById("contrasena").value,
        rol: document.getElementById("rol").value
    };

    try {
        const response = await fetch("http://localhost:3000/api/usuarios", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (result.success) {
            alert("Usuario guardado correctamente");
        } else {
            alert("Error: " + result.message);
        }
    } catch (err) {
        console.error("Error:", err);
        alert("⚠️ Error en la conexión con el servidor");
    }
});
