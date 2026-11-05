# Plantilla `frontera`

Una frontera rara contada sobre un mapa en 2–3 minutos (Short 1080×1920, 60 fps, 110–175 s): satélite NASA o
vectores Natural Earth, líneas que se dibujan, marcadores, zoom lento continuo, rótulos enormes sincronizados con la
voz, subtítulos palabra a palabra, fotos de Commons y cierre de marca. Referente visual: Ñerd (ver docs/REFERENTES.md §2).

## Flujo
```bash
npx tsx scripts/preparar-frontera.mts contenido/guiones/<id>.json      # valida, voz, sonido, fotos, satélite → salida/trabajo/<id>.props.json
npx remotion render src/index.ts Frontera salida/bandeja/<id>.mp4 --props=salida/trabajo/<id>.props.json \
  --codec=h264 --crf=18 --concurrency=1 --x264-preset=veryfast --timeout=180000
```
El diario hace las dos cosas solo (promueve del backlog, prepara, renderiza bajo el lock compartido, escribe el json
de bandeja después del mp4). Sin `--props`, Studio muestra el guion de El Chamizal con tiempos estimados y mapa oscuro.

## Props (guion)
`GuionBase` (src/plantillas/comun/guion.ts: cabecera, gancho {texto, rotulo}, 5–9 escenas tipadas, remate, fuentes)
+ `mapa` (src/plantillas/frontera/guion.ts):
- `fondo`: `satelite` | `relieve` | `oscuro`. Satélite/relieve = recorte NASA GIBS por WMS (EPSG:4326). Bajo 400 m/px
  pedido se usa **Landsat WELD** (30 m, ciudades); sobre eso **Blue Marble** (países). Si GIBS falla → `oscuro`.
- `centro`, `zoomInicial`, `zoomFinal`: zoom tipo mapa web (3 continente · 6 país chico · 9 región · 12 ciudad · 14 barrio).
  El zoom va de inicial a final durante TODO el video (nada queda quieto).
- `lineas[]`: `puntos` ([lon,lat]) o `fronteraEntre` (NE, solo escala regional), `color` amarillo/celeste/coral,
  `estilo` solida/punteada, `dibujarEn` (índice de escena, -1 = gancho), `etiqueta` opcional.
- `marcadores[]` (punto coral + nombre), `zooms[]` (salto de cámara con spring al empezar una escena), `paises[]` (relleno tenue).
Lo que agrega preparar (no va en el guion): `tiempos`, `duracionFrames`, `imagenes`, `fondoMapa` {src, bbox, capa, credito}, `creditos`.

## Cómo está armado
- `mapa.ts` (puro): escala d3 = 256·2^z/2π; proyección **equirectangular** si hay raster (el recorte EPSG:4326 encaja
  como rectángulo exacto: se posiciona proyectando las esquinas del bbox), **Mercator** con vectores solos,
  **ortográfica** (globo, interpolación con versor) si |lat| > 60. `cajaVisible` = bbox que cubre todas las cámaras.
- `Mapa.tsx`: por frame calcula la cámara (claves con spring + deriva lineal de zoom), proyecta y dibuja: `<Img>` del
  satélite + velo azul noche 36 %, tierra/bordes NE (bordes solo a zoom ≤ 9: a escala de ciudad NE es grueso),
  líneas reveladas con máscara `pathLength=1` + `strokeDashoffset` (1,6 s; la punteada es `0.1 24` con remate redondo),
  etiquetas de línea con posición elegida una vez para no pisar otras líneas, marcadores con pulso.
- `Frontera.tsx`: voz por línea (`<Sequence>` + `<Audio>`), cama/SFX, cabecera, gancho (rótulo entero en el frame 0),
  escenas (subtítulos, rótulo en la palabra `dice`, tarjeta de foto), remate en dos mitades, marca de agua, cierre 1,5 s.
- Componentes comunes en `src/plantillas/comun/` (los reutilizan `lugar` y `ruta`).
- Rótulos: clave = amarillo · mito = blanco y se **tacha en coral** cuando la voz dice "verdad" · giro = coral inclinado.

## Verificar un video
```bash
npx tsc --noEmit -p .
npx remotion render src/index.ts Frontera salida/pruebas/<id>.mp4 --props=salida/trabajo/<id>.props.json --scale=0.5 --concurrency=1 --x264-preset=veryfast
npx tsx scripts/fotogramas.mts salida/pruebas/<id>.mp4        # 0 s, 1,5 s, 25 %, 50 %, 75 %, último + hoja
```
Mirar con Read: rótulo del gancho entero en el frame 0, líneas dibujadas sobre el lugar correcto, etiquetas sin
pisarse, nada fuera de la zona segura, foto con crédito, remate legible, cierre. Las coordenadas de las líneas son
aproximadas: la descripción lo dice ("trazados aproximados").

## Fórmula de guion
docs/GUION.md (Fable). Resumen: gancho visual → mito → "La verdad es más rara." → "Todo se explica con dos cosas…" →
actos con fuente en la voz → "Y aquí está el giro…" → hoy → remate simétrico. Ejemplo: `contenido/backlog/frontera-chamizal.json`.
