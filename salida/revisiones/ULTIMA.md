# Revisión 2026-11-18/19 · Línea Punteada (noche: fórmula directa, lote de prueba, GTA 6)

Formato fijo (lo lee el panel): Detectado · Mejorado · Herramientas exploradas · Agregado · Pendiente.

## Detectado
- **Diagnóstico de virales** (`/home/santiago/projects/yt/_propuestas/2026-11-18-diagnostico-virales.md`): los Shorts de LP retienen sobre la media de YouTube (rel. 0,62–0,90) pero duran 116–152 s, tardan ~25 s en dar el primer hecho nuevo (andamiaje mito → "la verdad es más rara" → "todo se explica con…") y no generan compartidos ni comentarios (0–0,4 %). Todos topan en ~1.000–1.500 vistas. Más Allá del Mapa hace los mismos temas en 63–94 s y saca 300 K–1,6 M.
- **Lo de Chile + un vecino rinde 2–3× la mediana; lo extranjero, la mitad.** La semana 19–22 venía llena de temas extranjeros.
- **Crítica visual (fotogramas a 0,5 s y 3 s, nuestro Bolivia `FM9aJ326bHU` vs Más Allá `JdUCY8-PSU8`, `9Y5bltTFVZI` y GeoFronteras `Z51DtnpA9K8`):**
  1. *Densidad y sujeto:* ellos llenan el cuadro con el país pintado en color pleno y opaco (40–60 % del alto); nosotros, satélite nocturno oscuro, contorno fino o rayado y una tarjeta de texto que tapa la mitad inferior.
  2. *Texto:* ellos ponen 1–2 palabras enormes (el lugar o la cifra: "BOLIVIA", "5 VECINOS", "4.270 km") blancas con borde negro, arriba; nosotros, una pregunta de 3–4 palabras en la tarjeta de título y rótulos chicos en acento.
  3. *Color:* ellos, satélite diurno saturado + amarillo/rojo planos; nosotros, Blue Marble oscuro con brillo cian (lindo, pero se lee como "documental", no como "mira esto").
  4. *Personaje:* ellos, banderas con ojos sobre cada país desde el cuadro 0 (cara = atención y comentarios); nosotros, ninguno.
  5. *Cámara y cortes:* ellos casi no mueven la cámara en los primeros 3 s (el cuadro ya dice todo) y cambian de capa cada 2–4 s; nosotros abrimos con 0,9 s de tarjeta y luego un corte al satélite, con más movimiento de cámara que información.
- **Bug encontrado en el render de prueba:** el área del gancho entraba con fundido y el cuadro 0 salía sin el país pintado. Arreglado (ver Mejorado) y re-renderizado todo el lote.

## Mejorado
- **Fórmula directa** en todo el pipeline: `docs/GUION.md` §2 (y §2b clásica como legado), validación mecánica `problemasDirecta()` en el schema zod (180–230 palabras, primera frase ≤ 24 palabras con el lugar y la paradoja, número en las primeras 22 palabras, andamiaje prohibido, remate con pregunta), generador con `--formula directa` por defecto y solo ejemplos directos, `preparar-frontera` con tope 62–95 s.
- **Cuadro 0 nuevo en `frontera` (aplica lo barato de la crítica visual):** sin tarjeta de título; mapa con el país pintado (`trama: "plena"`, 80 % opaco) entero desde el cuadro 0; rótulo enorme blanco con borde negro arriba (`TituloArriba`); subtítulos desde el cuadro 0.
- **Largos:** se mantienen (corrección de la sesión principal); regla de apertura con escena en `docs/GUION.md` §10 y medida contra Bushby y Panamericana.
- **Plan semanal:** 80 % Chile/vecinos; 2 Shorts extranjeros corridos (Namibia → 28-11, Finlandia → 29-11), lote de 6 en dom 22 → mié 25 y GTA 6 el jue 19 18:00.

## Herramientas exploradas
- **Personaje dibujado por código** (SVG en Remotion, sin imagen generada ni marca): 16 banderas, ojos que parpadean y miran a un punto del mapa, cejas/boca por expresión, bracitos, ondeo. Costo cero.
- **Render en la nube por fragmentos para un lote completo:** 7 runs de `producir.yml` en paralelo (10 fragmentos c/u); un Short de 80 s sale en ~6 min de pared.
- **Revisor independiente en subagentes Sonnet** con contexto limpio y búsqueda web: 4 de 7 guiones rechazados en ronda 1 (duración, cota mal medida, superficies incoherentes, "son británicas" en un tema disputado) y aprobados en ronda 2.
- Propuestas con costo (no aplicadas): (a) **voz humana** para los Shorts del lote ganador (Romi graba para Casi Fue; para LP no hay voz: costo = horas de alguien o una voz clonada con licencia, US$5–22/mes en ElevenLabs/PlayHT, decide Santiago); (b) **satélite diurno de alta resolución** en vez de Blue Marble a escala país (Sentinel-2 ya se usa de cerca; a escala país gratis no hay mejor); (c) **mapa ilustrado/caricatura** (estilo Orbi Explicando) para largos: requiere un set de ilustraciones GPT por pedido (gratis por `caratulas-con-gpt`, ~5 min c/u, pero no animables).

## Agregado
- `src/plantillas/comun/visuales/BanderaConOjos.tsx`, `banderas[]` y `trama: "plena"` en el schema de `frontera`; `tTitulo()` en `visual.ts`.
- `scripts/programados.mts` (lista lo programado por API), `scripts/reprogramar.mts` (mueve `publishAt` sin borrar), `scripts/validar-guion.mts` (schema + fórmula + cámara + duración estimada), `scripts/registrar-nube.mts` (baja un render de la nube a la bandeja con créditos y duración real).
- 7 guiones con fórmula directa, verificados (informes en `contenido/verificaciones/`) y aprobados por el revisor (veredictos en `salida/revisiones/guiones/`): GTA 6 (Florida real), Rapa Nui, Malvinas, Mendoza, Tierra del Fuego, Antártida, Presidente Hayes.
- `docs/DECISIONES.md`, `docs/ESTRATEGIA.md` §0, `docs/PLAN-SEMANAL.md` (bloque del 18-11 con la orden para el ritual del jue 19-11 17:00 y cómo se mide el lote).

## Pendiente
- Lectura del lote el **jue 03-12** (umbral ≥ 2 de 6 sobre 4.800 vistas a 7 días; A/B bandera con ojos).
- Ritual del jue 19-11 17:00: guiones de las ranuras libres de 23→29 con la fórmula directa + largo del dom 29 (Iquique o Perú 1975) con su Short tráiler y carátula GPT.
- **Comentario fijado** (la API no deja comentar un video privado: HTTP 403; se publica el día de salida con `npx tsx scripts/comentar.mts <id> "<texto>"` y se fija en Studio): GTA `jnc7fW2GaT8` "¿Irías a la Florida real o te quedas con la del juego?" · Rapa Nui `DT-JWRpuALo` "¿Anexión o alianza entre dos pueblos?" · Malvinas `qiIzAO6oFqU` "¿Quién debería decidir el futuro de las islas?" · Mendoza `75pQ9Z-EiKc` "¿Mendoza tendría que haber sido chilena?" · Tierra del Fuego `CjCF53JgcIY` "¿Una línea recta es la forma más justa de repartir una isla?" · Antártida `L2FQ-4_oGeU` "¿Congelada o repartida algún día?" · Hayes `saWVBOhFN5U` "¿Justicia o diplomacia?".
- "Related video" ya puesto en los 7 (Chile → Bushby `RMjYx4IUpjE`; GTA, Malvinas, Hayes → Panamericana `S5BF4K20624`); cambiar a Bolivia `OA5sbBsUMHU` cuando se publique el dom 22.
- `contenido/calendario.json` sigue en 2 Shorts/día; el diagnóstico sugiere 1/día: decidir con el resultado del lote.
