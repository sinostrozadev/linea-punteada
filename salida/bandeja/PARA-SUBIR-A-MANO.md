# Videos listos para subir a mano (YouTube Studio)

Generado: 2026-11-05 06:29 (America/Santiago) · 0 Short(s), en orden de calendario.

Cómo: YouTube Studio → **Crear → Subir videos** → elige el archivo indicado. Copia el título y la
descripción **tal cual** (la descripción ya trae los hashtags al final). En "Público": **No, no es
contenido para niños**. En "Más opciones": idioma Español, categoría indicada, etiquetas. En
"Visibilidad": **Programar** con la fecha y hora indicadas (hora de Chile).

Al terminar, marca cada video como subido para que no vuelva a aparecer: en `salida/bandeja/<id>.json`
cambia `"estado": "listo"` por `"estado": "subido"` y agrega `"publicarEn": "<fecha ISO>"`
(así el calendario sabe que esa ranura ya está ocupada). Si no lo haces, solo se volverá a listar.

_No hay videos "listo" en la bandeja._
