document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado - Inicializando botones...');

    const userBtn = document.getElementById('userBtn');
    const adminBtn = document.getElementById('adminBtn');

    if (!userBtn || !adminBtn) {
        console.error('No se encontraron los botones necesarios');
        return;
    }

    function redirectTo(relativePath) {
        console.log('Redirigiendo a:', relativePath);
        window.location.href = relativePath;
    }

    userBtn.addEventListener('click', () => {
        console.log('Botón Usuario clickeado');
        redirectTo('html/UserLogin.html'); // ✅ Correcto
    });

    adminBtn.addEventListener('click', () => {
        console.log('Botón Bibliotecario clickeado');
        redirectTo('htmlAdmin/AdminLogin.html'); // ✅ Cambiado a htmlAdmin/
    });

    console.log('Botones inicializados correctamente');
});