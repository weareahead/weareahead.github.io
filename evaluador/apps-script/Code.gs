/**
 * EVALUADOR DE PROPIEDADES AHEAD — Backend en Google Sheets
 * ---------------------------------------------------------
 * Pegar este archivo en Extensiones → Apps Script de la hoja de cálculo
 * "Ahead · Evaluaciones de propiedades" y desplegar como Aplicación web:
 *   Ejecutar como: Yo   ·   Quién tiene acceso: Cualquier usuario
 * La URL que termina en /exec va en evaluador/config.js → endpoint.
 *
 * Qué hace:
 *  - registrar  (POST, público): agrega una fila por evaluación. No duplica
 *    si el mismo id llega dos veces (reintentos del modo offline).
 *  - listar     (GET, con clave): devuelve todas las evaluaciones al panel.
 *  - actualizar (POST, con clave): cambia estado comercial, asesor y notas.
 */

// Clave del panel interno. Cámbiala antes de desplegar y compártela solo con el equipo.
const CLAVE_EQUIPO = 'cambia-esta-clave';

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
    if (body.accion === 'actualizar') return actualizar_(body);
    return registrar_(body.registro || body);
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.accion === 'listar') {
    if (p.clave !== CLAVE_EQUIPO) return json_({ ok: false, error: 'clave' });
    return json_({ ok: true, registros: listar_() });
  }
  return json_({ ok: true, servicio: 'Ahead · Evaluador de propiedades' });
}

function hoja_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
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
  if (b.clave !== CLAVE_EQUIPO) return json_({ ok: false, error: 'clave' });
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

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

// Ejecutar una vez desde el editor para crear la hoja y autorizar permisos.
function configurar() {
  hoja_();
}
