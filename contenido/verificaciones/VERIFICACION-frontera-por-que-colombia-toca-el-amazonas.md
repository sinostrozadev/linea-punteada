# Verificación: frontera-por-que-colombia-toca-el-amazonas

Revisado el 2026-11-07 (mañana), con búsqueda web. Wikipedia no tiene página en inglés del río Yaguas (404): la desembocadura se tomó de la Wikipedia alemana (vía búsqueda) y se contrastó con la frontera de Natural Earth (world-atlas 50m del repo).

| Afirmación | Veredicto | Fuente |
|---|---|---|
| Colombia toca el Amazonas unos 116 km | ok | Acta Agronómica / UNAL (vía búsqueda): "el río Amazonas tan solo recorre un trayecto de 116 km" en Colombia |
| Punta en forma de trapecio, entre Perú y Brasil | ok | https://en.wikipedia.org/wiki/Amazon_Trapeze |
| Tratado Salomón-Lozano, Lima, 24-3-1922 | ok | https://es.wikipedia.org/wiki/Tratado_Salom%C3%B3n-Lozano |
| Putumayo pasa a ser casi toda la frontera; Perú entrega el trapecio; Colombia renuncia a lo que reclamaba al sur del Putumayo | ok (matiz: cada historiografía cuenta el canje al revés; el guion lo dice neutro) | ídem |
| Leticia cambia de bandera en 1930 | ok (17-08-1930) | ídem (pie de foto) |
| Loreto no aceptó el tratado; 1-9-1932 un grupo armado de peruanos toma Leticia y saca a las autoridades | ok (48 loretanos) | https://es.wikipedia.org/wiki/Guerra_colombo-peruana |
| Versiones: levantamiento loretano vs. ocupación | ok | ídem |
| Sin camino por tierra a Leticia; Vásquez Cobo con barcos comprados en Europa cruza el Atlántico y sube el Amazonas | ok (llegó a la boca del Amazonas a fines de dic. 1932) | ídem |
| "Unos 3.000 km" por aguas de Brasil | ok (matiz: Belém–Içá ≈ 3.000 km por río; cifra aproximada) | cálculo con la ruta del guion |
| Combates en Tarapacá, sobre el Putumayo, en febrero de 1933 | ok (14–15-02-1933) | Guerra colombo-peruana |
| Mayo de 1933, Ginebra: salida acordada | ok (25-05-1933) | ídem |
| Un año administrada por una comisión de la Sociedad de Naciones (jun. 1933–jun. 1934) | ok | ídem (Perú entrega Leticia el 25-06-1933) |
| Comisión con un estadounidense, un brasileño y un español | ok (cnel. Arthur Brown, cap. Alberto de Lemos Basto, cap. Francisco Iglesias) | https://history.state.gov/historicaldocuments/frus1933v04/d589 ; Anuario de Estudios Americanos (Iglesias, vía búsqueda) |
| Protocolo de Río (24-5-1934) confirma el tratado de 1922 | ok | Guerra colombo-peruana |
| Leticia–Tabatinga casi una sola ciudad | ok | https://es.wikipedia.org/wiki/Leticia_(Colombia) |
| 2025: Perú crea un distrito en la isla Santa Rosa | ok (Ley 32403, 3-07-2025, distrito Santa Rosa de Loreto) | https://comunicaciones.congreso.gob.pe/?p=406020 |
| Perú: le pertenece por el tratado y la demarcación de 1929; Colombia: isla posterior, nunca asignada | ok | https://radionacional.co/actualidad/cancilleria-colombiana-dice-que-la-isla-santa-rosa-no-ha-sido-asignada-nunca-peru ; El Tiempo Perú (isla de los años 70, vía búsqueda) |
| Polígono del trapecio: esquina NO en (-70.05, -2.45) | **corregido → (-70.07, -2.73)**, desembocadura del Yaguas (2°45′55″S 70°07′57″W); la esquina SO pasa a (-70.73, -3.78), boca del Atacuari | Wikipedia (de) Río Yaguas (vía búsqueda); Natural Earth |
| Trazado del Putumayo | **corregido**: pasaba por (-70.05, -2.45), unos 30 km al norte del río; ahora sigue la frontera Natural Earth (-72.4,-2.43 → -70.95,-2.21 → -70.07,-2.73 → Tarapacá) | Natural Earth (world-atlas 50m) |
| Pines Leticia, Tabatinga, Tarapacá, Iquitos, Lima, Bogotá; isla Santa Rosa | ok | Natural Earth / coordenadas conocidas |

## Cambios hechos
- gancho.areas[1].poligono, escenas[2].areas[0].poligono, escenas[5].areas[0].poligono (el trapecio, 3 veces): [[-70.72,-3.78],[-70.05,-2.45],…] → [[-70.73,-3.78],[-70.07,-2.73],[-69.74,-2.87],[-69.95,-4.22]].
- gancho.cotas[0].desde: [-70.72,-3.78] → [-70.73,-3.78].
- mapa.lineas[trapecio-oeste].puntos: termina en (-70.07,-2.73).
- mapa.lineas[putumayo].puntos: retrazado sobre la frontera real (9 puntos).
- camara.mts: 0 errores, 5 avisos (preexistentes, no se tocaron planos).

No se mueve a por-verificar.
