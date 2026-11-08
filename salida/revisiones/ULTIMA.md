# Revisión 2026-11-08 · Línea Punteada (madrugada: primer largo 16:9, bloqueo de subida, nube)

Formato fijo (lo lee el panel): Detectado · Mejorado · Herramientas exploradas · Agregado · Pendiente.

## Detectado
- **El canal no tiene verificación por teléfono** (Settings → Channel → Feature eligibility: Intermediate y Advanced "Eligible", sin activar). Al programar un Short salió "Daily upload limit reached": cupo diario bajo y sin miniaturas personalizadas.
- **Bug del piloto:** `/escribir` sobre el título del diálogo de subida de Studio a veces no cambia el texto, sin error. Números Rojos lo vio en 3 Shorts seguidos y Línea Punteada en 1.
- **GitHub cancela los `pending` intermedios** del mismo grupo de concurrencia de `producir.yml`: hay que encolar los Shorts de la nube de a uno.
- **Estimación de render de largos era pesimista:** medido 8,8 min de render por minuto de video (77 min para 8:45), no 15–25.
- **Señal de comentarios:** la discusión del Short de Bolivia (11-07) concentra los comentarios; es tema para el largo del 11-15.
- Studio eliminó la pestaña Reach de las métricas. Canal: 25 subs, 5.849 vistas a las 02:50.

## Mejorado
- **Primer VIDEO LARGO 16:9 hecho:** "Caminó 28 años para volver a casa. ¿Qué lo frenó?" (Karl Bushby, Punta Arenas → Hull, 1998–2026), 8:44, 6 capítulos (0:17 · 1:34 · 2:47 · 3:49 · 5:23 · 6:30), mid-rolls previstos ~3:57 y ~6:40, 33 hechos verificados con fuente, 10 fotos de Commons con licencia, carátula `salida/caratulas/bushby-serie-2.png`. Se publica hoy dom 11-08 a las 19:00 (el render terminó a las 03:58).
- **Render en la nube en marcha:** el primer Short (`soldados-entraron-a-un-pais-sin-ejercito`) tardó 40 min y está en bandeja, listo para lun 11-09 18:00; siguen otros 3 (11-10 12:00, 11-10 18:00, 11-11 12:00).
- **OAuth del canal autorizado** (youtube, upload, force-ssl, yt-analytics.readonly; vence 2026-11-15; el primer intento cayó en el canal personal y se repitió con la cuenta de marca). Los comentarios ya se responden por API.
- Métricas: la captura 3 pasó de Reach a Audiencia (`3-audiencia.png`).

## Herramientas exploradas
- **Remotion por tramos para largos:** tramos ≤ 3 min cortados en límite de capítulo, concat sin recodificar, retoma si se corta; concurrency 2 compartiendo máquina con otro canal.
- **GitHub Actions `producir.yml` de a uno** (`salida/tmp/nube-cola.sh`): funciona; en paralelo se pierden ejecuciones por la cancelación de pendientes.
- Foco por `/eval` + seleccionar todo + `/tipear` como respaldo cuando `/escribir` no cambia el título.

## Agregado
- Plantilla `largo` (`src/plantillas/largo`, 1920×1080 30 fps): apertura ≤ 20 s, tarjeta de título, capítulos con barra, contador de km/años, trazado progresivo, tarjetas, cotas, polaroids, fuente en pantalla, cierre con serie + teaser + marca una vez; validador de ritmo (sin tramos estáticos > 8 s, texto ≥ 1 s por cada 3 palabras, cámara R1–R5, duración 8:00–10:30).
- Scripts `scripts/preparar-largo.mts` y `scripts/render-largo.mts`; subidor `herramientas/navegador/subir-studio-largo.mjs` (releer título + respaldo `/tipear`; `BORRADOR=1`, `RETOMAR=1`; `LP_CANAL_ID` obligatorio).
- Docs: `docs/PLAN-SEMANAL.md` (largo dominical a las 19:00; 11-15 = "El mar de Bolivia"; 4 Shorts de la nube asignados), `contenido/calendario.json` (`ranurasLargo` 19:00), `docs/DECISIONES.md`; skills `videos-largos` §9, `incidentes-canal` (5 y 5b) y `canal-youtube-automatico` (paso 4b).

## Pendiente
- **Santiago:** verificar el teléfono del canal (aviso del panel `lp-2026-11-08-verificar-telefono`); quitar del crontab la línea de los sábados 05:30 (`compilar`); renovar OAuth antes del 2026-11-15.
- Subir el largo de Bushby a las 19:00 y programar el Short de soldados (lun 11-09 18:00) cuando se libere el cupo.
- Terminar la cola de la nube (3 Shorts) y programarlos en Studio en orden de fecha.
- Escribir el guion del largo "El mar de Bolivia" (dom 11-15 19:00); medir retención/CTR/horas del primer largo y anotarlo en `videos-largos` §9.
- Reordenar los temas desplazados por los Shorts de la nube (Alaska–Rusia, Atacama, Clipperton 2, Canal de Panamá) en el ritual del miércoles.
