/* ============================================================
   AHEAD · LINKS — ARCHIVO DE CONTENIDO
   Este es el ÚNICO archivo que hay que tocar para actualizar el sitio.

   Cómo editar:
   - Cambiar un link  → reemplaza el texto entre comillas de "url".
   - Ocultar un link  → cambia estado: "activo" por estado: "pendiente".
   - Activar un link  → pon la url real y cambia estado a "activo".
   - Reordenar        → mueve el bloque { ... } completo arriba o abajo.
   - Agregar un link  → copia un bloque { ... }, pégalo y cambia sus datos.
   Los links en "pendiente" NO se muestran al público.

   Íconos disponibles: web, instagram, tiktok, linkedin, facebook, x, whatsapp, evaluar
   Estilos de botón:   "destacado" (naranja), "claro" (crema), "contorno" (borde crema), "red" (lista de redes)
   ============================================================ */

window.AHEAD = {
  frase: "Operamos tu potencial.",
  bajada: "Somos quienes hacen que un lugar funcione mejor, se sienta mejor y llegue más lejos.",
  linea: "Desde 2018",   // se muestra en mayúsculas con tracking 200
  firma: "Always Ahead.",

  grupos: [
    {
      titulo: "Hablemos",
      links: [
        {
          texto: "Hablemos de tu propiedad",
          detalle: "Propietarios e inversionistas",
          url: "https://wa.me/573142701520?text=Hola%20Ahead%2C%20quiero%20hablar%20de%20mi%20propiedad.",
          icono: "whatsapp",
          estilo: "destacado",
          estado: "activo"
        },
        {
          texto: "Reserva tu estadía",
          detalle: "Huéspedes y reservas",
          url: "https://api.whatsapp.com/send?phone=573212489748&text=Hola%20Ahead%2C%20quiero%20reservar%20una%20estad%C3%ADa.",
          icono: "whatsapp",
          estilo: "claro",
          estado: "activo"
        },
        {
          texto: "Evalúa tu propiedad",
          detalle: "Descubre cuánto podría generar en 2 minutos",
          url: "https://weareahead.github.io/evaluador/",
          icono: "evaluar",
          estilo: "contorno",
          estado: "activo"
        }
      ]
    },
    {
      titulo: "Conócenos",
      links: [
        {
          texto: "Sitio web",
          detalle: "weareahead.co",
          url: "https://weareahead.co/",
          icono: "web",
          estilo: "red",
          estado: "activo"
        },
        {
          texto: "Instagram",
          detalle: "@weareahead",
          url: "https://www.instagram.com/weareahead/",
          icono: "instagram",
          estilo: "red",
          estado: "activo"
        },
        {
          texto: "TikTok",
          detalle: "@weareahead",
          url: "https://www.tiktok.com/@weareahead",
          icono: "tiktok",
          estilo: "red",
          estado: "activo"
        },
        {
          texto: "LinkedIn",
          detalle: "We Are Ahead",
          url: "https://www.linkedin.com/company/we-are-ahead",
          icono: "linkedin",
          estilo: "red",
          estado: "activo"
        },
        {
          texto: "Facebook",
          detalle: "We Are Ahead",
          url: "https://www.facebook.com/weareahead1",
          icono: "facebook",
          estilo: "red",
          estado: "activo"
        },
        {
          texto: "X",
          detalle: "",
          url: "",
          icono: "x",
          estilo: "red",
          estado: "pendiente"
        }
      ]
    }
  ]
};
