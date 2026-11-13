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
| Día completo | `npx tsx scripts/diario.mts` (`--solo-render`, `--n K`, `--solo-subir`, `--sin-generar`, `--sin-subir`, `--guion <texto>`, `--dry-run`) |
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
(`/tmp/bolita-render.lock`), `LP_CANAL_ID` (id del canal para subir-studio), `FFMPEG_BIN` (compilar), `LINEA_NUBE` (1 en Actions),
`LINEA_ARTEFACTO` (lo pone el workflow: dónde está el mp4).

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

## Hito del miércoles: semana asegurada (orden de Santiago, 2026-11-08)
El cupo semanal del Max se renueva los **miércoles**. Cada miércoles en la noche quedan escritos, verificados y dirigidos los guiones de
TODAS las ranuras **jueves → miércoles siguiente**, arrancan los renders (local en serie con el lock; nube donde exista) y el **jueves**
todo está `programado` en Studio con su fecha (tope jue 23:59; resto el viernes con ≥ 72 h de colchón). Solo después el cupo sobrante va a
mejoras o canales nuevos. El bloque "Hito del mié AAAA-MM-DD" arriba de `docs/PLAN-SEMANAL.md` lleva la cuenta; `estado.mts` avisa
"⚠ hito del miércoles" si quedan ranuras sin programar antes del próximo miércoles. Regla: skill `plan-semanal` §5b y `operacion-diaria` §0.

## Producción en la nube (GitHub Actions)
Para no depender del PC de Santiago, el mismo `diario.mts` corre en un runner de GitHub (repo público → minutos gratis):
`.github/workflows/producir.yml` ("Producir Shorts", <https://github.com/sinostrozadev/linea-punteada/actions>). Copia del
modelo de Bolita Lab (`bolita-lab/docs/OPERACION.md` § "Producción en la nube").

**Qué hace.** checkout de `main` → Node 22 + `npm ci` (caché npm) → `fonts-noto-color-emoji` → `npx remotion browser ensure`
→ `diario.mts --sin-generar --sin-subir --n <cuantos> [--guion <texto>]` con `LINEA_NUBE=1` → `scripts/hojas.mts` (hoja de
contacto liviana `salida/revisiones/hojas/<id>.jpg`, 6 fotogramas, ≤ 150 KB) → artifact **`shorts-<fecha>`** con los mp4
(14 días) y `logs-<fecha>-<intento>` → commit del bot `bot: producción <fecha>` (`.github/scripts/commit-bot.sh`):
`contenido/backlog` y `contenido/guiones` (el guion consumido se mueve, como en local), `salida/bandeja/<id>.json` (con
`artefacto` = nombre + URL del run), `PARA-SUBIR-A-MANO.md` y la hoja. Timeout 330 min; `concurrency: producir`.
- Todo lo de `preparar-frontera` va sin credenciales (Edge TTS, NASA GIBS/Sentinel-2, Natural Earth, Commons). Los guiones
  llegan **ya escritos** al backlog: la nube no corre `claude -p` (requeriría el token de Claude como secreto: lo decide Santiago).
- Runner: 4 vCPU / 16 GB en repo público → `LINEA_CONCURRENCIA=3` (2 si la máquina es menor; lo calcula el workflow).
  El lock `flock` y el mínimo de RAM (1500 MB) se cumplen solos (`flock` viene en ubuntu-latest, nadie más renderiza).
  `LINEA_NUBE=1`: los json 'listo' sin mp4 no son huérfanos y un render fallido hace fallar el run (lo producido igual se commitea).
- **Sin pisar a nadie:** el bot hace `git pull --rebase` antes del push; si hay **conflicto** (p. ej. una sesión local commiteó
  el mismo guion) el job falla con `::error::` y no fuerza nada. Sin bucles: el push del bot usa `GITHUB_TOKEN` (no dispara
  workflows), `paths` no incluye `salida/` y el job se salta si el último commit empieza por `bot:`.
- **Disparadores automáticos apagados** (`schedule` 07:45 UTC = 04:45 Chile y `push` a `contenido/backlog/**` o
  `contenido/calendario.json`): solo corren si la variable de repo `LINEA_NUBE_AUTO` = `1`. Motivo: el cron local de las 04:45
  no hace pull ni commit; si ambos corren, renderizan el mismo guion. Encenderla = apagar antes la línea del diario en el
  crontab (Santiago) o usar `--guion` para repartir.

**Cómo se lanza.**
```
gh workflow run producir.yml -R sinostrozadev/linea-punteada -f cuantos=1 [-f guion=uruguayo]
gh run list -R sinostrozadev/linea-punteada -w producir.yml -L 3 ;  gh run watch -R sinostrozadev/linea-punteada <run-id>
```
Después: `git pull` en local (el bot movió el guion y escribió el json de la bandeja).

**Bajar los mp4 y subirlos por Studio.**
```
gh run download <run-id> -R sinostrozadev/linea-punteada -n shorts-<fecha> -D salida/bandeja/
LP_CANAL_ID=UCp05AZK18-TL8pp74ntbdUw node herramientas/navegador/subir-studio.mjs <id> <AAAA-MM-DD> <HH:MM>
```
(el json `salida/bandeja/<id>.json` ya viene con el pull; `subir-studio` necesita el piloto 8777 encendido).

**Subida por API (apagada).** Gancho reservado: input `subir` o variable `LINEA_SUBIR=1` → hoy solo emiten un aviso y el run
sigue con `--sin-subir`. Para encenderla falta, todo de Santiago: (1) que Google apruebe la auditoría de la API (proyecto
bolita-lab; mientras tanto lo subido por API queda privado), (2) el token OAuth propio del canal (`npx tsx scripts/subir.mts
autorizar`) y (3) `gh secret set YOUTUBE_CLIENT_JSON` + `gh secret set YOUTUBE_TOKEN_JSON` en este repo. Recién entonces se
agregan al workflow los pasos de credenciales de Bolita Lab (escribir `secrets/`, correr sin `--sin-subir`, borrar `secrets/`).

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

### Producción en la nube POR FRAGMENTOS (2026-11-13, reemplaza el flujo de un solo runner)
`producir.yml` ahora trabaja un video por run en 3 etapas: **preparar** (1 job: promueve el guion, voz, sonido, mapas, props; lee los frames con `remotion compositions`) → **fragmento ×N** (matriz, cada uno en su runner de 4 vCPU: `--frames a-b --codec=h264-mkv --audio-codec=pcm-16 --concurrency=4`) → **final** (une con ffmpeg de Remotion `-c copy`, codifica AAC 192k una vez, `diario.mts` con `NUBE_FASE=final` deja el json de bandeja, hoja de contacto, artifact `shorts-<fecha>-<run>` con mp4+json+hoja+guion, 14 días). Hooks en `diario.mts`: `NUBE_FASE=preparar|final` (sin la variable todo es igual que antes).
- Lanzar: `gh workflow run producir.yml -f guion=<texto o ruta> [-f fragmentos=10] [-f commit=true]`; seguir: `gh run watch <id>`; bajar: `gh run download <id> -D salida/nube/`. A mano NO commitea (solo artifact) salvo `commit=true`; cada run a mano es independiente (se pueden lanzar varios a la vez). schedule/push siguen APAGADOS salvo variable de repo `27 capas satelitales de 2880 px por frame=1`.
- Medido 2026-11-13: x
- Cuello de botella: el costo por frame del render (Short frontera 134,5 s @60 fps (8.070 frames, 27 capas satelitales), 10 fragmentos: **8 min 05 s** de pared (preparar 65 s, fragmentos 132-378 s, final 37 s); antes 1 runner: 22 min de render (23 min el job). mp4 verificado: 1080x1920@60, 134,47 s, h264+aac.); más fragmentos = más rápido (el reparto no es parejo: el más lento manda). Sin fragmentar, 4 vCPU rinden ~6,5 fps en frontera y ~2 fps en ritmo (swangle). Concurrency 4 vs 3 ≈ -14 %; `--gl`, calidad JPEG y escala no cambian nada (medido). Caché de Chrome y de mapas ahorra segundos, no minutos.
- Pendiente: largos (`render-largo.mts` ya parte en tramos: falta mapearlos a la matriz; no hay guion largo commiteado para medir); lotes semanales (script que lance un run por guion); `maquina` sin medir.
