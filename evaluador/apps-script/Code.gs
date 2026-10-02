/**
 * EVALUADOR DE PROPIEDADES AHEAD — Backend en Google Sheets
 * ---------------------------------------------------------
 * Pegar este archivo en Extensiones → Apps Script de la hoja de cálculo
 * (cuenta ahead.hospitality@gmail.com) y desplegar como Aplicación web:
 *   Ejecutar como: Yo   ·   Quién tiene acceso: Cualquier usuario
 * La URL que termina en /exec va en evaluador/config.js → endpoint.
 *
 * Qué hace:
 *  - registrar  (POST, público): agrega una fila por evaluación. No duplica
 *    si el mismo id llega dos veces (reintentos sin conexión).
 *  - login      (POST): correo + contraseña del equipo → sesión firmada (7 días).
 *  - listar     (GET, con sesión): devuelve todas las evaluaciones al panel.
 *  - actualizar (POST, con sesión): cambia estado comercial, asesor y notas.
 *
 * La contraseña NO se guarda en este repositorio público: aquí va solo su
 * huella SHA-256 (CLAVE_SHA256), y únicamente en la copia del Apps Script.
 * Para cambiarla: ejecutar huella('nueva contraseña') en el editor y pegar
 * el resultado en CLAVE_SHA256. Al cambiarla se cierran todas las sesiones.
 */

const HOJA_ID = '1V2pylFWbQc-5oo-2qWM1mmL9cYyXRCxNVVX3DTaq3Jk';
const USUARIO_EQUIPO = 'ahead.hospitality@gmail.com';
const CLAVE_SHA256 = 'PEGAR_AQUI_LA_HUELLA';
const DIAS_SESION = 7;

// Opcional: correo que recibe un aviso con cada lead nuevo (vacío = sin aviso).
const CORREO_AVISO = '';

const HOJA = 'Evaluaciones';
const COLUMNAS = [
  'id', 'fecha', 'origen', 'asesor', 'estadoComercial', 'notas',
  'nombre', 'apellido', 'email', 'telefono', 'empresa', 'cargo', 'proyecto', 'ciudad', 'tipoProyecto', 'rol',
  'tipoInmueble', 'unidades', 'zona', 'area', 'estrato', 'habitaciones', 'banos', 'ubicacion', 'amoblado', 'estado',
  'amenidades', 'ph', 'rnt', 'inicio', 'arriendoActual',
  'tarifaMedia', 'ocupacionMedia', 'mensualConservador', 'mensualMedio', 'mensualAlto', 'anualMedio',
  'puntaje', 'clase', 'riesgos', 'modelo', 'json'
];

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    if (body.accion === 'login') return login_(body);
    if (body.accion === 'actualizar') return actualizar_(body);
    return registrar_(body.registro || body);
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.accion === 'listar') {
    if (!sesionValida_(p.token)) return json_({ ok: false, error: 'sesion' });
    return json_({ ok: true, registros: listar_() });
  }
  return json_({ ok: true, servicio: 'Ahead · Evaluador de propiedades' });
}

function hoja_() {
  const ss = SpreadsheetApp.openById(HOJA_ID);
  let sh = ss.getSheetByName(HOJA);
  if (!sh) {
    sh = ss.insertSheet(HOJA);
    sh.getRange(1, 1, 1, COLUMNAS.length).setValues([COLUMNAS]).setFontWeight('bold')
      .setBackground('#3B0B45').setFontColor('#F4F0E8');
    sh.setFrozenRows(1);
  }
  return sh;
}

function registrar_(r) {
  if (!r || !r.id || !r.lead || !r.resultado) return json_({ ok: false, error: 'registro incompleto' });
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = hoja_();
    const ya = sh.getRange('A:A').createTextFinder(r.id).matchEntireCell(true).findNext();
    if (ya) return json_({ ok: true, duplicado: true });

    const L = r.lead || {}, I = r.inmueble || {}, E = (r.resultado || {}).escenarios || {}, K = r.calificacion || {};
    const m = E.medio || {}, c = E.conservador || {}, a = E.alto || {};
    const fila = {
      id: r.id, fecha: new Date(r.fecha || Date.now()), origen: r.origen || '', asesor: r.asesor || '',
      estadoComercial: K.clase === 'No viable' ? 'No viable' : 'Nuevo', notas: '',
      nombre: L.nombre, apellido: L.apellido, email: L.email, telefono: "'" + (L.telefono || ''),
      empresa: L.empresa, cargo: L.cargo, proyecto: L.proyecto, ciudad: L.ciudad, tipoProyecto: L.tipoProyecto, rol: L.rol,
      tipoInmueble: I.tipoInmueble, unidades: I.unidades, zona: I.zona, area: I.area, estrato: I.estrato,
      habitaciones: I.habitaciones, banos: I.banos, ubicacion: I.ubicacion, amoblado: I.amoblado, estado: I.estado,
      amenidades: (I.amenidades || []).join(', '), ph: I.ph, rnt: I.rnt, inicio: I.inicio, arriendoActual: I.arriendoActual,
      tarifaMedia: m.tarifa, ocupacionMedia: m.ocupacion, mensualConservador: c.mensual, mensualMedio: m.mensual,
      mensualAlto: a.mensual, anualMedio: m.anual,
      puntaje: K.puntaje, clase: K.clase, riesgos: (K.riesgos || []).join(' · '),
      modelo: (r.resultado || {}).modelo, json: JSON.stringify(r)
    };
    sh.appendRow(COLUMNAS.map(function (k) { return fila[k] === undefined ? '' : fila[k]; }));

    if (CORREO_AVISO) {
      MailApp.sendEmail(CORREO_AVISO,
        'Nuevo lead Ahead · ' + (L.nombre || '') + ' ' + (L.apellido || '') + ' · ' + (K.clase || ''),
        'Proyecto: ' + (L.proyecto || '-') + '\nCiudad: ' + (L.ciudad || '') + '\nTipo: ' + (L.tipoProyecto || '') +
        '\nIngreso mensual medio estimado: $' + Number(m.mensual || 0).toLocaleString('es-CO') +
        '\nPuntaje: ' + (K.puntaje || 0) + ' (' + (K.clase || '') + ')\nTeléfono: ' + (L.telefono || '') + '\nEmail: ' + (L.email || ''));
    }
    return json_({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

function listar_() {
  const sh = hoja_();
  const datos = sh.getDataRange().getValues();
  const cab = datos.shift();
  const iJson = cab.indexOf('json'), iEst = cab.indexOf('estadoComercial'), iNot = cab.indexOf('notas'), iAse = cab.indexOf('asesor');
  return datos.filter(function (f) { return f[0]; }).map(function (f) {
    let r = {};
    try { r = JSON.parse(f[iJson]); } catch (e) { r = { id: f[0] }; }
    r.estadoComercial = f[iEst];
    r.notas = f[iNot];
    r.asesor = f[iAse];
    return r;
  });
}

function actualizar_(b) {
  if (!sesionValida_(b.token)) return json_({ ok: false, error: 'sesion' });
  const sh = hoja_();
  const celda = sh.getRange('A:A').createTextFinder(b.id).matchEntireCell(true).findNext();
  if (!celda) return json_({ ok: false, error: 'no encontrado' });
  const fila = celda.getRow();
  const cab = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  ['estadoComercial', 'notas', 'asesor'].forEach(function (k) {
    if (b[k] !== undefined) sh.getRange(fila, cab.indexOf(k) + 1).setValue(b[k]);
  });
  return json_({ ok: true });
}

/* ---------- Sesión del panel ---------- */
function huella(texto) {
  const b = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, texto, Utilities.Charset.UTF_8);
  const hex = b.map(function (x) { return ('0' + (x & 0xff).toString(16)).slice(-2); }).join('');
  Logger.log(hex);
  return hex;
}

function secreto_() {
  const props = PropertiesService.getScriptProperties();
  let s = props.getProperty('SECRETO_SESION');
  if (!s) { s = Utilities.getUuid() + Utilities.getUuid(); props.setProperty('SECRETO_SESION', s); }
  return s + CLAVE_SHA256; // cambiar la contraseña invalida las sesiones
}

function firmar_(texto) {
  return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(texto, secreto_()));
}

function login_(b) {
  const cache = CacheService.getScriptCache();
  const fallos = Number(cache.get('fallos') || 0);
  if (fallos >= 15) return json_({ ok: false, error: 'bloqueado' });
  const email = String(b.email || '').trim().toLowerCase();
  if (email !== USUARIO_EQUIPO || huella(String(b.password || '')) !== CLAVE_SHA256) {
    cache.put('fallos', String(fallos + 1), 600);
    Utilities.sleep(800);
    return json_({ ok: false, error: 'credenciales' });
  }
  const exp = Date.now() + DIAS_SESION * 864e5;
  const datos = email + '|' + exp;
  return json_({ ok: true, token: Utilities.base64EncodeWebSafe(datos) + '.' + firmar_(datos), expira: exp });
}

function sesionValida_(token) {
  if (!token || String(token).indexOf('.') < 0) return false;
  const partes = String(token).split('.');
  let datos;
  try { datos = Utilities.newBlob(Utilities.base64DecodeWebSafe(partes[0])).getDataAsString(); } catch (e) { return false; }
  if (firmar_(datos) !== partes[1]) return false;
  return Number(datos.split('|')[1]) > Date.now();
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

// Ejecutar una vez desde el editor para crear la hoja y autorizar permisos.
function configurar() {
  hoja_();
}
