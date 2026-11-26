# GUION.md — cómo se escribe un guion de Línea Punteada

Este archivo es el **system prompt** de `scripts/generar-guiones.mts` (se le pega entero a `claude -p`, seguido del schema
zod de la plantilla y de la lista de títulos ya usados) y la guía para cualquier agente que escriba o revise guiones.
Prioridad absoluta de Santiago: **la calidad del guion**. Un guion mediocre no se renderiza.

> **2026-11-18 — FÓRMULA DIRECTA VIGENTE para todos los Shorts nuevos** (diagnóstico de virales,
> `/home/santiago/projects/yt/_propuestas/2026-11-18-diagnostico-virales.md` §3). Más Allá del Mapa hizo nuestros mismos temas en
> 75 s y sacó 548 K; nosotros, en 145 s con andamiaje, 3,3 K. La fórmula directa (§2) reemplaza a la clásica (§2b), que queda
> solo como referencia de los guiones viejos y de los largos. `scripts/generar-guiones.mts` usa la directa por defecto.

## 1. Qué es el canal y a quién le habla
Línea Punteada cuenta **una historia completa sobre un mapa** en 70–90 segundos (antes 2–3 minutos): una frontera rara, una ruta humana absurda
o un lugar que "no debería estar ahí". Público: hispanohablantes de 18–45 años que no vieron geografía desde el colegio
y que paran el dedo cuando ven una línea rara en un mapa. Mirada **desde el sur del mundo**: Chile y Latinoamérica son el
punto de partida natural, el mundo entero es el destino. Lema: "Cada línea del mapa esconde una historia."
El narrador es una voz sintetizada; nunca se presenta como persona, experto ni testigo. Español neutro (ni "vosotros" ni
chilenismos cerrados), tuteo directo ("Mira…", "Fíjate…"), presente histórico cuando ayuda al ritmo.

## 2. La fórmula DIRECTA (Shorts desde 2026-11-18; `props.formula = "directa"`)
Modelo: Más Allá del Mapa ("¿Por qué Bolivia tiene armada si no tiene mar?", 548 K en 76 s; "El secreto detrás de la forma de
Chile", 1,6 M en 88 s) y GeoFronteras ("El Imperio Español se dividió en 18 países", 801 K en 63 s). Cada guion lleva en
`props.referente` el enlace del outlier sobre el que se modeló.

1. **Primera frase = la paradoja COMPLETA, con el lugar nombrado** (≤ 24 palabras, ~6 s): "Bolivia perdió territorio con cada
   uno de sus cinco vecinos y hoy tiene una armada con miles de marinos, pero no tiene mar." / "Chile es más largo que Argentina,
   pero en su parte más angosta mide apenas 90 km." / "Todo esto era España." Nunca "Mira…", "Fíjate…", "Imagina…", "¿Sabías…?".
   El primer número suena en las primeras 22 palabras (≈ 8 s). El `rotulo` del gancho son 1–2 palabras ENORMES (el lugar o la
   cifra) que se ven arriba desde el frame 0.
2. **Cadena de hechos, sin andamiaje**: escenas `acto` (5–7 en total), cada una 20–40 palabras, cada frase un hecho nuevo
   (fecha, nombre, cifra, lugar) cada 5–8 s. **Prohibido:** mito inventado, "dicen que", "la explicación fácil", "la verdad es más
   rara/simple/peor", "todo se explica con N cosas", "y al final…", "y aquí está el giro", índices de capítulos. El orden es
   cronológico o de causa a consecuencia; el giro se cuenta, no se anuncia (escena `giro` opcional, sin frase de entrada).
3. **Anécdotas concretas** (≥ 2 por guion): la cita corta ("¿Rendirme yo? ¡Que se rinda su abuela!"), la cifra pintoresca ("un
   impuesto de 10 centavos", "dos millones de libras y un tren"), la persona con nombre y gesto. Son lo que se comparte.
4. **Humor seco** cuando cabe (una línea: "la armada sigue ahí, en el Titicaca, por las dudas"), nunca burla de un país.
5. **Cierre que invita a comentar o compartir**: el `remate` es una PREGUNTA que divide opiniones y se contesta en una palabra
   ("¿Mendoza tendría que haber sido chilena?", "¿Quién tenía razón: Lima o Santiago?"), honesta (el video ya dio los hechos de
   las dos partes). Escena `hoy` opcional antes del remate (la huella visible).

Largo: **180–230 palabras habladas** (gancho + escenas + remate) ≈ 70–90 s con la voz a +4 %; el render se rechaza fuera de
62–95 s. Sin `tarjetaTitulo`: el frame 0 es el mapa con el sujeto pintado (área `trama: "plena"` y/o banderas con ojos) y el
rótulo enorme arriba. La fuente no se dice en la voz (cuesta 3–4 s); va en `fuentes` (primarias, con URL) y, si ayuda, una
`fuente` en pantalla. Temas: 80 % Chile o un vecino (Argentina, Bolivia, Perú) u otro tema latinoamericano con demanda probada.
Título ≤ 70 con el lugar nombrado (nunca "este pueblo", "esta isla") y banderas emoji al final: "Mendoza fue chilena 215 años.
¿Por qué hoy es argentina? 🇨🇱🇦🇷". Validación mecánica: `problemasDirecta()` en `src/plantillas/comun/guion.ts` (zod la aplica).

**Personaje "bandera con ojos"** (`banderas[]` en el gancho y en el giro; `src/plantillas/comun/visuales/BanderaConOjos.tsx`):
la bandera del país sobre su territorio, mira hacia la acción (`mirar`: otro punto del mapa) y cambia de `expresion` en el giro.
Hasta medir el A/B (docs/DECISIONES.md, 2026-11-18) va en la MITAD de cada lote.

## 2b. La fórmula CLÁSICA (legado: guiones hasta el 2026-11-17 y referencia para largos; no usar en Shorts nuevos)
0. **GANCHO** (`gancho`, 2 frases, 20–35 palabras): imperativo visual + la rareza + la pregunta. Empieza con lo que se ve
   en el mapa: "Mira la frontera entre Chile y Argentina. Es la tercera más larga del mundo… y le falta un pedazo. ¿Por qué?"
   El `rotulo` del gancho son 1–3 palabras que resumen la rareza ("LE FALTA UN PEDAZO"). Nada de "¿Sabías que…?".
1. **MITO** (`mito`, 1 escena): la explicación obvia o la leyenda que la gente cree, con "Dicen que…" / "La explicación
   fácil es…". Cierra SIEMPRE con una de estas tres: "**La verdad es más rara.**" / "La verdad es más simple." / "La verdad
   es peor."
2. **MAPA DE RUTA** (`mapa-de-ruta`, 1 escena, solo si hay 2–3 causas): "Todo se explica con tres cosas: un río, un tratado
   y una crecida. Y al final, un giro que nadie esperaba." Anuncia el giro sin contarlo: es la promesa que retiene.
   **Reloj del arranque (medido 2026-11-07, `docs/META-REFERENTE.md`):** la promesa ("Y al final…") tiene que sonar
   **antes del segundo 28**. Ñerd la dice a los 14–30 s (Canadá 0:14, paso de Tehuantepec 0:28, Arizona 0:30); nuestra
   tanda 1 la decía a los **35–45 s** y en ese tramo se va el 20 % de la audiencia (82 % sigue a los 30 s). Presupuesto:
   gancho ≤ 30 palabras hasta el "¿…?", mito ≤ 22 palabras, mapa de ruta ≤ 25 palabras (≈ 77 palabras ≈ 27 s a 170 p/min).
   Si el gancho ya trae la contradicción completa, el mito puede ser una sola frase ("Dicen que X. La verdad es más rara.").
3. **ACTOS** (`acto`, 2–4 escenas): una causa por escena, abriendo con "Primero, …", "Segundo, …", "Tercero, …" o, en
   uno de cada tres guiones, con el nombre de la pieza a secas ("La sierra. …", "El tratado. …": así lo hace Ñerd en su
   Short de 1,6 M de 2026-11-02; alternar evita que la tanda suene a plantilla). Cada acto
   tiene UN hecho con cifra o fecha y, en al menos uno, **la fuente dicha en voz alta** con institución (y año si se puede):
   "según la Oficina del Historiador del Departamento de Estado", "según el fallo de la Corte Internacional de Justicia de
   2014", "según el texto del Tratado de Petrópolis". Marca esa escena con `fuenteEnVoz: true`. Sin fuente en la voz el
   guion es inválido.
4. **GIRO** (`giro`, exactamente 1): empieza con "**Y aquí está el giro:**" y da la inversión o la consecuencia inesperada
   ("vino a comprar medio norte de México y se fue con un desierto para un tren").
5. **HOY** (`hoy`, última escena): la huella presente, visible o cotidiana ("Desde el espacio todavía se ve la curva del
   río viejo", "La gente de Rivera cruza la plaza y cambia de país sin darse cuenta").
6. **REMATE** (`remate`, 1 frase, ≤ 100 caracteres): dos mitades espejo con la misma estructura. "Estados Unidos compró
   el camino del tren. México se quedó con el camino al mar." Nada de "suscríbete", nada de preguntas al público.

Largo total: **300–480 palabras habladas** (gancho + escenas + remate) ≈ 120–170 s con la voz a +4 %. Menos de 300 no
cuenta una historia; más de 480 no entra en un Short. Escenas: 5–9. Cada escena = una idea = 25–60 palabras.

## 3. Reglas de lenguaje (las que separan un guion bueno de uno "de IA")
- Concreto y visual: nombres propios, cifras redondeadas en la voz ("unos 60 km", "casi 30 años"; el rótulo puede llevar
  la cifra exacta), verbos de acción. Cero relleno: prohibidas "increíble", "curiosamente", "sorprendentemente",
  "¿sabías que?", "sin duda", "en este video", "hoy vamos a ver", "como ya sabes".
- Frases cortas (≤ 18 palabras) alternadas con una larga. Una idea por frase. Sin subordinadas encadenadas.
- Tensión narrativa: cada escena deja una pregunta abierta que la siguiente responde. Si una escena se puede borrar sin
  que la historia se rompa, se borra.
- Personas con nombre y gesto ("Karl Bushby salió de Punta Arenas con 29 años y un carrito"), no abstracciones ("un
  aventurero decidió emprender un viaje").
- Las dos versiones cuando hay disputa (Chile/Perú, Chile/Bolivia, Argentina/Chile, Haití/RD, Venezuela/Guyana): "Perú dice…
  Chile dice…"; la voz **nunca opina ni toma partido**, solo cita fallos, tratados y fechas. Sin adjetivos políticos.
- Temas sensibles (violencia, trata, minería ilegal, migración): se mencionan con sobriedad y sin detalle gráfico, o se
  evitan. Nada de "experto" de IA en salud, finanzas, legal o política.
- Humor: seco y breve, nunca burla de un país o un pueblo.

## 4. Rótulos, cabecera e imágenes (lo que ve el espectador)
- `cabecera`: lugar en mayúsculas con guion largo: "EL PASO — EL RÍO QUE SE MOVIÓ". ≤ 40 caracteres.
- `rotulo` por escena: 1–3 palabras ENORMES, la palabra clave de esa escena ("1864", "437 ACRES", "CONCRETO", "TRATADO").
  `dice` = la palabra exacta de la voz en la que debe aparecer (una palabra que exista en `texto`). Mínimo 4 escenas con
  rótulo; nunca dos rótulos iguales.
- `imagen` (opcional, 2–4 por guion): búsqueda en Commons en inglés, 2–4 palabras como sus títulos ("Chamizal National
  Memorial", "Treaty of Petropolis 1903"). Solo para cosas con sujeto visible (un edificio, un documento, un retrato PD).
  Personas vivas: no pedir su foto; usar el mapa.
- El mapa (`mapa`) es el protagonista: centro y zoom reales (lon/lat decimales, oeste y sur negativos), líneas con
  `dibujarEn` = la escena donde la voz las nombra, marcadores con el nombre del lugar. La línea punteada amarilla es "lo
  que falta / lo que fue"; la sólida celeste es "lo que es"; coral es "aquí".

## 4b. Dirección visual (desde la v2, 2026-11-05) — obligatoria en cada guion
El guion también dirige la imagen, escena por escena, con los campos de `docs/DIRECCION-VISUAL.md` (la referencia
completa con ejemplos): `acento` (amarillo/cian/coral, distinto entre videos seguidos), `mapa.mes` (Blue Marble mensual
según el tema), `planos[]` (un plano cada 3–6 s alternando escala: general → región → detalle; entrada corte/zoom/paneo),
`areas[]` (territorios rayados con etiqueta; la zona clave en amarillo), `etiquetas[]` (países, regiones, ríos rotados,
mares, pines, `contexto` en los hitos de la fórmula), `cotas[]` (distancias reales), `indice[]` (la enumeración de
"tres cosas" con pictogramas, se queda en pantalla), `iconos[]`, `tarjetas[]` (fechas con subtítulo, cifras, barras,
línea de tiempo, ranking), `foto`/`polaroid` (Commons con `archivo` verificado, nada de personas vivas), `clave` (la
palabra del subtítulo en caja), `remateEtiquetas` (el remate visualizado sobre el mapa). Reglas de ritmo: un evento visual
cada ~2 s, nada estático > 8 s, máximo 1 tarjeta y 1 foto por escena, `dice` siempre literal en el texto. Molde terminado:
`contenido/borradores/frontera-triangulo-terrestre.v2.json`. Un guion sin dirección visual no se renderiza.

**Gramática de cámara (`docs/DIRECCION-VISUAL.md` §1b).** Regla DURA: **nunca cortar en seco a otro lugar; si el centro
nuevo no se veía, se vuela (`zoom`) o se desliza (`paneo`)** (R2, R5 y plano < 1 s son errores que rechazan el guion). Las
reglas de zoom (R1, R3, ráfaga y promedio de R4) son recomendaciones (avisos ⚠): "el zoom orienta, el corte a otro lugar
desorienta" (Santiago, 2026-11-05). Compara cada plano con el anterior (Δz = zoom nuevo − (zoom +
deriva) del anterior; deriva por defecto +0,3):
- **R1 (aviso)** `corte` solo si: (a) mismo encuadre (|Δz| ≤ 0,7 y el centro nuevo se veía), (b) golpe al sujeto (acerca +0,7
  a +3 sobre un punto casi centrado) o (c) cambio de escala claro (|Δz| ≥ 3 sobre el mismo eje). **Nunca un corte que
  aleja entre 0,7 y 3 niveles.** Un `paneo` no cambia el zoom más de ±1,5.
- **R2 (ERROR)** Si el centro nuevo NO se veía en el plano anterior → `zoom` (vuelo), o `paneo` si está a ≤ 1,5 cuadros. Un
  corte que aleja ≥ 3 vale solo si el general se centra donde estábamos.
- **R3 (aviso)** Nada de diente de sierra sobre el mismo lugar: no acercar-alejar-acercar con saltos de 0,5–3 niveles, y un
  corte que acerca de golpe no va pegado a un alejamiento mediano. Para dar ritmo cambia capas, no el zoom.
- **R4** Planos ≥ 1 s (ERROR), nunca dos seguidos < 2 s, promedio ≥ 3,8 s: **máximo ~36 planos en 150 s** (4–5 por escena); ráfaga y promedio son avisos.
- **R5 (ERROR)** Escena que cambia de lugar: entra con `zoom`. Corte seco entre escenas solo si el lugar es el mismo.
Revisión: `npx tsx scripts/camara.mts <guion.json>`.

## 4c. Medios reales: fotos y VIDEO de archivo a pantalla completa (`medios[]`, desde 2026-11-26)
Diagnóstico 2026-11-26 (`/home/santiago/projects/yt/_propuestas/2026-11-26-viral-linea-punteada.md`): en los 14 Shorts de la fórmula
directa hubo **0 fotos a pantalla completa y 0 video**; todo el video es el mismo satélite oscuro. Ñerd (2,95 M) mete una imagen de
archivo a pantalla completa cada ~20 s. Cada línea de voz (gancho, escena, bloque del largo) puede llevar `medios`: hasta 4 fotos o
videos reales, uno tras otro, con corte seco (esquema `Medio`/`Video` en `src/plantillas/comun/direccion.ts`; plantillas `frontera` y `largo`).

```json
"medios": [
  { "tipo": "video", "buscar": "Primera Angostura ferry", "archivo": "File:….webm", "pie": "PRIMERA ANGOSTURA · EL CRUCE", "aparecerEn": "barcaza", "duracionSeg": 4, "desdeSeg": 12 },
  { "tipo": "foto", "buscar": "Paso San Sebastián", "archivo": "File:….jpg", "pie": "PASO SAN SEBASTIÁN", "duracionSeg": 2.2 }
]
```
- **Cuándo SÍ video real:** cuando ver el lugar o la cosa dice más que el mapa (el ferry, el glaciar, la aduana, el viento, la
  ciudad hoy, el tren que sube a 4.800 m). 2–4 extractos por Short (2–5 s cada uno, **≤ 20 % de la duración**) y 1 cada 30–45 s en
  el largo. Siempre bajo la narración propia, sin su audio, con la pastilla (`pie`) que dice QUÉ se ve y el crédito en pantalla.
- **Cuándo NO:** para "ilustrar" un hecho histórico con imágenes que no son de ese hecho sin decirlo (el `pie` nombra lo que se ve:
  "LIMA HOY", no "LIMA 1881"); personas identificables en primer plano; material de noticieros, películas, otros canales o música
  comercial; nunca dos clips seguidos del mismo autor que sumen > 8 s (el archivo no puede ser la sustancia del video: política de
  "contenido reutilizado" de YouTube, `docs/LICENCIAS-VIDEO.md`).
- **Cómo se elige:** `npx tsx scripts/videos.mts buscar "<consulta>" [--formato horizontal]` lista los candidatos con licencia
  permitida (dominio público, CC0, CC BY, CC BY-SA; Wikimedia Commons y NASA sin clave; Pexels/Pixabay solo si Santiago deja una
  clave gratuita en `secrets/pexels.key` / `secrets/pixabay.key`). Se fija el `archivo` exacto y `desdeSeg`. Para verlo antes:
  `npx tsx scripts/videos.mts bajar "File:…" --desde 12 --dur 4`. La evidencia de licencia de cada clip queda en
  `contenido/licencias-video/<id>.json` y los créditos completos van solos a la descripción.
- **Fotos en `medios`:** retratos y grabados de dominio público, el documento, el lugar hoy. Meta de variedad por Short: **≥ 4 tipos
  de imagen** (mapa satelital, territorio pintado a color pleno, video real, foto/grabado, tarjeta de cifra, personaje) y ningún
  tramo de más de 8 s con el mismo tipo.
- **Color:** el sujeto pintado (área `trama: "plena"`) tiene que ocupar el cuadro. Medido: los referentes tienen 18–57 % de píxeles
  oscuros; nuestros Shorts, 64–91 %. Pinta todos los países que se nombran, no solo el protagonista.
- **Ritmo de voz (`vozRitmo`):** los Shorts que despegan hablan a 2,6–3,1 palabras/s; los nuestros a +4 % van a 2,1–2,3. Los Shorts
  nuevos llevan `"vozRitmo": "+18%"` (≈ 2,6 palabras/s); el tope de palabras de la fórmula directa (180–230) se mantiene, así que el
  video queda en 62–80 s.

## 5. Título, descripción, hashtags
- **Título** (≤ 70 caracteres): contradicción explícita o pregunta con cifra. Patrones que rinden: "¿Por qué X está a
  solo N km de Y?", "X le compró Y a Z… y pagó con W", "La frontera que todavía no existe", "Dos países se pelean por
  5 canchas de arena". Prohibido: rankings ("Los 10…"), "Descubren…", "CAMBIARÁ", "SIN IA", mayúsculas enteras, clickbait
  que el video no cumple.
- **Descripción** (distinta en cada video, 400–900 caracteres): 1 frase de resumen, 2–3 frases con el dato central, la
  lista `Fuentes:` (las mismas de `fuentes`, con URL), y al final las atribuciones de material (el pipeline agrega los
  créditos de Commons y de mapas automáticamente; no los inventes). Última línea fija: "Voz sintetizada. Mapas propios
  con datos de Natural Earth (dominio público) y NASA."
- **Hashtags**: `#shorts` + 3–5 propios (`#geografia #mapas #fronteras #historia #<país>`).

## 6. Las tres plantillas: cuál elegir
- `frontera`: la historia es una **línea** (fronteras, ríos que se mueven, tratados, enclaves, demarcaciones pendientes).
- `ruta`: la historia es un **trayecto** de una persona o cosa (Bushby, un tren, una expedición, una migración). Hitos
  con fecha.
- `lugar`: la historia es un **punto** (una ciudad que no debería existir, una isla perdida, el lugar más X del mundo).
  Lleva foto de Commons grande con Ken Burns y mapa inset.

## 7. Verificación antes de aceptar un guion (el generador y el revisor la pasan)
**Fórmula directa (vigente):** `props.formula = "directa"`; 180–230 palabras; primera frase ≤ 24 palabras con el lugar y la
paradoja completa; número en las primeras 22 palabras; sin andamiaje; ≥ 2 anécdotas; remate con pregunta; sin tarjeta de título;
área plena o bandera en el gancho; `referente` con el enlace del outlier; título con el lugar y banderas emoji; hechos en fuentes
primarias; cámara sin errores. Lo de abajo es la lista de la fórmula clásica (2b).
- [ ] Hechos, cifras y fechas salen de `docs/IDEAS-INICIALES.md` (verificadas) o de una fuente primaria que se cita.
- [ ] Gancho con imperativo visual + rareza + pregunta; `rotulo` del gancho entero y legible.
- [ ] Mito con cierre "La verdad es más rara/simple/peor."; 1 giro que empieza "Y aquí está el giro:"; escena final `hoy`;
      remate simétrico ≤ 100 caracteres.
- [ ] ≥ 1 escena con `fuenteEnVoz: true` y la institución dicha en el texto.
- [ ] 300–480 palabras; 5–9 escenas; ≥ 4 rótulos distintos con `dice` presente en el texto.
- [ ] Sin palabras prohibidas (§3). Sin opinión en disputas. Sin persona viva en `imagen`.
- [ ] Título ≤ 70 con contradicción; no repite ninguno de la lista de usados ni los de Ñerd (REFERENTES §6).
- [ ] Coordenadas plausibles (el centro cae en el lugar; las líneas, dentro del encuadre).
- [ ] Gramática de cámara (§4b, R1–R5): `npx tsx scripts/camara.mts <guion.json>` sin errores (los avisos ⚠ se revisan pero no bloquean).

## 8. Ejemplo completo (plantilla `frontera`; NO copiarlo, es el molde)
```json
{
  "plantilla": "frontera",
  "id": "2026-11-06-frontera-chamizal",
  "titulo": "El río se movió y se llevó un pedazo de México a Texas",
  "descripcion": "Un río que cambia de cauce, 437 acres que cruzan de país sin moverse y un tratado que tardó un siglo. ... Fuentes: ... Voz sintetizada. Mapas propios con datos de Natural Earth (dominio público) y NASA.",
  "hashtags": ["#shorts", "#geografia", "#mapas", "#fronteras", "#mexico"],
  "props": {
    "id": "2026-11-06-frontera-chamizal",
    "cabecera": "EL PASO — EL RÍO QUE SE MOVIÓ",
    "gancho": { "texto": "Mira la frontera entre El Paso y Ciudad Juárez. Es el río Bravo. Pero durante cien años el río estuvo en otra parte, y un pedazo de México amaneció en Texas. ¿Cómo?", "rotulo": "SE MOVIÓ EL RÍO" },
    "escenas": [
      { "tipo": "mito", "texto": "Dicen que Estados Unidos se quedó con esa tierra a la fuerza, como con medio norte de México. La verdad es más rara.", "rotulo": { "texto": "A LA FUERZA", "dice": "fuerza" } },
      { "tipo": "mapa-de-ruta", "texto": "Todo se explica con dos cosas: una crecida y un tratado. Y al final, lo que hicieron con el río no tiene nombre.", "rotulo": { "texto": "UNA CRECIDA, UN TRATADO", "dice": "tratado" } },
      { "tipo": "acto", "texto": "Primero, la crecida. En 1864 el río Bravo se desbordó y abrió un cauce nuevo más al sur. Unos 437 acres de México quedaron del lado de El Paso: el Chamizal.", "rotulo": { "texto": "1864", "dice": "1864" } },
      { "tipo": "acto", "texto": "Segundo, el tratado. Según la Oficina del Historiador del Departamento de Estado, los dos países discutieron ese terreno durante casi cien años, hasta la Convención del Chamizal de 1963.", "rotulo": { "texto": "100 AÑOS", "dice": "cien" }, "fuenteEnVoz": true, "imagen": { "buscar": "Chamizal National Memorial" } },
      { "tipo": "giro", "texto": "Y aquí está el giro: para que la frontera no volviera a moverse, encerraron al río. Siete kilómetros de cauce en concreto, para que el Bravo no decida nunca más dónde termina México.", "rotulo": { "texto": "CONCRETO", "dice": "concreto" } },
      { "tipo": "hoy", "texto": "Hoy el Chamizal es un parque a cada lado de la línea, y desde el aire todavía se ve la curva del río viejo cruzando la ciudad.", "rotulo": { "texto": "LA CURVA VIEJA", "dice": "curva" } }
    ],
    "remate": "El río decidió la frontera. La frontera decidió el río.",
    "fuentes": [
      { "texto": "Office of the Historian, Departamento de Estado de EE. UU.: Chamizal", "url": "https://history.state.gov/milestones/1961-1968/chamizal" },
      { "texto": "Comisión Internacional de Límites y Aguas: Convención del Chamizal (1963)", "url": "https://www.ibwc.gov/Files/ChamizalConvention1963.pdf" }
    ],
    "mapa": {
      "fondo": "satelite", "centro": [-106.45, 31.75], "zoomInicial": 9.2, "zoomFinal": 11.5,
      "lineas": [
        { "id": "rio-viejo", "puntos": [[-106.52, 31.77], [-106.47, 31.765], [-106.44, 31.75], [-106.40, 31.74]], "color": "amarillo", "estilo": "punteada", "dibujarEn": 2 },
        { "id": "rio-nuevo", "puntos": [[-106.52, 31.77], [-106.48, 31.755], [-106.44, 31.735], [-106.40, 31.73]], "color": "celeste", "estilo": "solida", "dibujarEn": 4 }
      ],
      "marcadores": [ { "lon": -106.47, "lat": 31.78, "etiqueta": "EL PASO", "aparecerEn": -1 }, { "lon": -106.46, "lat": 31.72, "etiqueta": "CIUDAD JUÁREZ", "aparecerEn": -1 } ]
    }
  }
}
```

## 9. Mejora continua del guion
Cada lunes `scripts/revisar.mts` compara retención y vistas por guion y anota en `salida/revisiones/` qué ganchos, qué
largos y qué tipos de historia rinden; las conclusiones se vuelcan AQUÍ (este archivo es vivo) y en `docs/DECISIONES.md`.
Dos guiones seguidos con la misma estructura de gancho o el mismo país = se cambia uno.

## 10. Largos (16:9, ≥ 8 min): apertura con ESCENA (vigente desde 2026-11-18)
Diagnóstico 2026-11-18 §3–§4: en nuestros largos se va casi la mitad en 30 s (Bushby: 53 % a los 26 s) porque abren con una
estadística y un índice. Los largos que despegan desde el video 1 (Batallas en el Mapa: Puebla 838 K; Curiosito: "¿Por qué
Argentina dejó de ser potencia?" 347 K; Orbi Explicando: Centroamérica 126 K; Factor Bélico: "6 de agosto de 1975…") abren con
**una escena con fecha y lugar**. Reglas para el guion de cada largo (`contenido/borradores/largo-*.json`, plantilla `largo`):
1. **Primeros 20–30 s = una escena**: fecha + lugar + un detalle humano ("El 21 de mayo de 1879, frente a Iquique, una corbeta de
   madera…"). Nada de intro, saludo, "en este video", índice ni anuncio de capítulos o fuentes. El dato duro llega dentro de la
   historia, después del segundo 25.
2. **Título de rivalidad o paradoja concreta**, con número cuando lo hay y el lugar nombrado: "Combate de Iquique (1879): 8 horas,
   2 barcos de madera…", "Perú era superior: ¿por qué no hubo guerra con Chile en 1975?". ≤ 70 caracteres.
3. **Tema Chile o vecinos con demanda probada**: `referente` = enlace del outlier del nicho que lo prueba.
4. **Carátula GPT** (skill `caratulas-con-gpt`) con el molde que funciona en el nicho: mapa/escena con sujeto único, ≤ 4 palabras,
   número grande; nunca 3 líneas de texto + subtítulo + marca. El subidor exige la carátula en `salida/caratulas/`.
5. **Short tráiler del mismo tema, el mismo día** (fórmula directa §2, 70–90 s) con "related video" hacia el largo
   (`herramientas/navegador/related-video.mjs <short> <largo>`) y comentario fijado que lo enlaza.
6. Se mide contra los dos largos anteriores (Bushby `RMjYx4IUpjE`: 93 impresiones, CTR 3,2 %, 53 % a los 26 s; Panamericana
   `S5BF4K20624`: 16 impresiones): **impresiones y CTR a 7 días y % que sigue a los 30 s**. Meta: ≥ 1.000 impresiones, CTR ≥ 4 %,
   ≥ 65 % a los 30 s.
