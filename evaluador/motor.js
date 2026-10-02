/* Motor de estimación del Evaluador de Propiedades Ahead.
   Lee los supuestos de config.js (window.AHEAD_EVAL.modelo).
   Función pura: estimar(inmueble) -> resultado. Sin efectos secundarios. */
(function () {
  function n(v, d) { return typeof v === "number" && isFinite(v) ? v : d; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function redondear(v, paso) { return Math.round(v / paso) * paso; }

  function estimar(x) {
    var M = window.AHEAD_EVAL.modelo;
    var ciudad = M.ciudades[x.ciudad] || M.ciudades["Otra"];
    var hab = n(M.habitaciones[x.habitaciones], 1);
    var est = n(M.estrato[x.estrato], 1);
    var ubi = M.ubicacion[x.ubicacion] || { tarifa: 1, ocupacion: 0 };
    var amob = n(M.amoblado[x.amoblado], 1);
    var edo = M.estado[x.estado] || { tarifa: 1, ocupacion: 0 };

    var amen = 0;
    (x.amenidades || []).forEach(function (a) { amen += n(M.amenidades[a], 0); });
    amen = Math.min(amen, M.amenidadesTope);

    var tarifaBase = ciudad.tarifa * hab * est * ubi.tarifa * amob * edo.tarifa * (1 + amen);
    var ocupBase = ciudad.ocupacion + ubi.ocupacion + edo.ocupacion;

    var unidades = Math.max(1, Math.round(n(Number(x.unidades), 1)));
    // 1 + 0.95 + 0.95 ... : la primera unidad completa, las demás con descuento.
    var factorUnidades = 1 + (unidades - 1) * M.factorMultiunidad;

    var escenarios = {};
    ["conservador", "medio", "alto"].forEach(function (k) {
      var e = M.escenarios[k];
      var tarifa = redondear(tarifaBase * e.tarifa, 1000);
      var ocup = clamp(ocupBase + e.ocupacion, M.ocupacionMin, M.ocupacionMax);
      var noches = ocup * M.nochesMes;
      var mensualUnidad = tarifa * noches;
      var mensual = redondear(mensualUnidad * factorUnidades, 10000);
      escenarios[k] = {
        tarifa: tarifa,
        ocupacion: Math.round(ocup * 100),
        noches: Math.round(noches),
        mensual: mensual,
        anual: mensual * 12
      };
    });

    var variables = [
      ["Ciudad", x.ciudad + " · base " + fmt(ciudad.tarifa) + "/noche, " + Math.round(ciudad.ocupacion * 100) + " % ocupación"],
      ["Habitaciones", x.habitaciones + " (×" + hab.toFixed(2) + ")"],
      ["Estrato", x.estrato + " (×" + est.toFixed(2) + ")"],
      ["Ubicación", x.ubicacion],
      ["Amoblado", x.amoblado],
      ["Estado", x.estado],
      ["Amenidades", (x.amenidades || []).length ? x.amenidades.join(", ") + " (+" + Math.round(amen * 100) + " %)" : "Ninguna"],
      ["Unidades", String(unidades)]
    ];

    return {
      escenarios: escenarios,
      variables: variables,
      unidades: unidades,
      modelo: M.version
    };
  }

  // Puntaje comercial del lead (0–100) y factores de riesgo.
  function calificar(lead, x, r) {
    var M = window.AHEAD_EVAL.modelo;
    var p = 0, riesgos = [], fortalezas = [];
    if (M.ciudadesOperadas.indexOf(x.ciudad) >= 0) { p += 25; fortalezas.push("Ciudad donde Ahead opera"); }
    else if (x.ciudad !== "Otra") { p += 10; riesgos.push("Ciudad fuera de la operación actual"); }
    else riesgos.push("Ciudad no cubierta");

    var med = r.escenarios.medio.mensual;
    if (med >= M.ingresoMensualAtractivo) { p += 20; fortalezas.push("Ingreso estimado atractivo"); }
    else if (med >= M.ingresoMensualAtractivo * 0.6) p += 10;
    else riesgos.push("Ingreso estimado bajo");

    if (x.ph === "Sí") { p += 20; fortalezas.push("Reglamento permite renta corta"); }
    else if (x.ph === "No sé") { p += 8; riesgos.push("Reglamento de propiedad horizontal sin confirmar"); }
    else if (x.ph === "No") riesgos.push("Reglamento no permite renta corta");
    else p += 20; // casas sin propiedad horizontal

    if (x.rnt === "Sí") p += 5; else if (x.rnt === "En trámite") p += 3; else riesgos.push("Sin RNT");

    if (x.amoblado === "Sí, listo para huéspedes") p += 10;
    else if (x.amoblado === "Sí, básico") p += 6;
    else { p += 2; riesgos.push("Requiere dotación"); }

    if (x.estado === "Nuevo o remodelado") p += 10;
    else if (x.estado === "Buen estado") p += 7;
    else { p += 2; riesgos.push("Requiere mejoras"); }

    if (lead.tipoProyecto && lead.tipoProyecto !== "Unidad individual") { p += 10; fortalezas.push("Proyecto de varias unidades"); }
    else p += 5;

    p = Math.min(100, p);
    var clase = p >= M.umbralPrioritario ? "Prioritario" : p >= M.umbralPotencial ? "Potencial" : "Bajo potencial";
    if (x.ph === "No") clase = "No viable";
    return { puntaje: p, clase: clase, riesgos: riesgos, fortalezas: fortalezas };
  }

  function fmt(v) {
    return "$" + Math.round(v).toLocaleString("es-CO");
  }
  function fmtCorto(v) {
    if (v >= 1e9) return "$" + (v / 1e9).toLocaleString("es-CO", { maximumFractionDigits: 1 }) + " mil M";
    if (v >= 1e6) return "$" + (v / 1e6).toLocaleString("es-CO", { maximumFractionDigits: 1 }) + " M";
    return fmt(v);
  }

  window.AheadMotor = { estimar: estimar, calificar: calificar, fmt: fmt, fmtCorto: fmtCorto };
})();
