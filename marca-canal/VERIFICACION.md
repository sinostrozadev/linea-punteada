# Verificación (revisión visual con Read, 2026-11-05)

- **avatar.png (800x800):** isotipo centrado, margen ~17 % (globo 520 px). OK. Tras corregir, los puntos amarillos son círculos limpios y el punto coral con aro azul noche destaca.
- **Isotipo a 48 px (prueba48.png, también 96 px y recorte circular):** lee: aro celeste, 5 puntos amarillos en diagonal y punto coral. Los meridianos casi desaparecen (esperado, son decorativos). Primera versión (doble capa de trazos) salía en grumos: corregida.
- **banner.png (2048x1152) + banner-guia.png:** nombre, lema y "2 historias al día · Shorts 2–3 min" caben dentro del recuadro 1235x338 (centrado en 406,407) con holgura lateral >170 px. Mapa y líneas punteadas quedan fuera de la zona segura; ninguna línea la cruza.
- **marca-de-agua.png (400x120):** transparente, nombre en una línea, blanco 90 % con sombra suave. Primera versión se partía en dos líneas: corregida (44 px, nowrap).
- **logo.svg / logo-horizontal.svg:** el horizontal usa fuentes por nombre; en visores sin Bricolage cae a Arial Black.

## Qué corregiría
- Los "continentes" del banner son polígonos abstractos: sirven de textura pero no leen como mapa; sustituirlos por costas reales de Natural Earth simplificadas.
- Convertir el texto de logo-horizontal.svg a trazos (outline) para no depender de fuentes.
- Probar el banner en la vista de móvil/TV de Studio; el lema (36 px) es lo más pequeño.
- Los visores muestran el PNG transparente de la marca de agua sobre blanco: verificarla sobre un fotograma real.
