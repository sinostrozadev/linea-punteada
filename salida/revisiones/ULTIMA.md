# Revisión 2026-11-26 · Línea Punteada (encargo "un viral": diagnóstico, librería de video y dos piezas candidatas)

Formato fijo (lo lee el panel): Detectado · Mejorado · Herramientas exploradas · Agregado · Pendiente.
Documento completo: `/home/santiago/projects/yt/_propuestas/2026-11-26-viral-linea-punteada.md`.

## Detectado
- Por qué se sienten "mecánicos" (5 virales y 3 nuestros, un fotograma cada 0,5 s): el mismo satélite oscuro todo el video (64–91 % de píxeles oscuros;
  los virales 18–57 %), **0 fotos a pantalla completa y 0 video en los 14 Shorts de la fórmula directa**, 0–0,7 cortes duros cada 10 s (GeoFronteras 2,9;
  Ñerd 2,2) y voz a 2,1–2,3 palabras/s (ellos 2,6–3,1).
- Los guiones suenan a ficha de enciclopedia: fecha, nombre, cifra; sin diálogo, sin humor, sin una persona. Los virales traen citas y apartes.
- Ninguno de los virales medidos usa video real: los separa el color, los personajes, el humor y el ritmo. El video real es diferenciación, no la fórmula probada.
- Video libre de Chile y vecinos: Commons cubre bien lo turístico y mal lo específico (no hay un video del ferry de Primera Angostura ni de una aduana).
- El primer borrador de cada guion nuevo tenía hechos mal (la Corte Suprema "confirmó" una condena que en realidad revocó; cifras solo de Wikipedia): el
  revisor con web los atrapó antes de producir.

## Mejorado
- Guion: narrador con punto de vista, cita real, frase larga encadenada + remate corto, remate con dilema en vez de moraleja; dos filtros por guion
  (revisor de hechos + "detector de IA").
- Voz: `vozRitmo` por guion (Short +18 %, largo +10 %).
- Imagen: países a color pleno todo el video, fotos reales y extractos de video a pantalla completa con crédito en pantalla.

## Herramientas exploradas
- Wikimedia Commons (video, sin clave), NASA images-api (sin clave), NASA SVS, Internet Archive/Prelinger, Pexels, Pixabay, Coverr, Mixkit, Europeana,
  Google Earth Studio, ESO, NOAA, Sentinel: licencias leídas en la página de cada fuente (`docs/LICENCIAS-VIDEO.md`).
- Captura de fotogramas de Shorts ajenos con un Chromium headless propio (sin yt-dlp) y medición de cortes, luz y color (`lab/viral-lp-2026-11-26/scripts/`).
- Render de un prototipo en la nube desde una rama aparte, sin tocar la cola de producción.
- GPT para carátulas: 3 variantes del largo en 15 min.

## Agregado
- `scripts/lib/videos.mts`, `scripts/videos.mts`, `scripts/lib/medios.mts`, `src/plantillas/comun/visuales/Medios.tsx`, `medios[]` y `vozRitmo` en el esquema
  (frontera y largo). Compatible: los guiones existentes validan y renderizan igual.
- `docs/GUION.md` §4c, `docs/LICENCIAS-VIDEO.md`, dossiers de hechos en `contenido/investigacion/2026-11-26-*.md`.
- Short candidato "Para llegar en auto a Ushuaia hay que salir de Argentina" y largo candidato "Chile tomó Lima en 3 días. A este general no lo atrapó nunca"
  (guion v2, carátulas GPT A y C, versión para locución humana).

## Pendiente
- Santiago: ver las dos piezas privadas; claves gratuitas de Pexels y Pixabay; decidir sobre CC BY-SA; grabar el Short con su voz; elegir carátula (A o C).
- Lote de 10 Shorts (5 con medios, 5 sin) después de leer el lote "directa" el 03-12.
- Integrar NASA SVS; adaptador de Qwen3 a `tiempos.json`; `medios[]` en `lugar` y `ruta`; llevar las reglas nuevas al generador semanal solo si el lote pasa el umbral.
- Antes de publicar el largo: pasada de hechos por Sater (*Andean Tragedy*) y Memoria Chilena (varios datos tienen confianza media).
