# Línea Punteada — Estrategia (Claude al mando; actualizado 2026-11-18)

> 🎯 **OBJETIVO: lograr la MONETIZACIÓN y GANAR MUCHO DINERO. Lo MÁS IMPORTANTE, por encima de calidad, volumen,
> herramientas o cualquier otra meta, es MONETIZAR y HACER GANAR DINERO a Santiago** (orden textual, 2026-11-05).
> Todo lo demás es instrumento. Skill `estrategia-viva`.

Mandato de Santiago (2026-11-05): "haz que el canal funcione, que se pueda monetizar y me haga ganar dinero; crea
estrategias, toma decisiones, haz todo. Prepara bien el guion y mejora cada vez más la calidad del producto final."
Claude decide y ejecuta; Santiago solo da los clics de identidad/consentimiento y pone el dinero si alguna vez hace falta.

## 0. Cambio de rumbo 2026-11-18 (diagnóstico de virales; manda sobre lo que contradiga abajo)
- **Shorts = fórmula directa** (docs/GUION.md §2): 70–90 s, paradoja completa en la primera frase, cadena de hechos sin
  andamiaje, cierre con pregunta. Los Shorts de LP retienen sobre la media de YouTube (rel. 0,62–0,90) pero duran 116–152 s y
  no generan compartidos ni comentarios (0–0,4 %): el feed no los empuja más allá del lote de prueba (~1.000–1.500 vistas).
- **Temas: 80 % Chile o vecinos** (Argentina, Bolivia, Perú) u otro tema LatAm con demanda probada en los referentes.
- **Meta-referente de Shorts: Más Allá del Mapa** (mediana 330 K, Shorts de 63–94 s); Ñerd queda como referencia secundaria.
- **Lote de prueba de 6 Shorts** (sáb 21-11 → mié 25-11) + A/B de la bandera con ojos (3 con, 3 sin). Umbral: ≥ 2 de 6 sobre 3×
  la mediana actual del canal a los 7 días (detalle y fecha de lectura en `docs/PLAN-SEMANAL.md`).
- **Largos: siguen** (domingo 19:00): arranque con escena (fecha + lugar) en 20–30 s, título de rivalidad/paradoja, tema Chile/
  vecinos con outlier, carátula GPT del molde del nicho y Short tráiler del mismo tema el mismo día con "related video".
- Lo que se deja: andamiaje "mito → la verdad es más rara → todo se explica con N cosas → y al final"; temas extranjeros sin
  gancho latino; tarjeta de título en el frame 0.

## 1. Objetivo y métrica que manda
- **Meta 1 (90 días): entrar al YPP** → 1.000 suscriptores + 10 M de vistas de Shorts en 90 días (ruta A) o 4.000 h de
  largos en 12 meses (ruta B, seguro). Se trabajan las dos.
- **Meta 2 (6 meses): ingresos.** Shorts pagan poco por vista (RPM ≈ US$0,03–0,10 en LatAm); los largos de 8 min con
  mid-rolls pagan 10–30×. Por eso cada Short bueno se convierte en un largo. Después: afiliados de libros/mapas (Amazon)
  y membresías; nunca sponsors que exijan opinión política.
- **KPI semanal** (los lee `scripts/revisar.mts` por la API y los anota en `salida/revisiones/`):
  vistas/Short a 48 h (umbral: mediana > 5 k a la semana 2, > 20 k a la semana 4), retención media (> 60 % en Shorts de
  2–3 min; Ñerd ronda 70–76 %), suscriptores/día (> 10 a la semana 2, > 35 a la semana 4), % "swiped away" en los 3
  primeros segundos (< 30 %). Si dos semanas seguidas no se cumplen, se cambia gancho/duración/tema según §5.

## 2. Producto
- **Shorts 70–90 s** (desde 2026-11-18; antes 120–170 s), 9:16, una historia completa con la fórmula directa de `docs/GUION.md` §2. 3 plantillas en rotación
  (`frontera`, `lugar`, `ruta`) para que la hoja de contacto de la semana se vea variada (requisito YPP "inauténtico").
- **Largos 6–8 min, 16:9**, los domingos: la versión extendida del mejor Short de la semana (más contexto, 2 giros,
  mapa con más capas) + al menos un tema exclusivo del largo cada mes. Mid-rolls a partir de 8 min: apuntar a 8:30.
- **Series con hilo** (razón para volver): "Del estrecho al canal", "Clipperton", "La línea que falta", "El mar de Bolivia".
  Cada video de una serie termina con una frase que apunta al siguiente, sin "suscríbete".
- **Calidad del guion por encima del volumen**: un guion que no pasa la lista de `GUION.md` §7 no se renderiza.
  Volumen: 2 Shorts/día las 2 primeras semanas, 3/día solo si la mediana de vistas y la RAM lo permiten.

## 3. Lanzamiento (primeras 2 semanas)
1. Día 0: canal creado, avatar/banner/descripción, 6 Shorts programados (3 días × 2) con los temas más fuertes y
   distintos entre sí: Bushby (ruta), Chamizal (frontera), Clipperton 1917 (lugar), Campo de Hielo (frontera),
   Puerto Williams vs Ushuaia (lugar), Acre (frontera).
2. Días 1–14: 2/día a las 12:00 y 18:00 (America/Santiago). Cada 48 h se mira el rendimiento de los últimos 4 y se
   ajusta el siguiente lote (temas, ganchos, duración).
3. Día 7 y 14: largo dominical (Bushby completo con el desenlace del 2-11-2026 es el primero: tema caliente).
4. Día 14: primera revisión formal (`mejora-continua-canal`): qué plantilla, qué tipo de historia, qué país rinden.

## 4. Distribución y SEO (gratis)
- Títulos con contradicción + "¿Por qué…?"; primera línea de la descripción = la pregunta; hashtags fijos + país.
- Cada Short enlaza al largo de su serie en la descripción y en un comentario fijado (lo hace `subir.mts`).
- Comentarios: responder preguntas de hechos con la fuente (señal de canal vivo). Nunca discutir de política.
- Comunidad: 1 post semanal con el mapa del próximo video ("¿Dónde crees que está esta línea?").

## 5. Bucle de mejora (orden permanente)
- Lunes: `revisar.mts` → fotogramas de 5 videos, métricas, 1 referente nuevo, 1 herramienta probada, ≥ 1 mejora
  implementada con render de prueba, todo en `salida/revisiones/<fecha>.md` + `docs/DECISIONES.md`.
- Pruebas A/B por lotes de 6: voz (es-MX-Jorge vs es-CL-Lorenzo), duración (120 vs 160 s), gancho (pregunta vs
  afirmación), fondo (satélite vs oscuro). Una variable por lote.
- Lo que funcione se vuelca a `docs/GUION.md` (vivo) y a las skills globales.

## 6. Cumplimiento (lo que puede matar la monetización)
- Checklist por video y por tanda de la skill `monetizacion-youtube` (→ `docs/MONETIZACION.md`).
- Material con licencia y créditos automáticos; voz sintetizada declarada en la descripción; mapas y animaciones no
  realistas → no exige la etiqueta "contenido alterado", pero si se usa una foto generada o voz clonada, se marca.
- Disputas vivas: dos versiones, cero opinión. Nada de "hecho para niños" (lo marca Santiago como NO).
- 2FA y teléfono verificado en la cuenta; AdSense listo antes de los 1.000 subs.

## 7. Riesgos y planes B
- YouTube castiga el volumen → bajar a 1/día y subir el largo a 2/semana.
- Edge TTS deja de funcionar → Kokoro en la RTX 3060 (Apache-2.0) o Azure (gratis hasta 500 k caracteres/mes).
- OOM en renders → un render a la vez, `.wslconfig memory=12GB`, nube (GitHub Actions) cuando la auditoría de la API
  esté aprobada.
- Ñerd u otro copia el ángulo → ganamos por series, largos y rigor de fuentes, no por velocidad.
