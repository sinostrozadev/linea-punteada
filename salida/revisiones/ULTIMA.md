# Revisión 2026-11-06 · Línea Punteada (sesión nocturna 2026-11-05 21:00 → 2026-11-06 08:30)

Formato fijo (lo lee el panel): Detectado · Mejorado · Herramientas exploradas · Agregado · Pendiente.

## Detectado
- Laguna del Desierto (Short 18:00 del 11-05) desorienta: 43 planos en 150 s, zooms en diente de sierra ±1 nivel y 4 cortes secos a cientos de kilómetros. Santiago lo vio y lo dijo; el zoom no molesta, el corte seco a otro lugar sí.
- La identidad de Studio en el piloto compartido quedaba en otro canal (Bolita Lab / En Números Rojos): la subida fallaba con "timeout esperando input de archivo" y las capturas de métricas daban "Oops, no permission".
- Studio recuerda la última categoría del canal (Educación) y el paso "categoría" del subidor esperaba la por defecto (People & Blogs): fallo "locator People & Blogs timeout".
- Las cifras que el lector de métricas sacaba del texto de Studio eran implausibles (28 d = 15.000 vistas en un canal con 2.645). La captura de monetización mostraba solo la cabecera, sin las barras al YPP.
- El reinicio de la máquina (21:21) mató el render en curso; el diario no se relanza solo.
- `claude -p` en el cron de las 04:45 no escribió guiones: los 3 intentos fallaron (código 124 = 10 min sin respuesta y código 1) con el aviso "this sign-in ends between 2026-11-07 and 2026-11-10". Backlog en 0.
- El plan semanal (docs/PLAN-SEMANAL.md) existe pero `generar-guiones` todavía no lo lee: los guiones salen de la rotación, no del plan.
- El modelo de "mejoras" no era visible para Santiago: estaba repartido entre DECISIONES.md, el estado y los commits.

- **Los guiones de `claude -p` salen con hechos de memoria, sin verificar:** el proceso hijo no tiene WebSearch/WebFetch ni Write (lo reportó él mismo al terminar el guion de Uruguay: fechas, cifras de población y 3 URLs de Wikipedia escritas de memoria). El paso "investigación con fuentes primarias" de `guiones-de-video` hoy no ocurre en el generador automático: hay que meterlo antes (ideas ya investigadas en el plan) o después (revisor que verifique cada cifra con el piloto/web) antes de renderizar.

## Mejorado
- **Gramática de cámara R1–R5** con severidad (`src/plantillas/comun/camara.ts`, enganchada al `superRefine` de frontera, lugar y ruta): error solo por corte seco a un lugar fuera de pantalla (R2/R5) o plano < 1 s (R4); aviso por diente de sierra (R1), R3 y ráfagas (R4). `scripts/camara.mts <guion|props> --solo-resumen` lo audita. Laguna: 22–24 violaciones; Triángulo: 0. Los 3 guiones del backlog bajaron de 42/42/38 a 32/31/33 planos y se re-renderizaron.
- `subir-studio.mjs` verifica y cambia el canal antes de subir (`asegurarCanal`, exige `LP_CANAL_ID`) y tolera la categoría ya puesta. Rivera y Campo de Hielo subieron solos; Martín García se terminó a mano por curl al piloto.
- `scripts/metricas.mts`: captura de monetización a página completa; descarta vistas 28 d/48 h si superan las totales; cambia de canal antes de capturar; enganchado al final de `scripts/estado.mts` (`--sin-metricas` para saltarlo).
- `scripts/subir.mts`: los largos van en categoría 27 (Educación), no 24.
- Documentación al día: `docs/DIRECCION-VISUAL.md` §1b, `docs/GUION.md` §4b/§7, `docs/DECISIONES.md`, `docs/ESTADO-2026-11-05.md` (cierre 02:40), `docs/ESTRATEGIA.md` con el objetivo en la primera línea.
- `.wslconfig` con `memory=12GB` y `swap=8GB` (respaldo `.wslconfig.bak-2026-11-05`); vale al reiniciar WSL.

- **Generador de guiones arreglado** (10:00): `claude -p` usa Opus por defecto y escribe de a un guion (414 s cada uno medido); el diario le da 45 min por plantilla; rotación solo `frontera` hasta revisar `lugar`/`ruta`. Primer guion nuevo en el backlog: "La guerra por un petróleo que no estaba" (0 errores de cámara, 3 avisos).

## Herramientas exploradas
- **Piloto compartido (8777) con cambio de identidad por canal**: `/clicktexto Switch account` → youtube.com/account → clic en el canal. Funciona para subir y para capturar métricas; documentado en `navegador-piloto` e `incidentes-canal`.
- **Captura de página completa del piloto** (`/captura` con `full=1`) para pantallas largas de Studio (monetización).
- **GitHub Pages para el panel** (https://sinostrozadev.github.io/panel/): publicación estática desde `scripts/publicar.sh`, sin servidor; el dominio sinodev.cl queda para después (CNAME).
- **gh api para visibilidad de repos** (`gh api -X PATCH repos/... -f private=false`): el `gh repo edit --visibility` de esta versión no sirve.
- **flock** como lock de render compartido entre canales (`/tmp/bolita-render.lock`): prueba con `-w 60`, producción con `-w 1800`.
- Pendiente de probar: `claude setup-token` (token de larga vida para `claude -p` en cron sin depender del inicio de sesión), carátulas por GPT (skill `caratulas-con-gpt`, mecanismo de Entender Chile).

## Agregado
- 7 skills globales nuevas: `crear-canal`, `guiones-de-video`, `superar-virales-del-nicho`, `estrategia-viva`, `metricas-diarias`, `plan-semanal`, `videos-largos`; y 21 contradicciones corregidas entre las 18 skills.
- Estado compartido `~/.claude/canales/` (canales.json, calendario.json con ventanas y turnos, estado/<slug>.json "trabajando ahora").
- Panel de canales (repo `sinostrozadev/panel`): podio, tabla, barras al YPP, planes, estrategias, trabajando ahora, calendario; local :8790 y público.
- `docs/PLAN-SEMANAL.md` con 24 ranuras (11-05 → 11-15) en tabla + JSON.
- Métricas diarias (4 capturas + JSON) portadas a Bolita Lab y Entender Chile.
- Repos públicos: bolita-lab, entender-chile, linea-punteada (creado esa noche), panel.
- Esta carpeta `salida/revisiones/` con el formato fijo que lee el panel.

## Pendiente
- **PRIMERO esta noche, antes de las 04:45:** verificar con web (agente Opus) los hechos y las URLs de los 5 guiones de frontera del backlog (generados de memoria por `claude -p`); corregir o descartar. Sin eso, el diario renderiza el primero para el 11-08 12:00.
- `claude auth login` (Santiago) antes del 2026-11-07 y, para el cron, `claude setup-token` → `CLAUDE_CODE_OAUTH_TOKEN` en el crontab; sin eso no hay guiones nuevos.
- Backlog en 0 (mínimo 8): regenerar hoy en cuanto `claude -p` responda.
- Estrenar `lugar` (Clipperton) y `ruta` (Bushby) tras revisar la hoja de contacto; plantilla 16:9 para el largo del domingo.
- Revisor independiente de guiones (`scripts/revisar-guion.mts`) y `generar-guiones` leyendo el plan.
- Lector de cifras de Studio (28 d, 48 h, progreso YPP) y la captura de alcance, que falló por tiempo de carga.
- Token de YouTube del canal (métricas por API) y CNAME `panel.sinodev.cl`.
