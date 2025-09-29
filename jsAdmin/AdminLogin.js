// AdminLogin.js
document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ Script de AdminLogin cargado");

    const loginForm = document.getElementById("login-form");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const exitBtn = document.querySelector(".exit-btn");
    const createAccountBtn = document.getElementById("create-account-btn");
    const forgotPasswordBtn = document.getElementById("forgot-password-btn");

    // Botón EXIT → volver a la página principal
    if (exitBtn) {
        exitBtn.addEventListener("click", () => {
            window.location.href = "/html/Biblioteca.html";
        });
    }

    // Botón LOGIN → validar con la base de datos
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            if (!email || !password) {
                mostrarError("Por favor, complete todos los campos.");
                return;
            }

            const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!regexCorreo.test(email)) {
                mostrarError("Debe ingresar un correo válido (ejemplo: usuario@gmail.com)");
                return;
            }

            try {
                const response = await fetch('http://localhost:3000/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                let data;
                try {
                    data = await response.json();
                } catch {
                    mostrarError("❌ Error inesperado en el servidor.");
                    return;
                }

                if (!response.ok) {
                    mostrarError(data.message || `❌ Error HTTP: ${response.status}`);
                    return;
                }

                if (data.success) {
                    sessionStorage.setItem('usuario', JSON.stringify(data.usuario));
                    sessionStorage.setItem('isLoggedIn', 'true');

                    mostrarExito("✅ Login exitoso, redirigiendo...");

                    setTimeout(() => {
                        window.location.href = "/html/htmlAdmin/InicioAdmin.html";
                    }, 2000);
                } else {
                    mostrarError(data.message || "❌ Usuario o contraseña incorrectos");
                }
            } catch (error) {
                console.error('Error de conexión:', error);
                mostrarError("❌ Error de conexión con el servidor.");
            }
        });
    }

    // Botón CREAR CUENTA
    if (createAccountBtn) {
        createAccountBtn.addEventListener("click", () => {
            window.location.href = "/html/htmlAdmin/RegistroAdmin.html";
        });
    }

    // Botón RECUPERAR CONTRASEÑA
    if (forgotPasswordBtn) {
        forgotPasswordBtn.addEventListener("click", () => {
            window.location.href = "/html/recuperar-contraseña.html";
        });
    }

    // Funciones auxiliares
    function mostrarError(mensaje) {
        const errorAnterior = document.querySelector('.error-message');
        if (errorAnterior) errorAnterior.remove();

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = mensaje;
        loginForm.appendChild(errorDiv);
    }

    function mostrarExito(mensaje) {
        const anterior = document.querySelector('.success-message');
        if (anterior) anterior.remove();

        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = mensaje;
        loginForm.appendChild(successDiv);
    }
});
