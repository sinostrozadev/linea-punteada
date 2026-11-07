# Medir el ritmo y los ganchos de un Short ajeno sin descargarlo (2026-11-07)

Usa el piloto (8777) con la sesión de YouTube: carga el video en la pestaña, lo pausa y recorre `<video>` por
`currentTime`, dibujando cada medio segundo un cuadro de 48×86 px en un canvas y midiendo la diferencia con el
anterior. Los picos de diferencia son cambios de imagen (cortes, zooms grandes, capas que aparecen). También
saca cuadros a tiempos fijos (0, 0,7, 1,5, 3, 10, 30… s) para comparar ganchos lado a lado.

- `tr.sh VIDEOID` → fecha, duración, vistas, likes y transcripción (abre el panel "Transcripción" de YouTube).
- `analiza.sh VIDEOID etiqueta` → `$REVISION_DIR/an/<etiqueta>.json` (diferencias por 0,5 s) y
  `<etiqueta>-cuadros.json` (cuadros en base64). `REVISION_DIR` por defecto `/tmp/revision-lp`.
- `picos.py <dir>` → cambios de imagen por minuto por video (umbral sobre la mediana de diferencias).
- `grilla.mjs salida.jpg "Etiqueta|img1,img2,…" …` → hoja de contacto de ganchos lado a lado (Playwright de
  bolita-lab/herramientas/navegador).
- Lo mismo sirve para nuestros videos ya publicados (comparación justa, mismo método).

Gotchas: YouTube a veces no deja dibujar el `<video>` en canvas (CORS) → `error`; reintentar tras recargar.
Cada `seek` tarda 60–120 ms: 60 s de video ≈ 15–25 s. No mide audio ni voz: para palabras/min usar la
transcripción de `tr.sh`. Resultados de la primera medición en `docs/META-REFERENTE.md`.
