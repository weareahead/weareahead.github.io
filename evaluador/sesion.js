/* Sesión del Equipo Ahead — compartida por /evaluador/ y /equipo/.
   La contraseña nunca se guarda en el navegador: solo el token firmado
   que entrega el Apps Script (válido 7 días). */
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
  function cerrar() { try { localStorage.removeItem(KEY); localStorage.removeItem("ahead_panel_sesion"); } catch (e) {} }
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
  var MENSAJES = {
    credenciales: "Correo o contraseña incorrectos.",
    pendiente: "Tu cuenta está pendiente de aprobación por el equipo de Ahead.",
    bloqueado: "Demasiados intentos. Espera 10 minutos.",
    existe: "Ya existe una cuenta con ese correo.",
    datos: "Revisa los datos: nombre, correo válido y contraseña de mínimo 8 caracteres.",
    sesion: "Tu sesión expiró. Inicia sesión de nuevo.",
    sin_endpoint: "El servicio aún no está conectado."
  };
  function mensaje(codigo) { return MENSAJES[codigo] || "No se pudo conectar. Revisa la conexión."; }
  window.AheadSesion = { leer: leer, cerrar: cerrar, login: login, registro: registro, post: post, mensaje: mensaje };
})();
