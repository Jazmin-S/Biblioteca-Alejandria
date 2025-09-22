// Mostrar 
document.querySelector(".btn-eliminar").addEventListener("click", () => {
  document.getElementById("popup-overlay").style.display = "flex";
});

// Cerrar el pop 
document.querySelector(".btn-rechazar").addEventListener("click", () => {
  document.getElementById("popup-overlay").style.display = "none";
});

// confirmado
document.querySelector(".btn-aceptar").addEventListener("click", () => {
  alert("Usuario eliminado "); 
  document.getElementById("popup-overlay").style.display = "none";
});
