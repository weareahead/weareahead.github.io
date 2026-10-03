/* Resumen en PDF para el propietario — Evaluador de propiedades Ahead.
   Usa jsPDF (cdnjs). Una página A4 con marca, cifras, datos del inmueble,
   aviso de estimación y CTA a WhatsApp con link clicable. */
(function () {
  var C = { dark: [59, 11, 69], morada: [92, 31, 99], naranja: [247, 111, 38], cream: [244, 240, 232],
            lila: [239, 235, 253], ink: [42, 8, 50], gris: [107, 88, 114], linea: [228, 220, 230], blanco: [255, 255, 255] };
  var MESES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];

  function fmt(v) { return "$" + Math.round(Number(v) || 0).toLocaleString("es-CO"); }
  function fecha(iso) { var d = new Date(iso); return d.getDate() + " de " + MESES[d.getMonth()] + " de " + d.getFullYear(); }

  function logoPng() {
    return new Promise(function (ok) {
      var img = new Image();
      img.onload = function () {
        try {
          var w = 372, h = Math.round(372 * (img.naturalHeight || 112) / (img.naturalWidth || 124));
          var cv = document.createElement("canvas"); cv.width = w; cv.height = h;
          cv.getContext("2d").drawImage(img, 0, 0, w, h);
          ok({ data: cv.toDataURL("image/png"), ratio: h / w });
        } catch (e) { ok(null); }
      };
      img.onerror = function () { ok(null); };
      img.src = "../assets/logo-ahead.svg";
    });
  }

  function generar(r, opts) {
    var jsPDF = window.jspdf && window.jspdf.jsPDF;
    if (!jsPDF) return Promise.reject(new Error("jspdf"));
    return logoPng().then(function (logo) {
      var doc = new jsPDF({ unit: "mm", format: "a4" });
      var W = 210, M = 16, CW = W - 2 * M;
      var L = r.lead, I = r.inmueble, E = r.resultado.escenarios, m = E.medio;
      var fill = function (c) { doc.setFillColor(c[0], c[1], c[2]); };
      var color = function (c) { doc.setTextColor(c[0], c[1], c[2]); };
      var font = function (estilo, size) { doc.setFont("helvetica", estilo); doc.setFontSize(size); };

      doc.setProperties({ title: "Ahead · Potencial estimado · " + L.nombre + " " + L.apellido, author: "Ahead", subject: "Evaluador de propiedades" });

      /* Encabezado */
      fill(C.dark); doc.rect(0, 0, W, 48, "F");
      fill(C.morada); doc.circle(W - 8, -6, 46, "F");
      if (logo) doc.addImage(logo.data, "PNG", M, 11, 22, 22 * logo.ratio);
      color(C.lila); font("bold", 7.5); doc.text("EVALUADOR DE PROPIEDADES", 48, 16, { charSpace: 0.6 });
      color(C.cream); font("bold", 19); doc.text("Potencial estimado de tu propiedad", 48, 26);
      font("normal", 10); doc.text("Preparado para " + L.nombre + " " + L.apellido + "  ·  " + fecha(r.fecha), 48, 33.5);
      color(C.lila); font("normal", 7.5); doc.text("Referencia " + r.id, 48, 39);

      /* Saludo */
      var y = 59;
      var objeto = (L.proyecto ? L.proyecto + " (" : "") + I.tipoInmueble + " en " + L.ciudad + (r.resultado.unidades > 1 ? ", " + r.resultado.unidades + " unidades" : "") + (L.proyecto ? ")" : "");
      color(C.ink); font("bold", 12); doc.text("Hola " + L.nombre + ",", M, y);
      font("normal", 10); color(C.gris);
      var saludo = doc.splitTextToSize("Este es un aproximado del potencial de " + objeto + " en renta corta operada por Ahead. Lo calculamos con referencias del mercado y los datos que nos compartiste; es una estimación para empezar la conversación, no una promesa de ingresos.", CW);
      doc.text(saludo, M, y + 6);
      y += 6 + saludo.length * 4.6 + 3;

      /* Cifra principal */
      fill(C.cream); doc.roundedRect(M, y, CW, 34, 4, 4, "F");
      color(C.morada); font("bold", 7.5); doc.text("INGRESO BRUTO MENSUAL ESTIMADO · ESCENARIO MEDIO", M + 7, y + 9, { charSpace: 0.4 });
      color(C.dark); font("bold", 30); doc.text(fmt(m.mensual), M + 7, y + 22);
      color(C.gris); font("normal", 9); doc.text("al mes, por todo el proyecto", M + 7, y + 28.5);
      var rx = M + CW - 7;
      color(C.gris); font("normal", 8); doc.text("Rango mensual", rx, y + 15, { align: "right" });
      color(C.dark); font("bold", 11); doc.text(fmt(E.conservador.mensual) + " – " + fmt(E.alto.mensual), rx, y + 22, { align: "right" });
      color(C.gris); font("normal", 8); doc.text("conservador – alto", rx, y + 27.5, { align: "right" });
      y += 39;

      /* Indicadores */
      var stats = [["Tarifa promedio", fmt(m.tarifa), "por noche, por unidad"], ["Ocupación estimada", m.ocupacion + " %", "del mes"],
                   ["Noches ocupadas", String(m.noches), "al mes, por unidad"], ["Ingreso anual", fmt(m.anual), "escenario medio"]];
      var gw = (CW - 3 * 4) / 4;
      stats.forEach(function (s, i) {
        var x = M + i * (gw + 4);
        doc.setDrawColor(C.linea[0], C.linea[1], C.linea[2]); doc.setLineWidth(0.3);
        doc.roundedRect(x, y, gw, 22, 3, 3, "S");
        color(C.gris); font("normal", 7.5); doc.text(s[0], x + 4, y + 6.5);
        color(C.dark); font("bold", s[1].length > 12 ? 10.5 : 12.5); doc.text(s[1], x + 4, y + 13.5);
        color(C.gris); font("normal", 7); doc.text(s[2], x + 4, y + 18.5);
      });
      y += 33;

      /* Escenarios */
      color(C.ink); font("bold", 11); doc.text("Escenarios", M, y); y += 5;
      var cols = [M, M + 52, M + 88, M + 120, M + CW];
      fill(C.lila); doc.rect(M, y, CW, 7, "F");
      color(C.gris); font("bold", 7.5);
      doc.text("ESCENARIO", cols[0] + 3, y + 4.8); doc.text("TARIFA / NOCHE", cols[1], y + 4.8);
      doc.text("OCUPACIÓN", cols[2], y + 4.8); doc.text("MENSUAL", cols[3], y + 4.8); doc.text("ANUAL", cols[4] - 3, y + 4.8, { align: "right" });
      y += 7;
      [["conservador", "Conservador"], ["medio", "Medio"], ["alto", "Alto"]].forEach(function (k) {
        var e = E[k[0]], medio = k[0] === "medio";
        if (medio) { fill(C.cream); doc.rect(M, y, CW, 8, "F"); }
        color(medio ? C.dark : C.ink); font(medio ? "bold" : "normal", 9.5);
        doc.text(k[1], cols[0] + 3, y + 5.4); doc.text(fmt(e.tarifa), cols[1], y + 5.4);
        doc.text(e.ocupacion + " %", cols[2], y + 5.4); doc.text(fmt(e.mensual), cols[3], y + 5.4);
        doc.text(fmt(e.anual), cols[4] - 3, y + 5.4, { align: "right" });
        doc.setDrawColor(C.linea[0], C.linea[1], C.linea[2]); doc.line(M, y + 8, M + CW, y + 8);
        y += 8;
      });
      y += 7;

      /* Datos del inmueble */
      color(C.ink); font("bold", 11); doc.text("Datos que usamos", M, y); y += 6;
      var amen = (I.amenidades || []).join(", ") + (I.amenidadesOtras ? ((I.amenidades || []).length ? ", " : "") + I.amenidadesOtras : "");
      var datos = [["Tipo de proyecto", L.tipoProyecto], ["Tipo de inmueble", I.tipoInmueble], ["Unidades", String(r.resultado.unidades)],
                   ["Ciudad", L.ciudad + (I.zona ? " · " + I.zona : "")], ["Dirección", L.direccion], ["Estrato", I.estrato],
                   ["Habitaciones / baños", I.habitaciones + " / " + I.banos], ["Área por unidad", I.area ? I.area + " m²" : ""],
                   ["Ubicación", I.ubicacion], ["Amoblado", I.amoblado], ["Estado", I.estado], ["Amenidades", amen]]
        .filter(function (d) { return d[1]; });
      var NC = 3, colW = CW / NC, filas = Math.ceil(datos.length / NC), y0 = y, alto = 0;
      datos.forEach(function (d, i) {
        var x = M + Math.floor(i / filas) * colW, yy = y0 + (i % filas) * 7.6;
        color(C.gris); font("normal", 7.5); doc.text(d[0], x, yy);
        color(C.ink); font("normal", 9);
        var v = doc.splitTextToSize(String(d[1]), colW - 6).slice(0, 2);
        if (v.length > 1) font("normal", 8);
        doc.text(v, x, yy + 3.7);
        alto = Math.max(alto, (i % filas) * 7.6 + 7.6 + (v.length - 1) * 3.4);
      });
      y = y0 + alto + 3;

      /* Aviso */
      var aviso = doc.splitTextToSize("Esto es una estimación, no una proyección financiera garantizada. Son ingresos brutos: no incluyen comisiones de plataformas ni de operación, impuestos, servicios, administración, aseo ni inversión en dotación. El resultado real depende de la temporada, la demanda, la normativa y las condiciones del inmueble.", CW - 12);
      var ah = aviso.length * 3.6 + 6;
      fill([254, 240, 232]); doc.setDrawColor(C.naranja[0], C.naranja[1], C.naranja[2]); doc.setLineWidth(0.3);
      doc.roundedRect(M, y, CW, ah, 3, 3, "FD");
      color(C.ink); font("normal", 8); doc.text(aviso, M + 6, y + 5.5);
      y += ah + 5;

      /* CTA WhatsApp */
      var ch = 27;
      if (y + ch > 286) { doc.addPage(); y = 20; }
      fill(C.dark); doc.roundedRect(M, y, CW, ch, 4, 4, "F");
      color(C.cream); font("bold", 13); doc.text("Hablemos de tu propiedad", M + 8, y + 10);
      color(C.lila); font("normal", 9); doc.text("Agenda una reunión con un asesor de Ahead en los próximos días.", M + 8, y + 15.5);
      var bw = 60, bx = M + CW - 7 - bw, by = y + (ch - 10) / 2;
      fill(C.naranja); doc.roundedRect(bx, by, bw, 10, 5, 5, "F");
      color(C.dark); font("bold", 9.5); doc.text("Escribir por WhatsApp", bx + bw / 2, by + 6.5, { align: "center" });
      doc.link(bx, by, bw, 10, { url: opts.whatsapp });
      color(C.cream); font("bold", 8.5); doc.text("WhatsApp " + opts.numero, M + 8, y + 22);
      doc.link(M + 8, y + 18, 60, 6, { url: opts.whatsapp });

      /* Pie */
      color(C.gris); font("normal", 7.5);
      doc.text("Operamos tu potencial.  ·  Ahead · Colombia", M, 292);
      doc.text("Modelo " + String(r.resultado.modelo || "").split(" · ")[0], M + CW, 292, { align: "right" });

      var nombre = ("Ahead-Potencial-" + L.nombre + "-" + L.apellido).normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9-]+/g, "-");
      doc.save(nombre + ".pdf");
      return doc;
    });
  }

  window.AheadPDF = { generar: generar };
})();
