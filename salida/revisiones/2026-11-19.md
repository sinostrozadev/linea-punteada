# Revisión 2026-11-19 · Línea Punteada (ritual del jueves: semana 23 → 29-11 asegurada)

Formato fijo (lo lee el panel): Detectado · Mejorado · Herramientas exploradas · Agregado · Pendiente.
Regla del día (Santiago): "cerrar frentes": cero mejoras nuevas; fórmula directa y plantillas tal como quedaron el 18-11.

## Detectado
- Faltaban 7 Shorts (mié 25 18:00, jue 26 12/18, vie 27 12/18, sáb 28 18:00, dom 29 18:00 tráiler) y el largo del dom 29 19:00 (confirmado por API).
- El revisor independiente rechazó 6 de 8 guiones en ronda 1 (todos aprobados en ronda 2): cifra con matiz ("volcán activo" de Ojos del Salado), falta de
  `fuenteEnVoz`, títulos sin contradicción, polígono de "mar perdido" que encerraba las islas que Colombia conservó, cifra de prensa dicha como hecho,
  fecha sin fuente en el largo ("volvieron a casa a fines de diciembre"), colores apilados en el Virreinato y un anacronismo (Panamá en 1717).
- Hoja de contacto del tráiler de Iquique: las dos banderas con ojos salían montadas una sobre otra y el área del cuadro 0 no se veía → re-render en la nube.
- `subir-studio.mjs` se corta con "timeout esperando subida completa" cuando Studio muestra "Checking N %" (el regex espera "Checks complete|Upload complete|Processing"):
  el video queda subido y en el paso de programar. 2 de 7 Shorts; se pulsó Schedule a mano y se leyó el id del diálogo.
- Como siempre, Studio dejó 5 de 7 Shorts y el largo sin `publishAt` aunque imprimió ✓: reprogramados por API y verificados con `videos.list`.
- Pedidos a GPT: con varios pedidos abiertos, `pedido-gpt.yml` elige por `ls -t` sobre un checkout recién clonado (mtimes iguales) y saltó dos veces el de
  Línea Punteada para atender los de Números Rojos; salió al tercer `workflow_dispatch`, ~32 min después del pedido.

## Mejorado
- Nada en código ni plantillas (regla del día). Guiones corregidos según el revisor (ronda 2) y el cuadro 0 del tráiler (banderas separadas, escala 1,3).

## Herramientas exploradas
- `gh run download -p 'shorts-*' -p preparado`: baja solo lo que necesita `registrar-nube.mts` (sin los 10 fragmentos, ~200 MB menos por run).
- Data API `search.list` + `videos.list` (order=viewCount) para medir la demanda real de un referente antes de citarlo (Esequibo: el candidato tenía 4,6 K;
  se cambió por `yhyz06uBbw0`, 878 K).

## Agregado
- 7 guiones de Shorts (fórmula directa) + 1 largo, verificados (`contenido/verificaciones/`) y aprobados por revisor Sonnet (`salida/revisiones/guiones/`).
- Semana 23 → 29-11 completa y programada, `publishAt` verificado por API:
  mié 25 18:00 Forma de Chile `cWbAjgCysMU` · jue 26 12:00 Esequibo `BiZoEyHu2jM` · jue 26 18:00 Estrecho de Magallanes `t2H8xt9IU5Q` ·
  vie 27 12:00 Virreinato del Perú `Wzkx2X0XuAU` · vie 27 18:00 San Andrés `yehzyCHwXxI` · sáb 28 18:00 Robinson Crusoe `c5I-8_Jh4Hc` ·
  dom 29 18:00 Tráiler Iquique `hOaASeOx1Pk` · **dom 29 19:00 LARGO "Iquique 1879: el combate que Perú ganó y Chile celebra" `3699jF6jxyg`**
  (8:52, apertura con escena, 6 capítulos, mid-rolls ~3:40 y ~6:49; render local 54,7 min).
- Carátula GPT del largo `salida/caratulas/iquique-1879.png` (revisada: texto exacto, un acento, sujeto legible sin título; puesta por API).
- `docs/PLAN-SEMANAL.md`: bloque del 19-11, JSON con ids, esqueleto 30-11 → 06-12.

## Pendiente
- Día de salida de cada Short: comentario fijado (`scripts/comentar.mts` + fijar en Studio). Largo: comentario fijado, pausas publicitarias y pantalla final en Studio.
- Dom 29 ≥ 19:00: "related video" del tráiler al largo: `flock -w 1800 /tmp/piloto.lock node herramientas/navegador/related-video.mjs hOaASeOx1Pk 3699jF6jxyg`.
- 26-11: reconfirmar en icj-cij.org que no hay sentencia en Guyana c. Venezuela (la voz dice "aún sin sentencia").
- Arreglo de una línea para después de "cerrar frentes": aceptar "Checking" en el regex de "subida completa" de `subir-studio.mjs`.
- Ritual del jue 26-11 17:00: semana 30-11 → 06-12 (largo candidato: Perú 1975) y lectura del lote el jue 03-12.
