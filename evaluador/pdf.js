/* Resumen en PDF para el propietario — Evaluador de propiedades Ahead.
   Usa jsPDF (cdnjs). Una página A4 con marca, cifras, datos del inmueble,
   aviso de estimación, CTA a WhatsApp y «Conoce más de Ahead» con redes y web enlazados. */
(function () {
  var C = { dark: [59, 11, 69], morada: [92, 31, 99], naranja: [247, 111, 38], cream: [244, 240, 232],
            lila: [239, 235, 253], ink: [42, 8, 50], gris: [107, 88, 114], linea: [228, 220, 230], blanco: [255, 255, 255] };
  var MESES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];

  function fmt(v) { return "$" + Math.round(Number(v) || 0).toLocaleString("es-CO"); }
  function fecha(iso) { var d = new Date(iso); return d.getDate() + " de " + MESES[d.getMonth()] + " de " + d.getFullYear(); }

  /* Redes de Ahead para el bloque «Conoce más de Ahead» (mismos íconos y enlaces del microsite de Links). */
  var REDES = [{"k": "web", "t": "Sitio web", "url": "https://weareahead.co/", "vb": "0 -960 960 960", "p": "M331.27-129.96q-69.35-29.96-120.85-81.27-51.5-51.31-80.96-120.96Q100-401.85 100-481.42q0-79.58 29.46-148.62t80.96-120.34q51.5-51.31 120.85-80.46Q400.62-860 480-860t148.73 29.16q69.35 29.15 120.85 80.46 51.5 51.3 80.96 120.34Q860-561 860-481.42q0 79.57-29.46 149.23-29.46 69.65-80.96 120.96-51.5 51.31-120.85 81.27Q559.38-100 480-100t-148.73-29.96ZM480-143.39q37.31-40.23 61.38-87.3 24.08-47.08 39.47-110.31H379.77q15.15 62.31 39.23 110.11 24.08 47.81 61 87.5Zm-63.46-8.15q-28.08-36.46-49.73-84.88-21.66-48.43-34.04-104.58H173.54q38.38 77.54 96.46 122.46 58.08 44.93 146.54 67Zm127.92-.61q78.54-17.62 142-66.7 63.46-49.07 100-122.15H627.85q-14.93 56.31-36.08 104.35-21.16 48.03-47.31 84.5ZM158.92-386.38h165.54q-3.77-27.39-4.84-50.43-1.08-23.04-1.08-44.81 0-24.23 1.38-45.84 1.39-21.62 5.16-46.77H158.92q-7.38 23.23-10.46 44.92-3.07 21.69-3.07 47.69 0 26.39 3.07 49 3.08 22.62 10.46 46.24Zm212.16 0h218.46q4.38-30.23 5.77-51.47 1.38-21.23 1.38-43.77 0-21.53-1.38-41.96-1.39-20.42-5.77-50.65H371.08q-4.39 30.23-5.77 50.65-1.39 20.43-1.39 41.96 0 22.54 1.39 43.77 1.38 21.24 5.77 51.47Zm263.84 0h166.16q7.38-23.62 10.46-46.24 3.07-22.61 3.07-49 0-26-3.07-47.69-3.08-21.69-10.46-44.92H635.92q3.39 33.08 4.77 53.88 1.39 20.81 1.39 38.73 0 22.39-1.7 44-1.69 21.62-5.46 51.24Zm-7.69-233.23h159.23q-35.31-76.7-97.81-125.2t-145.19-64.04q28.08 37.77 49.04 84.81t34.73 104.43Zm-247.46 0h202.08q-13.31-56.47-39.5-106.54-26.2-50.08-62.35-89.23-33.92 31.23-57.27 77.15t-42.96 118.62Zm-206.23 0h159.85q12.53-55.54 33-102.08 20.46-46.54 49.15-86.54-82.69 15.92-144.08 63.61-61.38 47.7-97.92 125.01Z"}, {"k": "instagram", "t": "Instagram", "url": "https://www.instagram.com/weareahead/", "vb": "0 0 24 24", "p": "M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077"}, {"k": "tiktok", "t": "TikTok", "url": "https://www.tiktok.com/@weareahead", "vb": "0 0 24 24", "p": "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"}, {"k": "linkedin", "t": "LinkedIn", "url": "https://www.linkedin.com/company/we-are-ahead", "vb": "0 0 24 24", "p": "M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z"}, {"k": "facebook", "t": "Facebook", "url": "https://www.facebook.com/weareahead1", "vb": "0 0 24 24", "p": "M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"}];

  // Convierte cada ícono (path SVG) en un PNG color crema para incrustarlo en el PDF.
  function iconosPng() {
    var out = {};
    REDES.forEach(function (r) {
      try {
        var vb = r.vb.split(/\s+/).map(Number), px = 96;
        var cv = document.createElement("canvas"); cv.width = px; cv.height = px;
        var ctx = cv.getContext("2d"), s = px / Math.max(vb[2], vb[3]);
        ctx.setTransform(s, 0, 0, s, -vb[0] * s, -vb[1] * s);
        ctx.fillStyle = "rgb(244,240,232)"; ctx.fill(new Path2D(r.p));
        out[r.k] = cv.toDataURL("image/png");
      } catch (e) {}
    });
    return out;
  }

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
      fill(C.dark); doc.rect(0, 0, W, 46, "F");
      fill(C.morada); doc.circle(W - 8, -6, 46, "F");
      if (logo) doc.addImage(logo.data, "PNG", M, 11, 22, 22 * logo.ratio);
      color(C.lila); font("bold", 7.5); doc.text("EVALUADOR DE PROPIEDADES", 48, 16, { charSpace: 0.6 });
      color(C.cream); font("bold", 19); doc.text("Potencial estimado de tu propiedad", 48, 26);
      font("normal", 10); doc.text("Preparado para " + L.nombre + " " + L.apellido + "  ·  " + fecha(r.fecha), 48, 33.5);
      color(C.lila); font("normal", 7.5); doc.text("Referencia " + r.id, 48, 39);

      /* Saludo */
      var y = 55;
      var objeto = (L.proyecto ? L.proyecto + " (" : "") + I.tipoInmueble + " en " + L.ciudad + (r.resultado.unidades > 1 ? ", " + r.resultado.unidades + " unidades" : "") + (L.proyecto ? ")" : "");
      color(C.ink); font("bold", 12); doc.text("Hola " + L.nombre + ",", M, y);
      font("normal", 10); color(C.gris);
      var saludo = doc.splitTextToSize("Este es un aproximado del potencial de " + objeto + " en renta corta operada por Ahead. Lo calculamos con referencias del mercado y los datos que nos compartiste; es una estimación para empezar la conversación, no una promesa de ingresos.", CW);
      doc.text(saludo, M, y + 6);
      y += 6 + saludo.length * 4.6 + 2;

      /* Cifra principal */
      fill(C.cream); doc.roundedRect(M, y, CW, 34, 4, 4, "F");
      color(C.morada); font("bold", 7.5); doc.text("INGRESO BRUTO MENSUAL ESTIMADO · ESCENARIO MEDIO", M + 7, y + 9, { charSpace: 0.4 });
      color(C.dark); font("bold", 30); doc.text(fmt(m.mensual), M + 7, y + 22);
      color(C.gris); font("normal", 9); doc.text("al mes, por todo el proyecto", M + 7, y + 28.5);
      var rx = M + CW - 7;
      color(C.gris); font("normal", 8); doc.text("Rango mensual", rx, y + 15, { align: "right" });
      color(C.dark); font("bold", 11); doc.text(fmt(E.conservador.mensual) + " – " + fmt(E.alto.mensual), rx, y + 22, { align: "right" });
      color(C.gris); font("normal", 8); doc.text("conservador – alto", rx, y + 27.5, { align: "right" });
      y += 37;

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
      y += 28;

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
        if (medio) { fill(C.cream); doc.rect(M, y, CW, 7.4, "F"); }
        color(medio ? C.dark : C.ink); font(medio ? "bold" : "normal", 9.5);
        doc.text(k[1], cols[0] + 3, y + 5); doc.text(fmt(e.tarifa), cols[1], y + 5);
        doc.text(e.ocupacion + " %", cols[2], y + 5); doc.text(fmt(e.mensual), cols[3], y + 5);
        doc.text(fmt(e.anual), cols[4] - 3, y + 5, { align: "right" });
        doc.setDrawColor(C.linea[0], C.linea[1], C.linea[2]); doc.line(M, y + 7.4, M + CW, y + 7.4);
        y += 7.4;
      });
      y += 6;

      /* Datos del inmueble */
      color(C.ink); font("bold", 11); doc.text("Datos que usamos", M, y); y += 6;
      var amen = (I.amenidades || []).join(", ") + (I.amenidadesOtras ? ((I.amenidades || []).length ? ", " : "") + I.amenidadesOtras : "");
      var datos = [["Tipo de proyecto", L.tipoProyecto], ["Tipo de inmueble", I.tipoInmueble], ["Unidades", String(r.resultado.unidades)],
                   ["Ciudad", L.ciudad + (I.zona ? " · " + I.zona : "")], ["Dirección", L.direccion], ["Estrato", I.estrato],
                   ["Habitaciones / baños", I.habitaciones + " / " + I.banos], ["Área por unidad", I.area ? I.area + " m2" : ""],
                   ["Ubicación", I.ubicacion], ["Amoblado", I.amoblado], ["Estado", I.estado], ["Amenidades", amen]]
        .filter(function (d) { return d[1]; });
      var NC = 3, colW = CW / NC, filas = Math.ceil(datos.length / NC), y0 = y, alto = 0;
      datos.forEach(function (d, i) {
        var x = M + Math.floor(i / filas) * colW, yy = y0 + (i % filas) * 7.1;
        color(C.gris); font("normal", 7.5); doc.text(d[0], x, yy);
        color(C.ink); font("normal", 9);
        var v = doc.splitTextToSize(String(d[1]), colW - 6);
        if (v.length > 2) { v = v.slice(0, 2); v[1] = v[1].replace(/[,\s]+$/, "") + "…"; }
        if (v.length > 1) font("normal", 8);
        doc.text(v, x, yy + 3.7);
        alto = Math.max(alto, (i % filas) * 7.1 + 7.1 + (v.length - 1) * 3.4);
      });
      y = y0 + alto + 3;

      /* Aviso */
      var aviso = doc.splitTextToSize("Esto es una estimación, no una proyección financiera garantizada. Son ingresos brutos: no incluyen comisiones de plataformas ni de operación, impuestos, servicios, administración, aseo ni inversión en dotación. El resultado real depende de la temporada, la demanda, la normativa y las condiciones del inmueble.", CW - 12);
      var ah = aviso.length * 3.6 + 6;
      fill([254, 240, 232]); doc.setDrawColor(C.naranja[0], C.naranja[1], C.naranja[2]); doc.setLineWidth(0.3);
      doc.roundedRect(M, y, CW, ah, 3, 3, "FD");
      color(C.ink); font("normal", 8); doc.text(aviso, M + 6, y + 5.5);
      y += ah + 3;

      /* CTA WhatsApp */
      var ch = 23;
      if (y + ch > 286) { doc.addPage(); y = 20; }
      fill(C.dark); doc.roundedRect(M, y, CW, ch, 4, 4, "F");
      color(C.cream); font("bold", 13); doc.text("Hablemos de tu propiedad", M + 8, y + 8.5);
      color(C.lila); font("normal", 9); doc.text("Agenda una reunión con un asesor de Ahead en los próximos días.", M + 8, y + 13.5);
      var bw = 60, bx = M + CW - 7 - bw, by = y + (ch - 10) / 2;
      fill(C.naranja); doc.roundedRect(bx, by, bw, 10, 5, 5, "F");
      color(C.dark); font("bold", 9.5); doc.text("Escribir por WhatsApp", bx + bw / 2, by + 6.5, { align: "center" });
      doc.link(bx, by, bw, 10, { url: opts.whatsapp });
      color(C.cream); font("bold", 8.5); doc.text("WhatsApp " + opts.numero, M + 8, y + 19);
      doc.link(M + 8, y + 15.5, 60, 5, { url: opts.whatsapp });
      y += ch + 3;

      /* Conoce más de Ahead: redes y sitio web, cada ícono con su enlace */
      var rh = 18;
      if (y + rh > 288) { doc.addPage(); y = 20; }
      var ico = iconosPng();
      fill(C.lila); doc.setDrawColor(C.linea[0], C.linea[1], C.linea[2]); doc.setLineWidth(0.3); doc.roundedRect(M, y, CW, rh, 4, 4, "FD");
      color(C.ink); font("bold", 11); doc.text("Conoce más de Ahead", M + 8, y + 8);
      color(C.morada); font("bold", 9); doc.text("weareahead.co", M + 8, y + 13.5);
      var wW = doc.getTextWidth("weareahead.co");
      doc.setDrawColor(C.morada[0], C.morada[1], C.morada[2]); doc.setLineWidth(0.3); doc.line(M + 8, y + 14.3, M + 8 + wW, y + 14.3);
      doc.link(M + 8, y + 10, wW, 5, { url: "https://weareahead.co/" });
      var d = 8.6, gap = 7.4, n = REDES.length, x0 = M + CW - 9 - (n * d + (n - 1) * gap), cy = y + 2.6;
      REDES.forEach(function (rd, i) {
        var x = x0 + i * (d + gap);
        fill(C.dark); doc.circle(x + d / 2, cy + d / 2, d / 2, "F");
        if (ico[rd.k]) doc.addImage(ico[rd.k], "PNG", x + 2.2, cy + 2.2, d - 4.4, d - 4.4);
        color(C.gris); font("normal", 6.2); doc.text(rd.t, x + d / 2, cy + d + 3.6, { align: "center" });
        doc.link(x - 2, cy - 1, d + 4, d + 5.5, { url: rd.url });
      });

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
