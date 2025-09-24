// InicioAdmin.js depurado
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

            // Validar formato de correo UV
            if (!email.endsWith('@uv.mx') && !email.endsWith('@estudiantes.uv.mx')) {
                mostrarError("Debe usar un correo institucional de la UV (@uv.mx o @estudiantes.uv.mx)");
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

                if (!response.ok) {
                    mostrarError(`Error HTTP: ${response.status}`);
                    console.error("Error HTTP:", response);
                    return;
                }

                const data = await response.json();
                console.log("Respuesta del servidor:", data);

                if (data.success) {
                    sessionStorage.setItem('usuario', JSON.stringify(data.usuario));
                    sessionStorage.setItem('isLoggedIn', 'true');
                    alert("Login exitoso → redirigiendo a InicioAdmin.html");
                    window.location.href = "/html/htmlAdmin/InicioAdmin.html";
                } else {
                    mostrarError(data.message || "Usuario o contraseña incorrectos");
                }
            } catch (error) {
                console.error('Error de conexión:', error);
                mostrarError("Error de conexión con el servidor");
            }
        });
    }

    // Botón CREAR CUENTA → redirigir a registro
    if (createAccountBtn) {
        createAccountBtn.addEventListener("click", () => {
            console.log("Redirigiendo a RegistroAdmin.html");
            window.location.href = "/html/htmlAdmin/RegistroAdmin.html"; 
        });
    }

    // Botón RECUPERAR CONTRASEÑA → redirigir a recuperar-contraseña.html
    if (forgotPasswordBtn) {
        forgotPasswordBtn.addEventListener("click", () => {
            console.log("Redirigiendo a recuperar-contraseña.html");
            window.location.href = "/html/recuperar-contraseña.html"; 
        });
    }

    function mostrarError(mensaje) {
        console.warn("Mensaje de error:", mensaje);

        const errorAnterior = document.querySelector('.error-message');
        if (errorAnterior) errorAnterior.remove();

        if (!loginForm) return;

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = mensaje;
        errorDiv.style.display = 'block';
        errorDiv.style.color = '#ffeb3b';
        errorDiv.style.marginTop = '10px';
        errorDiv.style.textAlign = 'center';

        loginForm.appendChild(errorDiv);

        setTimeout(() => {
            if (errorDiv.parentNode) errorDiv.remove();
        }, 5000);
    }

    // Validación en tiempo real del correo
    if (emailInput) {
        emailInput.addEventListener('blur', () => {
            const email = emailInput.value.trim();
            if (email && !email.endsWith('@uv.mx') && !email.endsWith('@estudiantes.uv.mx')) {
                emailInput.style.borderColor = 'red';
            } else {
                emailInput.style.borderColor = '';
            }
        });
    }
});
