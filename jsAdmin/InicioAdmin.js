// InicioAdmin.js

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const exitBtn = document.querySelector(".exit-btn");
    const createAccountBtn = document.getElementById("create-account-btn");

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

                const data = await response.json();

                if (data.success) {
                    // Guardar información del usuario en sessionStorage
                    sessionStorage.setItem('usuario', JSON.stringify(data.usuario));
                    sessionStorage.setItem('isLoggedIn', 'true');
                    
                    alert("Login exitoso");
                    window.location.href = "/html/htmlAdmin/InicioAdmin.html";
                } else {
                    mostrarError(data.message);
                }
            } catch (error) {
                console.error('Error:', error);
                mostrarError("Error de conexión con el servidor");
            }
        });
    }

    // Botón CREAR CUENTA → redirigir a registro
    if (createAccountBtn) {
        createAccountBtn.addEventListener("click", () => {
            window.location.href = "/html/htmlAdmin/RegistroAdmin.html"; 
        });
    }

    function mostrarError(mensaje) {
        // Eliminar mensajes de error anteriores
        const errorAnterior = document.querySelector('.error-message');
        if (errorAnterior) {
            errorAnterior.remove();
        }

        // Crear y mostrar nuevo mensaje de error
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = mensaje;
        errorDiv.style.display = 'block';
        errorDiv.style.color = '#ffeb3b';
        errorDiv.style.marginTop = '10px';
        errorDiv.style.textAlign = 'center';

        loginForm.appendChild(errorDiv);

        // Auto-eliminar después de 5 segundos
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
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