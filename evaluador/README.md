# Evaluador de propiedades Ahead

Microsite para Expohost 2026 y, si funciona, futura herramienta para propietarios en la web oficial.

Un solo link para todos (QR, stand, redes, Links): **https://weareahead.github.io/evaluador/**
Panel interno del equipo: **https://weareahead.github.io/equipo/** (inicio de sesión con el correo del equipo).

## Flujo
1. **Lead**: nombre, apellido, email, teléfono, empresa, cargo, proyecto, ciudad, tipo de proyecto, rol + autorización de datos (Ley 1581 de 2012).
2. **Inmueble**: tipo, unidades, zona, área, estrato, habitaciones, baños, ubicación, amoblado, estado, amenidades, reglamento P.H., RNT, inicio, arriendo actual.
3. **Resultado**: ingreso mensual y anual, tarifa, ocupación, noches, escenarios conservador–medio–alto, variables usadas y aviso de que es una estimación.
4. **Registro**: lead + inputs + resultado + calificación + fecha a Google Sheets. Si no hay internet, queda en cola en el dispositivo y se envía sola al reconectar.

## Conectar la hoja de cálculo (una vez)
Hoja: https://docs.google.com/spreadsheets/d/1V2pylFWbQc-5oo-2qWM1mmL9cYyXRCxNVVX3DTaq3Jk (cuenta ahead.hospitality@gmail.com).
1. Con la cuenta ahead.hospitality@gmail.com abrir la hoja → Extensiones → Apps Script.
2. Pegar `apps-script/Code.gs` y reemplazar `CLAVE_SHA256` por la huella de la contraseña del panel (la copia lista para pegar no está en este repo público).
3. Ejecutar `configurar` una vez y aceptar permisos (crea la pestaña "Evaluaciones").
4. Implementar → Nueva implementación → Aplicación web · Ejecutar como **Yo** · Acceso **Cualquier usuario** → copiar la URL `/exec`.
5. Pegar la URL en `config.js → endpoint`. Commit.

La hoja se descarga como Excel desde Archivo → Descargar → .xlsx.

## Panel del equipo
Inicio de sesión con correo + contraseña, verificados en el Apps Script (nunca en este repositorio). La sesión dura 7 días por dispositivo. 15 intentos fallidos bloquean el acceso 10 minutos. Para cambiar la contraseña: en el editor de Apps Script ejecutar `huella('nueva')`, pegar el resultado en `CLAVE_SHA256` y crear una nueva versión de la implementación.

## Ajustar el modelo
Todo está en `config.js → modelo` (tarifa y ocupación base por ciudad, multiplicadores, escenarios, umbrales de calificación). Al cambiar un supuesto, subir `modelo.version`: cada evaluación guarda la versión con la que se calculó.

Base actual: medianas de mercado de renta corta 2025 (Airbtics / AirDNA) ajustadas al segmento gestionado. Pendiente: reemplazar con datos reales de la operación de Ahead (Daniel / Lina).

## Calificación del lead (panel)
Puntaje 0–100: ciudad operada (25), ingreso estimado (20), reglamento P.H. (20), amoblado (10), estado (10), tipo de proyecto (10), RNT (5).
Prioritario ≥ 70 · Potencial ≥ 45 · Bajo potencial < 45 · **No viable** si el reglamento no permite renta corta.
