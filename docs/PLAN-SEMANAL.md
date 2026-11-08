# Línea Punteada — Plan semanal (rodante)

> Actualizado **2026-11-07 09:00** (America/Santiago) por Claude. Método: skill global `plan-semanal`.
> Regla: siempre hay plan de la semana en curso **y** de la siguiente. Cuando a la semana en curso le quedan < 3 ranuras
> futuras con guion, o termina, se hace el ritual de cierre y se arma la que viene. `scripts/estado.mts` avisa.
> **Manda el bloque JSON del final** (lo leen `estado.mts` y el panel de Santiago); la tabla es su vista legible.

## 🔒 Hito del mié 2026-11-11 → semana asegurada 2026-11-12 (jue) → 2026-11-18 (mié)

> Orden de Santiago (2026-11-08): el cupo del Max se renueva los **miércoles**. El miércoles en la noche quedan todos los guiones de
> la semana jue → mié escritos y dirigidos, arrancan los renders y el **jueves** todo está `programado` en Studio. Recién entonces el
> cupo sobrante va a mejoras. Regla completa: skill `plan-semanal` §5b · `operacion-diaria` §0 · `~/.claude/canales/calendario.json`.

| Ranuras jue 11-12 → mié 11-18 | Ya `programado` | Falta (al 2026-11-08 02:40) | Orden de producción el mié 11-11 |
|---|---|---|---|
| 14 Shorts (12:00 y 18:00) | 0 (lo programado llega al 11-09 12:00; el cron 04:45 cubre ~3/día hasta el miércoles) | 8 en el plan (2 `dirigido`, 3 `investigado`, 3 `idea`) + **6 sin ranura aún (11-16 → 11-18)**; lo que el cron no haya renderizado antes del miércoles | 1.º escribir/verificar/dirigir los ~14 guiones (Opus de a uno + revisor) → 2.º render: local en serie (~65 min c/u) + **nube `producir.yml` en paralelo** (la cola local sola no alcanza: 14 × 65 min ≈ 15 h) → 3.º Studio en orden de fecha |
| 1 largo (dom 11-15 19:00, El mar de Bolivia) | 0 (el largo de Bushby sale el dom 11-08 19:00) | guion del largo de Bolivia (plantilla `largo` ya existe) | `preparar-largo.mts` + `render-largo.mts` (tramos ≤ 3 min, ~9 min de render por minuto de video) antes del jueves |

Al cumplirse: anotar aquí "✅ asegurada hasta el mié 11-18 (fecha/hora)" y en `salida/revisiones/<fecha>.md`. El plan debe extenderse
hasta el 11-18 (hoy termina el 11-15): agregar las ranuras 11-16 → 11-18 en el ritual del miércoles.

Calendario: 2 Shorts/día (12:00 y 18:00) + largo dominical a las **19:00** (desde el 2026-11-08; plantilla `largo` 16:9 lista).
Rotación `frontera → lugar → ruta`. Cuota contingente de la semana siguiente: 3 de 14 Shorts + el largo (4 de 15 ranuras, ~27 %).

## Semana en curso: lun 2026-11-02 → dom 2026-11-08

| Día | Hora | Plantilla | Tema (provisional) | Tipo | Contingencia (fuente) | Estado | Referente | Por qué entra |
|---|---|---|---|---|---|---|---|---|
| jue 11-05 | 12:00 | frontera | La Haya repartió el mar entre Perú y Chile… menos 5 canchas de arena | evergreen | — | publicado ([xl1dVN0KX7Q](https://youtube.com/shorts/xl1dVN0KX7Q)) | Ñerd (Shorts de frontera 2–3 min) | lanzamiento: tema fuerte de Chile/Perú con disputa viva |
| jue 11-05 | 18:00 | frontera | Chile y Argentina pelearon un lago por una frase escrita en 1902 | serie · _La línea que falta_ | — | publicado ([8rm7lrivW0Q](https://youtube.com/shorts/8rm7lrivW0Q)) | Ñerd (Shorts de frontera 2–3 min) | abre la serie del laudo de 1902 (sigue Campo de Hielo) |
| vie 11-06 | 12:00 | frontera | ¿Por qué hay una isla argentina a solo 3,5 km de Uruguay? | evergreen | — | publicado ([6LgYD_Ae5qI](https://youtube.com/shorts/6LgYD_Ae5qI)) | Ñerd (Shorts de frontera 2–3 min) | audiencia AR/UY; tratado del 19-11-1973 cumple aniversario la semana del 16 |
| vie 11-06 | 18:00 | frontera | ¿Por qué en esta plaza cambias de país sin mostrar un solo papel? | evergreen | — | publicado ([p-0rgosOKdg](https://youtube.com/shorts/p-0rgosOKdg)) | Ñerd (Shorts de frontera 2–3 min) | audiencia UY/BR; frontera urbana (formato distinto a los anteriores) |
| sáb 11-07 | 12:00 | frontera | Chile y Argentina tienen un tramo de frontera que todavía no existe | serie · _La línea que falta_ | — | **programado** `o3yQPPqXoQA` | Ñerd (Shorts de frontera 2–3 min) | continúa Laguna del Desierto (mismo laudo 1902); demarcación sigue pendiente (T13, 2026-09-07) |
| sáb 11-07 | 18:00 | frontera | Bolivia tiene Armada… y no tiene mar | evergreen · _El mar de Bolivia_ | — | **programado** `FM9aJ326bHU` ([ver](https://youtube.com/shorts/FM9aJ326bHU)) | Ñerd (contradicciones de país) | audiencia BO/CL; contradicción en una frase (idea 14); adelantado del 11-15 porque lugar sigue sin revisión v2 |
| dom 11-08 | 19:00 | **largo** 16:9 | Caminó 28 años para volver a casa. ¿Qué lo frenó? | contingente · _Del estrecho al canal_ | Karl Bushby llega a Hull (fin de la caminata Punta Arenas → Hull) ([2026-11-02](https://www.emol.com/noticias/Tendencias/2026/11/02/1215855/karl-bushby-llega-ciudad-natal.html)) | programado `RMjYx4IUpjE` | GeoGlobeTales (Bushby, 61 M) | primer largo nativo 16:9 (ruta B 4.000 h; mid-rolls ~3:57 y ~6:40) |
| dom 11-08 | 12:00 | frontera | La guerra por un petróleo que no estaba | evergreen | — | **programado** `-c96F_ywLkM` ([ver](https://youtube.com/shorts/-c96F_ywLkM)) | Ñerd (guerras y límites) | audiencia BO/PY, línea de 1938 dibujable (idea 15); adelantado del 11-13 porque ruta sigue sin revisión v2 |
| dom 11-08 | 18:00 | frontera | Uruguay nació de un empate | evergreen | — | **programado** `fKFCTNMk7iQ` ([ver](https://youtube.com/shorts/fKFCTNMk7iQ)) | Ñerd (origen de países) | audiencia UY/AR que ya llegó con Martín García y Rivera (idea 18); adelantado del 11-10; guion renderizado en GitHub Actions |

## Semana siguiente: lun 2026-11-09 → dom 2026-11-15

| Día | Hora | Plantilla | Tema (provisional) | Tipo | Contingencia (fuente) | Estado | Referente | Por qué entra |
|---|---|---|---|---|---|---|---|---|
| lun 11-09 | 12:00 | frontera | La frontera más vigilada de Europa se abrió por un papel mal leído | contingente | 37 años de la caída del Muro de Berlín (9-11-1989): Schabowski anunció la apertura 'desde ya' ([2026-11-09](https://elordenmundial.com/hoy-en-la-historia/9-noviembre/9-de-noviembre-de-1989-caida-del-muro-de-berlin/)) | **programado** `VgecejtBkTo` ([ver](https://youtube.com/shorts/VgecejtBkTo)) | Ñerd (fronteras absurdas) | efeméride el mismo día; ángulo propio (el error de la conferencia), no 'cayó el muro' |
| lun 11-09 | 18:00 | frontera | Unos soldados entraron a un país sin ejército | evergreen | — | listo (render en la nube, en bandeja; programar cuando se libere el cupo de subida) | Ñerd (fronteras absurdas) | renderizado en GitHub Actions (40 min); `soldados-entraron-a-un-pais-sin-ejercito` |
| mar 11-10 | 12:00 | frontera | ¿Por qué estas dos islas están a 3,8 km… y a 21 horas de distancia? | evergreen | — | programado `Aa8tOCay-rk` | Ñerd (¿por qué está ahí?) | cola de la nube de a uno; `por-que-estas-dos-islas-estan-a-3-8-km` |
| mar 11-10 | 18:00 | frontera | ¿Por qué un francés firmó el tratado que partió a Panamá en dos? | evergreen | — | programado `sXHB8kRkrdo` | Ñerd (origen de países) | cola de la nube de a uno; `por-que-un-frances-firmo-el-tratado` |
| mié 11-11 | 12:00 | frontera | ¿Por qué México recuperó tierra de Texas moviendo un río? | evergreen | — | programado `yCkE5KOg-Ho` | Ñerd (fronteras absurdas) | cola de la nube de a uno; `por-que-mexico-recupero-tierra-de-texas`; protagonista México |
| mié 11-11 | 18:00 | lugar | La ciudad más alta del mundo existe por el oro | evergreen | — | investigado | Ñerd (¿por qué está ahí?) | audiencia PE; récord verificable con NASA (idea 16) |
| jue 11-12 | 12:00 | frontera | Venezuela reclama dos tercios de Guyana por un laudo de 1899 | contingente | La CIJ prepara el fallo Guyana c. Venezuela (audiencias terminadas en mayo de 2026; fallo esperado entre noviembre de 2026 y enero de 2027; consultado 2026-11-05) ([2026-11-05](https://oilnow.gy/featured/guyana-government-expects-world-court-ruling-as-early-as-november-2026-in-essequibo-border-case/)) | idea · ⚠ tema sensible: guion con revisión de neutralidad; si no hay novedad de la CIJ, entra el reemplazo (Bolivia tiene Armada… y no tiene mar) | Ñerd (disputas vivas) | si la CIJ anuncia fecha de lectura, se mueve al día del fallo; solo hechos, dos versiones |
| jue 11-12 | 18:00 | ruta | La Panamericana va de Alaska a Ushuaia… menos 100 km de selva | evergreen | — | idea · ⚠ verificar largo del Tapón del Darién con 2 fuentes | GeoGlobeTales (rutas imposibles) | ruta continental con contradicción clara; Bushby cruzó ese tramo (cruce con la serie) |
| vie 11-13 | 12:00 | lugar | Panamá se separó de Colombia y el tratado del canal lo firmó un francés | contingente · _Del estrecho al canal_ | Independencia de Panamá (3-11-1903) y tratado Hay–Bunau-Varilla (18-11-1903): 123 años ([2026-11-18](https://history.state.gov/milestones/1899-1913/panama-canal)) | investigado | Ñerd (origen de países) | entre los dos aniversarios; cierra la serie del estrecho al canal (idea 19) |
| vie 11-13 | 18:00 | ruta | Salió caminando de Punta Arenas y tardó 28 años en llegar a su casa | contingente · _Del estrecho al canal_ | Karl Bushby llega a Hull a pie tras 28 años (salió de Punta Arenas en 1998) ([2026-11-02](https://www.itv.com/news/calendar/2026-11-02/adventurer-arrives-back-in-home-city-after-28-year-walk-round-the-world)) | dirigido · ⚠ plantilla ruta debe pasar revisión v2 (hoja de contacto) antes del render | GeoGlobeTales (Bushby, 61 M) | contingencia ITV 2026-11-02 (se enfría; desplazado desde el 11-08); tema probado con 61 M; abre la serie y precede al largo del 11-15 |
| sáb 11-14 | 12:00 | ruta | El náufrago que inspiró a Robinson Crusoe: cómo lo encontraron en 1709 | serie · _Robinson_ | — | idea · ⚠ falta fuente primaria (diario de Woodes Rogers, 1712) | GeoGlobeTales (historias de náufragos) | ruta marítima Juan Fernández; abre mini-serie que cierra el 11-15 (idea 6) |
| sáb 11-14 | 18:00 | lugar | Dos países se pelean por cuál es la ciudad más austral del mundo | evergreen | — | investigado | Ñerd (récords con trampa) | audiencia CL/AR, la de los 2 primeros videos (idea 17) |
| dom 11-15 | 19:00 | **largo** 16:9 | El mar de Bolivia: 147 años sin costa, explicados en el mapa | serie · _El mar de Bolivia_ | — | idea | Ñerd / GeoGlobeTales | la discusión del Short de Bolivia (11-07) concentra los comentarios; plantilla `largo` ya existe |
| dom 11-15 | 12:00 | lugar | Los olvidaron en una isla 3 años: el rey de Clipperton | serie · _Clipperton_ | — | dirigido · ⚠ plantilla lugar debe pasar revisión v2 | Ñerd (historias humanas con mapa) | abre la serie Clipperton (desplazado desde el 11-07); orden intercambiado por plantilla pendiente |
| dom 11-15 | 18:00 | lugar | Selkirk nunca pisó la isla que lleva su nombre | serie · _Robinson_ | — | investigado | Ñerd (nombres con trampa) | cierra la mini-serie Robinson 30 h después (idea 6) |

## Contingencias revisadas (2026-11-05)

| Hecho | Fecha | Fuente | Decisión |
|---|---|---|---|
| Karl Bushby llega a Hull tras 28 años a pie desde Punta Arenas | 2026-11-02 | [ITV](https://www.itv.com/news/calendar/2026-11-02/adventurer-arrives-back-in-home-city-after-28-year-walk-round-the-world) · [Emol](https://www.emol.com/noticias/Tendencias/2026/11/02/1215855/karl-bushby-llega-ciudad-natal.html) | **Entra** 11-07 12:00 (Short `ruta`) + largo 11-15 + serie (Bering 11-09) |
| 37 años de la caída del Muro de Berlín | 2026-11-09 (1989) | [El Orden Mundial](https://elordenmundial.com/hoy-en-la-historia/9-noviembre/9-de-noviembre-de-1989-caida-del-muro-de-berlin/) | **Entra** 11-09 12:00 con ángulo propio (apertura por un comunicado mal leído) |
| CIJ: fallo Guyana c. Venezuela (Esequibo), esperado nov 2026–ene 2027 | consultado 2026-11-05 | [OilNOW](https://oilnow.gy/featured/guyana-government-expects-world-court-ruling-as-early-as-november-2026-in-essequibo-border-case/) · [JURIST, audiencias may-2026](https://www.jurist.org/news/2026/05/icj-opens-oral-hearings-as-guyana-asks-court-to-affirm-century-old-boundary-with-venezuela/) | **Entra en espera** 11-12 12:00; si la CIJ fija fecha, se mueve a ese día; si no, reemplazo |
| Independencia de Panamá (3-11-1903) y tratado Hay–Bunau-Varilla (18-11-1903) | 2026-11-03 / 2026-11-18 | [Office of the Historian](https://history.state.gov/milestones/1899-1913/panama-canal) | **Entra** 11-13 12:00 (entre los dos aniversarios) |
| Campo de Hielo Sur: demarcación aún pendiente | 2026-09-07 | [T13](https://www.t13.cl/noticia/nacional/no-tenemos-presencia-campos-hielo-sur-estrategico-territorio-olvidado-estado-7-9-2026) | Fuera de ventana (> 14 d): entra como **serie**, no contingente (11-08) |
| Inventario argentino de glaciares que incluye Campo de Hielo | 2018-10 | [CNN Chile](https://www.cnnchile.com/pais/argentina-se-adjudico-territorio-chileno-como-suyo-advierten-de-tres-hechos-de-este-tipo-en-menos-de-cuatro-meses/) | **No entra**: parecía reciente y es de 2018 |
| Tratado de Petrópolis (Acre, 17-11-1903) | 2026-11-17 | idea 3 de `IDEAS-INICIALES.md` | **No entra**: Ñerd ya hizo Acre |
| Tratado del Río de la Plata (Martín García, 19-11-1973) | 2026-11-19 | idea 7 | Ya cubierto (Short del 11-06) |

## Cola de reemplazos (si una ranura se cae)
1. `frontera` · Point Roberts · 2. `lugar` · Diómedes: 3,8 km y 21 horas
(sin Bushby) · 3. `lugar` · Chile tricontinental (decir "reclamo", no "territorio").

## Plan (JSON)

```json
{
  "version": 1,
  "canal": "linea-punteada",
  "zona": "America/Santiago",
  "actualizado": "2026-11-07T09:00:00-03:00",
  "semanas": [
    { "inicio": "2026-11-02", "fin": "2026-11-08", "rol": "en-curso" },
    { "inicio": "2026-11-09", "fin": "2026-11-15", "rol": "siguiente" }
  ],
  "ranuras": [
    { "fecha": "2026-11-05", "hora": "12:00", "formato": "short", "plantilla": "frontera",
      "tema": "La Haya repartió el mar entre Perú y Chile… menos 5 canchas de arena",
      "tipo": "evergreen", "serie": null, "contingencia": null,
      "estado": "publicado", "guion": "contenido/guiones/2026-11-05-frontera-triangulo-terrestre.json", "videoId": "xl1dVN0KX7Q",
      "referente": "Ñerd (Shorts de frontera 2–3 min)", "porQue": "lanzamiento: tema fuerte de Chile/Perú con disputa viva", "bloqueo": null },
    { "fecha": "2026-11-05", "hora": "18:00", "formato": "short", "plantilla": "frontera",
      "tema": "Chile y Argentina pelearon un lago por una frase escrita en 1902",
      "tipo": "serie", "serie": "La línea que falta", "contingencia": null,
      "estado": "publicado", "guion": "contenido/guiones/2026-11-05-frontera-laguna-del-desierto.json", "videoId": "8rm7lrivW0Q",
      "referente": "Ñerd (Shorts de frontera 2–3 min)", "porQue": "abre la serie del laudo de 1902 (sigue Campo de Hielo)", "bloqueo": null },
    { "fecha": "2026-11-06", "hora": "12:00", "formato": "short", "plantilla": "frontera",
      "tema": "¿Por qué hay una isla argentina a solo 3,5 km de Uruguay?",
      "tipo": "evergreen", "serie": null, "contingencia": null,
      "estado": "publicado", "guion": "contenido/guiones/2026-11-05-frontera-martin-garcia.json", "videoId": "6LgYD_Ae5qI",
      "referente": "Ñerd (Shorts de frontera 2–3 min)", "porQue": "audiencia AR/UY; tratado del 19-11-1973 cumple aniversario la semana del 16", "bloqueo": null },
    { "fecha": "2026-11-06", "hora": "18:00", "formato": "short", "plantilla": "frontera",
      "tema": "¿Por qué en esta plaza cambias de país sin mostrar un solo papel?",
      "tipo": "evergreen", "serie": null, "contingencia": null,
      "estado": "publicado", "guion": "contenido/guiones/2026-11-05-frontera-rivera-livramento.json", "videoId": "p-0rgosOKdg",
      "referente": "Ñerd (Shorts de frontera 2–3 min)", "porQue": "audiencia UY/BR; frontera urbana (formato distinto a los anteriores)", "bloqueo": null },
    { "fecha": "2026-11-08", "hora": "12:00", "formato": "short", "plantilla": "frontera",
      "tema": "La guerra por un petróleo que no estaba",
      "tipo": "evergreen", "serie": null, "contingencia": null,
      "estado": "programado", "guion": "contenido/guiones/2026-11-07-frontera-la-guerra-por-un-petroleo-que-no-estaba.json", "videoId": "-c96F_ywLkM",
      "referente": "Ñerd (guerras y límites)", "porQue": "audiencia BO/PY, línea de 1938 dibujable (idea 15); adelantado del 11-13 porque ruta sigue sin revisión v2", "bloqueo": null },
    { "fecha": "2026-11-07", "hora": "18:00", "formato": "short", "plantilla": "frontera",
      "tema": "Bolivia tiene Armada… y no tiene mar",
      "tipo": "evergreen", "serie": "El mar de Bolivia", "contingencia": null,
      "estado": "programado", "guion": "contenido/guiones/2026-11-07-frontera-bolivia-tiene-armada-y-no-tiene-mar.json", "videoId": "FM9aJ326bHU",
      "referente": "Ñerd (contradicciones de país)", "porQue": "audiencia BO/CL; contradicción en una frase (idea 14); adelantado del 11-15 porque lugar sigue sin revisión v2", "bloqueo": null },
    { "fecha": "2026-11-08", "hora": "19:00", "formato": "largo", "plantilla": "largo",
      "tema": "Caminó 28 años para volver a casa. ¿Qué lo frenó?",
      "tipo": "contingente", "serie": "Del estrecho al canal",
      "contingencia": {"hecho": "Karl Bushby llega a Hull (fin de la caminata Punta Arenas → Hull)", "fecha": "2026-11-02", "url": "https://www.emol.com/noticias/Tendencias/2026/11/02/1215855/karl-bushby-llega-ciudad-natal.html"},
      "estado": "listo", "guion": "contenido/borradores/largo-bushby.json", "videoId": null,
      "referente": "GeoGlobeTales (Bushby, 61 M)", "porQue": "primer largo nativo 16:9 (ruta B 4.000 h; mid-rolls ~3:57 y ~6:40); render hecho 03:58, 8:44, 6 capítulos; subir 19:00", "bloqueo": null },
    { "fecha": "2026-11-07", "hora": "12:00", "formato": "short", "plantilla": "frontera",
      "tema": "Chile y Argentina tienen un tramo de frontera que todavía no existe",
      "tipo": "serie", "serie": "La línea que falta", "contingencia": null,
      "estado": "programado", "guion": "contenido/guiones/2026-11-06-frontera-campo-de-hielo.json", "videoId": "o3yQPPqXoQA",
      "referente": "Ñerd (Shorts de frontera 2–3 min)", "porQue": "continúa Laguna del Desierto (mismo laudo 1902); demarcación sigue pendiente (T13, 2026-09-07). Adelantado del 11-08: salió del diario del 11-06 y ruta aún no pasó revisión", "bloqueo": null },
    { "fecha": "2026-11-08", "hora": "18:00", "formato": "short", "plantilla": "frontera",
      "tema": "Uruguay nació de un empate",
      "tipo": "evergreen", "serie": null, "contingencia": null,
      "estado": "programado", "guion": "contenido/guiones/2026-11-07-frontera-por-que-ningun-uruguayo-firmo.json", "videoId": "fKFCTNMk7iQ",
      "referente": "Ñerd (origen de países)", "porQue": "audiencia UY/AR que ya llegó con Martín García y Rivera (idea 18); adelantado del 11-10; guion renderizado en GitHub Actions", "bloqueo": null },

    { "fecha": "2026-11-09", "hora": "12:00", "formato": "short", "plantilla": "frontera",
      "tema": "La frontera más vigilada de Europa se abrió por un papel mal leído",
      "tipo": "contingente", "serie": null, "contingencia": {"hecho": "37 años de la caída del Muro de Berlín (9-11-1989): Schabowski anunció la apertura 'desde ya'", "fecha": "2026-11-09", "url": "https://elordenmundial.com/hoy-en-la-historia/9-noviembre/9-de-noviembre-de-1989-caida-del-muro-de-berlin/"},
      "estado": "programado", "guion": "contenido/guiones/2026-11-07-frontera-la-frontera-mas-vigilada-de-europa-se.json", "videoId": "VgecejtBkTo",
      "referente": "Ñerd (fronteras absurdas)", "porQue": "efeméride el mismo día; ángulo propio (el error de la conferencia), no 'cayó el muro'", "bloqueo": null },
    { "fecha": "2026-11-09", "hora": "18:00", "formato": "short", "plantilla": "frontera",
      "tema": "Unos soldados entraron a un país sin ejército",
      "tipo": "evergreen", "serie": null, "contingencia": null,
      "estado": "programado", "guion": "contenido/guiones/2026-11-08-frontera-soldados-entraron-a-un-pais-sin-ejercito.json", "videoId": null,
      "referente": "Ñerd (fronteras absurdas)", "porQue": "renderizado en GitHub Actions (40 min), en bandeja; programar cuando se libere el cupo de subida", "bloqueo": null },
    { "fecha": "2026-11-10", "hora": "12:00", "formato": "short", "plantilla": "frontera",
      "tema": "¿Por qué estas dos islas están a 3,8 km… y a 21 horas de distancia?",
      "tipo": "evergreen", "serie": null, "contingencia": null,
      "estado": "programado", "guion": null, "videoId": null,
      "referente": "Ñerd (¿por qué está ahí?)", "porQue": "cola de la nube de a uno (producir.yml); por-que-estas-dos-islas-estan-a-3-8-km", "bloqueo": null },
    { "fecha": "2026-11-10", "hora": "18:00", "formato": "short", "plantilla": "frontera",
      "tema": "¿Por qué un francés firmó el tratado que partió a Panamá en dos?",
      "tipo": "evergreen", "serie": null, "contingencia": null,
      "estado": "programado", "guion": null, "videoId": null,
      "referente": "Ñerd (origen de países)", "porQue": "cola de la nube de a uno (producir.yml); por-que-un-frances-firmo-el-tratado", "bloqueo": null },
    { "fecha": "2026-11-11", "hora": "12:00", "formato": "short", "plantilla": "frontera",
      "tema": "¿Por qué México recuperó tierra de Texas moviendo un río?",
      "tipo": "evergreen", "serie": null, "contingencia": null,
      "estado": "programado", "guion": null, "videoId": null,
      "referente": "Ñerd (fronteras absurdas)", "porQue": "cola de la nube de a uno (producir.yml); por-que-mexico-recupero-tierra-de-texas; protagonista México", "bloqueo": null },
    { "fecha": "2026-11-11", "hora": "18:00", "formato": "short", "plantilla": "lugar",
      "tema": "La ciudad más alta del mundo existe por el oro",
      "tipo": "evergreen", "serie": null, "contingencia": null,
      "estado": "investigado", "guion": null, "videoId": null,
      "referente": "Ñerd (¿por qué está ahí?)", "porQue": "audiencia PE; récord verificable con NASA (idea 16)", "bloqueo": null },
    { "fecha": "2026-11-12", "hora": "12:00", "formato": "short", "plantilla": "frontera",
      "tema": "Venezuela reclama dos tercios de Guyana por un laudo de 1899",
      "tipo": "contingente", "serie": null,
      "contingencia": { "hecho": "La CIJ prepara el fallo Guyana c. Venezuela (audiencias terminadas en mayo de 2026; fallo esperado entre noviembre de 2026 y enero de 2027; consultado 2026-11-05)", "fecha": "2026-11-05", "url": "https://oilnow.gy/featured/guyana-government-expects-world-court-ruling-as-early-as-november-2026-in-essequibo-border-case/" },
      "estado": "idea", "guion": null, "videoId": null,
      "referente": "Ñerd (disputas vivas)", "porQue": "si la CIJ anuncia fecha de lectura, se mueve al día del fallo; solo hechos, dos versiones", "bloqueo": "tema sensible: guion con revisión de neutralidad; si no hay novedad de la CIJ, entra el reemplazo (Bolivia tiene Armada… y no tiene mar)" },
    { "fecha": "2026-11-12", "hora": "18:00", "formato": "short", "plantilla": "ruta",
      "tema": "La Panamericana va de Alaska a Ushuaia… menos 100 km de selva",
      "tipo": "evergreen", "serie": null, "contingencia": null,
      "estado": "idea", "guion": null, "videoId": null,
      "referente": "GeoGlobeTales (rutas imposibles)", "porQue": "ruta continental con contradicción clara; Bushby cruzó ese tramo (cruce con la serie)", "bloqueo": "verificar largo del Tapón del Darién con 2 fuentes" },
    { "fecha": "2026-11-13", "hora": "12:00", "formato": "short", "plantilla": "lugar",
      "tema": "Panamá se separó de Colombia y el tratado del canal lo firmó un francés",
      "tipo": "contingente", "serie": "Del estrecho al canal",
      "contingencia": { "hecho": "Independencia de Panamá (3-11-1903) y tratado Hay–Bunau-Varilla (18-11-1903): 123 años", "fecha": "2026-11-18", "url": "https://history.state.gov/milestones/1899-1913/panama-canal" },
      "estado": "investigado", "guion": null, "videoId": null,
      "referente": "Ñerd (origen de países)", "porQue": "entre los dos aniversarios; cierra la serie del estrecho al canal (idea 19)", "bloqueo": null },
    { "fecha": "2026-11-13", "hora": "18:00", "formato": "short", "plantilla": "ruta",
      "tema": "Salió caminando de Punta Arenas y tardó 28 años en llegar a su casa",
      "tipo": "contingente", "serie": "Del estrecho al canal", "contingencia": {"hecho": "Karl Bushby llega a Hull a pie tras 28 años (salió de Punta Arenas en 1998)", "fecha": "2026-11-02", "url": "https://www.itv.com/news/calendar/2026-11-02/adventurer-arrives-back-in-home-city-after-28-year-walk-round-the-world"},
      "estado": "dirigido", "guion": "contenido/borradores/ruta-bushby.v2.json", "videoId": null,
      "referente": "GeoGlobeTales (Bushby, 61 M)", "porQue": "contingencia ITV 2026-11-02 (se enfría; desplazado desde el 11-08); tema probado con 61 M; abre la serie y precede al largo del 11-15", "bloqueo": "plantilla ruta debe pasar revisión v2 (hoja de contacto) antes del render" },
    { "fecha": "2026-11-14", "hora": "12:00", "formato": "short", "plantilla": "ruta",
      "tema": "El náufrago que inspiró a Robinson Crusoe: cómo lo encontraron en 1709",
      "tipo": "serie", "serie": "Robinson", "contingencia": null,
      "estado": "idea", "guion": null, "videoId": null,
      "referente": "GeoGlobeTales (historias de náufragos)", "porQue": "ruta marítima Juan Fernández; abre mini-serie que cierra el 11-15 (idea 6)", "bloqueo": "falta fuente primaria (diario de Woodes Rogers, 1712)" },
    { "fecha": "2026-11-14", "hora": "18:00", "formato": "short", "plantilla": "lugar",
      "tema": "Dos países se pelean por cuál es la ciudad más austral del mundo",
      "tipo": "evergreen", "serie": null, "contingencia": null,
      "estado": "investigado", "guion": null, "videoId": null,
      "referente": "Ñerd (récords con trampa)", "porQue": "audiencia CL/AR, la de los 2 primeros videos (idea 17)", "bloqueo": null },
    { "fecha": "2026-11-15", "hora": "19:00", "formato": "largo", "plantilla": "largo",
      "tema": "El mar de Bolivia: 147 años sin costa, explicados en el mapa",
      "tipo": "serie", "serie": "El mar de Bolivia", "contingencia": null,
      "estado": "idea", "guion": null, "videoId": null,
      "referente": "Ñerd / GeoGlobeTales", "porQue": "la discusión del Short de Bolivia (11-07) concentra los comentarios; plantilla largo ya existe", "bloqueo": null },
    { "fecha": "2026-11-15", "hora": "12:00", "formato": "short", "plantilla": "lugar",
      "tema": "Los olvidaron en una isla 3 años: el rey de Clipperton",
      "tipo": "serie", "serie": "Clipperton", "contingencia": null,
      "estado": "dirigido", "guion": "contenido/borradores/lugar-clipperton-1917.v2.json", "videoId": null,
      "referente": "Ñerd (historias humanas con mapa)", "porQue": "abre la serie Clipperton (desplazado desde el 11-07); orden intercambiado por plantilla pendiente", "bloqueo": "plantilla lugar debe pasar revisión v2" },
    { "fecha": "2026-11-15", "hora": "18:00", "formato": "short", "plantilla": "lugar",
      "tema": "Selkirk nunca pisó la isla que lleva su nombre",
      "tipo": "serie", "serie": "Robinson", "contingencia": null,
      "estado": "investigado", "guion": null, "videoId": null,
      "referente": "Ñerd (nombres con trampa)", "porQue": "cierra la mini-serie Robinson 30 h después (idea 6)", "bloqueo": null }
  ]
}
```
