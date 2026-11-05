# Plantilla `frontera` (v2)

Una frontera rara contada sobre un mapa satelital en 2–3 minutos (Short 1080×1920, 60 fps, 110–175 s), con el sistema
visual de Ñerd llevado más lejos (docs/VISUAL-NERD.md): tarjeta de título en el frame 0, corte al satélite, **planos de
cámara por escena**, máscaras rayadas, etiquetas, pines, cotas, índice de enumeración, iconos, tarjetas de cifra, fotos
a pantalla completa y polaroids, subtítulos en bloques con palabra clave en caja de acento, fuente citada en pantalla,
remate sobre el mapa y 0,8 s de línea punteada. **Cómo dirigir cada escena: docs/DIRECCION-VISUAL.md.**

## Flujo
```bash
npx tsx scripts/preparar-frontera.mts contenido/guiones/<id>.json      # valida, voz, SFX, fotos, satélite, geo → salida/trabajo/<id>.props.json
npx remotion render src/index.ts Frontera salida/bandeja/<id>.mp4 --props=salida/trabajo/<id>.props.json \
  --codec=h264 --crf=18 --concurrency=1 --x264-preset=veryfast --timeout=180000
npx tsx scripts/hoja-contacto.mts salida/bandeja/<id>.mp4 salida/pruebas/<id>-hoja.jpg --cada 2   # compárala con salida/referentes/nerd/
```
Sin `--props`, Studio muestra `ejemplo.json` (triángulo terrestre Perú-Chile) con tiempos estimados y mapa oscuro.

## Props
`GuionBase` (comun/guion.ts) + `mapa` + dirección visual por línea de voz (gancho y escenas) + `acento`,
`tarjetaTitulo`, `remateEtiquetas`, `rematePlanos`. Esquema documentado campo a campo en `guion.ts`; los campos no
cartográficos (tarjetas, foto, polaroid, contexto, fuente, clave) en `comun/direccion.ts`.
**Compatibilidad v1:** un guion sin `planos` hereda la cámara de `mapa.centro/zoomInicial/zoomFinal/zooms`, y su
`rotulo` pasa a etiqueta de contexto y su `imagen` a polaroid.

Lo que agrega preparar (no va en el guion): `tiempos`, `duracionFrames`, `fotos`, `polaroids`, `imagenes` (v1),
`fondos[]` (recortes por plano), `geo` (Natural Earth 1:10 M recortado), `creditos`.

## Cómo está armado
- `visual.ts` (puro): resuelve la dirección visual a segundos absolutos con los tiempos por palabra de la voz (planos,
  ventanas de cada capa, índice y su ítem activo por acto, etiquetas del remate). Lo usan la composición, preparar
  (SFX sincronizados y qué recortes bajar) y cualquier hoja de contacto. `camaraEn()` = plano vigente + zoom lento
  (`deriva`) + transición con easing (vuelo con escala tipo van Wijk en `zoom`, deslizamiento en `paneo`, seco en `corte`).
- `scripts/lib/satelite.mts`: un recorte por grupo de planos. Lejos (zoom < 9) Blue Marble con relieve y batimetría
  (o el mensual con `mapa.mes`); cerca Sentinel-2 cloudless 2016 (EOX, CC BY 4.0; respaldo Landsat WELD). Zoom útil ≤ 17.
- `Mapa.tsx`: recortes que se funden por zoom, océano oscurecido + brillo de costa, fronteras blancas finas, máscaras
  con rayas que se deslizan, líneas que se dibujan (la amarilla con glow), cotas, resaltes; en HTML etiquetas, pines,
  iconos, etiquetas de área (solo si el área mide ≥ 70 px) y del remate. Las etiquetas nunca caen en la franja del subtítulo.
- `TarjetaTitulo.tsx`: frame 0 a 0,9 s. `Frontera.tsx`: orquesta capas, audio y cierre.
- Comunes en `src/plantillas/comun/` (`Superposiciones.tsx`, `SubtitulosBloque.tsx`, `Icono.tsx`, `pictogramas/`).

## Verificar un video
`npx tsc --noEmit -p .`, render a `--scale=0.5`, hoja de contacto cada 2 s y mirarla junto a las de Ñerd: ¿pregunta
entera en el frame 0? ¿un evento cada ~2 s y un plano nuevo cada 3–6 s? ¿etiquetas sin pisarse ni tapar el subtítulo?
¿índice, tarjetas y contexto sin chocar? ¿el detalle (triángulo, cota) se ve grande? ¿fotos con crédito? ¿remate legible?

## Fórmula de guion
docs/GUION.md. Ejemplo completo con dirección visual: `ejemplo.json` (= contenido/borradores/frontera-triangulo-terrestre.v2.json).
