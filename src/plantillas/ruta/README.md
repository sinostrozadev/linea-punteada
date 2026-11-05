# Plantilla `ruta`

La historia es un **trayecto** (una persona, una expedición, un tren, una migración) contado en 2–3 minutos
(Short 1080×1920, 60 fps, 110–175 s): globo ortográfico que rota siguiendo la cabeza de la línea (o mapa plano
regional con satélite), línea punteada amarilla que se dibuja punto a punto, marcador coral con fecha en cada hito,
contador de km y de tiempo transcurrido, rótulos enormes sincronizados con la voz, subtítulos palabra a palabra,
fotos de Commons y cierre de marca.

## Flujo
```bash
npx tsx scripts/preparar-ruta.mts contenido/guiones/<id>.json      # valida, voz, trazado, sonido, fotos, satélite → salida/trabajo/<id>.props.json
npx remotion render src/index.ts Ruta salida/bandeja/<id>.mp4 --props=salida/trabajo/<id>.props.json \
  --codec=h264 --crf=18 --concurrency=1 --x264-preset=veryfast --timeout=180000
```
Mientras `Ruta` no esté en `src/Root.tsx`, usar la raíz de prueba `src/index.ruta.ts`. Sin `--props`, Studio muestra el
guion de Karl Bushby (`src/plantillas/ruta/ejemplo.json`, copia de `contenido/borradores/ruta-bushby.json`) con tiempos estimados y el trazado calculado en el navegador.

## Props (guion)
`GuionBase` (cabecera, gancho, 5–9 escenas, remate, fuentes) + cada escena admite **`tramo: [desde, hasta]`** (índices de
`mapa.puntos`, inclusive: la línea va de donde quedó hasta `hasta` durante esa escena; sin `tramo`, lo que falta se reparte
entre las escenas sin tramo; el gancho no dibuja) + `mapa` (`src/plantillas/ruta/guion.ts`):
- `proyeccion`: `globo` (trayectos entre continentes) | `plano` (regionales; equirectangular).
- `fondo`: `satelite` (solo `plano`, NASA GIBS) | `relieve` (solo `plano`; en el globo se ve `oscuro`) | `oscuro` (Natural Earth).
- `puntos[]` (≥ 3, en orden de viaje): `lon`, `lat`, `etiqueta?` (hito con marcador), `fecha?` (`AAAA`, `AAAA-MM`,
  `AAAA-MM-DD`; solo verificadas), `hito?`. Sin etiqueta ni hito el punto solo da forma al trazado.
- `color?` (amarillo), `escala?` (globo: radio máximo en anchos de pantalla, 1,1), `zoom?` (plano: zoom máximo, 6),
  `kmReales?` (distancia real según las fuentes: el contador escala los km de los grandes círculos para terminar en esa
  cifra), `mostrarContador?` (true).
Lo que agrega preparar (no va en el guion): `tiempos`, `duracionFrames`, `trazado`, `imagenes`, `fondoMapa`, `creditos`.

## Cómo está armado
- `trazado.ts` (puro): `calcularTrazado` densifica la ruta por grandes círculos cada ~50 km (`geoInterpolate`), acumula km
  (`geoDistance`), interpola fechas por km entre puntos fechados y genera los **puntitos a distancia geográfica fija**
  (~30 px a escala máxima): así la punteada no "repta" cuando la cámara gira o se aleja. Se precalcula en preparar.
  `armarRecorrido` + `cabezaEn`: dentro de cada escena la cabeza avanza con curva coseno; cada segmento recibe tiempo
  ∝ largo + constante (un tramo de 0 km —el viajero trabado— igual ocupa tiempo y el contador de años salta).
- `camara.ts` (puro): la cámara sigue a la cabeza con un **promedio 3D ponderado** de sus posiciones en ±1,8 s (cruzar ±180°
  no salta, la rotación nunca es brusca) y se aleja según el arco que la cabeza recorre en ±2,2 s (respiro lento encima: nada
  quieto). En el gancho la vista general **sobrevuela la ruta fantasma de punta a punta** cuando no cabe en un hemisferio;
  en el remate vuelve a alejarse sobre la ruta completa. Transición = slerp de centros + escala logarítmica.
- `MapaRuta.tsx`: esfera + atmósfera, retícula, tierra y bordes NE 50m, ruta fantasma (solo en el gancho), puntitos
  recorridos (con fundido en el horizonte del globo: lo del lado oculto no se dibuja), cabeza con halo, marcadores coral y
  **etiquetas solo de los dos últimos hitos** (la anterior tenue) con nombre + año; se atenúan bajo el rótulo enorme y nunca
  salen de los márgenes seguros.
- `Contador.tsx`: abajo a la izquierda, sobre la zona segura: km (cifras tabulares) + año en curso y tiempo desde el
  primer hito. Aparece al terminar el gancho.
- `Ruta.tsx`: como `Frontera.tsx` (voz por línea, cama/SFX, cabecera, gancho, escenas, remate, marca de agua, cierre) con
  disposición propia (`modelo.ts › DISPOSICION_RUTA`): rótulo en y 820 y cabeza de la línea en y 1250; si la escena tiene
  foto, rótulo 720, cabeza 990 y la tarjeta común sube 90 px para dejar sitio al contador.
- Sonido (preparar): `trazo` cuando la línea arranca en cada escena que se mueve y `tic` en cada hito alcanzado.

## Verificar un video
```bash
npx tsc --noEmit -p .
npx remotion render src/index.ruta.ts Ruta salida/pruebas/<id>.mp4 --props=salida/trabajo/<id>.props.json --scale=0.5 --concurrency=1 --x264-preset=veryfast
npx tsx scripts/fotogramas.mts salida/pruebas/<id>.mp4
```
Mirar: rótulo del gancho entero en el frame 0 con la ruta fantasma, línea que no cruza el lado oculto del globo,
etiquetas dentro de la zona segura, contador legible y que termina en la cifra de la voz, foto con crédito, remate, cierre.

## Fórmula de guion
docs/GUION.md. En `ruta`: el gancho nombra el origen y el destino ("Sale de Punta Arenas… y termina en Hull"); cada acto es
un tramo con su fecha; el giro suele ser donde el contador de km se frena y el de años sigue (el viajero trabado).
Personas vivas: sin foto (la ruta es la protagonista). Ejemplo: `contenido/borradores/ruta-bushby.json`.
