/* =====================================================================
   EVALUADOR DE PROPIEDADES AHEAD — CONFIGURACIÓN
   ---------------------------------------------------------------------
   Este es el ÚNICO archivo que hay que tocar para:
   1. Conectar la hoja de cálculo (endpoint del Apps Script).
   2. Ajustar los supuestos del motor de estimación (tarifas, ocupación,
      multiplicadores) cuando Daniel o Lina entreguen datos reales.
   3. Cambiar la lista de asesores del stand.

   Al editar este archivo, sube también el ?v= de los <script> en
   evaluador/index.html y equipo/index.html para que los celulares no usen
   una copia vieja.

   Versión del modelo: súbela cada vez que cambies un supuesto. Queda
   guardada con cada evaluación para saber con qué números se calculó.
   ===================================================================== */
window.AHEAD_EVAL = {

  /* ---------- Conexión ---------- */
  // URL del Web App de Google Apps Script (termina en /exec). Vacío = las
  // evaluaciones quedan en cola en el dispositivo hasta que se configure.
  endpoint: "https://script.google.com/macros/s/AKfycbxuXhO_6-Yv9lrJ7pcjBofT4lPqX_j2kD8xzVrrFGBq-H-H6st1fwcotFBXQI_w4dQP/exec",

  // Link a la hoja de cálculo (solo se muestra en el panel del equipo).
  hojaUrl: "https://docs.google.com/spreadsheets/d/1V2pylFWbQc-5oo-2qWM1mmL9cYyXRCxNVVX3DTaq3Jk/edit",

  // Política de tratamiento de datos de Ahead (si existe una URL pública).
  politicaDatosUrl: "",

  // WhatsApp de propietarios (botón final del resultado).
  whatsapp: "https://wa.me/573142701520?text=Hola%20Ahead%2C%20acabo%20de%20evaluar%20mi%20propiedad%20y%20quiero%20hablar%20con%20un%20asesor.",

  /* ---------- Equipo en el stand ---------- */
  // Nombres del campo opcional "¿Te está atendiendo alguien de Ahead?".
  // PENDIENTE: confirmar quién estará en el stand y editar esta lista.
  asesores: ["Daniel", "Lina", "Otra persona de Ahead"],

  /* ---------- Motor de estimación ---------- */
  modelo: {
    version: "1.0 · Referencia de mercado (Airbtics/AirDNA 2025) · oct-2026",

    // Base por ciudad para 1 habitación, estrato 4, amoblado, buen estado,
    // operado profesionalmente. Tarifa en COP por noche; ocupación 0–1.
    // Fuente inicial: medianas de mercado 2025 (Bogotá ADR ~USD 36 / 56 %,
    // Medellín ~USD 50 / 63 %, Cartagena ~USD 85 / 56 %) ajustadas al
    // segmento gestionado. REEMPLAZAR con datos reales de Ahead.
    ciudades: {
      "Bogotá":            { tarifa: 210000, ocupacion: 0.62 },
      "Medellín":          { tarifa: 230000, ocupacion: 0.66 },
      "Cartagena":         { tarifa: 420000, ocupacion: 0.58 },
      "Santa Marta":       { tarifa: 300000, ocupacion: 0.55 },
      "Cali":              { tarifa: 180000, ocupacion: 0.52 },
      "Barranquilla":      { tarifa: 190000, ocupacion: 0.52 },
      "San Andrés":        { tarifa: 380000, ocupacion: 0.60 },
      "Eje Cafetero":      { tarifa: 170000, ocupacion: 0.50 },
      "Girardot / Anapoima": { tarifa: 330000, ocupacion: 0.40 },
      "Otra":              { tarifa: 180000, ocupacion: 0.48 }
    },

    // Ciudades donde Ahead opera hoy (suman en el puntaje del lead).
    ciudadesOperadas: ["Bogotá", "Medellín", "Cartagena"],

    habitaciones: { "Estudio": 0.80, "1": 1.00, "2": 1.35, "3": 1.70, "4": 2.00, "5+": 2.40 },
    estrato:      { "2": 0.75, "3": 0.85, "4": 1.00, "5": 1.12, "6": 1.25 },

    // Ubicación: multiplica tarifa y suma/resta puntos de ocupación.
    ubicacion: {
      "Zona turística o corporativa": { tarifa: 1.08, ocupacion: 0.05 },
      "Buena conectividad":           { tarifa: 1.00, ocupacion: 0.00 },
      "Residencial / alejada":        { tarifa: 0.88, ocupacion: -0.08 }
    },
    amoblado: {
      "Sí, listo para huéspedes": 1.00,
      "Sí, básico":               0.92,
      "No":                       0.90
    },
    estado: {
      "Nuevo o remodelado": { tarifa: 1.05, ocupacion: 0.02 },
      "Buen estado":        { tarifa: 1.00, ocupacion: 0.00 },
      "Requiere mejoras":   { tarifa: 0.88, ocupacion: -0.05 }
    },
    // Suma porcentual sobre la tarifa (tope en amenidadesTope).
    amenidades: {
      "Piscina": 0.05, "Vista": 0.04, "Balcón o terraza": 0.03, "Parqueadero": 0.03,
      "Gimnasio": 0.02, "Coworking": 0.02, "Aire acondicionado": 0.03,
      "Jacuzzi o BBQ": 0.03, "Pet friendly": 0.01, "Lavadora": 0.01
    },
    amenidadesTope: 0.18,

    // Proyectos de varias unidades: cada unidad adicional rinde un poco
    // menos (compiten entre sí en el mismo edificio).
    factorMultiunidad: 0.95,

    // Escenarios sobre el caso medio.
    escenarios: {
      conservador: { tarifa: 0.88, ocupacion: -0.10 },
      medio:       { tarifa: 1.00, ocupacion: 0.00 },
      alto:        { tarifa: 1.12, ocupacion: 0.08 }
    },
    ocupacionMin: 0.20,
    ocupacionMax: 0.85,
    nochesMes: 30.4,

    // Clasificación del lead en el panel (puntaje 0–100).
    umbralPrioritario: 70,
    umbralPotencial: 45,
    // Ingreso mensual medio a partir del cual el inmueble suma puntos.
    ingresoMensualAtractivo: 4000000
  }
};
