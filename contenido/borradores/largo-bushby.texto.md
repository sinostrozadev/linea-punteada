# Largo 1 — Karl Bushby: Punta Arenas → Hull a pie (16:9, ~9:00)

Serie: **Del estrecho al canal**. Tipo (a) largo nativo derivado del Short `ruta-bushby.v2.json`: reutiliza hechos y assets,
**ni una frase copiada** (apertura, orden, remate y cifras nuevas). Investigación: `contenido/investigacion/bushby-largo.md`
(los `[n]` al final de cada párrafo son los números de hecho de esa tabla). JSON del contrato `largo`:
`contenido/borradores/largo-bushby.json` (valida con `EnvoltorioLargo` y 0 errores/0 avisos de cámara R1–R5).

**Qué tiene el largo que el Short no:** el origen (la tarjeta del padre y la apuesta Londres–Nueva York), por qué Punta
Arenas, las dos reglas, la Bestia, Darién con cifra y cárcel, Nogales y el robo del carrito, el detalle del hielo (ruta de
240 km para un estrecho de ~90, trineo, trajes secos), la multa de 72 dólares y la deportación anulada, las visas de 90/180
días, la crisis de 2008, el veto y la caminata de protesta Los Ángeles–Washington, Siberia → Ulán Bator, Gobi, China, el
callejón de Irán, el plan B, Kyzylkum, el Eurotúnel negado, la llegada (10.229 días, "¿Dónde estabas?", el hijo y la nieta)
y la cuenta que responde la pregunta: **7 años para la mitad difícil, 20 para la fácil; 15 caminando, 13 esperando**.

## Título (≤ 60 caracteres)
1. **Caminó 28 años para volver a casa. ¿Qué lo frenó?** (50) ← **ELEGIDO**: contradicción (28 años para "volver a casa") + pregunta
   que el video responde con una cifra; no repite el título del Short ("¿Por qué tardó 28 años en caminar de Chile a Inglaterra?").
2. Cruzó un mar congelado a pie y lo frenó un papel (48) — mejor como título B para "Probar y comparar".
3. De Punta Arenas a su casa: 28 años caminando (44) — choca con el texto de la carátula.

## Miniatura
**`salida/caratulas/bushby-serie-2.png`**. De las tres, es la única cuya línea punteada sigue la ruta real: sube por la costa
del Pacífico, pasa por Alaska y cruza por el norte de Asia. En la 1 y la 3 la línea cruza el Atlántico Norte por Groenlandia,
y eso es falso. Además tiene la esquina inferior derecha limpia y el caminante chico. El texto ya viene dentro: **"28 años
caminando hasta su casa"**. Va bien con el título elegido, que es la pregunta (la miniatura muestra el hecho y el título
pregunta por qué). Si se pide otra variante a GPT, el texto sería **"LO FRENÓ UN PAPEL"** (4 palabras) sobre el mismo globo.
Ojo: subir la miniatura personalizada exige que el canal tenga el teléfono verificado.

## Estructura y tiempos (estimados con el estimador de voz del canal: 523 s de voz + 3,2 s de tarjeta + 12 s finales)
| Tramo | Inicio | Qué pasa |
|---|---|---|
| Cold open | 0:00 | La línea completa sobre el globo + "Iba a tardar doce años. Tardó veintiocho. ¿Qué lo frenó?" (17 s) |
| Tarjeta de título | 0:17 | "¿Por qué tardó 28 años en volver a pie?" (3,2 s) |
| 1. Por qué empezó en Punta Arenas | 0:21 | La apuesta del padre, la geografía (Bering es el único hueco), las dos reglas, la salida |
| 2. El Tapón del Darién | 1:36 | La selva sin camino, 18 días preso, Nogales, la Bestia robada, Alaska |
| 3. Bering: el mar congelado | 2:50 | 14 días sobre hielo que deriva → **cliffhanger 1**: "en la orilla, alguien lo está esperando" |
| ⏸ **Mid-roll 1** | **~3:57** | justo después del gancho |
| 4. Rusia le cerró la puerta | 3:57 | Multa y deportación anulada, visas 90/180, 2008, **giro 1** (veto de 5 años: el hombre que cruzó el mar congelado queda trabado por un sello), protesta a pie, Ulán Bator |
| 5. Sin salida en Asia central | 5:37 | Gobi, China, el muro de Irán, la pandemia, "haz la cuenta" → **cliffhanger 2**: "ningún vehículo puede hacerlo avanzar ni un metro" |
| ⏸ **Mid-roll 2** | **~6:40** | justo después del gancho |
| 6. Dos mares a nado hasta Hull | 6:40 | **giro 2** (lo cruza nadando), Caspio, Europa, Eurotúnel negado, canal a nado, Hull, "¿Dónde estabas?", la cuenta final |
| Cierre | 8:37 | "Caminó quince años. Esperó trece." + el próximo de la serie |
| Pantalla final | 8:46 | 12 s de mapa en calma → **total ≈ 8:58** |

Palabras habladas: **1.289** → 1.289 ÷ 150 = **8:36 de voz**; con tarjeta, respiros y pantalla final, **≈ 8:58**.
(Con la voz a +4 % del canal, 155–160 p/min, la voz baja a ~8:10 y el total a ~8:25. Si al medir con TTS el total queda
bajo 8:30, conviene alargar los respiros o bajar la velocidad de la voz a +0 % antes que meter relleno.)

## Narración + dirección visual (por párrafo)
Formato: **[tiempo] bloque** — texto de la voz [hechos]. Debajo, 🎬 lo que ve el espectador: plano [lon, lat] zoom · entrada;
tramo de la ruta (índices de `mapa.puntos`); tarjetas, cotas, máscaras, etiquetas, iconos, fotos (Commons, archivo exacto)
y fuente en pantalla, cada cosa anclada a la palabra de la voz donde aparece. Mapa: globo con relieve, mes 3 (marzo, el mes
del cruce del hielo), línea amarilla, `kmReales` 50.000. Respiros: cada `siguiente` (gancho de capítulo) va sobre un plano
amplio en calma, sin tarjeta.

**[0:00] APERTURA (cold open)** — Mira esta línea punteada. Sale de Punta Arenas, sube por toda América, cruza un mar congelado, atraviesa Asia y termina en la puerta de una casa en Inglaterra. Un hombre la hizo a pie. Iba a tardar doce años. Tardó veintiocho. ¿Qué lo frenó? [2, 6, 31]

> 🎬 plano [-70, -30] z3.3 · corte; plano [-105, 45] z3.3 · paneo en «América»; plano [150, 62] z3.3 · zoom en «congelado»; plano [-0.4, 53.6] z6.2 · zoom en «Inglaterra»; plano [40, 45] z3.2 · zoom en «doce»; tarjeta «28 AÑOS» / EL PLAN ERAN 12 (linea-tiempo) en «veintiocho»; contexto «¿QUÉ LO FRENÓ?» en «frenó»

**[0:17] TARJETA DE TÍTULO** (3,2 s, sin voz): «¿Por qué tardó 28 años en volver a pie?» (clave en acento: 28 AÑOS)


### Capítulo 1 — Por qué empezó en Punta Arenas  (empieza ~0:21)

**[0:21] 1.1** — Todo empieza con una tarjeta de cumpleaños. A mediados de los noventa, Keith Bushby, veterano del ejército británico, le escribe a su hijo Karl sobre una discusión. ¿Se podría ir caminando de Londres a Nueva York, cruzando por el estrecho de Bering? [3]

> 🎬 plano [-40, 50] z3.4 · zoom; plano [-168.9, 65.9] z5.0 · zoom en «Bering»; etiqueta pin «LONDRES» en «Londres»; etiqueta pin «NUEVA YORK» en «Nueva»; contexto «LA APUESTA» en «discusión»

**[0:38] 1.2** — Karl es paracaidista. Y decide hacerlo de verdad, pero desde el otro extremo del mapa. Mira por qué empieza en Punta Arenas. Desde ahí hasta su casa, en Hull, casi todo es tierra firme. El hueco grande está arriba: Bering. Y en invierno, ese hueco se congela. [2, 3]

> 🎬 plano [-70.9, -53.2] z6.0 · zoom; plano [-20, 20] z2.8 · zoom en «casa»; plano [-168.9, 65.9] z5.6 · zoom en «Bering»; etiqueta mar «ESTRECHO DE BERING» en «Bering»; resalte en «hueco»; FOTO pantalla completa «PUNTA ARENAS · EL ESTRECHO DE MAGALLANES» — File:Punta Arenas con vista al estrecho de Magallanes.jpg en «Punta»

**[0:57] 1.3** — Se pone dos reglas. Ningún vehículo puede hacerlo avanzar un solo metro. Y no vuelve a casa hasta llegar caminando. Si tiene que irse, por dinero o por papeles, puede tomar un avión. Pero después vuelve al punto exacto donde se detuvo. [4]

> 🎬 plano [-70.9, -53.2] z5.0 · zoom; tarjeta «2 REGLAS» / NADA DE RUEDAS · A CASA SOLO A PIE (cifra) en «reglas»; icono carretera tachado en «vehículo»; icono ✈️ en «avión»

**[1:14] 1.4** — El primero de noviembre de mil novecientos noventa y ocho sale de Punta Arenas. Tiene veintinueve años y empuja un carrito con todo lo que tiene. Lo llama la Bestia. El plan: unos cincuenta y ocho mil kilómetros en doce años. [2, 5, 6]

> 🎬 plano [-70.9, -53.2] z6.4 · corte; plano [-72, -40] z4.2 · zoom en «Bestia»; ruta: puntos 0→2 (); tarjeta «58.000 KM» / EN 12 AÑOS: EL PLAN (cifra) en «cincuenta»; POLAROID «La Bestia, el carrito de Bushby (Hull, 2026)» — File:Karl Bushby Homecoming The Beast, Kingston upon Hull Nov26.jpg en «Bestia»

**[1:30] 1.→ GANCHO AL SIGUIENTE** — Tarda más de dos años en subir por Sudamérica. Y entonces, el camino se acaba. [2, 7]

> 🎬 plano [-74, -15] z3.8 · zoom; ruta: puntos 2→6 (); contexto «EL CAMINO SE ACABA» en «acaba»


### Capítulo 2 — El Tapón del Darién  (empieza ~1:36)

**[1:36] 2.1** — La carretera Panamericana une Alaska con la Patagonia. Tiene un solo corte: el Tapón del Darién, la selva entre Colombia y Panamá. Ahí no hay camino. Nunca lo hubo. [8]

> 🎬 plano [-90, 10] z2.9 · zoom; plano [-77.6, 8.0] z7.0 · zoom en «Darién»; ruta: puntos 6→6 (); máscara polígono amarillo «TAPÓN DEL DARIÉN» en «Darién»; etiqueta pais «COLOMBIA» en «Colombia»; etiqueta pais «PANAMÁ» en «Panamá»; icono carretera tachado en «camino»

**[1:48] 2.2** — Según ExplorersWeb, Bushby cruza unos trescientos kilómetros de selva en casi dos meses, a comienzos de dos mil uno. Esquiva las zonas del conflicto armado colombiano. Y sale al otro lado. [7]

> 🎬 plano [-77.6, 8.0] z7.0 · corte; ruta: puntos 6→8 (PANAMÁ); tarjeta «2 MESES» / UNOS 300 KM DE SELVA (cifra) en «meses»; FOTO pantalla completa «UN SENDERO EN EL DARIÉN · COLOMBIA» — File:Jungle path in the Darién Gap.jpg en «selva»; FUENTE en pantalla «ExplorersWeb · abril de 2025» en «ExplorersWeb»

**[2:01] 2.3** — En Panamá lo espera la policía. Entró por una zona fronteriza restringida. Pasa dieciocho días preso. Es el primer aviso de algo que va a repetirse: lo que más lo frena no es el terreno. [7]

> 🎬 plano [-77.97, 8.5] z7.6 · corte; tarjeta «18 DÍAS» / PRESO EN PANAMÁ (cifra) en «dieciocho»; etiqueta pin «METETÍ» en «policía»; contexto «PRIMER AVISO» en «aviso»

**[2:15] 2.4** — Sigue por Centroamérica y México. El veintinueve de abril de dos mil dos entra a Estados Unidos por Nogales, Arizona. El primer día de dos mil tres, en Montana, le roban la Bestia. La encuentran en una cantera, y él sigue empujando. [9]

> 🎬 plano [-95, 20] z4.2 · zoom; plano [-110.9, 31.3] z6.0 · zoom en «Nogales»; plano [-111.9, 48.6] z5.6 · paneo en «Montana»; ruta: puntos 8→15 (MONTANA); etiqueta pais «MÉXICO» en «México»; etiqueta pais «ESTADOS UNIDOS» en «Estados»; icono 🛒 tachado en «roban»

**[2:32] 2.5** — Canadá, el Yukón, Alaska. En dos mil cinco llega a la costa del mar de Bering. En siete años ha cruzado un continente entero, de punta a punta. [10]

> 🎬 plano [-135, 60] z4.2 · zoom; plano [-100, 10] z2.6 · zoom en «siete»; ruta: puntos 15→19 (ALASKA); tarjeta «7 AÑOS» / UN CONTINENTE ENTERO (linea-tiempo) en «siete»; etiqueta pais «CANADÁ» en «Canadá»; etiqueta region «ALASKA» en «Alaska»

**[2:43] 2.→ GANCHO AL SIGUIENTE** — Delante tiene menos de cien kilómetros de mar. Solo hay que esperar a que se congele. [12]

> 🎬 plano [-168.9, 65.9] z6.2 · zoom; cota «< 100 KM» en «cien»


### Capítulo 3 — Bering: el mar congelado  (empieza ~2:50)

**[2:50] 3.1** — Según Los Angeles Times, el diecisiete de marzo de dos mil seis sale de Wales, el pueblo más al oeste de Alaska. Va con Dimitri Kieffer, un aventurero franco-estadounidense. [11]

> 🎬 plano [-168.1, 65.6] z8.0 · zoom; ruta: puntos 19→20 (WALES); tarjeta «17 MARZO 2006» / SALEN SOBRE EL HIELO (cifra) en «diecisiete»; etiqueta pin «WALES» en «Wales»; FUENTE en pantalla «Los Angeles Times · 5 de abril de 2006» en «Angeles»

**[3:02] 3.2** — El estrecho mide menos de cien kilómetros. Pero el hielo no se queda quieto: las corrientes arrastran los bloques, y hay que caminar sobre el hielo que hay, no sobre el que uno quisiera. [12]

> 🎬 plano [-168.9, 65.9] z6.6 · zoom; cota «~90 KM» en «estrecho»; icono 🧊 (avanza por ruta) en «corrientes»; FOTO pantalla completa «HIELO EN EL ESTRECHO DE BERING · NASA» — File:Spring Ice Chokes the Bering Strait (657).jpg en «hielo»

**[3:16] 3.3** — Por eso la ruta se estira a unos doscientos cuarenta kilómetros. Arrastran un trineo sobre placas que crujen. Donde el hielo se abre, se meten al agua con trajes secos y nadan hasta el bloque siguiente. [11, 12]

> 🎬 plano [-168.9, 66.1] z7.0 · corte; ruta: puntos 20→22 (); tarjeta «240 KM» / PARA CRUZAR UNOS 90 (barras) en «doscientos»; icono hielo en «trineo»; icono 🏊 en «nadan»

**[3:30] 3.4** — Catorce días después pisan Chukotka, el extremo oriental de Rusia, cerca del pueblo de Uelen. Al llegar a Rusia, Bushby lleva unos veintisiete mil kilómetros caminados. Más de la mitad del viaje. [12, 13, 15]

> 🎬 plano [-169.8, 66.16] z8.2 · zoom; plano [-100, 20] z2.4 · zoom en «veintisiete»; ruta: puntos 22→23 (UELEN); tarjeta «14 DÍAS» / DE ALASKA A RUSIA A PIE (cifra) en «Catorce»; POLAROID «Uelen, Chukotka (verano)» — File:Uelen 1 2013-08-02.jpg en «Uelen»

**[3:43] 3.→ GANCHO AL SIGUIENTE** — Acaba de cruzar a pie de América a Asia, por la frontera entre Estados Unidos y Rusia. Por un lugar donde no hay ningún puesto fronterizo. Y en la orilla, alguien lo está esperando. [13]

> 🎬 plano [-169.8, 66.16] z7.4 · zoom; icono 🚨 en «esperando»; contexto «ALGUIEN LO ESPERA» en «esperando»

> ⏸ **MID-ROLL 1 aquí (~3:57)**, justo después del gancho.


### Capítulo 4 — Rusia le cerró la puerta  (empieza ~3:57)

**[3:57] 4.1** — Son guardias de frontera. El primero de abril detienen a Bushby y a Kieffer por entrar a Rusia sin pasar por un control. Un tribunal de Chukotka les pone una multa de setenta y dos dólares y ordena deportarlos. [13, 14]

> 🎬 plano [-171.0, 65.6] z7.4 · zoom; tarjeta «US$ 72» / MULTA Y ORDEN DE DEPORTACIÓN (cifra) en «setenta»; etiqueta pin «LAVRENTIYA» en «tribunal»; contexto «DETENIDOS» en «detienen»

**[4:13] 4.2** — Deportado, no podría volver en cinco años. En mayo, la apelación anula la expulsión y la caminata sigue. Parece el final del problema. Es el principio. [14]

> 🎬 plano [-171.0, 65.6] z7.0 · corte; contexto «ES EL PRINCIPIO» en «principio»; FUENTE en pantalla «Seattle Times · 15 de abril de 2006» en «Deportado»

**[4:23] 4.3** — Rusia da visas de turista de noventa días cada ciento ochenta. Bushby camina por tramos: tres meses en Siberia, tres meses afuera, y de vuelta al punto exacto. [16]

> 🎬 plano [170, 66] z4.6 · zoom; ruta: puntos 23→25 (); tarjeta «90 / 180» / DÍAS DE VISA DE TURISTA (cifra) en «noventa»; etiqueta region «SIBERIA» en «Siberia»

**[4:35] 4.4** — En dos mil ocho estalla la crisis financiera y se van los patrocinadores. Pasa dos años esperando en México. En dos mil once vuelve y avanza unos mil cien kilómetros, hasta Srednekolymsk. [17]

> 🎬 plano [160, 67] z4.8 · paneo; plano [153.7, 67.45] z6.4 · zoom en «Srednekolymsk»; ruta: puntos 25→26 (SREDNEKOLYMSK); tarjeta «2008 – 2010» / ESPERANDO EN MÉXICO (linea-tiempo) en «México»; icono dinero tachado en «patrocinadores»

**[4:48] 4.5** — Y aquí está el giro: en abril de dos mil doce, Rusia le niega la visa. Al año siguiente le prohíbe entrar durante cinco años. El hombre que cruzó el mar congelado a pie queda trabado por un sello en el pasaporte. [18]

> 🎬 plano [140, 64] z3.6 · zoom; tarjeta «5 AÑOS» / SIN ENTRAR A RUSIA (cifra) en «cinco»; máscara Russia rojo «PROHIBIDO ENTRAR» en «prohíbe»; contexto «EL GIRO» en «giro»

**[5:05] 4.6** — Su respuesta es la única que conoce: caminar. Recorre unos cuatro mil ochocientos kilómetros, de Los Ángeles a la embajada rusa en Washington, para pedir que lo dejen volver. [19]

> 🎬 plano [-97, 37] z4.0 · zoom; cota «4.800 KM» en «cuatro»; etiqueta pin «LOS ÁNGELES» en «Ángeles»; etiqueta pin «WASHINGTON» en «Washington»; icono 🚶 (avanza por ruta) en «Recorre»

**[5:17] 4.7** — En dos mil catorce levantan la prohibición. Vuelve a Siberia y la cruza por años, hasta Mongolia. El ocho de agosto de dos mil diecisiete llega a Ulán Bator. [20]

> 🎬 plano [140, 62] z4.2 · zoom; plano [107, 48] z5.4 · paneo en «Mongolia»; ruta: puntos 26→31 (ULÁN BATOR); tarjeta «8 AGOSTO 2017» / ULÁN BATOR (cifra) en «agosto»; etiqueta pais «MONGOLIA» en «Mongolia»

**[5:28] 4.→ GANCHO AL SIGUIENTE** — Once años después de pisar Rusia, por fin la deja atrás. Ahora le toca Asia central. Y ahí las fronteras son peores. [20]

> 🎬 plano [80, 43] z4.0 · zoom; contexto «ASIA CENTRAL» en «central»


### Capítulo 5 — Sin salida en Asia central  (empieza ~5:37)

**[5:37] 5.1** — Primero, el desierto de Gobi: unos mil ciento treinta kilómetros con camellos, junto a la caminante estadounidense Angela Maxwell. [21]

> 🎬 plano [103, 44] z5.6 · zoom; ruta: puntos 31→32 (GOBI); etiqueta region «GOBI» en «Gobi»; FOTO pantalla completa «CAMELLOS EN EL DESIERTO DE GOBI» — File:Camels in Gobi Desert 01.jpg en «camellos»

**[5:45] 5.2** — En dos mil dieciocho entra a China. Las autoridades locales lo frenan, hasta que interviene la embajada británica. Después, Kazajistán. En junio de dos mil diecinueve, Uzbekistán. Luego, Turkmenistán. Y en la frontera con Irán, se detiene. [22]

> 🎬 plano [88, 43] z4.8 · zoom; plano [66, 40] z5.0 · paneo en «Kazajistán»; plano [58.4, 38.0] z6.4 · zoom en «Irán»; ruta: puntos 32→38 (TURKMENISTÁN); etiqueta pais «CHINA» en «China»; etiqueta pais «KAZAJISTÁN» en «Kazajistán»; etiqueta pais «UZBEKISTÁN» en «Uzbekistán»; etiqueta pais «TURKMENISTÁN» en «Turkmenistán»; etiqueta pais «IRÁN» en «Irán»

**[6:00] 5.3** — Irán no le da la visa. Mira el mapa: al norte queda Rusia, al sur, Irán. Para seguir hacia Europa sin pasar por ninguno de los dos, hay que cruzar el mar Caspio. [22]

> 🎬 plano [52, 42] z4.4 · zoom; máscara Iran rojo «SIN VISA» en «Irán»; máscara Russia rojo «RUSIA» en «norte»; etiqueta mar «MAR CASPIO» en «Caspio»; resalte en «Caspio»

**[6:13] 5.4** — Y entonces llega la pandemia. Las fronteras del mundo se cierran. Bushby vuelve a México a esperar, otra vez. [22]

> 🎬 plano [52, 42] z3.0 · zoom; tarjeta «2020» / PANDEMIA: TODO SE CIERRA (cifra) en «pandemia»

**[6:21] 5.5** — Haz la cuenta. Los primeros veintisiete mil kilómetros, con selva y hielo, le tomaron siete años. Ya van más de veinte, y todavía está en Asia. [2, 15, 22]

> 🎬 plano [0, 30] z2.2 · zoom; tarjeta «7 vs 20+» / AÑOS: LA MITAD DIFÍCIL VS LA FÁCIL (barras) en «siete»; contexto «HAZ LA CUENTA» en «cuenta»

**[6:32] 5.→ GANCHO AL SIGUIENTE** — Para cruzar el Caspio hace falta un barco. Y su regla dice que ningún vehículo puede hacerlo avanzar ni un metro. [4]

> 🎬 plano [51, 42] z5.0 · zoom; icono barco tachado en «barco»

> ⏸ **MID-ROLL 2 aquí (~6:40)**, justo después del gancho.


### Capítulo 6 — Dos mares a nado hasta Hull  (empieza ~6:40)

**[6:40] 6.1** — Y aquí está el segundo giro: si no puede cruzar el mar en barco, lo cruza nadando. El plan B nace en dos mil veintidós y tarda dos años en armarse. [23]

> 🎬 plano [51, 42] z5.0 · corte; contexto «EL SEGUNDO GIRO» en «giro»

**[6:53] 6.2** — Primero vuelve a Uzbekistán y camina el desierto de Kyzylkum, desde Bujará hasta la costa. En dos mil veinticuatro se mete al agua cerca de Aktau, en Kazajistán. [23, 24]

> 🎬 plano [64.4, 39.8] z5.6 · zoom; plano [51.2, 43.6] z6.2 · paneo en «Aktau»; ruta: puntos 38→42 (AKTAU); etiqueta region «KYZYLKUM» en «Kyzylkum»

**[7:04] 6.3** — Son doscientos ochenta y ocho kilómetros hasta Bakú, en Azerbaiyán. Nada dos turnos de tres horas al día, con Angela Maxwell y dos nadadores azerbaiyanos. De noche duermen en los barcos de apoyo. Tarda alrededor de un mes. [24, 25]

> 🎬 plano [50.5, 42.0] z6.0 · corte; plano [49.9, 40.4] z7.2 · zoom en «noche»; ruta: puntos 42→43 (BAKÚ); tarjeta «288 KM» / A NADO · 31 DÍAS (cifra) en «mes»; cota «288 KM» en «doscientos»; FOTO pantalla completa «EL MAR CASPIO EN BAKÚ · AZERBAIYÁN» — File:Caspian sea-Baku.jpg en «Bakú»

**[7:20] 6.4** — Desde Bakú camina hasta Turquía, y en dos mil veinticinco cruza el Bósforo: entra a Europa. Bulgaria, Rumania, Hungría, Bélgica, Francia. [26]

> 🎬 plano [40, 41] z4.6 · zoom; plano [29.0, 41.1] z7.0 · zoom en «Bósforo»; plano [12, 48] z4.6 · zoom en «Bulgaria»; ruta: puntos 43→50 (TOURNAI); etiqueta mar «BÓSFORO» en «Bósforo»; etiqueta region «EUROPA» en «Europa»

**[7:28] 6.5** — En Calais queda el último mar. Pide cruzar por el túnel bajo el canal, a pie. Se lo niegan. Así que hace lo mismo que en el Caspio: el cinco de octubre de dos mil veintiséis sale del agua en una playa de Dover. En la arena lo esperan su padre y sus hermanos. [27, 28]

> 🎬 plano [1.6, 51.0] z8.4 · zoom; plano [1.29, 51.1] z9.4 · zoom en «Dover»; ruta: puntos 50→52 (DOVER); tarjeta «5 OCTUBRE 2026» / LLEGA A NADO A INGLATERRA (cifra) en «octubre»; cota «CANAL» en «Caspio»; icono tren tachado en «túnel»; FOTO pantalla completa «SHAKESPEARE BEACH · DOVER» — File:Shakespeare beach - geograph.org.uk - 5459173.jpg en «playa»

**[7:50] 6.6** — Le quedan unos cuatrocientos kilómetros. El dos de noviembre llega a Hull. Según la agencia AP, cientos de personas lo esperan frente al ayuntamiento. La alcaldesa le dice que la ciudad lo esperó diez mil doscientos veintinueve días. [29]

> 🎬 plano [-0.3, 52.4] z7.0 · zoom; plano [-0.34, 53.74] z10.5 · zoom en «Hull»; ruta: puntos 52→55 (HULL); tarjeta «10.229 DÍAS» / LA ESPERA DE HULL (cifra) en «diez»; POLAROID «El ayuntamiento de Hull» — File:Hull City Hall Apr23.jpg en «ayuntamiento»; FUENTE en pantalla «AP · 2 de noviembre de 2026» en «AP»

**[8:05] 6.7** — Camina los últimos cinco kilómetros hasta la casa de su madre. Su madre, Angela, lo abraza en la puerta y le pregunta: ¿Dónde estabas? Lo espera su hijo Adam, que tenía ocho años cuando él partió. Hoy tiene treinta y seis. Y una nieta de doce que nunca había visto. [30]

> 🎬 plano [-0.36, 53.77] z11.5 · zoom; FOTO pantalla completa «LA CASA DE SU MADRE · HULL, 2 NOV 2026» — File:Karl Bushby Homecoming House, Kingston upon Hull Nov26.jpg en «casa»; contexto «¿DÓNDE ESTABAS?» en «Dónde»

**[8:25] 6.8** — Cincuenta mil kilómetros, cuatro continentes, unos treinta países. ¿Qué lo frenó? No fue la selva ni el hielo. De sus veintiocho años de viaje, caminó unos quince. El resto fue esperar. [31, 32]

> 🎬 plano [20, 35] z2.2 · zoom; tarjeta «50.000 KM» / 4 CONTINENTES · 30 PAÍSES (cifra) en «Cincuenta»; contexto «¿QUÉ LO FRENÓ?» en «frenó»

**[8:37] CIERRE / REMATE** — Caminó quince años. Esperó trece. En el próximo de Del estrecho al canal: los catorce días sobre el hielo de Bering. [32]

> 🎬 plano [10, 40] z2.2 · corte; etiqueta remate «15 AÑOS CAMINANDO» en «None»; etiqueta remate «13 AÑOS ESPERANDO» en «None»


**[8:46–8:58]** mapa en calma con la ruta completa, pie «Del estrecho al canal · Línea Punteada», 12 s para la pantalla final. **Duración total estimada ≈ 8:58**.

## Fotos (Wikimedia Commons, licencias verificadas con la API el 2026-11-08)
| Escena | Archivo | Licencia | Autor |
|---|---|---|---|
| 1.2 Punta Arenas | [File:Punta Arenas con vista al estrecho de Magallanes.jpg](https://commons.wikimedia.org/wiki/File:Punta_Arenas_con_vista_al_estrecho_de_Magallanes.jpg) | CC BY-SA 4.0 | Nampolitis |
| 1.4 La Bestia (polaroid) | [File:Karl Bushby Homecoming The Beast, Kingston upon Hull Nov26.jpg](https://commons.wikimedia.org/wiki/File:Karl_Bushby_Homecoming_The_Beast,_Kingston_upon_Hull_Nov26.jpg) | CC BY-SA 4.0 | Hullian111 |
| 2.2 Darién | [File:Jungle path in the Darién Gap.jpg](https://commons.wikimedia.org/wiki/File:Jungle_path_in_the_Dari%C3%A9n_Gap.jpg) | Dominio público | Päivi & Santeri |
| 3.2 Hielo de Bering | [File:Spring Ice Chokes the Bering Strait (657).jpg](https://commons.wikimedia.org/wiki/File:Spring_Ice_Chokes_the_Bering_Strait_(657).jpg) | Dominio público (NASA) | George Riggs, NASA GSFC |
| 3.4 Uelen (polaroid) | [File:Uelen 1 2013-08-02.jpg](https://commons.wikimedia.org/wiki/File:Uelen_1_2013-08-02.jpg) | CC BY-SA 3.0 | Ansgar Walk |
| 5.1 Gobi | [File:Camels in Gobi Desert 01.jpg](https://commons.wikimedia.org/wiki/File:Camels_in_Gobi_Desert_01.jpg) | CC0 | Bernard Gagnon |
| 6.3 Caspio en Bakú | [File:Caspian sea-Baku.jpg](https://commons.wikimedia.org/wiki/File:Caspian_sea-Baku.jpg) | CC BY-SA 4.0 | Saidaa444 |
| 6.5 Dover | [File:Shakespeare beach - geograph.org.uk - 5459173.jpg](https://commons.wikimedia.org/wiki/File:Shakespeare_beach_-_geograph.org.uk_-_5459173.jpg) | CC BY-SA 2.0 | Tim Glover |
| 6.6 Ayuntamiento de Hull (polaroid) | [File:Hull City Hall Apr23.jpg](https://commons.wikimedia.org/wiki/File:Hull_City_Hall_Apr23.jpg) | CC BY-SA 4.0 | Hullian111 |
| 6.7 La casa en Hull, 2-11-2026 | [File:Karl Bushby Homecoming House, Kingston upon Hull Nov26.jpg](https://commons.wikimedia.org/wiki/File:Karl_Bushby_Homecoming_House,_Kingston_upon_Hull_Nov26.jpg) | CC BY-SA 4.0 | Hullian111 |

Existe un retrato libre de Bushby (`File:Karl Bushby, Kingston upon Hull Nov26.jpg`, CC BY-SA 4.0, Hullian111, del
2-11-2026). **No lo puse en el guion**, porque la regla del canal prohíbe fotos de personas vivas (GUION §4). Si la sesión
principal decide hacer una excepción, el lugar natural es el bloque 6.7, como polaroid.

## Descripción de YouTube
```
¿Por qué un hombre tardó 28 años en volver caminando de Punta Arenas a su casa en Inglaterra?

Karl Bushby salió de Punta Arenas el 1 de noviembre de 1998 con un carrito, la Bestia, y una regla: ningún vehículo podía hacerlo avanzar un metro. Cruzó el Tapón del Darién, caminó sobre el estrecho de Bering congelado y llegó a Rusia en 2006 con más de la mitad del viaje hecho. Ahí empezó lo difícil.

Visas de 90 días, una deportación anulada, un veto de cinco años, una pandemia y dos mares que cruzó a nado: el Caspio y el canal de la Mancha. El 2 de noviembre de 2026 llegó a la casa de su madre en Hull. Unos 50.000 km en 28 años, de los que caminó unos quince.

Capítulos
00:00 La línea de Punta Arenas a Hull
00:21 Por qué empezó en Punta Arenas
01:36 El Tapón del Darién
02:50 Bering: el mar congelado
03:57 Rusia le cerró la puerta
05:37 Sin salida en Asia central
06:40 Dos mares a nado hasta Hull
08:37 Caminó quince años, esperó trece
(marcas estimadas: reemplazar por las de `capitulosTiempos` del render)

Fuentes:
AP (2 nov 2026): https://www.ajc.com/news/2026/11/karl-bushby-returns-home-to-northern-england-after-a-28-year-31000-mile-walk-around-the-world/
PA / Irish Examiner (2 nov 2026): https://www.irishexaminer.com/world/arid-41932203.html
AFP / The Standard (25 sep 2026): https://www.thestandard.com.hk/world/article/343869/After-50000-km-British-round-the-world-walker-faces-final-hurdle
ExplorersWeb (28 abr 2025): https://explorersweb.com/karl-bushby-begins-home-stretch-of-27-year-round-the-world-walk/
ExplorersWeb, el Caspio (19 oct 2024): https://explorersweb.com/karl-bushby-and-angela-maxwell-swim-across-the-caspian-sea/
Los Angeles Times (5 abr 2006): https://www.spokesman.com/stories/2006/apr/05/adventurers-held-by-russians-after-crossing/
Seattle Times (15 abr 2006): https://archive.seattletimes.com/archive/20060415/deport15m/world-trek-threatened-by-russian-court-order

El Short de la serie: [enlace al Short de Bushby]

Fotos (Wikimedia Commons): Punta Arenas, Nampolitis, CC BY-SA 4.0 · La Bestia, el ayuntamiento de Hull y la casa en Hull, Hullian111, CC BY-SA 4.0 · Sendero en el Darién, Päivi & Santeri, dominio público · Hielo en el estrecho de Bering, NASA GSFC (George Riggs), dominio público · Uelen, Ansgar Walk, CC BY-SA 3.0 · Camellos en el Gobi, Bernard Gagnon, CC0 · El Caspio en Bakú, Saidaa444, CC BY-SA 4.0 · Shakespeare Beach, Tim Glover, CC BY-SA 2.0.

Voz sintetizada. Mapas propios con datos de Natural Earth (dominio público) y NASA.

#geografia #mapas #historia #KarlBushby #PuntaArenas
```

**Etiquetas (12):** Karl Bushby · Goliath Expedition · vuelta al mundo a pie · Punta Arenas · Hull · estrecho de Bering ·
Tapón del Darién · mar Caspio a nado · canal de la Mancha · caminata más larga del mundo · geografía · Línea Punteada

**Comentario fijado:** "De sus 28 años de viaje, caminó unos quince. ¿Qué tramo te parece el más difícil: el Darién, el hielo
de Bering o los dos mares a nado?" + enlace al Short de la serie.

## Lista de verificación — docs/GUION.md §7 (adaptada al largo)
- [x] Hechos, cifras y fechas trazables a fuentes primarias o prensa seria: 33 hechos en la tabla, cada párrafo con `[n]`. Las 5 dudas están marcadas ⚠ y en la voz va la forma prudente ("unos trescientos", "alrededor de un mes", "unos treinta países", el veto sin motivo).
- [x] La apertura tiene imperativo visual ("Mira esta línea punteada"), algo raro (12 años → 28) y la pregunta ("¿Qué lo frenó?"), y la pregunta suena antes de los 20 s (~17 s). La tarjeta de título se lee entera (39 caracteres).
- [x] Mito y giro: el mito implícito es que "lo difícil es el terreno"; cae en el bloque 2.3 ("lo que más lo frena no es el terreno"). Hay **2 giros**: 4.5 "Y aquí está el giro:" (el veto ruso) y 6.1 "Y aquí está el segundo giro:" (lo cruza nadando). El cierre retoma la pregunta y el remate es simétrico: "Caminó quince años. Esperó trece."
- [x] Fuente dicha en voz con institución en 3 bloques: ExplorersWeb (2.2), Los Angeles Times (3.1) y la agencia AP (6.6). Una cuarta, el Seattle Times (4.2), va solo en pantalla. Las cuatro aparecen en la tarjeta de fuente.
- [x] 1.289 palabras (rango del largo: 1.100–1.400). 6 capítulos. Cada `aparecerEn`/`dice` es una palabra literal del texto (lo comprueba el validador).
- [x] Sin palabras prohibidas (grep: "sin embargo", "además", "cabe", "curiosamente", "en este video", "suscr"… = 0). Sin dígitos en la voz: todas las cifras van en palabras, así que no hay "1.000" que la voz lea como decimal (`RE_MILES` = 0). No hay disputa política: el veto ruso se cuenta con fechas, sin opinar. No hay persona viva en foto.
- [x] Título de 50 caracteres con contradicción; no repite el del Short ni ninguno de Ñerd.
- [x] Coordenadas plausibles: los 56 puntos de la ruta caen en el lugar que nombran (Punta Arenas -70,91/-53,16; Wales -168,09/65,61; Uelen -169,81/66,16; Aktau 51,2/43,65; Bakú 49,87/40,41; Hull -0,33/53,74).
- [x] Gramática de cámara: `validarCamara` sobre el aplanado da **0 errores y 0 avisos** (63 planos en 523 s). Hubo un aviso R1 en el bloque 5.4 (un corte que alejaba 1,5 niveles) y lo cambié a `zoom`.

## Lista de verificación — videos-largos §8 (lo que toca al guion)
- [x] Duración estimada ≥ 8:00 (≈ 8:58). **Pendiente** medir la real con ffprobe después del render.
- [x] Nada estático más de 8 s: cada plano trae deriva y varias capas que entran escalonadas. El promedio sale en 8,3 s por plano porque en 16:9 hay pocos planos largos con muchas capas encima. Si en el render de prueba algún tramo se ve quieto, agregar un plano intermedio.
- [x] Todo el material tiene licencia y atribución: 10 fotos de Commons (PD, CC0, CC BY-SA), mapas propios y fuentes en la descripción.
- [x] "Voz sintetizada" está en la descripción. Con fotos reales y mapas no hace falta marcar contenido alterado/sintético realista. Igual conviene marcar la casilla si Studio la pide.
- [x] No es contenido reutilizado: el texto es 100 % nuevo respecto del Short; la apertura, el remate y el orden cambian.
- [x] Los mid-rolls quedan en el límite de capítulo, justo después del gancho (~3:57 y ~6:40). Los capítulos van en la descripción y la miniatura no repite el título.
- [ ] Registrar en la bandeja con `tipo: 'largo'` y en `docs/DECISIONES.md`: lo hace la sesión principal.

## Cambios de dirección visual tras `preparar-largo.mts --prueba` (2026-11-08)
El texto de la voz no cambió (se conserva "Su madre, Angela, lo abraza"). Cambios solo en la imagen:
- 1.1: el 2.º plano entra en «caminando» (antes en «Bering» duraba 0,9 s). Se agregan el icono 🎂 sobre Hull en «cumpleaños» y la tarjeta «AÑOS 90 / LA TARJETA DE SU PADRE» en «noventa».
- Ruta del cap. 1: la línea queda quieta en Punta Arenas (tramo 0→0) en 1.1–1.3, avanza 0→1 en 1.4 y 1→3 en el gancho «Tarda más de dos años en subir por Sudamérica», hasta el norte de Chile. Ese gancho usa un plano cerrado sobre el cono sur, [-71, -36] z4.8, con la etiqueta CHILE. En 2.1 la línea sigue 3→7 hasta el Darién y en 2.2 va 7→8.
- 3.1: la fuente en pantalla queda en «Los Angeles Times, 2006».
- 3.→ (cliffhanger): etiquetas AMÉRICA / ASIA / ESTADOS UNIDOS / RUSIA en su palabra e icono de bandera tachada en «puesto».
- 6.3: la tarjeta queda «288 KM / UN MES NADANDO», entra en «turnos» y dura 3,5 s.
- 6.5: el icono del túnel tachado se movió a [2.9, 51.9], sobre el mar, para que no tape la etiqueta de Calais.
- 6.7: tarjeta «8 → 36 / LA EDAD DE SU HIJO, ADAM» en «ocho»; icono 👧 en «nieta».
- 6.8: 2.º plano en «quince» y tarjeta de barras «15 + 13 / AÑOS CAMINANDO + AÑOS ESPERANDO».
Resultado: `preparar-largo.mts --prueba` sin rechazos, 524,7 s (8:44,7).
