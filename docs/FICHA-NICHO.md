# Ficha de nicho — Canal 2: geografía narrada en español

**Fecha:** 2026-11-05 · **Autor:** Fable (sesión principal) con 4 agentes (Opus referentes, Sonnet material, Sonnet
verificación de hechos, Haiku handles) · **Estado:** lista para decisión de Santiago · Skill: `arranque-de-nicho`.
Anexos: `docs/REFERENTES.md` (16 canales medidos), `docs/MATERIAL-Y-HERRAMIENTAS.md` (licencias y pila técnica),
`docs/IDEAS-INICIALES.md` (20 guiones con verificación de hechos).

## 1. Tesis (una frase)
**Shorts de 2–3 minutos que cuentan una historia completa sobre un mapa** (una frontera rara, una ruta humana absurda o un
lugar que "no debería estar ahí"), para público latino de 18–45 años, **contados desde el sur del mundo** (Chile y
Latinoamérica como punto de partida, el mundo como destino), con la fórmula mito → "la verdad es más rara" → fuente en la
voz → giro → cierre simétrico, y **una versión larga (6–8 min, 16:9) semanal** del mejor tema para sumar horas.

## 2. Prueba de demanda (regla: 3 referentes con ≥ 1 M por video en el último mes)
| Referente | Evidencia (≤ 60 días) | Formato |
|---|---|---|
| **Ñerd** (ES, nació 2026-10-21) | 15,76 M vistas en 14 días con 41 Shorts; 3 Shorts ≥ 1 M: Arizona 4,2 M, Canadá 1,33 M, Chile 1,11 M | Shorts 2–3 min |
| **Geografía con Geoff** (ES) | "Por Qué Nadie Vive en Esta Enorme Parte de la Costa de África" 3,64 M (2026-09-12); 3,07 M vistas/28 días | Largos traducidos del inglés |
| **GeoGlobeTales** (EN) | 45,3 M vistas en 28 días; Karl Bushby 61 M, Darién 48 M, fronteras de España 47 M | Largos + Shorts |

Cumple con matiz: en español hay **dos** canales activos sobre 1 M (uno con 2 semanas de vida); el tercero es el techo
en inglés que ya está entrando al español por traducción (Geoff) y por doblaje automático (abierto a todos desde 2026-02).
Lectura: la demanda existe y el hueco en Shorts en español está casi vacío; la ventana se cierra cuando los anglos doblen.
Un Mundo Inmenso (1,79 M subs, la vara de calidad) no hace Shorts. Detalle y fuentes en `docs/REFERENTES.md`.

## 3. Capacidad de producción
**La fábrica actual hace el 60 %.** Se reutiliza del repo madre (`/home/santiago/projects/yt/bolita-lab`): voz con límites
por palabra (`scripts/voz.mts`), subtítulos palabra a palabra y rótulos sincronizados (plantilla `dato`), fotos de Commons
con filtro de licencia y créditos automáticos (`scripts/imagenes-dato.mts`), sonido sintetizado (`sonido-dato.mts`,
`lib/wav.mts`), el prompt de guion con la fórmula Ñerd (`generar-guiones.mts`), bandeja/diario/estado/subir, el piloto y
`subir-studio.mjs`, compilador 16:9 (`compilar.mts`).
**Lo nuevo:** mapas. Pila mínima sin WebGL: `d3-geo` + `d3-geo-projection` + `topojson-client` + `versor` con **Natural
Earth** (dominio público) y **geoBoundaries** (CC BY) para vectores, **NASA GIBS/Blue Marble/Landsat** (PD) para satélite.
Descartados por licencia: GADM, tiles de OSM, Esri, Mapbox/MapTiler. Detalle en `docs/MATERIAL-Y-HERRAMIENTAS.md`.

| Etapa | Qué | Días de Claude |
|---|---|---|
| **1. Arranque** | plantillas `frontera` y `lugar`, pipeline guion→props con descarga de mapa/satélite/foto con licencia, 20 guiones, canal creado, 10 Shorts programados | 6–8 |
| **2. Rutas** | plantilla `ruta` (globo/mapa con trayecto animado e hitos con fecha); Short + largo de Karl Bushby | 3–4 |
| **3. Largos** | plantilla 16:9 narrada (no solo compilación), 1 por semana | 3–4 |
Total 12–16 días; la etapa 1 sola ya deja el canal andando. Si el ritmo exige más de ~3 Shorts/día, la RAM (7,6 GB) es el
cuello de botella real: render de uno a la vez, nunca junto al piloto.

## 4. Diferenciación (no copiar a Ñerd)
Ñerd = fronteras raras del mundo, cualquier país, sin hilo. Nosotros:
1. **Historias humanas con mapa** (lo que más rinde en GeoGlobeTales y UMI y Ñerd no hace): una persona, una ruta, un
   tiempo absurdo. Abre con Karl Bushby (salió de Punta Arenas en 1998, llegó a casa el 2026-11-02: noticia fresca, ángulo
   chileno propio).
2. **Punto de vista del sur**: Latinoamérica como origen de la mirada (Acre, Clipperton, Chamizal, Martín García, Campo de
   Hielo, Puerto Williams…), sin encerrarse en ella.
3. **Tres plantillas visuales distintas** (`frontera`, `ruta`, `lugar`) en rotación → variación real contra "inauténtico".
4. **Series con hilo** ("Lo que pasó después", "El canal que mató una ciudad" → Bushby): razón para volver.
5. **Short + largo del mismo tema** (lo que hacen Geoff y GeoGlobeTales): el Short suscribe, el largo suma horas.
6. Nunca títulos de ranking ("Los 15…"), nunca "Descubren… CAMBIARÁ": son los formatos que caen o huelen a IA.

**Identidad: 3 opciones (handles comprobados libres el 2026-11-05)**
| | Nombre · handle | Lema | Por qué |
|---|---|---|---|
| **A (recomendada)** | **Línea Punteada** · `@lineapunteada` | "Cada línea del mapa esconde una historia." | La línea punteada es frontera, ruta y "pendiente" a la vez: sirve a los tres formatos. Marca visual inmediata (la línea se dibuja en el frame 0). Nombre libre también como marca. |
| B | **Sur del Mapa** · `@surdelmapa` | "El mundo contado desde el sur." | Identidad latina más fuerte y defendible frente a los doblajes anglos; riesgo: suena a "solo Sudamérica". |
| C | **Atlas del Sur** · `@atlasdelsur` | "Historias que caben en un mapa." | Serio y escalable a largos/documental; menos gancho en Shorts. |
Ocupados o dudosos: `@mapararo`, `@puntoenelmapa`, `@elcartografo`. Paleta propuesta (válida para las 3): fondo azul
noche `#0B1D2E`, línea/rótulo clave amarillo `#FFD23F`, agua y rutas celeste `#4FC3F7`, texto blanco, acento "aquí" coral
`#FF5E5B`. Voz: `es-MX-JorgeNeural` (ya probada en `dato`) como base y prueba A/B con `es-CL-LorenzoNeural` en los 10
primeros; nunca presentarla como persona. Idioma: español neutro con cifras redondeadas en la voz.

## 5. Riesgos y mitigación
| Riesgo | Nivel | Mitigación |
|---|---|---|
| Content ID | bajo | mapas propios (NE/geoBoundaries), satélite NASA PD, fotos Commons con licencia, música sintetizada |
| Imágenes sin licencia / personas vivas (Bushby) | medio | solo Commons con licencia explícita y crédito; personas = ruta/silueta/mapa, no fotos sueltas |
| "Contenido inauténtico" YPP | medio | 3 plantillas, guion propio por video, fuente nombrada en la voz, descripción distinta, ≤ 60 % una plantilla; checklist `monetizacion-youtube` por video y por tanda |
| Tema sensible (disputas activas: triángulo terrestre, Bolivia-mar, Esequibo) | medio | solo hechos con fuente (fallos CIJ, tratados), las dos versiones, cero opinión; Esequibo a reserva |
| Público castiga la IA (Urckari pone "(SIN IA)") | medio | narrativa con fuentes, voz cuidada, no decir "IA"; divulgar voz sintética en descripción |
| Saturación / Ñerd a 20 por semana | medio | no repetir sus temas (lista en REFERENTES §6); ganar por ángulo y series, no por volumen |
| Doblaje automático de los gigantes en inglés | medio-alto | velocidad: abrir en noviembre, apropiarse de los temas latinos antes |
| RAM 7,6 GB (render + piloto) | alto operativo | lock de render compartido con Bolita Lab, un render a la vez, `.wslconfig memory=12GB` (pendiente de Santiago) |
| Edge TTS no oficial | bajo-medio | Kokoro en la RTX 3060 o Azure como relevo documentado |

## 6. Ruta al YPP
**Las dos.** Shorts: 10 M vistas en 90 días = 111 k/día; Ñerd hace ~1,1 M/día con ~3 Shorts/día, así que el objetivo es
alcanzable con 2–3 Shorts/día si 1 de cada 10 pasa el millón. Largos: 1 por semana de 6–8 min (versión larga del mejor
Short + material extra) apunta a las 4.000 h en paralelo y es el seguro si YouTube castiga el volumen de Shorts.
Suscriptores: 1.000 en el primer mes es realista (Ñerd: 18,5 k en 14 días).

## 7. Cadencia, horarios, duración
- Semanas 1–2: **2 Shorts/día** (12:00 y 18:00 Chile) por Studio con el piloto; semana 3 en adelante: 3/día si el colchón
  (≥ 3 días renderizados) y la RAM lo permiten. 1 largo los domingos.
- Duración objetivo: Shorts **120–170 s** (historia completa; Ñerd usa el máximo de 3 min), largos 6–8 min.
- Cron propio del canal (horas distintas a Bolita Lab para no chocar en RAM: diario 04:45, compilar sáb 05:30).

## 8. Hand-off para el agente que arranque el canal (skill `canal-youtube-automatico` §2)
- **Repo nuevo** `/home/santiago/projects/yt/<slug del nombre elegido>` (hoy el borrador vive en
  `/home/santiago/projects/yt/geografía`; hay una carpeta vacía `narrada` al lado, sobrante de un `mkdir` con espacio).
  Copiar del repo madre: `scripts/lib/`, `voz.mts`, `imagenes-dato.mts`, `sonido-dato.mts`, `estado.mts`, `diario.mts`,
  `subir.mts`, `compilar.mts`, `herramientas/navegador/subir-studio.mjs`, `src/plantillas/marca` como base, `remotion.config.ts`.
  No duplicar el piloto: se usa el de Bolita Lab (puerto 8777, un solo usuario a la vez).
- **Plantillas a construir y su fórmula:**
  1. `frontera` — satélite NASA (GIBS WMS) o mapa NE + línea de frontera que se dibuja + zoom lento + rótulos de 1–2
     palabras sincronizados; guion Ñerd completo. Frame 0: el mapa con la pregunta ("¿Por qué…?") ya legible.
  2. `ruta` — globo ortográfico o Mercator regional con trayecto animado (`strokeDasharray`), hitos con fecha y distancia
     acumulada; guion "una persona, una ruta, un tiempo": quién → por qué → tres obstáculos → giro → cierre.
  3. `lugar` — foto histórica/actual de Commons con Ken Burns + mapa inset con el punto parpadeando + rótulo; guion
     "¿por qué está ahí?": lo raro → la explicación obvia → la verdad → consecuencia hoy → cierre.
  Comunes: zona segura 9:16, subtítulos arriba, cabecera con el lugar, crédito pequeño por imagen, cierre de marca 1,5 s,
  `creditos[]` en el JSON que arma la descripción sola.
- **20 ideas iniciales** verificadas en `docs/IDEAS-INICIALES.md` (hechos, cifras, fuentes y foto de Commons por idea).
- **Cuentas:** canal de marca nuevo en la cuenta de Santiago (lo crea el piloto; nombre/handle = decisión de abajo);
  mismo proyecto Google Cloud `bolita-lab` y misma auditoría; token OAuth propio del canal; cupo de API compartido
  (≈ 6 subidas/día entre todos) → primero Studio.
- **Checklist de monetización** pasado antes de la primera tanda (skill `monetizacion-youtube` §3–4) y registro en
  `docs/MONETIZACION.md` del repo nuevo.

## 9. Decisión de Santiago (lo único que se le pide)
1. **Nombre y handle:** A `Línea Punteada` (recomendada), B `Sur del Mapa`, C `Atlas del Sur`, u otro.
2. **Voz:** base `es-MX-Jorge` con A/B chileno (recomendado), o chileno desde el día 1.
3. **Ritmo de arranque:** 2 Shorts/día + 1 largo semanal (recomendado), o solo Shorts al principio.
Con el 1 se crea el repo y el canal; el resto arranca solo. Recomendación de Fable: **A + voz base MX con A/B + 2/día y largo semanal**,
porque el nombre sirve a los tres formatos, la voz ya está probada en producción y el largo semanal es el seguro ante el
riesgo de "producido en masa".
