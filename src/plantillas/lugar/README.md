# Plantilla `lugar`

La historia es un **punto** (una ciudad que no debería existir, una isla perdida, "el lugar más X del mundo"), contada
en 2–3 minutos (Short 1080×1920, 60 fps, 110–175 s). Protagonista: **una foto grande de Wikimedia Commons con Ken
Burns** y, encima, un **mapa inset redondo** (500 px) con el punto coral que parpadea y un zoom lento del continente al
punto. Las escenas pueden pasar a **mapa a pantalla completa** (`vista: 'mapa'`). Cabecera, subtítulos palabra a
palabra, rótulos en la palabra `dice`, remate, marca de agua y cierre vienen de `src/plantillas/comun/`.

## Flujo
```bash
npx tsx scripts/preparar-lugar.mts contenido/guiones/<id>.json      # valida, voz, sonido, fotos, satélite → salida/trabajo/<id>.props.json
npx remotion render src/index.ts Lugar salida/bandeja/<id>.mp4 --props=salida/trabajo/<id>.props.json \
  --codec=h264 --crf=18 --concurrency=1 --x264-preset=veryfast --timeout=180000
```
Mientras `Lugar` no esté cableada en `src/Root.tsx`, usar la entrada temporal `src/index.lugar.ts` (= Root + lugar).
Sin `--props`, Studio muestra el guion de Clipperton con tiempos estimados, sin foto y todo en vista mapa (vectores).

## Props (guion)
`GuionBase` (cabecera, gancho, 5–9 escenas, remate, fuentes) + (`guion.ts`):
- `imagenPrincipal` (obligatoria): `{ buscar, archivo?, encuadre? }` de Commons. Se ve en el gancho y en toda escena
  `vista: 'foto'` sin foto propia. Mejor una vista aérea o de lejos del lugar entero. Pasa por el mismo filtro de
  licencias que el resto (PD/CC0/CC BY/CC BY-SA, ≥ 1200 px, sin `Restrictions`), se baja a 1280 px.
- `mapa`: `fondo` satelite | relieve | oscuro, `punto` [lon, lat], `zoomInicial` → `zoomFinal` (zoom del inset: 3 continente
  · 5 país · 7 región · 9 ciudad), `etiqueta` (nombre junto al punto), `marcadores[]` (≤ 4: `{lon, lat, etiqueta, aparecerEn}`,
  con una línea punteada amarilla hasta el punto).
- Por escena: `vista` foto (defecto) | mapa, `kenBurns` acercar | alejar | izquierda | derecha (defecto: alterna), `imagen`
  propia opcional (reemplaza a la principal mientras dura la escena). Validación: al menos 1 escena `mapa`.
Lo que agrega preparar (no va en el guion): `tiempos`, `duracionFrames`, `fotoPrincipal`, `imagenes` (por línea de voz),
`fondosMapa[]` (`{src, bbox, capa, credito, zoom}`, del más lejano al más cercano), `creditos`.

## Cómo está armado
- `camara.ts` (puro): zoom del inset lineal de inicial a final; el mapa grande usa el mismo encuadre (`+log2(1080/500)`)
  pero **frena** para no dejar fuera los marcadores ya nombrados (`zoomCompletoEn`, con fundido de 1,6 s y una deriva
  mínima de 0,25 para que nunca quede quieto). En pantalla completa el punto va al 68 % del alto: el rótulo (centro 860)
  no lo tapa. Vistas efectivas por bloque (sin foto disponible → mapa; el remate siempre es mapa), Ken Burns por bloque,
  opacidad del inset y niveles de recorte satelital (`nivelesRaster`: cada 1,5 zooms).
- `FotoKenBurns.tsx`: encuadre "cover" calculado a mano + zoom ≥ 1,02 y foco (fx, fy) acotado al sobrante en píxeles:
  **nunca asoma un borde**. Velos arriba (subtítulos) y abajo (crédito) + viñeta. Cada foto es una capa por bloque
  alargada 14 frames para fundirse con la siguiente (o con el mapa).
- `MapaLugar.tsx`: recortes NASA por niveles (el más cercano encima, solo cuando ya tiene resolución útil), océano
  llevado al azul de marca con `mix-blend-mode: lighten`, cuadrícula de meridianos/paralelos que se densifica sin saltos
  (en mar abierto es lo que muestra el movimiento), bordes NE a zoom ≤ 9, líneas punteadas a los marcadores, marcadores
  y el punto con dos anillos que se expanden. Mismo componente para el inset y para la pantalla completa.
- `Lugar.tsx`: mapa grande (no se dibuja cuando una foto lo tapa entero), capas de foto, voz + cama, inset, crédito al pie
  (foto · licencia · "Mapa: NASA", o el del satélite en vista mapa), cabecera, gancho (rótulo entero en el frame 0),
  escenas (rótulo a 800 con foto / 860 con mapa), remate, marca de agua, cierre.
- `scripts/preparar-lugar.mts`: la principal se resuelve con `prepararImagenes` pasándola como "escena 0" (mismo filtro y
  caché); el satélite reutiliza `scripts/mapas.mts` con un mapa "falso" por nivel (centro corrido al norte porque el punto
  va abajo; acotado a ±59°). En mar abierto GIBS devuelve JPEG casi vacíos a zoom alto: esos niveles se omiten y se ve el
  nivel anterior (es océano liso, no se nota).

## Verificar un video
```bash
npx tsc --noEmit -p .
npx remotion render src/index.ts Lugar salida/pruebas/<id>.mp4 --props=salida/trabajo/<id>.props.json --scale=0.5 --concurrency=1 --x264-preset=veryfast
npx tsx scripts/fotogramas.mts salida/pruebas/<id>.mp4
```
Mirar: rótulo del gancho entero en el frame 0 y el sujeto de la foto visible entre el rótulo y el inset; el inset legible
(el punto y su etiqueta); en vista mapa, el punto sin tapar y los marcadores dentro del cuadro; créditos al pie; remate y
cierre. Un islote no se ve en satélite a zoom ≤ 9: el punto coral es el lugar (Clipperton: 3 → 8).

## Fórmula de guion
docs/GUION.md. Para `lugar`: el gancho empieza con lo que se ve en la foto ("Mira este anillo de coral…"); las escenas de
distancias o vecinos van en `vista: 'mapa'`; 2–3 fotos propias de escena como máximo. Ejemplo:
`contenido/borradores/lugar-clipperton-1917.json`.
