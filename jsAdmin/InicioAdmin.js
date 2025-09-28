// InicioAdmin.js corregido: mensajes claros de error y éxito
document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ Script cargado");

    const loginForm = document.getElementById("login-form");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const exitBtn = document.querySelector(".exit-btn");
    const createAccountBtn = document.getElementById("create-account-btn");
    const forgotPasswordBtn = document.getElementById("forgot-password-btn");

    if (!loginForm) console.warn("⚠️ Formulario de login no encontrado (id='login-form')");
    if (!emailInput) console.warn("⚠️ Input de email no encontrado (id='email')");
    if (!passwordInput) console.warn("⚠️ Input de password no encontrado (id='password')");

    // Botón EXIT → volver a la página principal
    if (exitBtn) {
        exitBtn.addEventListener("click", () => {
            console.log("EXIT presionado → redirigiendo a Biblioteca.html");
            window.location.href = "/html/Biblioteca.html";
        });
    }

    // Botón LOGIN → validar con la base de datos
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            console.log("🔹 Submit de login disparado");

            if (!emailInput || !passwordInput) {
                mostrarError("Elementos de formulario no encontrados.");
                return;
            }

            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();
            console.log("Email:", email, "Password:", password);

            if (!email || !password) {
                mostrarError("Por favor, complete todos los campos.");
                return;
            }

            // ✅ Validar formato de correo genérico
            const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!regexCorreo.test(email)) {
                mostrarError("Debe ingresar un correo válido (ejemplo: usuario@gmail.com)");
                return;
            }

            try {
                const response = await fetch('http://localhost:3000/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password })
                });

                let data;
                try {
                    data = await response.json();
                } catch {
                    mostrarError("❌ Error inesperado en el servidor.");
                    return;
                }

                // ✅ Mostrar mensaje del backend aunque venga 404 o 401
                if (!response.ok) {
                    mostrarError(data.message || `❌ Error HTTP: ${response.status}`);
                    return;
                }

                if (data.success) {
                    sessionStorage.setItem('usuario', JSON.stringify(data.usuario));
                    sessionStorage.setItem('isLoggedIn', 'true');

                    // Mensaje bonito de éxito
                    mostrarExito("✅ Login exitoso, redirigiendo a tu panel de administrador...");

                    // Desaparece con fade-out y luego redirige
                    setTimeout(() => {
                        const successDiv = document.querySelector('.success-message');
                        if (successDiv) {
                            successDiv.classList.add("fade-out");
                        }
                        setTimeout(() => {
                            window.location.href = "/html/htmlAdmin/InicioAdmin.html";
                        }, 1000);
                    }, 2000);
                } else {
                    if (data.message === "Usuario no encontrado") {
                        mostrarError("❌ El correo ingresado no está registrado en el sistema.");
                    } else if (data.message === "Contraseña incorrecta") {
                        mostrarError("❌ La contraseña es incorrecta.");
                    } else {
                        mostrarError(data.message || "❌ Usuario o contraseña incorrectos");
                    }
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
            console.log("Redirigiendo a RegistroAdmin.html");
            window.location.href = "/html/htmlAdmin/RegistroAdmin.html"; 
        });
    }

    // Botón RECUPERAR CONTRASEÑA
    if (forgotPasswordBtn) {
        forgotPasswordBtn.addEventListener("click", () => {
            console.log("Redirigiendo a recuperar-contraseña.html");
            window.location.href = "/html/recuperar-contraseña.html"; 
        });
    }

    // Función para mostrar errores
    function mostrarError(mensaje) {
        console.warn("Mensaje de error:", mensaje);

        const errorAnterior = document.querySelector('.error-message');
        if (errorAnterior) errorAnterior.remove();

        if (!loginForm) return;

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = mensaje;

        loginForm.appendChild(errorDiv);
    }

    // Función para mostrar éxito
    function mostrarExito(mensaje) {
        console.log("Mensaje de éxito:", mensaje);

        const anterior = document.querySelector('.success-message');
        if (anterior) anterior.remove();

        if (!loginForm) return;

        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = mensaje;

        loginForm.appendChild(successDiv);
    }

    // 🔥 Cuando el usuario interactúa de nuevo → borrar mensajes de error
    [emailInput, passwordInput].forEach(input => {
        if (input) {
            input.addEventListener("input", () => {
                const error = document.querySelector('.error-message');
                if (error) error.remove();
            });
        }
    });

    // Validación en tiempo real del correo
    if (emailInput) {
        emailInput.addEventListener('blur', () => {
            const email = emailInput.value.trim();
            const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (email && !regexCorreo.test(email)) {
                emailInput.style.borderColor = 'red';
            } else {
                emailInput.style.borderColor = '';
            }
        });
    }
});
