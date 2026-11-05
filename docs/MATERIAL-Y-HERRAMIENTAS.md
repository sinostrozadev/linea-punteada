# Material y herramientas gratis para mapas en Remotion (informe de agente Sonnet, 2026-11-04; revisado por Fable)

Verificado = URL leída ese día. "Memoria" = verificar antes de depender de ello.

## 0. Qué hay en el repo madre (/home/santiago/idea)
- Remotion 4.0.540, React 19, zod, `msedge-tts`, `music-metadata`, `@remotion/google-fonts`. Sin d3/topojson/mapas.
- Voz: `msedge-tts`, `es-MX-JorgeNeural` por defecto, `rate +6%`, **límites por palabra** en `tiempos.json` con caché por hash → sirve directo para rótulos sincronizados. Riesgo: servicio no oficial (plan B: Azure Speech o Kokoro en la RTX 3060).
- Música/SFX: síntesis propia en Node (`scripts/sonido-dato.mts`, `scripts/lib/wav.mts`). Sin Content ID.
- Fotos: `scripts/imagenes-dato.mts` (Commons API, filtra PD/CC0/CC BY/CC BY-SA, 1280 px, caché, créditos).

## 1. Datos vectoriales
| Fuente | Licencia | Uso |
|---|---|---|
| **Natural Earth** | Dominio público, comercial OK, atribución opcional (verificado: naturalearthdata.com/about/terms-of-use/) | Base: admin-0, costas, ríos. Fronteras disputadas con criterio propio. |
| **world-atlas (npm)** | ISC, redistribuye NE 4.1 (verificado: github.com/topojson/world-atlas) | `countries-110m/50m/10m.json`. Puede estar desactualizado. |
| **geoBoundaries** | CC BY 4.0, nombrar "geoBoundaries" + www.geoboundaries.org (verificado) | Regiones y comunas (ADM1–2). |
| OSM | ODbL, "© OpenStreetMap contributors" + openstreetmap.org/copyright (verificado: osmfoundation.org/wiki/Licence/Attribution_Guidelines) | Detalle de calle. Crédito en el cuadro si el mapa es protagonista + en descripción. |
| **GADM** | **NO comercial** (verificado: gadm.org/license.html) | **Descartado.** |
| Who's On First | CC BY 4.0 mixto (memoria) | Solo nombres. |

Carga: `d3-geo`, `d3-geo-projection`, `topojson-client`, `versor`. `geoOrthographic()`/`geoMercator()` + `geoPath` → `<path d>`. Animar `rotate`/`scale` con `interpolate` por frame. SVG puro, determinista, sin WebGL.

## 2. Satelital y relieve
| Fuente | Términos | Nota |
|---|---|---|
| **NASA Blue Marble / Earth Observatory** | Sin copyright (EE. UU.), acreditar NASA, sin aval (verificado: nasa.gov/nasa-brand-center/images-and-media/) | Excluir imágenes marcadas de terceros. |
| **NASA GIBS (WMS/WMTS)** | Datos NASA CC0, cita recomendada (verificado: earthdata.nasa.gov data-use-policy) | Recorte estático sin clave: `https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.1.1&LAYERS=BlueMarble_ShadedRelief_Bathymetry&SRS=EPSG:4326&BBOX=-80,-60,-60,-40&WIDTH=2048&HEIGHT=2048&FORMAT=image/jpeg` (memoria: probar). Guardar en `public/mapas/`. |
| Landsat / USGS | Dominio público, "Landsat imagery courtesy of NASA/USGS" (memoria) | Vía GIBS o EarthExplorer. |
| Sentinel-2 | Libre; "Contains modified Copernicus Sentinel data [año]" (memoria; página de Copernicus leída solo trata logos) | Ambigua: preferir NASA/Landsat. |
| MapTiler / Mapbox free | Tiles solo dentro de su SDK (memoria) | **No** para fotogramas. |
| SRTM / Mapterhorn (PMTiles de terreno) | SRTM PD (memoria); descargas en docs.protomaps.com/basemaps/downloads (verificado) | Relieve sombreado. |
| Esri World Imagery | Términos propios, no confirmado para video | **No usar.** |

## 3. Mapas base (tiles)
- OSM tile.openstreetmap.org: **prohibido** render masivo/headless (verificado: operations.osmfoundation.org/policies/tiles/).
- Stadia/Stamen: gratis solo no comercial (memoria) → riesgo. CARTO: clave gratis, comercial hasta 1 M tiles/mes (verificado github CartoDB/basemap-styles; términos legales no leídos).
- **Protomaps (PMTiles)**: ODbL, archivo local, `pmtiles extract --bbox` (verificado) → **la mejor** si se necesita mapa de calles. OpenFreeMap: solo pruebas.
- Recomendación: **SVG propio con Natural Earth + geoBoundaries**; Protomaps solo si hace falta detalle urbano.

## 4. Fotos y archivo
- **Wikimedia Commons** (PD/CC0/CC BY/CC BY-SA; crédito autor+licencia+fuente; verificado Commons:Reusing_content_outside_Wikimedia). API: `prop=imageinfo&iiprop=extmetadata|url|size` → `LicenseShortName`, `Artist`, `Credit`, `Restrictions` (descartar si no vacío). Ya implementado en `imagenes-dato.mts`.
- Library of Congress ("No known restrictions"), Europeana (`reusability=open`), Flickr Commons — memoria.
- Unsplash/Pexels: licencias propias, riesgo con personas/marcas → evitar para personas reales.
- CC BY-SA: usar como foto aislada con crédito completo (no está claro si contagia al video). **Personas vivas** (Bushby): derechos de imagen además del copyright → preferir mapa/ruta/silueta, fotos solo de Commons con licencia explícita.

## 5. Librerías de mapas en Remotion
- **Pila mínima (recomendada):** d3-geo + d3-geo-projection + topojson-client + versor. Globo ortográfico, Mercator/Albers para zoom regional, satélite como `<Img>` con `clipPath` por país, ruta como `<path>` con `strokeDasharray`.
- Pila pro: MapLibre + PMTiles o three-globe (`@remotion/three`). Requiere WebGL: `chromiumOptions: {gl: 'angle'}`, `concurrency=1`, `delayRender`. En WSL con 7,6 GB: 1–2 GB por proceso, lento → **para después**.
- No existe plugin oficial de mapas de Remotion (la URL /docs/mapbox dio 404).

## 6. Voz
| Motor | Licencia | Nota |
|---|---|---|
| Edge TTS (actual) | no oficial | es-CL Lorenzo/Catalina, es-MX Jorge (memoria). Sirve para narración larga troceada por frase con caché. |
| Azure Speech | comercial, nivel gratis limitado | relevo directo, mismas voces. |
| **Kokoro** | Apache-2.0, español `lang_code='e'` (verificado github hexgrad/kokoro) | corre en la RTX 3060; sin timestamps por palabra (usar `estimarPalabras`). |
| Piper | GPL-3.0 (verificado) | CPU, calidad menor. |
| Coqui XTTS | CPML no comercial | **evitar**. |

## 7. Música
Síntesis propia ya existe; sumar cama ambiental (drones/pads). Apoyo CC0/PD (memoria): Free Music Archive (filtro CC0), Musopen, YouTube Audio Library sin atribución. Nada con Content ID.

## 8. Plantilla de atribución (descripción)
```
Mapas: Natural Earth (dominio público). Límites: geoBoundaries (www.geoboundaries.org, CC BY 4.0).
Datos de mapa: © OpenStreetMap contributors (openstreetmap.org/copyright), ODbL. Mapa base: Protomaps.
Imágenes satelitales: NASA GIBS / NASA Earth Observatory (Landsat: USGS/NASA). Contains modified Copernicus Sentinel data [año].
Fotos: "<Título>", de <Autor>, <Licencia>, vía Wikimedia Commons (<URL>). <Modificada: recortada>.
Archivo: <Institución>, <URL del ítem>, <estado de derechos>.
Voz: sintetizada (contenido sintético). Música: composición propia.
```
Guardar los mismos datos en `creditos[]` del guion JSON para que la descripción se arme sola.

## 9. Estimación (días de Claude, con render de prueba)
| Pieza | Días | Riesgos |
|---|---|---|
| (a) `frontera`: mapa con frontera y zoom | 2–3 | antimeridiano, parpadeo de stroke al zoom, peso de 10m por frame (precalcular `d`) |
| (b) `ruta`: ruta animada sobre globo/mapa | 3–4 | grandes círculos, lado oculto del globo, dasharray largo, hitos sincronizados con `tiempos.json` |
| (c) `lugar`: foto histórica Ken Burns + rótulo | 1–2 | fotos chicas al ampliar, zona segura 9:16, pie de crédito vs rótulo |
| (d) pipeline guion→props con descarga automática | 4–6 | pertinencia de fotos, licencia y `Restrictions`, caché, créditos, revisión humana |
**Total 10–15 días** en pila mínima (dividir en etapas). Pila pro +3–5 días.

## Riesgos principales
1. GADM, tiles OSM y Esri descartados. 2. Edge TTS no oficial → Azure/Kokoro documentados. 3. Sentinel-2 y términos de GIBS sin confirmar → preferir NASA/Landsat. 4. Personas reales: derechos de imagen. 5. YPP "inauténtico": guion original + fuente en la voz (skill `monetizacion-youtube`).
