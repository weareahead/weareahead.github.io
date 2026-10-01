# Microsite Ahead Links

Micrositio tipo Linktree de Ahead para el QR de Expohost 2026 y la bio de redes.
Mobile-first, sin dependencias, estático: se publica gratis en GitHub Pages.

## Estructura

| Archivo | Qué es | ¿Se edita? |
|---|---|---|
| `links.js` | Frase, bajada y **todos los links** (texto, url, ícono, estado) | **Sí, aquí se hace todo** |
| `index.html` | Diseño y lógica de la página | Solo para cambios de diseño |
| `assets/` | Logo, isotipo, tipografías, imagen para compartir (og), ícono de iPhone | Solo si cambia la marca |
| `favicon.ico` | Ícono de la pestaña | No |

## Cómo editar un link

1. Abrir `links.js`.
2. Buscar el bloque del link y cambiar `url`, `texto` o `detalle`.
3. Para **mostrar** Facebook o X: poner la url real y cambiar `estado: "pendiente"` por `estado: "activo"`.
4. Para **ocultar** un link sin borrarlo: `estado: "pendiente"`.
5. Guardar y subir (commit). GitHub Pages actualiza el sitio en 1–2 minutos. **El QR no cambia.**

## Sistema visual (Brandbook Ahead V1.0)

- Fondo en degradado vertical: Morada `#5C1F63` arriba → Dark Morada `#3B0B45` abajo (decisión 01-oct-2026, invertido el mismo día; excepción consciente a la regla de fondo sólido del brandbook). Marca de agua con la silueta del isotipo en Morada.
- Logo vertical versión Cream (archivo maestro `Logo_V_Blanco_Ahead.svg`).
- Acento único: Naranja `#F76F26` en el botón de propietarios. Cream `#F4F0E8` en el de reservas.
- Titulares: Outfit (sustituto de Aeonik mientras no haya licencia web). Cuerpo: DM Sans.
  Para pasar a Aeonik: agregar su `.woff2` en `assets/fonts/` y un `@font-face` con `font-family:"Aeonik"`; el sitio ya lo prioriza.
- Botones píldora, tarjetas de 20 px, íconos Material Symbols Rounded 300.

## Dónde vive

- Código: `~/Desktop/Work/Ahead/Links_Ahead` (fuera del drive, igual que la landing).
- Publicado: GitHub Pages (ver URL en la configuración del repositorio → Pages).
