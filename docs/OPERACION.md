# Operación de Línea Punteada

Igual que la fábrica de Bolita Lab (`/home/santiago/projects/yt/bolita-lab/docs/OPERACION.md`), adaptada al canal.

## Flujo
```
generar-guiones ─► contenido/backlog/<plantilla>-<slug>.json            (id "pendiente-<plantilla>-<slug>")
        diario ─► promueve a contenido/guiones/<fecha>-<plantilla>-<slug>.json
               ─► scripts/preparar-<plantilla>.mts  ─► salida/trabajo/<id>.props.json  (voz, sonido, fotos, satélite)
               ─► flock /tmp/bolita-render.lock remotion render ─► salida/bandeja/<id>.mp4 + <id>.json ('listo')
               ─► subir --todos (API auditada + token) o PARA-SUBIR-A-MANO.md; por Studio: herramientas/navegador/subir-studio.mjs
     compilar ─► salida/compilaciones/<fecha>-compilacion.mp4 (largo 16:9 con los Shorts de la semana)
```

## Plantillas
| Plantilla | Composición | Preparar | Qué es |
|---|---|---|---|
| `frontera` | `Frontera` | `scripts/preparar-frontera.mts` | frontera curiosa sobre satélite (`src/plantillas/frontera/`) |
| `lugar` | `Lugar` | `scripts/preparar-lugar.mts` | foto Ken Burns + mapa inset (`src/plantillas/lugar/README.md`) |
| `ruta` | `Ruta` | `scripts/preparar-ruta.mts` | globo, línea que se dibuja y contador (`src/plantillas/ruta/README.md`) |

Cada una trae su `ejemplo.json` propio (nunca se importa desde `contenido/`) y se registra en `src/Root.tsx` con `registrar()`.

## Comandos
| Qué | Comando |
|---|---|
| Estado | `npx tsx scripts/estado.mts` |
| Día completo | `npx tsx scripts/diario.mts` (`--solo-render`, `--n K`, `--solo-subir`, `--sin-generar`, `--dry-run`) |
| Generar guiones | `npx tsx scripts/generar-guiones.mts --plantilla frontera --n 5 [--mostrar-prompt]` |
| Preparar uno a mano | `npx tsx scripts/preparar-<plantilla>.mts <guion.json>` (`preparar-frontera`, `preparar-lugar`, `preparar-ruta`) |
| Render de prueba | `npx remotion render src/index.ts <Frontera|Lugar|Ruta> salida/pruebas/<id>.mp4 --props=salida/trabajo/<id>.props.json --scale=0.5 --concurrency=1 --x264-preset=veryfast` |
| Fotogramas de revisión | `npx tsx scripts/fotogramas.mts <video.mp4>` |
| Subir por Studio (piloto de Bolita Lab encendido) | `LP_CANAL_ID=UC… node herramientas/navegador/subir-studio.mjs <id> <AAAA-MM-DD> <HH:MM>` |
| Subir por API / exportar | `npx tsx scripts/subir.mts subir --todos` · `npx tsx scripts/subir.mts exportar` |
| Métricas del día (capturas + JSON) | `npx tsx scripts/metricas.mts` (`--sin-capturas`, `--fecha`); lo llama `estado.mts` (`--sin-metricas` lo omite) |
| Compilación | `npx tsx scripts/compilar.mts --n 10` |
| Solo el satélite / las fotos | `npx tsx scripts/mapas.mts <guion.json>` · `npx tsx scripts/imagenes.mts <guion.json>` |

Variables: `LINEA_MEMORIA_MIN_MB` (1500), `LINEA_CONCURRENCIA` (1), `LINEA_RENDER_MAX_MIN` (150), `LINEA_LOCK_RENDER`
(`/tmp/bolita-render.lock`), `LP_CANAL_ID` (id del canal para subir-studio), `FFMPEG_BIN` (compilar).

## Calendario (`contenido/calendario.json`)
2 Shorts diarios **12:00 y 18:00 America/Santiago**, largo **domingo 10:00**, rotación `frontera → lugar → ruta`
(el diario intercala las 3 plantillas; si a una no le quedan guiones usa la que tenga), mínimo 4 en bandeja y 8 en backlog.

## Plan semanal (`docs/PLAN-SEMANAL.md`)
Skill global `plan-semanal`. Siempre hay plan de la **semana en curso y de la siguiente** (lunes→domingo, America/Santiago): una
ranura por cada hora del calendario (Shorts y largo), con plantilla, tema, tipo (`contingente`/`evergreen`/`serie`), fuente de la
contingencia (URL + fecha), estado (`idea` → … → `publicado`), referente y por qué entra. **Manda el bloque ```json** del final (lo
leen `estado.mts` y el panel de Santiago); la tabla se regenera desde él. `estado.mts` avisa si quedan **< 3 Shorts futuros con
guion** o si no hay ranuras a más de 7 días: entonces toca el ritual de cierre (métricas → duplicar lo que rinde → contingencias de
los próximos 14 días → llenar la semana siguiente → encargar guiones → `DECISIONES.md`). Pendiente: que `generar-guiones.mts` tome
los temas de las ranuras `idea`/`investigado` del plan en vez de inventarlos.

## Cron
`scripts/cron.txt` (04:45 diario, sábado 05:30 compilación, 08:15 estado): lo instala Santiago (`crontab -e`).

## Lo que exige a Santiago
Instalar el cron, el id del canal (`LP_CANAL_ID`), el token OAuth propio del canal (`subir.mts autorizar`, mismo proyecto de
Google Cloud que Bolita Lab) y los consentimientos de Studio (skill `canal-youtube-automatico`).

## Métricas diarias (`salida/metricas/AAAA-MM-DD/`)
Skill global `metricas-diarias`. A las 08:15 `estado.mts` llama a `scripts/metricas.mts` (sin línea nueva en el cron): guarda 4 capturas
de Studio (`1-overview`, `2-monetizacion`, `3-alcance`, `4-contenido` .png + .txt con el texto) y `metricas.json` (subs, vistas por video con
curl público, progreso al YPP leído de Studio). Es material del video "camino a la monetización": **no se borra nunca** y sí se commitea
(`fallo-*.png` no). Requiere el piloto en :8777 **con Studio en el canal Línea Punteada**; si Studio está en otro canal de marca las capturas
quedan como `fallo-*.png` y `capturas` en el JSON lo dice (se siguen guardando los números públicos). Antes de capturar, `metricas.mts` asegura el canal con la misma rutina que `subir-studio.mjs` ("Select a channel" → clic en `LP_CANAL_NOMBRE`,
por defecto "Línea Punteada"), más "Switch account" cuando sale "Oops, no permission". Es cambio entre canales de la misma cuenta de Google. **Sin probar
aún contra el piloto**; si el clasificador bloqueara ese clic, habría que dejar la pantalla lista y pedírselo a Santiago. Ojo: el cambio de canal es
de toda la sesión del piloto, así que quien lo use después debe re-asegurar su canal (subir-studio ya lo hace).
