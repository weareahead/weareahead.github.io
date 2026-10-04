/* Sesión del Equipo Ahead — compartida por /evaluador/ y /equipo/.
   La contraseña nunca se guarda en el navegador: solo el token firmado
   que entrega el Apps Script (válido 7 días) y los datos del perfil. */
(function () {
  var KEY = "ahead_sesion_v2";
  function ep() { return (window.AHEAD_EVAL || {}).endpoint; }
  function leer() {
    try {
      var s = JSON.parse(localStorage.getItem(KEY) || "null");
      return s && s.expira > Date.now() ? s : null;
    } catch (e) { return null; }
  }
  function guardar(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
  function cerrar() { try { localStorage.removeItem(KEY); localStorage.removeItem("ahead_panel_sesion"); localStorage.removeItem("ahead_panel_cache_v1"); } catch (e) {} }
  // Mezcla datos del perfil (nombre, foto…) en la sesión guardada.
  function actualizarLocal(datos) {
    var s = leer(); if (!s) return null;
    Object.keys(datos || {}).forEach(function (k) { if (["nombre", "foto", "telefono", "cargo"].indexOf(k) >= 0) s[k] = datos[k]; });
    guardar(s); return s;
  }
  function post(body) {
    if (!ep()) return Promise.reject(new Error("sin_endpoint"));
    return fetch(ep(), { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(body) })
      .then(function (r) { return r.json(); });
  }
  function login(email, password) {
    return post({ accion: "login", email: String(email || "").trim().toLowerCase(), password: password }).then(function (j) {
      if (j.ok) guardar({ token: j.token, expira: j.expira, email: j.email, nombre: j.nombre, rol: j.rol });
      return j;
    });
  }
  function registro(nombre, email, password) {
    return post({ accion: "registro", nombre: String(nombre || "").trim(), email: String(email || "").trim().toLowerCase(), password: password });
  }
  function token() { return (leer() || {}).token; }
  function perfil() {
    return post({ accion: "perfil", token: token() }).then(function (j) { if (j.ok) actualizarLocal(j.perfil); return j; });
  }
  function guardarPerfil(datos) {
    return post({ accion: "perfil_guardar", token: token(), nombre: datos.nombre, telefono: datos.telefono, cargo: datos.cargo, foto: datos.foto })
      .then(function (j) { if (j.ok) actualizarLocal(j.perfil); return j; });
  }
  function clave(actual, nueva) { return post({ accion: "clave", token: token(), actual: actual, nueva: nueva }); }

  var MENSAJES = {
    credenciales: "Correo o contraseña incorrectos.",
    pendiente: "Tu cuenta está pendiente de aprobación por el equipo de Ahead.",
    bloqueado: "Demasiados intentos. Espera 10 minutos.",
    existe: "Ya existe una cuenta con ese correo.",
    datos: "Revisa los datos: nombre, correo válido y contraseña de mínimo 8 caracteres.",
    sesion: "Tu sesión expiró. Inicia sesión de nuevo.",
    sin_endpoint: "El servicio aún no está conectado.",
    clave_actual: "La contraseña actual no es correcta.",
    clave_corta: "La nueva contraseña debe tener mínimo 8 caracteres.",
    foto: "La foto no se pudo guardar. Prueba con otra imagen."
  };
  function mensaje(codigo) { return MENSAJES[codigo] || "No se pudo conectar. Revisa la conexión."; }

  /* Ojo para mostrar u ocultar la contraseña. El ícono refleja el estado:
     ojo cerrado = la contraseña está oculta; ojo abierto = se está viendo. */
  var OJO_ABIERTO = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/></svg>';
  var OJO_CERRADO = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10c2.4 3.1 5.4 4.7 9 4.7s6.6-1.6 9-4.7"/><path d="M6.6 13.4 5 15.9M12 14.7v2.9M17.4 13.4l1.6 2.5"/></svg>';
  function ojos(raiz) {
    (raiz || document).querySelectorAll('input[type="password"]').forEach(function (inp) {
      if (inp.dataset.ojo) return;
      inp.dataset.ojo = "1";
      var caja = document.createElement("span"); caja.className = "con-ojo";
      inp.parentNode.insertBefore(caja, inp); caja.appendChild(inp);
      var b = document.createElement("button");
      b.type = "button"; b.className = "ojo"; b.innerHTML = OJO_CERRADO;
      b.setAttribute("aria-label", "Mostrar contraseña"); b.setAttribute("aria-pressed", "false"); b.title = "Mostrar contraseña";
      b.addEventListener("click", function () {
        var ver = inp.type === "password";
        inp.type = ver ? "text" : "password";
        b.innerHTML = ver ? OJO_ABIERTO : OJO_CERRADO;
        var t = ver ? "Ocultar contraseña" : "Mostrar contraseña";
        b.setAttribute("aria-label", t); b.title = t; b.setAttribute("aria-pressed", String(ver));
        inp.focus();
      });
      caja.appendChild(b);
    });
  }
  // Vuelve a ocultar las contraseñas que estén visibles (al enviar o cerrar).
  function ocultarTodas(raiz) {
    (raiz || document).querySelectorAll('input[data-ojo]').forEach(function (inp) {
      if (inp.type === "text") { var b = inp.parentNode.querySelector(".ojo"); if (b) b.click(); }
    });
  }

  window.AheadSesion = { leer: leer, cerrar: cerrar, login: login, registro: registro, post: post, mensaje: mensaje,
    perfil: perfil, guardarPerfil: guardarPerfil, clave: clave, actualizarLocal: actualizarLocal, ojos: ojos, ocultarTodas: ocultarTodas };
})();
