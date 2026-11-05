# Decisiones de Línea Punteada

- **2026-11-05 · Esqueleto copiado del repo madre** (bolita-lab): bandeja, diario, estado, subir, compilar, voz, Commons,
  wav y fotogramas. Cambios: plantillas `frontera|lugar|ruta`, categoría 27 Educación, variables `LINEA_*`,
  memoria mínima 1500 MB, render bajo `flock /tmp/bolita-render.lock` (lock compartido entre canales: Bolita Lab debería
  tomarlo también en su cron), tiempo máximo de render 150 min (Shorts de 2–3 min).
- **Dependencias nuevas**: `d3-geo` (proyecciones y caminos SVG), `d3-geo-projection` (proyecciones extra para `ruta`/largos),
  `topojson-client` + `world-atlas` (Natural Earth 50m, dominio público), `versor` (interpolación de rotación del globo
  ortográfico), y sus `@types`. Sin WebGL (MapLibre/three quedan para después: RAM).
- **Contrato común** `src/plantillas/comun/guion.ts` (GuionBase + `validarFormula`) para las 3 plantillas; cada plantilla
  extiende con `.extend()` y vuelve a aplicar las reglas con `.superRefine()`.
- **Satélite**: NASA GIBS WMS en EPSG:4326. Blue Marble (~500 m/px) se ve como mosaico a escala de ciudad → bajo 400 m/px
  pedido se usa **Landsat WELD** (30 m, probado con El Paso/Juárez). Con raster se proyecta en **equirectangular** para que
  el recorte encaje exacto; Mercator solo con vectores; ortográfica si |lat| > 60.
- **Bordes de Natural Earth ocultos a zoom > 9**: a escala de barrio la línea de NE cae a cientos de metros del lugar real.
  Las fronteras de ciudad van a mano con `puntos` y la descripción dice "trazados aproximados".
- **Bricolage Grotesque llega a 800** en Google Fonts (900 no existe): rótulos en 800 con borde grueso (`paint-order`).
- **Voz +4 %** (narración) en vez del +6 % de `dato`; pausa entre líneas 0,32 s y doble antes del remate.
- **Etiquetas de línea con colocación automática** (prueba 7 puntos × arriba/abajo, elige la primera sin choques, con la
  cámara del frame en que aparece) en vez de un campo nuevo en el contrato.
- **generar-guiones**: `docs/GUION.md` va como `--system-prompt` de `claude -p` (lo escribe Fable); si falta, resumen mínimo.
- **subir-studio** exige `LP_CANAL_ID`: la sesión de Google del piloto es la misma de Bolita Lab y sin id fijo podría subir
  al canal equivocado.
- 2026-11-05 · Las plantillas importan su guion de ejemplo desde `src/plantillas/<p>/ejemplo.json`, nunca desde `contenido/`: el diario mueve los guiones al promoverlos y el bundle de Remotion rompía ("Module not found") en todos los renders siguientes. Chamizal pasa a `contenido/reserva/` (Ñerd ya lo hizo).
