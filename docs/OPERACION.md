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
| Compilación | `npx tsx scripts/compilar.mts --n 10` |
| Solo el satélite / las fotos | `npx tsx scripts/mapas.mts <guion.json>` · `npx tsx scripts/imagenes.mts <guion.json>` |

Variables: `LINEA_MEMORIA_MIN_MB` (1500), `LINEA_CONCURRENCIA` (1), `LINEA_RENDER_MAX_MIN` (150), `LINEA_LOCK_RENDER`
(`/tmp/bolita-render.lock`), `LP_CANAL_ID` (id del canal para subir-studio), `FFMPEG_BIN` (compilar).

## Calendario (`contenido/calendario.json`)
2 Shorts diarios **12:00 y 18:00 America/Santiago**, largo **domingo 10:00**, rotación `frontera → lugar → ruta`
(el diario intercala las 3 plantillas; si a una no le quedan guiones usa la que tenga), mínimo 4 en bandeja y 8 en backlog.

## Cron
`scripts/cron.txt` (04:45 diario, sábado 05:30 compilación, 08:15 estado): lo instala Santiago (`crontab -e`).

## Lo que exige a Santiago
Instalar el cron, el id del canal (`LP_CANAL_ID`), el token OAuth propio del canal (`subir.mts autorizar`, mismo proyecto de
Google Cloud que Bolita Lab) y los consentimientos de Studio (skill `canal-youtube-automatico`).
