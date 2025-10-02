// Validación de registro de administrador
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registroForm");
  const usuario = document.getElementById("usuario");
  const correo = document.getElementById("correo");
  const pass = document.getElementById("contrasena");
  const pass2 = document.getElementById("contrasena2");

  const usuarioError = document.getElementById("usuarioError");
  const correoError = document.getElementById("correoError");
  const passError = document.getElementById("contrasenaError");
  const pass2Error = document.getElementById("contrasena2Error");
  const formMessage = document.getElementById("formMessage");

  const reqList = document.getElementById("passReqs");
  const reqItems = {
    len: reqList.querySelector('[data-req="len"]'),
    upper: reqList.querySelector('[data-req="upper"]'),
    special: reqList.querySelector('[data-req="special"]'),
  };

  // Regex: mínimo 8, al menos 1 mayúscula y 1 especial
  const passRegex = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;

  const setValid = (el, ok, msgEl, msg = "") => {
    el.classList.remove("is-valid", "is-invalid");
    if (ok) {
      el.classList.add("is-valid");
      if (msgEl) msgEl.textContent = "";
    } else {
      el.classList.add("is-invalid");
      if (msgEl) msgEl.textContent = msg;
    }
  };

  const updateRequirements = (value) => {
    const checks = {
      len: value.length >= 8,
      upper: /[A-Z]/.test(value),
      special: /[^A-Za-z0-9]/.test(value),
    };

    for (const key in checks) {
      reqItems[key].classList.toggle("good", checks[key]);
      reqItems[key].classList.toggle("bad", !checks[key]);
    }
    return checks.len && checks.upper && checks.special;
  };

  // Live validation
  usuario.addEventListener("input", () => {
    const ok = usuario.value.trim().length >= 3;
    setValid(usuario, ok, usuarioError, ok ? "" : "Mínimo 3 caracteres.");
  });

  correo.addEventListener("input", () => {
    const ok = correo.validity.valid;
    setValid(correo, ok, correoError, ok ? "" : "Correo inválido.");
  });

  pass.addEventListener("input", () => {
    const ok = updateRequirements(pass.value);
    setValid(
      pass,
      ok,
      passError,
      ok ? "" : "La contraseña no cumple los requisitos."
    );

    // Mientras escribe la primera, verifica coincidencia con la segunda
    if (pass2.value.length > 0) {
      const same = pass.value === pass2.value;
      setValid(
        pass2,
        same,
        pass2Error,
        same ? "" : "Las contraseñas no coinciden."
      );
    }
  });

  pass2.addEventListener("input", () => {
    const same = pass.value === pass2.value;
    setValid(
      pass2,
      same,
      pass2Error,
      same ? "" : "Las contraseñas no coinciden."
    );
  });

  // Envío
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    formMessage.textContent = "";

    // Disparar validaciones finales
    const uOK = usuario.value.trim().length >= 3;
    setValid(usuario, uOK, usuarioError, uOK ? "" : "Mínimo 3 caracteres.");

    const cOK = correo.validity.valid;
    setValid(correo, cOK, correoError, cOK ? "" : "Correo inválido.");

    const pOK = passRegex.test(pass.value);
    setValid(
      pass,
      pOK,
      passError,
      pOK ? "" : "La contraseña no cumple los requisitos."
    );
    updateRequirements(pass.value);

    const p2OK = pass.value === pass2.value;
    setValid(
      pass2,
      p2OK,
      pass2Error,
      p2OK ? "" : "Las contraseñas no coinciden."
    );

    if (!(uOK && cOK && pOK && p2OK)) {
      formMessage.textContent = "⚠️ Revisa los campos marcados en rojo.";
      return;
    }

    // Si tu backend ya recibe este payload, ajusta la URL si es necesario:
    const payload = {
      usuario: usuario.value.trim(),
      correo: correo.value.trim(),
      contrasena: pass.value, // En el backend hashea antes de guardar
      rol: document.getElementById("rol").value || "bibliotecario",
    };

    try {
      const res = await fetch("http://localhost:3000/api/admin/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || "Error al registrar.");
      }

      formMessage.textContent = "✅ Registro exitoso.";
      form.reset();
      // Limpia estilos
      [usuario, correo, pass, pass2].forEach((el) =>
        el.classList.remove("is-valid", "is-invalid")
      );
      updateRequirements("");
    } catch (err) {
      formMessage.textContent = "❌ " + err.message;
    }
  });
});
