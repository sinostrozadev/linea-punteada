# Verificación: frontera-chile-y-bolivia-fueron-a-la-haya

Revisado el 2026-11-07 (mañana), con búsqueda web. Los PDF de la CIJ (sentencia y resumen) devuelven 403 a WebFetch y a curl: se usó el resumen HTML de la Corte (icj-cij.org/node/106285), que se agregó como fuente. Las coordenadas se comprobaron contra OpenStreetMap (río Silala, bofedales y límite internacional vía Overpass).

| Afirmación | Veredicto | Fuente |
|---|---|---|
| El Silala cruza de Bolivia a Chile; dos países pasaron seis años en La Haya (más de seis en la descripción) | ok (6-6-2016 a 1-12-2022) | https://www.icj-cij.org/case/162 |
| Pin "SILALA" en -68,03 / -22,00 | **corregido → -68,029 / -22,013**, el punto donde el río cruza la frontera (el original caía ~1,5 km dentro de Bolivia, lejos del cauce) | OpenStreetMap (way "Río Silala" + límite admin_level 2) |
| Línea de frontera dibujada | **corregido → trazado tomado de OSM** (el original se desviaba ~2 km en la zona del cruce) | OpenStreetMap |
| Cauce del Silala dibujado (17 km, hasta -68,16) | **corregido → cauce real de OSM: nace en los bofedales (-68,002 / -22,0085), cruza en -68,029 / -22,013 y llega al río San Pedro (~6 km en Chile)** | OSM; resumen CIJ ("discharges into the San Pedro River about 6 km" dentro de Chile) |
| "Dicen que Chile le roba un río…" | ok (planteado como mito; Morales acusaba a Chile de "robar" el agua) | https://www.eldinamo.cl/pais/2022/12/01/la-haya-por-rio-silala-los-principales-argumentos-del-fallo-que-resolvio-conflicto-con-bolivia/ |
| 1908: la prefectura de Potosí entrega una concesión a la compañía británica del ferrocarril de Antofagasta a Bolivia, para locomotoras a vapor | ok (proveído prefectural de 1908; FCAB, sociedad inglesa) | https://www.icj-cij.org/node/106285 ; Los Tiempos (vía búsqueda) |
| El Silala nace a más de 4.000 m, en humedales del lado boliviano | ok (~4.300 m; bofedales Cajones y Orientales) | https://www.icj-cij.org/node/106285 |
| Polígono "HUMEDALES" (-68,01…-67,985 / -21,97…-22,00) | **corregido → -68,026…-67,996 / -22,002…-22,013** (los bofedales están ~3 km más al sur) | OSM ("Bofedales del Silala") |
| 1928: la empresa canaliza los humedales | ok | https://www.icj-cij.org/node/106285 |
| Bolivia: manantiales desviados por los canales; Chile: río internacional que baja solo | ok | ídem |
| 1997: Bolivia revoca la concesión | ok (14-5-1997, prefectura de Potosí) | ídem |
| Marzo de 2016: Evo Morales anuncia que irá a La Haya; Chile demanda primero, en junio | ok (26-3-2016; 6-6-2016) | búsqueda (tuit del Ministerio de Comunicación de Bolivia); https://www.icj-cij.org/case/162 |
| Según la CIJ, los manantiales nacen a menos de 3 km de la línea | ok ("approximately 0.5 to 3 kilometres" de la frontera) | https://www.icj-cij.org/node/106285 |
| Cota "MENOS DE 3 KM" | **corregido → va de la fuente (-68,002 / -22,0085) al cruce del río**, ~2,8 km | OSM |
| Dos años después, Bolivia contrademanda | ok (contramemoria con contrademandas, 2018) | búsqueda (Los Tiempos, 2018) |
| Durante el juicio, Bolivia aceptó que es un curso de agua internacional; Chile aceptó que Bolivia manda sobre sus canales y puede desmontarlos | ok | https://www.icj-cij.org/node/106285 |
| Diciembre de 2022: casi todo lo pedido ya no tenía objeto | ok (matiz: sin objeto las peticiones a–d de Chile y dos contrademandas; rechazó la e) de Chile y la c) de Bolivia) | ídem |
| Hoy cruzan "unos 200 litros por segundo" | **corregido → "unos 160 litros por segundo"** (Wikipedia: 160 L/s de promedio en la frontera; Chile, ~170) | https://en.wikipedia.org/wiki/Silala_River |
| El agua baja hacia Calama y el desierto de Antofagasta | ok (Silala → San Pedro → Loa, que pasa por Calama) | https://en.wikipedia.org/wiki/Silala_River |
| Los canales de piedra siguen del lado boliviano | ok | resumen CIJ (Bolivia puede mantenerlos o desmantelarlos) |
| Los dos gobiernos celebraron el mismo fallo | ok (Boric: "fue por certeza jurídica y la obtuvo"; Arce: el fallo ratifica el derecho de Bolivia) | https://www.lostiempos.com/actualidad/pais/20221202/arce-dice-que-fallo-cij-ratifica-derecho-del-pais-silala |
| Pines Potosí, Antofagasta, Calama; trazado del ferrocarril (Antofagasta–Baquedano–Calama–Ollagüe–Uyuni) | ok | conocimiento geográfico; coordenadas de las ciudades |

## Cambios hechos
- tarjetaTitulo.pines[0] y gancho.etiquetas[0] (SILALA): → -68,029 / -22,013.
- escenas[2].areas[0].poligono (HUMEDALES): → bofedales reales.
- escenas[3].etiquetas: "SEGÚN BOLIVIA" → -68,0 / -22,0; "SEGÚN CHILE" → -68,06 / -22,03 (estaba encima de la frontera); escenas[3].iconos[0] (gota) → recorre el cauce en el cruce.
- escenas[4].cotas[0]: desde -68,002 / -22,0085 hasta -68,029 / -22,013.
- escenas[5].etiquetas "CANALES BOLIVIANOS", escenas[6].etiquetas "CANALES DE 1928" y remateEtiquetas "CANALES BOLIVIANOS" → -68,005 / -22,0 (sobre los canales).
- escenas[6].texto: "unos 200 litros por segundo" → "unos 160 litros por segundo"; rotulo "160 L/S" (dice "160"); tarjeta "160 L/S · PROMEDIO, AL CRUZAR LA FRONTERA"; clave "200" → "160"; gota parte del cruce.
- planos con centro junto al Silala: corridos 0,012° al sur (mismo zoom y mismos movimientos relativos); mapa.centro → -68,02 / -22,012.
- mapa.lineas `frontera`, `silala` y `canales`: reemplazadas por trazados de OSM.
- fuentes y `descripcion`: se agregó el resumen HTML de la sentencia (https://www.icj-cij.org/node/106285).
- camara.mts: 0 errores, 1 aviso (R3, preexistente). Esquema `EnvoltorioFrontera`: OK.

No se mueve a por-verificar.
