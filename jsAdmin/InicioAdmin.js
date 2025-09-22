document.addEventListener("DOMContentLoaded", () => {
  const popup = document.getElementById("popupMenu");
  const btn = document.querySelector(".menu-btn");
  const close = document.querySelector(".close-popup");

  btn.addEventListener("click", () => {
    popup.style.display = "flex";
  });

  close.addEventListener("click", () => {
    popup.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === popup) {
      popup.style.display = "none";
    }
  });
});
