# Dirección visual escena por escena (plantilla `frontera` v2)

El guion no solo dice qué se oye: dice **qué se ve en cada segundo**. Cada línea de voz (el `gancho`, cada escena y el
remate) lleva su dirección visual en el mismo objeto. La plantilla la convierte en planos de cámara y capas
sincronizadas con la voz. Esquema exacto: `src/plantillas/frontera/guion.ts` y `src/plantillas/comun/direccion.ts`.
Ejemplo completo: `contenido/borradores/frontera-triangulo-terrestre.v2.json`. Referente: docs/VISUAL-NERD.md.

## 0. Reglas que valen para todo

- **Momentos.** Todo lo que aparece usa `aparecerEn` (o `dice`, `en`): una **palabra exacta del texto de esa línea**
  (`"1929"`, `"Concordia"`; si se repite, `"Perú#2"` es la segunda vez) o **segundos** desde que empieza la línea
  (`1.5`). Coincide por **palabra completa** normalizada (sin tildes ni puntuación): `"Según"` NO calza con
  `"Segundo"`. El validador rechaza palabras que no estén literales en el texto (y sugiere la parecida) y un `#n`
  pedido más veces de las que aparece.
- **Duración.** Lo declarado en una escena desaparece al terminar la escena. `desaparecerEn` lo corta antes;
  `quedarse: n` lo deja n escenas más; `quedarse: "siempre"` hasta el final.
- **Coordenadas** siempre `[lon, lat]` en grados decimales (oeste y sur negativos).
- **Zoom** tipo mapa web: 4 continente · 6 país · 8 región · 10 provincia · 12 ciudad · 14 barrio · 16 una playa ·
  **17 máximo** (el satélite cercano es Sentinel-2 de 10 m: más allá se ve borroso).

## 1. Reglas de ritmo (lo que hace que se vea como Ñerd o mejor)

1. **Un evento visual cada ~2 s**: plano nuevo, máscara, etiqueta, pin, cota, icono, tarjeta, foto. Si una escena de
   12 s solo tiene un plano y una etiqueta, está muerta.
2. **Un plano nuevo cada 3–6 s**, alternando escala: general (país) → medio (región) → cerrado (el detalle). Vuelve
   al general para explicar y al cerrado para mostrar. Los cortes caen en límite de frase (la plantilla los ajusta).
   Cómo se pasa de un plano a otro (corte, vuelo, paneo) lo fija la **gramática de cámara** (§1b), que es obligatoria.
3. **El detalle se ve grande.** Una cota o un triángulo de 250 m necesita zoom 16,8–17; a zoom 15 mide 50 px y no
   existe. Las áreas que en pantalla miden menos de 70 px no muestran su etiqueta.
4. **Una idea por capa a la vez.** Máx. 1 tarjeta y 1 contexto simultáneos; etiquetas que ya cumplieron, fuera
   (`desaparecerEn`). Las etiquetas de línea se van solas a los ~4 s.
5. **La palabra clave vive en el subtítulo** (caja de acento) y, si hace falta, en `contexto` arriba. Nunca rótulos
   gigantes en medio del mapa.
6. **Cero marca** salvo los 0,8 s finales. **Fuente dicha y mostrada** (`fuente`) al menos una vez.
7. **Nada quieto más de 8 s (automático).** Si un tramo pasa > 8 s sin un cambio notable de encuadre (|Δzoom| ≥ 0,6
   o el centro se corre ≥ 22 % del ancho), la plantilla inserta un **micro-movimiento** cada 5 s: un paneo lento de
   15 % del ancho (hacia el centro del plano siguiente si está a la vista; si no, ida y vuelta) alternado con un zoom
   de ±10 % (primero un pequeño retroceso), con easing largo de 1,2–2,4 s y sin SFX. Un `corte` a un encuadre casi
   idéntico (salto de pocos px que se lee como error) se convierte solo en paneo suave. Lo hace `microMovimientos`
   en `frontera/visual.ts`; no hay que escribirlo en el guion, pero un plano propio cada 3–6 s sigue siendo mejor.
8. **Las etiquetas no se pisan (automático).** Cada etiqueta del mapa (pines, regiones, países, mares, ríos, áreas
   como `MAR DE PERÚ`, etiquetas de línea y las del remate) es una caja medida; se colocan por prioridad
   **remate > pin > región/área > país > mar > río > línea** (a igual prioridad, la que apareció antes) y la de
   menor prioridad se corre a la posición libre más cercana de 8 alrededor de su anclaje (luego un anillo más
   lejos), con una **línea guía fina** si se alejó > 40 px; si no cabe, se oculta. Esquivan también la franja del
   subtítulo, el índice, la tarjeta, el contexto, la fuente, el crédito, las cotas y los iconos quietos. Se resuelve
   con la cámara asentada del plano (no salta durante los vuelos): `frontera/colisiones.ts`. Igual conviene no
   declarar dos etiquetas a 20 m una de otra.
9. **Variar entre videos**: `acento` (amarillo · cian · coral), `mapa.mes` (estación del satélite), iconos y
   pictogramas distintos, índice en fila o vertical.

## 1b. Gramática de cámara (reglas duras; el validador rechaza el guion si no se cumplen)

**Por qué.** Santiago vio "Laguna del Desierto" (2026-11-05) y dijo que tenía "muchos cambios de cámara bruscos dentro
del mapa que dejaban perdido"; el triángulo terrestre no. Medición (tiempos reales de la voz): Laguna 43 planos en
148 s (3,4 s/plano), 18 cortes, cuatro escenas que abren con un corte seco a un plano general centrado a 270–480 km del
anterior, y zoom en **diente de sierra** (10 → 11,4 → 9,4 → 10,4 → 11,4…: ±0,6 a ±2,3 niveles ida y vuelta sobre el
mismo centro). Triángulo: 31 planos en 132 s (4,2 s/plano); cuando cambia de lugar **vuela**; cuando corta, corta al
mismo zoom, acerca de golpe sobre el mismo sujeto o salta ≥ 3 niveles sobre el mismo eje. Con estas reglas el triángulo
da **0 fallas** y Laguna **24** (justo en los puntos que Santiago percibió).

**Cómo se mide.** Se compara cada plano con el **anterior** tal como estaba en pantalla al final (su `zoom + deriva`;
deriva por defecto +0,3). Δz = zoom nuevo − zoom final anterior. El encuadre a zoom z mide 1080 × 1920 px con
`360 / (256·2^z)` grados por px. "**A la vista**" = el centro nuevo cae en el 90 % central del cuadro anterior.
"**Cuadros**" = distancia entre centros medida en anchos (o altos) del cuadro anterior. En `frontera` una escena sin
`planos` hereda el último; en `lugar`/`ruta` vuelve a la cámara automática, así que su siguiente plano no se compara.

| regla | qué exige | umbral |
|---|---|---|
| **R1 · el corte tiene una razón** | Un `corte` solo es válido si es **(a) mismo encuadre**: \|Δz\| ≤ 0,7 y el centro nuevo a la vista; **(b) golpe al sujeto**: acerca entre +0,7 y +3 con el centro nuevo a ≤ 0,6 medio cuadro del centro (en el eje); **(c) cambio de escala claro**: \|Δz\| ≥ 3 (general ↔ detalle, como Ñerd). Un corte que **aleja** entre 0,7 y 3 niveles es diente de sierra: prohibido (usa `zoom`, mantén el zoom o aleja ≥ 3). Un `paneo` no cambia la escala más de ±1,5. | 0,7 · 3 · 0,6 · 1,5 |
| **R2 · fuera de cuadro se vuela** | Si el centro nuevo **no estaba a la vista**, la entrada es `zoom` (vuelo) o `paneo` si es adyacente (≤ 1,5 cuadros). Nunca `corte`. Única excepción: el corte que aleja ≥ 3 niveles **sobre el mismo lugar** (el general se centra a ≤ 0,85 cuadros del plano anterior). Un general "de reorientación" centrado en OTRO lugar es un cambio de lugar: se vuela. | 0,9 · 1,5 · 0,85 |
| **R3 · sin diente de sierra** | Sobre el mismo lugar (centro a la vista), no se acerca y aleja en tramos medianos (0,5 ≤ \|Δz\| < 3) seguidos: **(a)** un corte que acerca de golpe no va pegado a un tramo mediano en sentido contrario (antes o después); **(b)** nunca tres tramos medianos alternando (acercar → alejar → acercar). Los vuelos entre lugares distintos (ruta) no cuentan. | 0,5 · 3 |
| **R4 · duración** | Ningún plano < 1,0 s (parpadeo); nunca dos planos seguidos < 2,0 s (ráfaga); promedio del video ≥ 3,8 s/plano → **máx. 39 planos en 150 s** (con tiempos estimados por palabras, que salen ~7 % largos: ≥ 4,1 s, máx. 36 en 150 s; los mínimos por plano se aplican con 15 % de holgura). El primer y el último plano no cuentan para los mínimos. | 1,0 · 2,0 · 3,8 |
| **R5 · cambio de escena** | Es R1/R2 aplicado al **primer plano de cada escena**: si la escena cambia de lugar, se entra volando (`zoom`) o se abre con un general centrado donde estábamos y desde ahí se vuela; el corte seco entre escenas solo si el lugar es el mismo. | (los de R1/R2) |

**Recetas.**
- *Ir a otro lugar:* `{ "entrada": "zoom" }` al lugar nuevo (la plantilla vuela alejándose y acercándose). Si está lejos,
  un general intermedio también con `zoom`.
- *Mostrar el detalle:* corte de +3 o más sobre un punto que se ve (o `zoom` si no está centrado).
- *Volver al contexto:* corte de −3 o más centrado **en el mismo sitio**, o `zoom` hacia afuera.
- *Ritmo sin mareo:* entre dos planos del mismo sitio, cambia la capa (área, etiqueta, cota, tarjeta), no el zoom; la
  `deriva` y los micro-movimientos (§1.7) ya mueven la cámara.

**Verificar.** `npx tsx scripts/camara.mts <guion.json>` imprime la tabla de planos (línea, t0, duración, `en`,
zoom → zoom final, Δz, distancia, cuadro, entrada) y las violaciones. Con un `salida/trabajo/<id>.props.json` usa los
tiempos reales de la voz. El `superRefine` de las 3 plantillas (`src/plantillas/comun/camara.ts`) rechaza el guion
con mensajes del tipo `gramática de cámara R1 · escenas[3].planos[0]: corte con Δzoom -1,3 (diente de sierra…) → usa
entrada "zoom", deja el zoom en 11,5 o aleja hasta ≤ 8,5`.

## 2. Nivel guion

```jsonc
"acento": "amarillo",                       // amarillo | cian | coral: caja del subtítulo, palabra clave del título, tarjetas
"tarjetaTitulo": {                          // frame 0 a 0,9 s; luego corte al satélite
  "texto": "¿DE QUIÉN ES ESTA PLAYA?",       // 2–3 líneas cortas, ≤ 52 caracteres
  "clave": "PLAYA",                          // va en el color de acento
  "paises": ["Peru", "Chile"],               // contorno resaltado (nombre Natural Earth en inglés)
  "centro": [-70.9, -18.6], "zoom": 4.9,     // mapa chico (por defecto: el 1.er plano 1,6 niveles más lejos)
  "pines": [{ "lon": -70.3763, "lat": -18.3501, "texto": "HITO 1" }],
  "icono": "🔍"
},
"mapa": { "fondo": "satelite", "mes": 1, "centro": [...], "zoomInicial": 10, "zoomFinal": 15, "lineas": [...] },
"remateEtiquetas": [                        // 1.ª al empezar el remate, 2.ª en su segunda frase
  { "lon": -70.3814, "lat": -18.3484, "texto": "LA LÍNEA EN EL AGUA" },
  { "lon": -70.3776, "lat": -18.3528, "texto": "¿Y LA ARENA?" }
],
"rematePlanos": [{ "centro": [-70.3792, -18.3505], "zoom": 16.4, "entrada": "zoom" }, { "centro": [...], "zoom": 17, "entrada": "corte", "en": "Nadie" }]
```
- `mapa.mes` (1–12): Blue Marble mensual (enero = nieve en el norte). Sin `mes`: Blue Marble con relieve sombreado.
- `mapa.ocultarBordesEn`: polígonos `[[lon, lat], …]` donde no se dibujan los bordes blancos de Natural Earth ni el
  contorno de las áreas de país (ej. el tramo "sin trazar" de Campo de Hielo Sur, que NE dibuja igual y contradice
  la historia). `areas[].ocultarBordes: true` (con `poligono`) hace lo mismo solo mientras esa área se ve.
- `mapa.lineas[]`: `puntos` o `fronteraEntre`, `color` (amarillo = la protagonista, se dibuja con glow · celeste =
  agua y rutas · coral = lo que cambió), `estilo` (solida = hoy · punteada = lo reclamado o lo que fue), `dibujarEn`
  (índice de escena, -1 = gancho) + `dice` (palabra en que empieza a dibujarse), `etiqueta` (transitoria).

## 3. Campos por línea de voz (gancho, escenas)

### `planos[]` — la cámara (máx. 6 por escena)
```json
"planos": [
  { "centro": [-70.37, -18.36], "zoom": 13.4, "entrada": "corte", "deriva": 0.35 },
  { "centro": [-70.3763, -18.3501], "zoom": 16.6, "entrada": "zoom", "en": "Hito" },
  { "centro": [-70.3773, -18.3512], "zoom": 17, "entrada": "corte", "en": "Entre", "deriva": -0.25 }
]
```
- `entrada`: `corte` (seco) · `zoom` (vuelo con easing largo; acercarse o alejarse) · `paneo` (deslizarse). Cuál va
  en cada caso lo dice la **gramática de cámara** (§1b): corte solo al mismo encuadre, golpe al sujeto o ±3 niveles
  sobre el mismo eje; a otro lugar, siempre `zoom`.
- `en` (palabra o s) o `duracionSeg` del anterior; sin ninguno, se reparten en límites de frase.
- `deriva`: zoom lento dentro del plano (por defecto +0,3; negativo = se aleja). Nada queda quieto.
- Una escena sin `planos` sigue con el último. Si alguna escena usa planos, el gancho debe declarar ≥ 1.

### `areas[]` — máscaras rayadas (máx. 6)
```json
{ "pais": "Peru", "color": "verde", "etiqueta": "PERÚ", "etiquetaEn": [-72.3, -15.4], "aparecerEn": "Perú", "desaparecerEn": "triángulo" }
{ "poligono": [[-70.3763,-18.3501],[-70.3786,-18.3501],[-70.3783,-18.3523]], "color": "amarillo", "etiqueta": "EL TRIÁNGULO", "aparecerEn": "triángulo", "quedarse": "siempre" }
{ "tipo": "franja", "linea": "frontera-hoy", "anchoKm": 160, "color": "amarillo", "etiqueta": "UNA FRANJA", "aparecerEn": "franja" }
```
- `color`: verde · rojo · violeta · amarillo · azul. Convención: verde = un país, rojo = el otro o lo cedido,
  violeta = lo que alguien quería, amarillo = la zona en disputa, azul = agua o península.
- `trama`: `rayas` (por defecto, translúcida con borde blanco) o `solida`.

### `etiquetas[]` — texto sobre el mapa (máx. 10)
```json
{ "lon": -74.4, "lat": -21, "texto": "OCÉANO PACÍFICO", "tipo": "mar", "aparecerEn": "playa" }
{ "lon": -70.27, "lat": -18.392, "texto": "RÍO LLUTA", "tipo": "rio", "rotacion": -14, "aparecerEn": "Lluta" }
{ "lon": -70.31, "lat": -18.48, "texto": "ARICA", "tipo": "pin", "aparecerEn": "Chile", "desaparecerEn": "Según" }
{ "texto": "NOTAS DE PROTESTA", "tipo": "contexto", "aparecerEn": "protesta" }
```
- `pais` (grande) · `region` · `rio` (rotada a lo largo del cauce) · `mar` (espaciada) · `pin` (marcador rojo +
  nombre) · `contexto` (acento, arriba; sin lon/lat). Las que caen en la franja del subtítulo suben solas.

### `contexto` — la etiqueta de acento arriba (1–4 palabras)
`"contexto": { "texto": "¿CÓMO QUEDÓ ASÍ?", "dice": "Cómo" }`. Usos: la pregunta, "LA VERDAD ES MÁS RARA", "EL GIRO",
"SEGÚN PERÚ", una fecha, el nombre de un documento. Reemplaza al rótulo gigante de v1 (un `rotulo` v1 se convierte solo).

### `cotas[]` — medidas (máx. 4 a la vez)
`{ "desde": [-70.3763,-18.3501], "hasta": [-70.3783,-18.3523], "texto": "260 M", "aparecerEn": "260" }` — línea con
flechas y marcas, se abre desde el centro; el texto va rotado y siempre derecho. Encuadra para que mida ≥ 150 px.

### `iconos[]` — dibujos sobre el mapa (máx. 6)
```json
{ "lon": -70.374, "lat": -18.353, "icono": "🏠", "escala": 0.9, "tachado": true, "aparecerEn": "casas" }
{ "lon": -70.25, "lat": -18.05, "icono": "tratado", "ruta": [[-70.25,-18.06],[-70.36,-18.25],[-70.31,-18.44]], "duracionSeg": 2, "aparecerEn": "notas" }
```
- Emoji (🔍 ❄️ ⚔️ 👑 🛡️ 🚢 🔥 🌲 🚂 🚗 ⚖️ 📍 🌊 ⚽) o pictograma propio: `guerra` `tren` `rio` `tratado` `dinero`
  `tribunal` `hielo` `isla` `barco` `montana` `carretera` `bandera`. `ruta` lo mueve (tren que avanza, nota que viaja);
  `tachado` = lo que no hay o no pasó; `escala` 1 = 96 px.

### `resaltes[]` — círculo que marca un detalle ~1,6 s
`{ "lon": -70.3763, "lat": -18.3501, "radio": 110, "aparecerEn": "ahí" }`.

### `tarjetas[]` — cifras arriba (máx. 1 visible)
```json
{ "texto": "3,7 HA", "sub": "CINCO CANCHAS DE FÚTBOL", "icono": "⚽", "aparecerEn": "hectáreas" }
{ "texto": "5 CANCHAS", "sub": "DE ARENA EN DISPUTA", "pictos": { "icono": "⚽", "n": 5 }, "aparecerEn": "cinco" }
{ "texto": "16 AÑOS", "tipo": "linea-tiempo", "desde": "1841", "hasta": "1857" }
{ "texto": "US$ 50 M", "tipo": "barras", "barras": [{ "etiqueta": "OFERTA", "valor": 50 }, { "etiqueta": "PAGADO", "valor": 10 }] }
{ "texto": "2º", "tipo": "ranking", "sub": "PAÍS MÁS GRANDE DEL MUNDO" }
```
- Solo cuentan hacia arriba al entrar las cifras **≥ 100** (`437 KM`, `1.200 KM`); nunca años, fechas ni ordinales.
  Las menores (`5 CANCHAS`, `3,7 HA`) entran fijas con un pop: "1 CANCHAS → 5 CANCHAS" se leía como error. Al contar
  cambia solo el número, nunca la palabra. Sin `aparecerEn`, aparece cuando la voz dice el
  número. `pictos` = fila de personitas, canchas, barcos que entran uno a uno (porcentajes, comparaciones).

### `foto` — pantalla completa 2–3 s (máx. 1 por escena)
`{ "buscar": "Playa las machas Arica", "archivo": "File:Playa las machas.jpg", "pie": "PLAYA LAS MACHAS · ARICA, HACIA LA FRONTERA", "aparecerEn": "arena", "duracionSeg": 2.6 }`
— Commons (PD/CC0/CC BY/CC BY-SA), zoom leve, pastilla "● LUGAR · QUÉ ES" arriba a la izquierda, crédito abajo.

### `polaroid` — retrato, documento o edificio sobre el mapa
`{ "buscar": "Peace Palace The Hague", "archivo": "File:Peace Palace The Hague 1.jpg", "pie": "Palacio de la Paz, La Haya (sede de la CIJ)", "anio": "2014", "lado": "derecha", "forma": "marco", "aparecerEn": "Corte" }`
— marco blanco con giro leve, crédito automático debajo, año gigante opcional; `forma: "circulo"` = foto redonda.

### `fuente` — la fuente citada en pantalla
`{ "texto": "Corte Internacional de Justicia · sentencia del 27-1-2014", "dice": "Según" }` — tarjeta discreta abajo
2,6 s. Úsala en la escena con `fuenteEnVoz: true`.

### `clave` — palabras en acento del subtítulo
`"clave": ["1929", "Lima", "Concordia"]`. Sin `clave`, la plantilla elige cifras y nombres propios. El subtítulo va en
bloques de 2–4 palabras, mayúsculas condensadas, la palabra que suena en caja de acento; nunca parte un nombre propio.

### `indice`, `indicePosicion`, `indiceAncla` — solo en la escena `mapa-de-ruta`
```json
"indice": [
  { "icono": "⚖️", "texto": "CONCORDIA", "dice": "puntos" },
  { "icono": "📍", "texto": "HITO", "dice": "hito" },
  { "icono": "🌊", "texto": "EL MAR", "dice": "Corte" }
],
"indicePosicion": "fila"     // o "vertical-mapa" + "indiceAncla": [lon, lat] (apilado sobre el territorio)
```
Cada ítem entra cuando la voz lo nombra y se queda; en cada `acto` siguiente se ilumina el suyo (más grande, en
acento, con brillo) y los demás quedan al 55 %. Mientras el índice está arriba, tarjeta, contexto y polaroid bajan
solos; el contexto se corre además según el alto real de la tarjeta (con pictos o barras es más alta).

### Crédito del satélite
Abajo a la derecha, 22 px, discreto (62 %). Se oculta durante las fotos a pantalla completa, desde que empieza el
remate y en el cierre; las etiquetas del mapa lo esquivan.

## 4. Esqueleto de un video (≈ 130 s, 8 líneas de voz)

| línea | planos | capas típicas |
|---|---|---|
| gancho | general país → zoom al detalle | máscaras de los países, mar, el área en disputa, tarjeta de tamaño, contexto con la pregunta |
| mito | región → corte → cerrado en "verdad" | foto del lugar o institución, tarjeta del año, máscaras del "reparto", contexto "LA VERDAD ES MÁS RARA" |
| mapa-de-ruta | cerrado → detalle 1 → detalle 2 → general | índice de 2–3 ítems, pines de cada cosa |
| acto ×3 | 3–4 planos cada uno, alternando escala | tarjeta del año, fuente, cota, línea que se dibuja, contexto "SEGÚN …", polaroid |
| giro | detalle → más cerca → el área grande → región | contexto "EL GIRO", resalte, icono tachado, área amarilla con etiqueta, tarjeta de tamaño |
| hoy | cerrado → paneo → región → cerrado | etiquetas de cada lado, iconos que viajan (notas, barcos), foto del lugar hoy, iconos tachados |
| remate | cerrado → corte | `remateEtiquetas` (la simetría del remate hablado), luego 0,8 s de línea punteada |

## 5. Verificar
`npx tsx scripts/camara.mts <guion>` (gramática de cámara, §1b) → `npx tsx scripts/preparar-frontera.mts <guion>` (valida palabras, índices y planos) → render a `--scale=0.5` →
`npx tsx scripts/hoja-contacto.mts <mp4> <hoja.jpg> --cada 2` y mirarla junto a `salida/referentes/nerd/*.jpg`.
