# Verificación: frontera-soldados-entraron-a-un-pais-sin-ejercito

Revisado el 2026-11-07 (mañana), con búsqueda web. La página del caso 157 de la CIJ es la delimitación marítima y no dice nada de la frontera terrestre: el fallo de 2018 sobre Isla Portillos es el caso 165 (resumen leído en https://icj-cij.org/node/105548).

| Afirmación | Veredicto | Fuente |
|---|---|---|
| Tratado Cañas-Jerez, 1858 | ok (15-04-1858) | https://icj-cij.org/node/105548 |
| El río San Juan es de Nicaragua; la frontera va por la orilla derecha (costarricense) | ok | ídem |
| 1897: Edward Porter Alexander, exgeneral confederado, árbitro que demarca el final de la línea | ok | ídem; fallo 2018 (165-20180202-JUD) |
| La línea rodea la laguna Harbor Head y sigue "el primer canal" que encuentra | ok ("first channel met") | https://api.icj-cij.org/sites/default/files/case-related/165/165-20180202-JUD-01-05-BI.pdf |
| Octubre 2010: Edén Pastora, exguerrillero a cargo del dragado, abre un caño; llegan soldados nicaragüenses | ok (dragado desde octubre; tropas en la zona entre fines de oct. y nov.) | https://en.wikipedia.org/wiki/Isla_Calero |
| Pastora cita Google Maps; Google admite el error | ok | https://en.mercopress.com/2010/11/08/google-maps-errors-rekindle-border-conflict-between-nicaragua-and-costa-rica ; Isla Calero |
| En La Haya Nicaragua alega el canal de Alexander, no Google | ok | Isla Calero; https://www.icj-cij.org/case/150 |
| Costa Rica abolió el ejército en 1948 y fue a la OEA y a la Corte | ok (Consejo Permanente de la OEA, nov. 2010; demanda ante la CIJ 18-11-2010) | Tico Times / Wikipedia (vía búsqueda) |
| CIJ 2015: unos 3 km² son de Costa Rica | ok ("area of wetland of some 3 square kilometres") | https://icj-cij.org/node/105548 ; https://www.icj-cij.org/case/150 |
| CIJ 2015 reprocha a Costa Rica la carretera sin evaluación ambiental | ok | https://www.icj-cij.org/case/150 |
| 2018: Nicaragua paga US$378.890 ("unos 379 mil"), primera indemnización ambiental de la Corte | ok (US$378.890,59, fallo del 2-02-2018) | ídem; https://www.hsfkramer.com/es/notes/publicinternationallaw/2018-04/icj-determines-first-ever-compensation-claim-for-environmental-harm |
| 2018: la laguna Harbor Head y su barra son de Nicaragua, rodeadas de tierra costarricense | ok | https://icj-cij.org/node/105548 (dispositivo, punto 2) |
| Pin HARBOR HEAD (-83.665, 10.93) | **corregido → (-83.669, 10.929)**: la barra de la laguna va de 83°40′03″ a 83°40′24″ O, 10°55′47″–10°56′01″ N | ídem (coordenadas Ple2/Plw2) |
| Polígono de los "cerca de 3 km²" | **corregido**: el original medía ~7 km² y quedaba al sur del caño (tierra no disputada); ahora es el triángulo caño–orilla del San Juan–laguna, ~3,4 km² | cálculo propio con la descripción de la CIJ |
| Caño de 2010 / "primer canal" / línea de Google | **corregido**: los tres trazados terminan ahora en la laguna (-83.672, 10.927) y salen del San Juan; antes el caño medía ~5 km y nacía 1 km al sur del río | ídem |
| Polígono de la laguna (escena final) | **corregido → más pequeño y al sur de la barra** (≈ 1 km, junto a las coordenadas del fallo) | ídem |
| Fuente "Delimitación marítima y parte norte de Isla Portillos" (caso 157) | **corregido → caso 165** (Frontera terrestre en la parte norte de Isla Portillos) | https://www.icj-cij.org/case/165 |

## Cambios hechos
- escenas[3].etiquetas[0] (HARBOR HEAD): lon/lat → -83.669, 10.929.
- escenas[5].areas[0].poligono → [[-83.71,10.92],[-83.69,10.919],[-83.672,10.927],[-83.7,10.932]] (~3,4 km², al norte del caño).
- escenas[6].areas[0].poligono → [[-83.674,10.93],[-83.667,10.933],[-83.664,10.928],[-83.671,10.925]].
- mapa.lineas[cano-2010] → [[-83.71,10.92],[-83.69,10.919],[-83.672,10.927]]; [alexander-1897] = el mismo al revés; [google-2010] → [[-83.712,10.918],[-83.69,10.917],[-83.672,10.926]].
- props.fuentes[1] y descripcion: caso 157 → caso 165 (https://www.icj-cij.org/case/165).
- camara.mts: 0 errores, 1 aviso (preexistente, no se tocaron planos).

No se mueve a por-verificar.
