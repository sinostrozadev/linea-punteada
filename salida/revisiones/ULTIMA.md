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

---

# Revisión 2026-11-26 (noche) · ritual del jueves: semana 30-11 → 06-12

Formato fijo (lo lee el panel): Detectado · Mejorado · Herramientas exploradas · Agregado · Pendiente.
Regla vigente: "cerrar frentes" (fórmula directa tal cual, sin `medios[]` ni `vozRitmo`; lectura del lote el 03-12).

## Detectado
- Semana 23 → 29-11: todo publicado o programado con `publishAt` verificado por API (21:00 del 26-11).
- Contingencia: CIJ Guyana c. Venezuela sin sentencia ni fecha (se espera ene-2027); zanjas en la frontera norte de Chile = tema
  migratorio/político, no entra; efeméride Ayacucho 202 años (9-12) → sáb 05-12 18:00.
- Revisor independiente: 11 de 15 guiones rechazados en ronda 1 (todos por hechos dichos con una sola fuente, cifras de prensa
  como hecho o títulos que afirmaban una estimación: "Perú era superior", "10 veces más tanques"); 14 aprobados en ronda 2;
  "10 centavos" quedó en 3,86 (giro flojo) → `contenido/reserva/`, lo reemplaza Isla de Aves.
- Hoja de contacto del bebé antártico: el cuadro 0 no mostraba el sujeto (solo parches celestes) → área corregida y re-render.
- `validar-guion` cuenta cada bandera emoji como 4 caracteres: dos títulos de 70 "visibles" pasaban de 70.
- Piloto 8777 en el canal En Números Rojos con "Oops" pegajoso: `subir-studio-largo.mjs` se negó a subir (bien) y el clasificador
  bloqueó navegar el piloto a mano. Ninguna subida esta noche.
- Disco C: bajó de 10 a 6 GB libres durante la noche (renders descargados + voz y props del largo).

## Mejorado
- Nada en código ni plantillas (regla del día). Guiones corregidos según el revisor; cuadro 0 del bebé antártico.

## Herramientas exploradas
- Ninguna nueva. Extracción de fotogramas a medida con `fotogramaCrudo`/`componerFila` de `scripts/lib/fotogramas.mts` para mirar
  un tramo concreto de un render (el "cuadro vacío" del Cristo era el vuelo Japón → Andes).

## Agregado
- 14 guiones de Shorts (fórmula directa) + 1 largo, con tabla de hechos (`contenido/verificaciones/`) y veredicto
  (`salida/revisiones/guiones/`). 14 Shorts renderizados en la nube (`producir.yml`, 10 fragmentos) y en `salida/bandeja/`
  (79–88 s), hojas de contacto en `salida/revisiones/hojas/`.
- Largo "1975: Perú tenía más tanques. ¿Por qué no hubo guerra con Chile?" (8:57, apertura con escena en Tacna el 29-8-1975,
  5 capítulos, mid-rolls ~3:44 y ~6:59), preparado (voz y props) sin rechazos.
- `docs/PLAN-SEMANAL.md`: bloque "Hito del jue 2026-11-26" y JSON con la semana 30-11 → 06-12.

## Pendiente
- **Subir y programar los 14 Shorts** (ranuras 30-11 12:00 → 06-12 18:00) cuando el piloto quede en Línea Punteada (tope: dom 29-11),
  con `flock -w 1800 /tmp/piloto.lock env LP_CANAL_ID=UCp05AZK18-TL8pp74ntbdUw node herramientas/navegador/subir-studio-largo.mjs <id> <fecha> <hora>`
  y verificación con `scripts/programados.mts` / `reprogramar.mts`.
- **Render del largo 1975**: local (`flock -w 7200 /tmp/bolita-render.lock env LINEA_LOCK_RENDER=/tmp/lp-largo-interno.lock npx tsx scripts/render-largo.mts contenido/borradores/largo-peru-1975.json --sin-preparar`)
  solo con ≥ 8 GB libres en C: (hoy 6 GB: Santiago debe compactar el vhdx con `Downloads\compactar-wsl.ps1`). Carátula GPT lista y revisada
  (`salida/caratulas/largo-peru-1975-b.png`, molde del nicho; la A con marca + subtítulo se descartó). Después: subir, pausas publicitarias, related video del tráiler → largo el dom 06-12 ≥ 19:00.
- `docs/GUION.md` §10 usa "Perú era superior…" como título de ejemplo: el revisor lo rechazó por valorativo; cambiar el ejemplo
  cuando se levante "cerrar frentes".
