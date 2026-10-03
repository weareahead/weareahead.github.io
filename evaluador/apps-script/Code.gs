/**
 * EVALUADOR DE PROPIEDADES AHEAD — Backend en Google Sheets  (v4)
 * ---------------------------------------------------------------
 * Proyecto de Apps Script «Ahead · Evaluador de propiedades (backend)»
 * en la cuenta ahead.hospitality@gmail.com, publicado como Aplicación web:
 *   Ejecutar como: Yo   ·   Quién tiene acceso: Cualquier usuario
 * La URL /exec va en evaluador/config.js → endpoint. Para publicar cambios
 * sin cambiar la URL: Implementar → Gestionar implementaciones → editar →
 * Versión: nueva versión → Implementar.
 *
 * Acciones:
 *  - registrar   (público)  agrega una evaluación. Si llega con token del
 *                           Equipo Ahead, queda a nombre de esa persona;
 *                           si no, se marca como «QR / por su cuenta».
 *  - registro    (público)  solicitud de cuenta del equipo → queda pendiente.
 *  - login                   correo + contraseña → sesión firmada (7 días).
 *  - listar      (sesión)   evaluaciones + equipo activo.
 *  - actualizar  (sesión)   estado comercial, asesor y notas de un lead.
 *  - usuarios    (admin)    lista de cuentas.
 *  - perfil      (sesión)   leer el perfil propio (nombre, celular, cargo, foto).
 *  - perfil_guardar (sesión) actualizar el perfil propio.
 *  - clave       (sesión)   cambiar la contraseña propia (pide la actual).
 *  - usuario     (admin)    aprobar / desactivar / eliminar una cuenta
 *                           (eliminar solo si está rechazada o desactivada).
 *
 * La cuenta administradora es USUARIO_EQUIPO con la contraseña cuya huella
 * SHA-256 está en CLAVE_SHA256 (la contraseña nunca está en el repositorio
 * público). Las demás contraseñas se guardan como huella con sal propia.
 */

const HOJA_ID = '1V2pylFWbQc-5oo-2qWM1mmL9cYyXRCxNVVX3DTaq3Jk';
const USUARIO_EQUIPO = 'ahead.hospitality@gmail.com';
const CLAVE_SHA256 = 'PEGAR_AQUI_LA_HUELLA';
const DIAS_SESION = 7;

// Correo que recibe avisos de cuentas nuevas por aprobar ('' = sin aviso).
const CORREO_AVISO_CUENTAS = USUARIO_EQUIPO;
// Correo que recibe un aviso con cada lead nuevo ('' = sin aviso).
const CORREO_AVISO_LEADS = '';

const HOJA = 'Evaluaciones';
const HOJA_USUARIOS = 'Usuarios';
const COLUMNAS = [
  'id', 'fecha', 'origen', 'asesor', 'asesorNombre', 'estadoComercial', 'notas',
  'nombre', 'apellido', 'email', 'telefono', 'empresa', 'cargo', 'proyecto', 'direccion', 'ciudad', 'tipoProyecto', 'rol',
  'tipoInmueble', 'unidades', 'zona', 'area', 'estrato', 'habitaciones', 'banos', 'ubicacion', 'amoblado', 'estado',
  'amenidades', 'amenidadesOtras', 'ph', 'rnt', 'inicio', 'arriendoActual', 'observaciones',
  'tarifaMedia', 'ocupacionMedia', 'mensualConservador', 'mensualMedio', 'mensualAlto', 'anualMedio',
  'puntaje', 'clase', 'riesgos', 'modelo', 'json'
];
const COLUMNAS_USUARIOS = ['email', 'nombre', 'estado', 'rol', 'sal', 'huella', 'creado', 'ultimoAcceso', 'telefono', 'cargo', 'foto'];
const FOTO_MAX = 45000; // caracteres del data URL (una celda admite 50.000)

/* ================= Entrada ================= */

function doPost(e) {
  try {
    const b = JSON.parse(e.postData.contents);
    switch (b.accion) {
      case 'login': return login_(b);
      case 'registro': return registroCuenta_(b);
      case 'actualizar': return actualizar_(b);
      case 'usuarios': return usuarios_(b);
      case 'usuario': return usuarioEstado_(b);
      case 'perfil': return perfil_(b);
      case 'perfil_guardar': return perfilGuardar_(b);
      case 'clave': return cambiarClave_(b);
      default: return registrar_(b.registro || b, b.token);
    }
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.accion === 'listar') {
    const s = sesion_(p.token);
    if (!s) return json_({ ok: false, error: 'sesion' });
    return json_({ ok: true, registros: listar_(), equipo: equipoActivo_(), yo: s });
  }
  return json_({ ok: true, servicio: 'Ahead · Evaluador de propiedades', version: 4 });
}

/* ================= Hojas ================= */

function libro_() { return SpreadsheetApp.openById(HOJA_ID); }

function asegurarHoja_(nombre, columnas) {
  const ss = libro_();
  let sh = ss.getSheetByName(nombre);
  let cambio = false;
  if (!sh) {
    sh = ss.insertSheet(nombre);
    sh.getRange(1, 1, 1, columnas.length).setValues([columnas]);
    sh.setFrozenRows(1);
    cambio = true;
  } else {
    // Agrega al final las columnas nuevas que falten (no reordena lo existente).
    const cab = sh.getRange(1, 1, 1, Math.max(1, sh.getLastColumn())).getValues()[0];
    const faltan = columnas.filter(function (c) { return cab.indexOf(c) < 0; });
    if (faltan.length) { sh.getRange(1, cab.filter(String).length + 1, 1, faltan.length).setValues([faltan]); cambio = true; }
  }
  if (cambio) sh.getRange(1, 1, 1, sh.getLastColumn()).setFontWeight('bold').setBackground('#3B0B45').setFontColor('#F4F0E8');
  return sh;
}

function cabecera_(sh) { return sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0]; }

function filaPorValor_(sh, columna, valor) {
  const cab = cabecera_(sh);
  const col = cab.indexOf(columna) + 1;
  if (!col || sh.getLastRow() < 2) return 0;
  const celda = sh.getRange(2, col, sh.getLastRow() - 1, 1).createTextFinder(String(valor)).matchEntireCell(true).findNext();
  return celda ? celda.getRow() : 0;
}

function escribirFila_(sh, objeto, fila) {
  const cab = cabecera_(sh);
  const valores = cab.map(function (k) { return objeto[k] === undefined || objeto[k] === null ? '' : objeto[k]; });
  if (fila) sh.getRange(fila, 1, 1, valores.length).setValues([valores]);
  else sh.appendRow(valores);
}

/* ================= Evaluaciones ================= */

function registrar_(r, token) {
  if (!r || !r.id || !r.lead || !r.resultado) return json_({ ok: false, error: 'registro incompleto' });
  const s = sesion_(token || r.token);
  delete r.token;
  r.origen = s ? 'Equipo Ahead' : 'QR / por su cuenta';
  r.asesor = s ? s.email : '';
  r.asesorNombre = s ? s.nombre : '';

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = asegurarHoja_(HOJA, COLUMNAS);
    if (filaPorValor_(sh, 'id', r.id)) return json_({ ok: true, duplicado: true });

    const L = r.lead || {}, I = r.inmueble || {}, E = (r.resultado || {}).escenarios || {}, K = r.calificacion || {};
    const m = E.medio || {}, c = E.conservador || {}, a = E.alto || {};
    escribirFila_(sh, {
      id: r.id, fecha: new Date(r.fecha || Date.now()), origen: r.origen, asesor: r.asesor, asesorNombre: r.asesorNombre,
      estadoComercial: K.clase === 'No viable' ? 'No viable' : 'Nuevo', notas: '',
      nombre: L.nombre, apellido: L.apellido, email: L.email, telefono: "'" + (L.telefono || ''),
      empresa: L.empresa, cargo: L.cargo, proyecto: L.proyecto, direccion: L.direccion, ciudad: L.ciudad,
      tipoProyecto: L.tipoProyecto, rol: L.rol,
      tipoInmueble: I.tipoInmueble, unidades: I.unidades, zona: I.zona, area: I.area, estrato: I.estrato,
      habitaciones: I.habitaciones, banos: I.banos, ubicacion: I.ubicacion, amoblado: I.amoblado, estado: I.estado,
      amenidades: (I.amenidades || []).join(', '), amenidadesOtras: I.amenidadesOtras,
      ph: I.ph, rnt: I.rnt, inicio: I.inicio, arriendoActual: I.arriendoActual, observaciones: I.observaciones,
      tarifaMedia: m.tarifa, ocupacionMedia: m.ocupacion, mensualConservador: c.mensual, mensualMedio: m.mensual,
      mensualAlto: a.mensual, anualMedio: m.anual,
      puntaje: K.puntaje, clase: K.clase, riesgos: (K.riesgos || []).join(' · '),
      modelo: (r.resultado || {}).modelo, json: JSON.stringify(r)
    });

    if (CORREO_AVISO_LEADS) {
      MailApp.sendEmail(CORREO_AVISO_LEADS,
        'Nuevo lead Ahead · ' + (L.nombre || '') + ' ' + (L.apellido || '') + ' · ' + (K.clase || ''),
        'Proyecto: ' + (L.proyecto || '-') + '\nCiudad: ' + (L.ciudad || '') +
        '\nIngreso mensual medio estimado: $' + Number(m.mensual || 0).toLocaleString('es-CO') +
        '\nOrigen: ' + r.origen + (r.asesorNombre ? ' (' + r.asesorNombre + ')' : '') +
        '\nTeléfono: ' + (L.telefono || '') + '\nEmail: ' + (L.email || ''));
    }
    return json_({ ok: true, origen: r.origen });
  } finally {
    lock.releaseLock();
  }
}

function listar_() {
  const sh = asegurarHoja_(HOJA, COLUMNAS);
  const datos = sh.getDataRange().getValues();
  const cab = datos.shift();
  const i = function (k) { return cab.indexOf(k); };
  return datos.filter(function (f) { return f[0]; }).map(function (f) {
    let r = {};
    try { r = JSON.parse(f[i('json')]); } catch (e) { r = { id: f[0] }; }
    r.estadoComercial = f[i('estadoComercial')];
    r.notas = f[i('notas')];
    r.asesor = f[i('asesor')];
    if (i('asesorNombre') >= 0) r.asesorNombre = f[i('asesorNombre')];
    if (i('origen') >= 0 && f[i('origen')]) r.origen = f[i('origen')];
    return r;
  });
}

function actualizar_(b) {
  const s = sesion_(b.token);
  if (!s) return json_({ ok: false, error: 'sesion' });
  const sh = asegurarHoja_(HOJA, COLUMNAS);
  const fila = filaPorValor_(sh, 'id', b.id);
  if (!fila) return json_({ ok: false, error: 'no encontrado' });
  const cab = cabecera_(sh);
  if (b.asesor !== undefined) {
    const u = equipoActivo_().filter(function (x) { return x.email === b.asesor; })[0];
    b.asesorNombre = u ? u.nombre : '';
  }
  ['estadoComercial', 'notas', 'asesor', 'asesorNombre'].forEach(function (k) {
    if (b[k] !== undefined && cab.indexOf(k) >= 0) sh.getRange(fila, cab.indexOf(k) + 1).setValue(b[k]);
  });
  return json_({ ok: true });
}

/* ================= Cuentas ================= */

function hex_(bytes) { return bytes.map(function (x) { return ('0' + (x & 0xff).toString(16)).slice(-2); }).join(''); }

function huella(texto) {
  const h = hex_(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(texto), Utilities.Charset.UTF_8));
  Logger.log(h);
  return h;
}

function usuariosHoja_() { return asegurarHoja_(HOJA_USUARIOS, COLUMNAS_USUARIOS); }

function leerUsuarios_() {
  const sh = usuariosHoja_();
  const datos = sh.getDataRange().getValues();
  const cab = datos.shift();
  return datos.filter(function (f) { return f[0]; }).map(function (f, n) {
    const o = { fila: n + 2 };
    cab.forEach(function (k, j) { o[k] = f[j]; });
    o.email = String(o.email).toLowerCase();
    return o;
  });
}

function equipoActivo_() {
  const lista = [{ email: USUARIO_EQUIPO, nombre: 'Equipo Ahead' }];
  leerUsuarios_().forEach(function (u) { if (u.estado === 'activo') lista.push({ email: u.email, nombre: u.nombre }); });
  return lista;
}

function registroCuenta_(b) {
  const nombre = String(b.nombre || '').trim().slice(0, 80);
  const email = String(b.email || '').trim().toLowerCase();
  const pass = String(b.password || '');
  if (!nombre || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || pass.length < 8) return json_({ ok: false, error: 'datos' });
  if (email === USUARIO_EQUIPO) return json_({ ok: false, error: 'existe' });

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    if (leerUsuarios_().some(function (u) { return u.email === email; })) return json_({ ok: false, error: 'existe' });
    const sal = Utilities.getUuid();
    escribirFila_(usuariosHoja_(), {
      email: email, nombre: nombre, estado: 'pendiente', rol: 'equipo',
      sal: sal, huella: huella(sal + pass), creado: new Date(), ultimoAcceso: ''
    });
  } finally {
    lock.releaseLock();
  }
  if (CORREO_AVISO_CUENTAS) {
    try {
      MailApp.sendEmail(CORREO_AVISO_CUENTAS, 'Ahead · Nueva cuenta por aprobar: ' + nombre,
        nombre + ' (' + email + ') pidió acceso al Evaluador de propiedades.\n\n' +
        'Apruébala o recházala en el panel: https://weareahead.github.io/equipo/ → Equipo.');
    } catch (e) {}
  }
  return json_({ ok: true, estado: 'pendiente' });
}

function usuarios_(b) {
  const s = sesion_(b.token);
  if (!s || s.rol !== 'admin') return json_({ ok: false, error: 'sesion' });
  return json_({ ok: true, usuarios: leerUsuarios_().map(function (u) {
    return { email: u.email, nombre: u.nombre, estado: u.estado, creado: u.creado, ultimoAcceso: u.ultimoAcceso, telefono: u.telefono || '', cargo: u.cargo || '', foto: u.foto || '' };
  }) });
}

function usuarioEstado_(b) {
  const s = sesion_(b.token);
  if (!s || s.rol !== 'admin') return json_({ ok: false, error: 'sesion' });
  if (['activo', 'pendiente', 'desactivado', 'eliminar'].indexOf(b.estado) < 0) return json_({ ok: false, error: 'datos' });
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const u = leerUsuarios_().filter(function (x) { return x.email === String(b.email || '').toLowerCase(); })[0];
    if (!u) return json_({ ok: false, error: 'no encontrado' });
    const sh = usuariosHoja_();
    if (b.estado === 'eliminar') {
      // Solo se eliminan cuentas rechazadas o desactivadas. Sus evaluaciones
      // se conservan en la hoja con el correo de quien las registró.
      if (u.estado === 'activo') return json_({ ok: false, error: 'activo' });
      sh.deleteRow(u.fila);
      return json_({ ok: true, eliminado: true });
    }
    sh.getRange(u.fila, cabecera_(sh).indexOf('estado') + 1).setValue(b.estado);
    return json_({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

/* ================= Sesión ================= */

function secreto_() {
  const props = PropertiesService.getScriptProperties();
  let s = props.getProperty('SECRETO_SESION');
  if (!s) { s = Utilities.getUuid() + Utilities.getUuid(); props.setProperty('SECRETO_SESION', s); }
  return s + CLAVE_SHA256; // cambiar la contraseña admin invalida todas las sesiones
}

function firmar_(texto) {
  return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(texto, secreto_()));
}

function login_(b) {
  const cache = CacheService.getScriptCache();
  const fallos = Number(cache.get('fallos') || 0);
  if (fallos >= 15) return json_({ ok: false, error: 'bloqueado' });
  const email = String(b.email || '').trim().toLowerCase();
  const pass = String(b.password || '');
  let cuenta = null;

  if (email === USUARIO_EQUIPO) {
    if (huella(pass) === claveAdmin_()) cuenta = { email: email, nombre: perfilAdmin_().nombre || 'Equipo Ahead', rol: 'admin' };
  } else {
    const u = leerUsuarios_().filter(function (x) { return x.email === email; })[0];
    if (u && huella(u.sal + pass) === u.huella) {
      if (u.estado === 'pendiente') return json_({ ok: false, error: 'pendiente' });
      if (u.estado === 'activo') {
        cuenta = { email: email, nombre: u.nombre, rol: 'equipo' };
        const sh = usuariosHoja_();
        sh.getRange(u.fila, cabecera_(sh).indexOf('ultimoAcceso') + 1).setValue(new Date());
      }
    }
  }
  if (!cuenta) {
    cache.put('fallos', String(fallos + 1), 600);
    Utilities.sleep(800);
    return json_({ ok: false, error: 'credenciales' });
  }
  const exp = Date.now() + DIAS_SESION * 864e5;
  const datos = JSON.stringify({ e: cuenta.email, n: cuenta.nombre, r: cuenta.rol, x: exp });
  return json_({
    ok: true, token: Utilities.base64EncodeWebSafe(datos, Utilities.Charset.UTF_8) + '.' + firmar_(datos),
    expira: exp, email: cuenta.email, nombre: cuenta.nombre, rol: cuenta.rol
  });
}

// Devuelve {email, nombre, rol} si el token es válido y la cuenta sigue activa.
function sesion_(token) {
  if (!token || String(token).indexOf('.') < 0) return null;
  const partes = String(token).split('.');
  let datos;
  try { datos = Utilities.newBlob(Utilities.base64DecodeWebSafe(partes[0])).getDataAsString('UTF-8'); } catch (e) { return null; }
  if (firmar_(datos) !== partes[1]) return null;
  let o;
  try { o = JSON.parse(datos); } catch (e) { return null; }
  if (!o || !(Number(o.x) > Date.now())) return null;
  if (o.r !== 'admin') {
    const u = leerUsuarios_().filter(function (x) { return x.email === o.e; })[0];
    if (!u || u.estado !== 'activo') return null;
    return { email: o.e, nombre: u.nombre || o.n, rol: o.r };
  }
  return { email: o.e, nombre: perfilAdmin_().nombre || o.n, rol: o.r };
}

/* ================= Perfil ================= */

// La cuenta administradora no vive en la pestaña Usuarios: su perfil y su
// contraseña cambiada se guardan en las propiedades del script.
function perfilAdmin_() {
  try { return JSON.parse(PropertiesService.getScriptProperties().getProperty('PERFIL_ADMIN') || '{}'); } catch (e) { return {}; }
}
function claveAdmin_() {
  return PropertiesService.getScriptProperties().getProperty('CLAVE_ADMIN') || CLAVE_SHA256;
}

function perfil_(b) {
  const s = sesion_(b.token);
  if (!s) return json_({ ok: false, error: 'sesion' });
  if (s.rol === 'admin') {
    const p = perfilAdmin_();
    return json_({ ok: true, perfil: { email: s.email, nombre: p.nombre || 'Equipo Ahead', rol: 'admin', telefono: p.telefono || '', cargo: p.cargo || '', foto: p.foto || '' } });
  }
  const u = leerUsuarios_().filter(function (x) { return x.email === s.email; })[0];
  return json_({ ok: true, perfil: { email: s.email, nombre: u.nombre, rol: 'equipo', telefono: u.telefono || '', cargo: u.cargo || '', foto: u.foto || '' } });
}

function perfilGuardar_(b) {
  const s = sesion_(b.token);
  if (!s) return json_({ ok: false, error: 'sesion' });
  const nombre = String(b.nombre || '').trim().slice(0, 80);
  const telefono = String(b.telefono || '').trim().slice(0, 30);
  const cargo = String(b.cargo || '').trim().slice(0, 80);
  const foto = String(b.foto || '');
  if (!nombre) return json_({ ok: false, error: 'datos' });
  if (foto && (!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+\/=]+$/.test(foto) || foto.length > FOTO_MAX)) return json_({ ok: false, error: 'foto' });

  if (s.rol === 'admin') {
    PropertiesService.getScriptProperties().setProperty('PERFIL_ADMIN', JSON.stringify({ nombre: nombre, telefono: telefono, cargo: cargo, foto: foto }));
  } else {
    const lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      const u = leerUsuarios_().filter(function (x) { return x.email === s.email; })[0];
      const sh = usuariosHoja_(), cab = cabecera_(sh);
      [['nombre', nombre], ['telefono', "'" + telefono], ['cargo', cargo], ['foto', foto]].forEach(function (kv) {
        sh.getRange(u.fila, cab.indexOf(kv[0]) + 1).setValue(kv[0] === 'telefono' && !telefono ? '' : kv[1]);
      });
    } finally {
      lock.releaseLock();
    }
  }
  return json_({ ok: true, perfil: { email: s.email, nombre: nombre, rol: s.rol, telefono: telefono, cargo: cargo, foto: foto } });
}

function cambiarClave_(b) {
  const s = sesion_(b.token);
  if (!s) return json_({ ok: false, error: 'sesion' });
  const actual = String(b.actual || ''), nueva = String(b.nueva || '');
  if (nueva.length < 8) return json_({ ok: false, error: 'clave_corta' });
  if (s.rol === 'admin') {
    if (huella(actual) !== claveAdmin_()) { Utilities.sleep(800); return json_({ ok: false, error: 'clave_actual' }); }
    PropertiesService.getScriptProperties().setProperty('CLAVE_ADMIN', huella(nueva));
    return json_({ ok: true });
  }
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const u = leerUsuarios_().filter(function (x) { return x.email === s.email; })[0];
    if (huella(u.sal + actual) !== u.huella) { Utilities.sleep(800); return json_({ ok: false, error: 'clave_actual' }); }
    const sal = Utilities.getUuid(), sh = usuariosHoja_(), cab = cabecera_(sh);
    sh.getRange(u.fila, cab.indexOf('sal') + 1).setValue(sal);
    sh.getRange(u.fila, cab.indexOf('huella') + 1).setValue(huella(sal + nueva));
  } finally {
    lock.releaseLock();
  }
  return json_({ ok: true });
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

// Ejecutar una vez desde el editor: crea/actualiza las pestañas y autoriza permisos.
function configurar() {
  asegurarHoja_(HOJA, COLUMNAS);
  usuariosHoja_();
}
