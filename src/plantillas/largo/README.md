# Plantilla `largo` — video largo 16:9 (1920×1080, 30 fps, 8:00–10:30)

Un trayecto contado en capítulos sobre el mapa de `ruta` (globo o plano, línea punteada progresiva, hitos con fecha,
contador de km y tiempo) con toda la dirección visual v2 (docs/DIRECCION-VISUAL.md). Por dentro el guion se **aplana**
a la forma de `ruta` (apertura = gancho, todos los bloques = escenas, cierre = remate) y reutiliza la voz, el plan, la
cámara v2, el validador de cámara R1–R5, las capas del mapa y el sonido. Lo propio: capas de pantalla 16:9
(`Capas16x9.tsx`), pausas sin voz (tarjeta de título 3,2 s y tarjeta de capítulo 2 s), capítulos con minuto y el
validador de ritmo (`modelo.ts` → `problemasDeRitmo`).

## Comandos

```bash
# Validar + voz + rechazos + props (no renderiza). --prueba acepta < 8 min.
npx tsx scripts/preparar-largo.mts contenido/largos/<id>.json
# Preparar + render por tramos (≤ 3 min, cortados en capítulo) bajo /tmp/bolita-render.lock + audio + bandeja.
npx tsx scripts/render-largo.mts contenido/largos/<id>.json
# Si se corta: volver a correr el mismo comando (con --sin-preparar si los props ya están) retoma desde el tramo que faltó.
# Prueba de la plantilla (10 s por capítulo, escala 0,5) → salida/pruebas/largo/<id>-muestra.mp4
npx tsx scripts/render-largo.mts src/plantillas/largo/ejemplo.json --escala 0.5 --muestra 10
```

Salida: `salida/bandeja/<id>.mp4` + `<id>.json` (`tipo: 'largo'`, `plantilla: 'largo'`, `capitulos: [{titulo, desde, marca}]`,
descripción = la del envoltorio + capítulos + fuentes + créditos, `miniatura` si el envoltorio la trae). diario.mts no
lo renderiza (los largos no cuentan para el colchón de Shorts) y `largo` NO está en `PLANTILLAS` (la rotación de Shorts
no lo elige). Los minutos de los capítulos también quedan en `salida/trabajo/<id>.capitulos.json`.

## Contrato (src/plantillas/largo/guion.ts, envoltorio `EnvoltorioLargo`)

```jsonc
{ "plantilla": "largo", "id": "largo-bushby", "titulo": "≤ 70", "descripcion": "sin hashtags", "hashtags": ["#geografia"], // nunca #shorts
  "miniatura": "salida/caratulas/x.png",                       // opcional
  "props": {
    "id": "largo-bushby", "acento": "cian",                    // amarillo|cian|coral
    "mapa": { "proyeccion": "globo", "fondo": "relieve", "kmReales": 49890, "puntos": [{ "lon": -70.91, "lat": -53.16, "etiqueta": "PUNTA ARENAS", "fecha": "1998-11-01" }, …] }, // 3–150 puntos, = MapaRuta
    "apertura": { "texto": "Mira esta línea… ¿Por qué tanto?", "planos": [{ "centro": [-70, -25], "zoom": 3.5, "entrada": "corte" }] }, // ≤ 20 s de voz, ≥ 1 plano
    "tarjetaTitulo": { "texto": "¿Por qué tardó 28 años a pie?", "clave": "28 AÑOS" },        // ≤ 52, sin voz
    "capitulos": [                                             // 3–8 (2 solo en pruebas)
      { "titulo": "La selva sin caminos",                      // ≤ 32: barra, tarjeta y capítulos de YouTube
        "bloques": [{ "texto": "…", "tramo": [0, 4], "planos": […], "etiquetas": […], "cotas": […], "tarjetas": […], "foto": {…}, "polaroid": {…}, "fuente": {…}, "contexto": {…}, "clave": […] }],
        "siguiente": { "texto": "Pero lo peor estaba al norte…", "planos": […] } } ],          // obligatorio salvo en el último
    "cierre": { "texto": "El hielo lo dejó pasar en dos semanas. Los papeles, en diez años.", "planos": […], "etiquetas": [{ "lon": -170, "lat": 66, "texto": "2 SEMANAS" }], "pie": "opcional", "segundosFinales": 12 },
    "fuentes": [{ "texto": "…", "url": "https://…" }] } }
```

Cada bloque admite los mismos campos v2 que una escena de `ruta` (`planos`, `areas`, `etiquetas`, `cotas`, `iconos`,
`resaltes`, `tarjetas`, `foto`, `polaroid`, `contexto`, `fuente`, `clave`, `indice`) más `tramo`. Bloque sin `planos` =
la cámara sigue la cabeza de la línea.

## Rechazos (preparar-largo)

Esquema · cámara R1–R5 (estimada al validar y con la voz real) · tramos de ruta al revés o que retroceden · "suscríbete"
en la voz · cifras con punto de miles en la voz ("28.000" → "veintiocho mil") · duración fuera de 8:00–10:30 · > 8 s sin
cambio visual (los micro-movimientos automáticos no cuentan; la línea que avanza sí) · capítulo > 150 s sin plano nuevo ·
tarjeta/contexto/fuente/foto/polaroid < 1 s · tarjeta/contexto/fuente con < 1 s por cada 3 palabras · apertura > 20 s ·
capítulo de YouTube < 10 s.

## Pantalla 16:9

Mapa a cuadro completo (cámara en y = 500, escala del globo referida a 1080 px) · barra de capítulo arriba a la izquierda
(segmentos + "2/5 · NOMBRE") · contador arriba a la derecha · subtítulos en bloques ≈ 50 px centrados en y = 900 entre
x = 300 y 1620 · nada en los 120 px de abajo · tarjeta de cifra arriba al centro · polaroid a un lado · fuente arriba a la
izquierda · cierre: línea punteada + "LÍNEA PUNTEADA" + pie arriba a la izquierda (libres el centro y la esquina 300×150 de
las tarjetas finales), fundido a negro en el último segundo. Sin marca en el resto del video.
