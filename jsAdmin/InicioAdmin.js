// AdminLogin.js

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.querySelector("form");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const exitBtn = document.querySelector(".exit-btn");
    const createAccountBtn = document.querySelector(".create-account button");

    // Botón EXIT → volver a la página principal
    if (exitBtn) {
        exitBtn.addEventListener("click", () => {
            window.location.href = "/html/Biblioteca.html";
        });
    }

    // Botón LOGIN → validar y redirigir
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault(); // evita recargar la página

            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            if (!email || !password) {
                alert("Por favor, complete todos los campos.");
                return;
            }

            // Aquí pondrías tu validación real contra BD o API
            if (email === "admin@uv.mx" && password === "12345678") {
                alert("Login exitoso");
                window.location.href = "/html/htmlAdmin/InicioAdmin.html"; // ruta al dashboard de admin
            } else {
                alert("Correo o contraseña incorrectos");
            }
        });
    }

    // Botón CREAR CUENTA → redirigir a registro
    if (createAccountBtn) {
        createAccountBtn.addEventListener("click", () => {
            window.location.href = "/html/htmlAdmin/RegistroAdmin.html"; 
        });
    }
});
