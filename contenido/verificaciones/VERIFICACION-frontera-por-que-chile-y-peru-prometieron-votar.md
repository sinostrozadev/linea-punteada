# Verificación: frontera-por-que-chile-y-peru-prometieron-votar

Revisado el 2026-11-07 (mañana), con búsqueda web. La URL de Wikipedia "Tratado_de_Lima_(1929)" da 404: se reemplazó por el texto del tratado y del protocolo (derechos.org). Los PDF de la sentencia CIJ de 2018 devuelven 403: se usó la página HTML de la sentencia (icj-cij.org/node/105707, párrs. 62–70). El PDF del laudo (RIAA vol. II) sí existe y se leyó. El tren se comprobó contra OpenStreetMap (way "Ferrocarril de Arica a La Paz"); la frontera, contra Natural Earth 50m (la capa que dibuja la plantilla).

| Afirmación | Veredicto | Fuente |
|---|---|---|
| Octubre de 1883: Perú firma el Tratado de Ancón | ok (20-10-1883) | https://es.wikipedia.org/wiki/Tratado_de_Anc%C3%B3n |
| Art. 3: Chile posee Tacna y Arica diez años; luego plebiscito; el ganador paga diez millones de pesos | ok | ídem; texto del art. 3 citado en https://legal.un.org/riaa/cases/vol_II/921-958.pdf |
| La votación debía hacerse en 1894 | ok | ídem |
| 1894 pasa sin votación: no hay acuerdo sobre quién vota | ok (nativos o residentes; protocolo Billinghurst-La Torre de 1898 no aprobado) | ídem |
| 1925: Coolidge arbitra y EE. UU. envía a Pershing a organizar la votación | ok (laudo del 4-3-1925; Pershing presidió la comisión plebiscitaria en 1925) | https://legal.un.org/riaa/cases/vol_II/921-958.pdf ; https://en.wikipedia.org/wiki/Treaty_of_Lima_(1929) |
| Perú denuncia presión sobre sus votantes; Chile dice que el plebiscito es posible; en 1926 la comisión lo declara impracticable | ok (moción de Lassiter, sucesor de Pershing, junio de 1926) | https://history.state.gov/historicaldocuments/frus1926v01/ch11 ; USNI Proceedings, agosto de 1926 (vía búsqueda) |
| 1929, fórmula de Hoover, Tratado de Lima: Tacna a Perú, Arica a Chile, Chile paga seis millones de dólares | ok (3-6-1929; arts. 2 y 6) | https://derechos.org/nizkor/peru/doc/tratadolima.html |
| La frontera parte de la costa, 10 km al norte del puente del río Lluta, y sigue a 10 km del tren Arica–La Paz | ok (art. 2: punto "Concordia") | ídem |
| Pin "CONCORDIA" en la costa (-70,375 / -18,351) | ok (matiz: el nombre es el del tratado; el pin queda junto al Hito 1, entre este y el punto que reclama Perú, sin tomar partido; no contradice el Short del triángulo terrestre, que también dice que el tratado pone Concordia en la costa) | contenido/guiones/2026-11-05-frontera-triangulo-terrestre.json |
| Tarjeta "46 AÑOS · DE LA PROMESA AL TRATADO" (1883–1929) | ok | — |
| Trazado del tren Arica–La Paz (6 puntos rectos) | **corregido → 17 puntos de OSM** (el original se apartaba ~9–12 km en la subida; no pasaba por el valle del Lluta) | OpenStreetMap |
| Polígono "TACNA Y ARICA" (del Sama al Camarones) | ok (aproximado; el art. 3 de Ancón las limita por los ríos Sama y Camarones) | RIAA vol. II |
| Protocolo complementario: ninguno puede ceder los territorios a un tercero sin acuerdo del otro | ok (art. 1) | https://derechos.org/nizkor/peru/doc/tratadolima.html |
| 1975: Chile ofrece a Bolivia un corredor al norte de Arica | ok ("strip of territory north of Arica up to the Concordia Line", dic. 1975) | https://www.icj-cij.org/node/105707 (párr. 64) |
| Según el fallo de 2018, Chile consulta a Perú y Perú propone soberanía compartida | ok (consulta del 19-12-1975; propuesta de "area under tripartite sovereignty", nov. 1976) | ídem (párr. 67) |
| "Chile la rechaza" | **corregido → "Ni Chile ni Bolivia la aceptan."** (la Corte dice que ninguno de los dos la aceptó) | ídem (párr. 67) |
| 1978: Bolivia rompe relaciones | ok (matiz: el 17-3-1978 Bolivia comunica la suspensión de relaciones diplomáticas, que no se han restablecido) | ídem (párr. 70) |
| Polígono "CORREDOR DE 1975" | **corregido → borde norte por la frontera (Natural Earth) hasta el trifinio, borde sur por el tren corregido** (aproximado: el límite sur de la oferta era el borde norte de la quebrada del Lluta, por donde va el tren) | ídem; OSM |
| Cada 28 de agosto Tacna pasea una bandera peruana enorme por el día de 1929 en que volvió | ok (entrega de Tacna el 28-8-1929; Procesión de la Bandera) | https://en.wikipedia.org/wiki/Treaty_of_Lima_(1929) |
| En Arica, Chile construyó un muelle para Perú, como pedía el tratado | ok (art. 5: malecón de atraque, agencia aduanera y estación) | https://derechos.org/nizkor/peru/doc/tratadolima.html |
| Las últimas cláusulas se cerraron recién en 1999; tarjeta "70 AÑOS DESPUÉS" | ok (Acta de Ejecución, 13-11-1999) | https://en.wikipedia.org/wiki/Treaty_of_Lima_(1929) ; repositorio UGM (vía búsqueda) |
| El protocolo sigue vigente | ok | — |
| Pines Tacna, Arica, Ancón; río Lluta | ok | — |

## Cambios hechos
- escenas[5].texto: "Chile la rechaza." → "Ni Chile ni Bolivia la aceptan."; escenas[5].planos[3].en "rechaza" → "aceptan" (la palabra ya no existía; con eso camara.mts marcaba un plano de 0,8 s).
- mapa.lineas `tren-arica-la-paz`: → 17 puntos de OSM (Arica, desembocadura del Lluta, Poconchile, subida a Puquios, General Lagos, Visviri).
- escenas[4].iconos (tren).ruta: → 8 puntos del trazado corregido.
- escenas[5].areas[0].poligono (CORREDOR DE 1975): → frontera Natural Earth + tren corregido.
- fuentes y `descripcion`: Wikipedia "Tratado_de_Lima_(1929)" (404) → https://derechos.org/nizkor/peru/doc/tratadolima.html ; icj-cij.org/case/153 → https://www.icj-cij.org/node/105707 (la sentencia, que es lo que se cita en voz).
- camara.mts: 0 errores, 0 avisos. Esquema `EnvoltorioFrontera`: OK.

No se mueve a por-verificar.
