# Evaluador de propiedades Ahead

Microsite para Expohost 2026 y, si funciona, futura herramienta para propietarios en la web oficial.

| URL | Para quién |
|---|---|
| `/evaluador/` | Público (QR, redes, web). Origen se registra como `web`; con `?origen=qr` queda como `qr`. |
| `/evaluador/?modo=stand` | Tablet/celular del equipo en el stand: campo "Atendido por", contador de pendientes, sincronizar y respaldo CSV. |
| `/equipo/` | Panel interno con clave: leads, KPIs, calificación, proyección, seguimiento y exportar CSV. Tiene "Ver con datos de ejemplo". |

## Flujo
1. **Lead**: nombre, apellido, email, teléfono, empresa, cargo, proyecto, ciudad, tipo de proyecto, rol + autorización de datos (Ley 1581 de 2012).
2. **Inmueble**: tipo, unidades, zona, área, estrato, habitaciones, baños, ubicación, amoblado, estado, amenidades, reglamento P.H., RNT, inicio, arriendo actual.
3. **Resultado**: ingreso mensual y anual, tarifa, ocupación, noches, escenarios conservador–medio–alto, variables usadas y aviso de que es una estimación.
4. **Registro**: lead + inputs + resultado + calificación + fecha a Google Sheets. Si no hay internet, queda en cola en el dispositivo y se envía sola al reconectar.

## Conectar la hoja de cálculo (una vez, ~10 min)
1. En Google Drive (cuenta del equipo Ahead) crear una hoja: **Ahead · Evaluaciones de propiedades**.
2. Extensiones → Apps Script → pegar `apps-script/Code.gs` → cambiar `CLAVE_EQUIPO` (y opcionalmente `CORREO_AVISO`).
3. Ejecutar la función `configurar` una vez y aceptar permisos (crea la pestaña "Evaluaciones").
4. Implementar → Nueva implementación → Aplicación web · Ejecutar como **Yo** · Acceso **Cualquier usuario** → copiar la URL `/exec`.
5. En `config.js`: pegar la URL en `endpoint` y el link de la hoja en `hojaUrl`. Commit.
6. Probar: hacer una evaluación en `/evaluador/?modo=stand` y verla en la hoja y en `/equipo/`.

La clave real **no** se sube a este repositorio público: vive solo en el Apps Script.
La hoja se descarga como Excel desde Archivo → Descargar → .xlsx.

## Ajustar el modelo
Todo está en `config.js → modelo` (tarifa y ocupación base por ciudad, multiplicadores, escenarios, umbrales de calificación). Al cambiar un supuesto, subir `modelo.version`: cada evaluación guarda la versión con la que se calculó.

Base actual: medianas de mercado de renta corta 2025 (Airbtics / AirDNA) ajustadas al segmento gestionado. Pendiente: reemplazar con datos reales de la operación de Ahead (Daniel / Lina).

## Calificación del lead (panel)
Puntaje 0–100: ciudad operada (25), ingreso estimado (20), reglamento P.H. (20), amoblado (10), estado (10), tipo de proyecto (10), RNT (5).
Prioritario ≥ 70 · Potencial ≥ 45 · Bajo potencial < 45 · **No viable** si el reglamento no permite renta corta.
