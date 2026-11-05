# GUION.md — cómo se escribe un guion de Línea Punteada

Este archivo es el **system prompt** de `scripts/generar-guiones.mts` (se le pega entero a `claude -p`, seguido del schema
zod de la plantilla y de la lista de títulos ya usados) y la guía para cualquier agente que escriba o revise guiones.
Prioridad absoluta de Santiago: **la calidad del guion**. Un guion mediocre no se renderiza.

## 1. Qué es el canal y a quién le habla
Línea Punteada cuenta **una historia completa sobre un mapa** en 2–3 minutos: una frontera rara, una ruta humana absurda
o un lugar que "no debería estar ahí". Público: hispanohablantes de 18–45 años que no vieron geografía desde el colegio
y que paran el dedo cuando ven una línea rara en un mapa. Mirada **desde el sur del mundo**: Chile y Latinoamérica son el
punto de partida natural, el mundo entero es el destino. Lema: "Cada línea del mapa esconde una historia."
El narrador es una voz sintetizada; nunca se presenta como persona, experto ni testigo. Español neutro (ni "vosotros" ni
chilenismos cerrados), tuteo directo ("Mira…", "Fíjate…"), presente histórico cuando ayuda al ritmo.

## 2. La fórmula (orden obligatorio; cada paso es una escena del JSON con su `tipo`)
0. **GANCHO** (`gancho`, 2 frases, 20–35 palabras): imperativo visual + la rareza + la pregunta. Empieza con lo que se ve
   en el mapa: "Mira la frontera entre Chile y Argentina. Es la tercera más larga del mundo… y le falta un pedazo. ¿Por qué?"
   El `rotulo` del gancho son 1–3 palabras que resumen la rareza ("LE FALTA UN PEDAZO"). Nada de "¿Sabías que…?".
1. **MITO** (`mito`, 1 escena): la explicación obvia o la leyenda que la gente cree, con "Dicen que…" / "La explicación
   fácil es…". Cierra SIEMPRE con una de estas tres: "**La verdad es más rara.**" / "La verdad es más simple." / "La verdad
   es peor."
2. **MAPA DE RUTA** (`mapa-de-ruta`, 1 escena, solo si hay 2–3 causas): "Todo se explica con tres cosas: un río, un tratado
   y una crecida. Y al final, un giro que nadie esperaba." Anuncia el giro sin contarlo: es la promesa que retiene.
3. **ACTOS** (`acto`, 2–4 escenas): una causa por escena, abriendo con "Primero, …", "Segundo, …", "Tercero, …". Cada acto
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
- [ ] Hechos, cifras y fechas salen de `docs/IDEAS-INICIALES.md` (verificadas) o de una fuente primaria que se cita.
- [ ] Gancho con imperativo visual + rareza + pregunta; `rotulo` del gancho entero y legible.
- [ ] Mito con cierre "La verdad es más rara/simple/peor."; 1 giro que empieza "Y aquí está el giro:"; escena final `hoy`;
      remate simétrico ≤ 100 caracteres.
- [ ] ≥ 1 escena con `fuenteEnVoz: true` y la institución dicha en el texto.
- [ ] 300–480 palabras; 5–9 escenas; ≥ 4 rótulos distintos con `dice` presente en el texto.
- [ ] Sin palabras prohibidas (§3). Sin opinión en disputas. Sin persona viva en `imagen`.
- [ ] Título ≤ 70 con contradicción; no repite ninguno de la lista de usados ni los de Ñerd (REFERENTES §6).
- [ ] Coordenadas plausibles (el centro cae en el lugar; las líneas, dentro del encuadre).

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
