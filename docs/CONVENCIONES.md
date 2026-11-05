# Convenciones de Línea Punteada (léelas antes de tocar el repo)

## Qué es esto
Fábrica de Shorts de **geografía narrada en español**: 2–3 minutos, una historia completa sobre un mapa (una
frontera rara, un lugar que no debería estar ahí, una ruta humana absurda), contada desde el sur del mundo.
Canal **@lineapunteada**. Ficha del nicho: `docs/FICHA-NICHO.md`. Fórmula de guion: `docs/GUION.md`.
Repo madre (solo lectura): `/home/santiago/projects/yt/bolita-lab` (de ahí vienen bandeja, diario, voz, Commons, sonido).

Plantillas: `frontera` (hecha), `lugar` y `ruta` (pendientes). Todas comparten el contrato de
`src/plantillas/comun/guion.ts` y los componentes de `src/plantillas/comun/`.

Formato: **1080×1920, 60 fps, 110–175 s** (Shorts admiten hasta 3 min; `preparar-*` rechaza lo que quede fuera).
Zona segura en `src/marca/tokens.ts` (`FORMATO.seguro`); disposición vertical en `src/plantillas/comun/disposicion.ts`.

## Reglas duras
- **Determinismo:** mismo guion → mismo video. Nada de `Math.random()` (`crearAzar(semilla)` de `src/lib/azar.ts`).
  El mapa se recalcula por frame con `interpolate`/`spring` (nunca transiciones CSS).
- **Datos con licencia:** vectores Natural Earth vía `world-atlas` (dominio público); satélite NASA GIBS (Landsat WELD /
  Blue Marble, dominio público, con crédito en pantalla y en la descripción); fotos solo de Wikimedia Commons PD/CC0/
  CC BY/CC BY-SA sin `Restrictions`, ≤ 1280 px, con autor y licencia. **Prohibido:** GADM, teselas de OSM, Esri, Mapbox/MapTiler.
- **Voz:** msedge-tts, `es-MX-JorgeNeural` a +4 % por defecto (A/B con `es-CL-LorenzoNeural`). Nunca se presenta como persona;
  la descripción declara "Voz sintetizada (contenido sintético)".
- **Audio:** cama y SFX sintetizados en Node (`scripts/sonido.mts`, WAV 48 kHz), muy por debajo de la voz; picos < −1 dBFS.
- **Marca:** colores y tipografía solo de `src/marca/tokens.ts` (azul noche, amarillo, celeste, blanco, coral; Bricolage
  Grotesque + Inter por `@remotion/google-fonts`). Marca de agua arriba a la derecha; cierre 1,5 s con la línea punteada.
- **Gancho en el frame 0:** mapa visible + rótulo del gancho ENTERO (entrada `0.88 + 0.12·spring`). Nada quieto > 0,8 s
  (el zoom lento continuo lo garantiza).
- **Hechos:** solo verificables, con fuente nombrada en la voz en ≥ 1 escena y listadas en `fuentes`. Trazados del mapa
  aproximados se declaran en la descripción.
- **RAM (7,6 GB):** un render a la vez (`flock /tmp/bolita-render.lock`, compartido con Bolita Lab), ≥ 1500 MB libres,
  `--concurrency=1 --x264-preset=veryfast --timeout=180000`. Nunca junto al piloto si hay poca RAM.
- **Piloto:** se usa el de Bolita Lab (puerto 8777). No se copia, no se lanza desde aquí.
- Idioma del código, comentarios, docs y commits: **español**. Archivos en minúsculas sin acentos.
- Dependencias nuevas: anotarlas en `docs/DECISIONES.md`. Commits `ámbito: verbo en infinitivo`. No pushear sin pedirlo.

## Contrato de guion
`{ plantilla: 'frontera'|'lugar'|'ruta', id, titulo (≤ 70, contradicción explícita), descripcion, hashtags, props }`,
`props.id === id`. Props = `GuionBase` + lo propio de la plantilla (`mapa` en `frontera`). El schema zod es a la vez el
validador y el texto que lee `generar-guiones`. Reglas de la fórmula en `validarFormula` (≥ 1 mito, 1 giro que empieza por
"Y aquí está el giro", última escena "hoy", fuente en la voz, 300–480 palabras).

## Cómo se ve "bien"
Mapa satelital oscurecido o vectores azul noche, línea amarilla que se dibuja, zoom lento, rótulos de 1–3 palabras
enormes con borde oscuro en la palabra exacta de la voz, subtítulos arriba con la palabra que suena en amarillo,
foto con crédito en el tercio inferior cuando la idea tiene sujeto, remate simétrico gigante y la línea punteada del cierre.
