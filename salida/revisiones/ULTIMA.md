# Revisión 2026-11-07 · Línea Punteada (cierre de la tanda 1 contra Ñerd y la competencia; 03:20–04:40)

Formato fijo (lo lee el panel): Detectado · Mejorado · Herramientas exploradas · Agregado · Pendiente.
Respuesta a "¿cuándo miras los videos de la competencia?": hoy, con los números abajo; desde ahora en cada tanda y cada
lunes (ficha viva en `docs/META-REFERENTE.md`).

## Detectado
- **Nuestros 4 Shorts publicados (Studio, 11-07 03:25):** triángulo 1.385 vistas · 23 likes · 3 comentarios · +2 subs ·
  se quedó a ver 75,5 % · duración media 1:24 de 2:13 (63 %) · 79 % sigue a los 30 s · ≈ 38 % llega al final.
  Laguna 1.869 · 36 likes · 1 comentario · +4 subs · 74,7 % · 1:39 de 2:30 (66 %) · 82 % a los 30 s · ≈ 47 % al final.
  Martín García 1.005 · 14 likes · 1 comentario · 0 subs · retención "sin datos" (Studio tarda hasta 2 días).
  Rivera 1.276 · 27 likes · +1 sub · sin datos de retención. Campo de Hielo programado hoy 12:00. Canal: 7 subs.
  95–97 % de las vistas vienen del feed de Shorts.
- **Ñerd (canal-meta), medido hoy:** 21,5 k subs, 50 Shorts en 17 días (~3/día), mediana 184 k por video (últimos 10:
  54 k). Top 3 de los últimos 30 días: Arizona 4,45 M (165 s), paso de Tehuantepec 1,63 M (155 s, 11-02), capital de
  Canadá 1,47 M (104 s). Video-meta nuevo: **Beagle 261 k** (158 s, 11-01): pregunta a los 0:05, promesa a los 0:20–0:25,
  184 p/min, 12,2 cambios/min, 5 en los primeros 10 s, y tarjeta de título **ilustrada a pantalla completa** ("3 ISLAS,
  2 PAÍSES, CASI HAY GUERRA" sobre islas con banderas) con transición de nubes al mapa (hoja
  `salida/revisiones/hojas/2026-11-07-ganchos-beagle-vs-laguna.jpg`).
- **Competencia (mismo método):** GeoHitos (8,2 k subs): Corea 2,21 M (85 s, 207 p/min, 6,4 cambios/min), Groenlandia
  485 k (81 s, 196 p/min, 11,1/min), Chile 439 k (73 s, 194 p/min, 13,2/min); abre en el globo, banderas, personajes 3D y
  humor; sus últimos 5 bajaron a 27–59 k. **Mapas insólitos** (3,2 k subs): San Andrés 391 k (135 s), pico del Amazonas
  313 k (118 s), islas Monjes 186 k (124 s), todos de Colombia, **con voz a 140–151 p/min y 1–5 cambios/min (más lentos que
  nosotros)**; arrancan sin tarjeta, con el satélite del lugar y un círculo en el cuadro 0, "Mira esta isla…", y prometen
  el final a los 0:15. El nicho se llenó en 15 días: 6 canales nuevos con la misma fórmula (El Mapa lo Explica, El Porqué
  del Mapa, GeoFronteras, Geograf-IA, Mapas insólitos, GeoHitos).
- **Lo que hacemos bien (3, medido):**
  1. A quien nos ve le rendimos igual que Ñerd: likes por vista 1,4–2,2 % (Ñerd 1,6–2,3 %) y 1,26 suscriptores por
     1.000 vistas (Ñerd ≈ 1,1).
  2. Retención sobre los umbrales de ESTRATEGIA §1: 74,7–75,5 % se queda a ver (umbral: < 30 % desliza) y 63–66 % de
     duración media (umbral: > 60 %). Studio califica el arranque de ambos como "kept your viewers watching longer".
  3. Lenguaje visual a la par: máscaras, cotas, índice con pictogramas, polaroids y además la fuente en pantalla, que Ñerd
     no muestra. El mejor nuestro (Laguna) es el de base satelital más contrastada (glaciares turquesa).
- **Las 5 mejoras, por impacto × facilidad (qué se ve / causa / qué cambiar):**
  1. **La promesa llega tarde.** Se ve: "Y al final…" suena a los 35–45 s; Ñerd a los 14–30 s y Mapas insólitos a los 15 s;
     nosotros perdemos el 18–21 % de la audiencia antes del segundo 30. Causa: gancho de 27–40 palabras + mito + mapa de ruta
     largo. Cambiar: presupuesto de palabras del arranque (gancho ≤ 30 hasta la pregunta, mito ≤ 22, mapa ≤ 25).
  2. **El cuadro 0 no dice dónde ni qué es raro.** Se ve: tarjeta de 0,9 s con "¿DE QUIÉN ES ESTE LAGO?" / "¿DE QUÉ PAÍS ES
     ESTA PLAZA?"; Ñerd dice "¿POR QUÉ ARIZONA NO TOCA EL MAR?" o afirma el desenlace ("EE. UU. RECHAZÓ EL PASO PERPETUO") y
     a 0,7 s ya está en el satélite; Mapas insólitos no usa tarjeta: el cuadro 0 es el lugar con un círculo. Causa: molde
     del doc + `T_TITULO = 0.9`. Cambiar: molde "¿POR QUÉ [LUGAR] [CONTRADICCIÓN]?" (hecho) y, en código, 0,7 s y un lote
     de prueba sin tarjeta.
  3. **Los dos últimos videos perdieron ritmo.** Se ve: Martín García 5,9 y Rivera 5,2 cambios/min (Rivera, 0 en 0–10 s;
     Martín, de 1,5 a 3 s un mapa continental sin etiquetas); Ñerd 8,8–19,0; triángulo 9,5; Laguna 16,9 y es la de más
     vistas, retención y subs. Causa: al reescribir los planos para la gramática de cámara se quitaron también los cortes
     sobre el mismo eje. Cambiar: piso ≥ 8/min y ≥ 3 en 0–10 s. Ojo: Mapas insólitos va viral con 1–5/min, así que es
     mejora de calidad, no la causa del alcance.
  4. **Temas de países chicos.** Se ve: 2 de 4 giran en torno a Uruguay; los virales medidos son EE. UU./México, Colombia ×3,
     Corea y Chile–Argentina. Causa: banco de ideas armado desde el sur. Cambiar: en el plan semanal, 1 de cada 2 Shorts con
     México, Colombia o Argentina de protagonista (sin repetir temas de Ñerd).
  5. **La voz va lenta frente a Ñerd y GeoHitos.** Se ve: 142–162 p/min contra 176–207. Causa: Edge TTS a +4 %. Cambiar: A/B de
     un lote a +12 % (`scripts/voz.mts`). Impacto dudoso: Mapas insólitos hace 391 k a 144 p/min.
- **La brecha que importa es de alcance:** 1.005–1.869 vistas contra 54 k de mediana reciente de Ñerd (×30–140). Como la
  respuesta por espectador ya empata (likes 1,4–2,2 % en los cuatro canales; subs por 1.000 vistas 1,26 vs ≈ 1,1), el feed
  nos corta en el arranque: por eso las mejoras 1 y 2 van primero.

## Mejorado
- **Render en la nube funcionando** (04:10): `.github/workflows/producir.yml` (copiado de Bolita; runner de 4 vCPU/16 GB, concurrency 3) renderizó el Short de Uruguay en 61 min (local ≈ 40), dejó el mp4 como artifact de 147 MB y commiteó el estado como bot. Ya descargado a `salida/bandeja/`; hoja de contacto correcta (fuentes, satélite, capas). Automático solo si `LINEA_NUBE_AUTO=1` (decisión de Santiago: nube o cron local, no ambos). Subida por API sigue esperando la auditoría de Google y el token del canal.
- `docs/GUION.md` §2 (system prompt del generador): **reloj del arranque** (promesa antes del segundo 28; gancho ≤ 30
  palabras hasta la pregunta, mito ≤ 22, mapa de ruta ≤ 25) y variante de actos con el nombre de la pieza ("La sierra. …")
  en 1 de cada 3 guiones, para que la tanda no suene a plantilla. Rige desde el próximo guion que se escriba.
- `docs/DIRECCION-VISUAL.md` §1.10 **piso de ritmo** (≥ 8 cambios/min, ≥ 3 en 0–10 s, un corte sobre el mismo eje por
  escena, foto/tarjeta en 3 de cada 7 escenas) y §1.11 **gancho que se mueve** (2 cambios en 0–3 s, etiqueta de lugar
  antes del segundo 3); §2 **molde de la tarjeta de título** "¿POR QUÉ [LUGAR] [CONTRADICCIÓN]?".
- `docs/META-REFERENTE.md` creado: canal-meta Ñerd, **video-meta Beagle (261 k)** en vez de Arizona (outlier), 2 de apoyo,
  ficha de 20 dimensiones con cifra y fecha, competidores, 7 tareas con dueño y verificación.
- No se tocó `src/plantillas/` (renders de producción desde las 04:45), ni `contenido/backlog`, ni la bandeja.

## Herramientas exploradas
- **Detector de ritmo en el navegador (adoptado):** recorrer el `<video>` de YouTube cada 0,5 s con `currentTime`, dibujar a
  48×86 en un `canvas` y medir la diferencia entre cuadros; cuenta cortes/fotos/tarjetas por minuto sin bajar el video
  (yt-dlp sigue bloqueado). Mide igual lo nuestro y lo ajeno. Calibrado contra el conteo a mano de VISUAL-NERD (5,7 vs ~5
  eventos por 10 s). ~1–2 min por video con el piloto.
- **Cuadros del gancho desde el canvas** (0 / 0,7 / 1,5 / 3 / 10 / 30 s) en JPG 270×480, y **grilla lado a lado con un
  Chromium headless de Playwright** (el ffmpeg de Remotion no trae `hstack`/`tile` ni decodifica JPG).
- **Studio → Analytics del Short → Overview**: trae "Stayed to watch", duración media, "% a los 0:30" y la curva; el %
  al final se lee del gráfico (captura con `main#main.scrollTop`). La pestaña Engagement queda en blanco para Shorts.
- **Carátulas con GPT para el cuadro 0 (propuesta, sin probar):** Ñerd cambió su tarjeta de título a una imagen ilustrada
  tipo carátula desde el 11-01; la skill `caratulas-con-gpt` ya da imágenes gratis en 1–5 min. Tarea 10 de META-REFERENTE.
- Búsqueda de YouTube por el piloto para encontrar competidores nuevos de la semana (Mapas insólitos, GeoHitos, El Mapa
  lo Explica, El Porqué del Mapa, GeoFronteras): el nicho de Shorts de mapas en español se llenó en 15 días.

## Agregado
- `docs/META-REFERENTE.md` (ficha viva).
- 4 hojas lado a lado en `salida/revisiones/hojas/2026-11-07-ganchos-*.jpg` (Ñerd Arizona vs Laguna/Martín/triángulo; Ñerd
  Tehuantepec y Canadá vs Rivera; GeoHitos; Mapas insólitos), cuadros a 0 / 0,7 / 1,5 / 3 s y más.
- Capturas de retención de Studio y scripts de medición (local): `salida/revisiones/2026-11-07-capturas/`.
- Una línea por decisión en `docs/DECISIONES.md`.

## Pendiente
- **Sesión de código (sin renders corriendo):** (0) lote de prueba sin tarjeta de título: `tarjetaTitulo` opcional en
  `src/plantillas/frontera/Frontera.tsx` (sin ella, el gancho arranca en el satélite con un `resaltes[]` sobre el lugar en
  0 s); (a) `src/plantillas/frontera/visual.ts` `T_TITULO` 0,9 → 0,7 y el `0.9` fijo de
  `src/plantillas/comun/camara.ts` (cálculo de `inicio` del gancho); (b) aviso **R6 "ritmo bajo"** en
  `src/plantillas/comun/camara.ts` (< 8 cortes+fotos+tarjetas por minuto de voz, o < 3 en el gancho) mostrado por
  `scripts/camara.mts`; (c) validación del reloj del arranque en `scripts/generar-guiones.mts` (palabras hasta el fin de
  `mapa-de-ruta` ≤ 77).
- **A/B de voz:** `scripts/voz.mts` `PROSODIA.rate` `+4%` → `+12%` en un lote de 6 (una variable por lote, ESTRATEGIA §5).
- Tarjeta ilustrada en el cuadro 0: pedido por `caratulas-con-gpt` + campo `tarjetaTitulo.imagen` en
  `src/plantillas/frontera/TarjetaTitulo.tsx`, lote de prueba de 6 (META-REFERENTE tarea 10).
- Plan semanal: 1 de cada 2 Shorts con México, Colombia o Argentina de protagonista (META-REFERENTE tarea 9).
- Re-medir el lunes 11-09: retención de Martín García, Rivera y Campo de Hielo; vistas a 7 días del triángulo y Laguna;
  ritmo del primer guion escrito con las reglas nuevas.
- Los guiones del backlog (`contenido/backlog`) se escribieron antes de estas reglas: revisarlos con el detector antes de
  promoverlos (no se tocaron hoy).
