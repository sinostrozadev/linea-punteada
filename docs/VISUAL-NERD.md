# Lenguaje visual de Ñerd, plano a plano (Arizona, 4,2 M; 90 fotogramas, 2026-11-05 01:30)

Hojas de contacto en `salida/referentes/nerd/sheet_0..3.jpg` (6×4 cuadros, con el segundo arriba a la izquierda).
Santiago fijó el estándar: **hay que quedar MEJOR que esto**, no igual. Lo que sigue es lo que hace Ñerd y, al final,
lo que haremos nosotros además.

## 1. Estructura temporal (164 s)
- **0,0–0,7 s: tarjeta de título**, no el mapa. Fondo azul marino; arriba un mapa chico con el contorno del estado,
  dos pines ("PHOENIX", "PUERTO PEÑASCO") y un icono de auto; una regla amarilla; la pregunta en 2 líneas, condensada,
  mayúsculas, con la palabra clave en amarillo ("¿POR QUÉ ARIZONA NO TOCA EL **MAR**?").
- **0,7 s: corte al satélite.** Desde ahí, **un evento visual cada ~2 s** (corte de cámara, máscara que aparece,
  etiqueta, icono, cota, foto). Los cortes coinciden con los límites de frase.
- Cierre (160–164 s): el mapa final con las dos etiquetas del remate ("EL TREN · EE. UU." / "EL MAR · MÉXICO") y la
  cota "60 KM". **Sin cartel de marca, sin marca de agua, sin cabecera permanente.** Termina sobre el mapa.

## 2. Cámara
- Base satelital tipo **Blue Marble con relieve sombreado y colores saturados** (tierra ocre/verde, océano azul marino
  oscuro con **brillo claro en la línea de costa**). A escala de ciudad cambia a imagen de más detalle (Yuma, delta del
  Colorado) con tono amarillento.
- **Zoom lento continuo dentro de cada plano + cortes entre encuadres** cada 2–6 s: plano general (México-EE. UU.),
  medio (Sonora-Baja), cerrado (Yuma, el escalón de la línea). Vuelve al general para las explicaciones.
- Fluidez: cada corte llega con un easing corto; nada estático más de 1 s.

## 3. Capas sobre el mapa
- **Fronteras**: blancas finas por defecto; la que importa, **amarilla con glow** y se dibuja. Un **círculo amarillo**
  marca el detalle ("el escalón") durante 1 s.
- **Máscaras de territorio con trama de rayas diagonales y color translúcido**: verde = México, rojo = lo cedido
  (Texas → California), **violeta = "LO QUE QUERÍA WASHINGTON"**, amarillo = La Mesilla, azul = Baja California.
  Aparecen cuando la voz las nombra, con etiqueta dentro.
- **Etiquetas de mapa**: mayúsculas condensadas, blancas, con tracking y sombra: países ("ESTADOS UNIDOS", "MÉXICO"),
  estados, **ríos rotados a lo largo del cauce** ("RÍO BRAVO", "COLORADO"), mares ("GOLFO DE CALIFORNIA"); **pines rojos**
  con nombre ("TUCSON", "YUMA", "CIUDAD DE MÉXICO", "PHOENIX").
- **Cotas**: línea con marcas y el número rotado sobre ella ("60 KM", "32 KM").
- **Etiquetas de contexto** en amarillo arriba del mapa, 1–4 palabras, cuando la voz lo dice: "¿POR QUÉ?", "LA LEYENDA",
  "MÁS DE LA MITAD", "EL GIRO", "NOVIEMBRE DE 1853", "ARIZONA HIGHWAYS", "DEPARTAMENTO DE ESTADO".
- **Índice de enumeración** arriba a la izquierda cuando dice "tres cosas": fila de **emoji + número + palabra**
  ("⚔️ 1 · GUERRA", "🚂 2 · TREN", "🌴 3 · PENÍNSULA"); aparecen uno a uno y **se quedan** como índice.
- **Iconos sobre el mapa**: tren (emoji) que avanza por la ruta; montañas; casco militar; círculo tachado; monedas;
  auto que cruza de Phoenix a Puerto Peñasco.
- **Tarjetas de cifra**: número enorme + subtítulo pequeño ("US$ 50 M / LA OFERTA MÁS GRANDE", "77.000 KM² / LA COMPRA
  DE GADSDEN (LA MESILLA)"); **comparación de barras** ("50 M OFERTA · 10 M PAGADO") con miniatura del mapa.
- **Fotos**: a pantalla completa 2–3 s con **pastilla de pie arriba a la izquierda** ("● NOGALES · LA LÍNEA PARTE LA
  CIUDAD", "● TREN DE CARGA EN EL DESIERTO DE ARIZONA", "● VÍAS DEL SOUTHERN PACIFIC JUNTO A TUCSON · 1880"), con zoom
  leve. **Retratos y documentos como "polaroid"** (marco blanco, leve giro, crédito debajo: "Antonio López de Santa
  Anna · daguerrotipo c. 1853 · dominio público"; "Mapa de la Compra de Gadsden (1858) · NARA · dominio público") que
  entran sobre el mapa, a veces con un año gigante arriba ("1853").

## 4. Subtítulos y texto
- **2–4 palabras por bloque**, mayúsculas, **fuente condensada bold** (tipo Bebas Neue/Oswald), blancas, **sin
  pastilla**, al ~62 % de la altura; **una palabra clave por bloque en caja amarilla redondeada con texto oscuro**
  ("MIRA LA [FRONTERA]", "LA [LÍNEA] BAJA", "SIN [TOCARLO]"). Cambian cada 0,6–1 s al ritmo de la voz.
- **No usa rótulos gigantes en medio del mapa** (lo que hacíamos nosotros tapaba el mapa). La palabra clave vive en el
  subtítulo y, si hace falta, como etiqueta de contexto arriba.
- Cero marca en el video. Cero cabecera permanente.

## 5. Lo que nosotros vamos a hacer además (para quedar mejor)
1. Todo lo anterior, generado desde el guion (cada escena trae su **dirección visual**: planos, máscaras, etiquetas,
   cotas, iconos, tarjetas, foto), para que un agente pueda escribirlo sin tocar código.
2. **Fuente dicha en voz y citada en pantalla** como tarjeta elegante (Ñerd la dice; nosotros además la mostramos).
3. **Relieve y costas más nítidos** (shaded relief propio + glow de costa) y transiciones de cámara con easing
   cinematográfico (ease-in-out largo), sin saltos.
4. **Ruta animada y contador** (plantilla `ruta`) y **Ken Burns en fotos** (plantilla `lugar`): cosas que Ñerd no tiene.
5. Las dos etiquetas del remate sobre el mapa (como Ñerd) **y** el remate hablado.
6. Índice de enumeración con pictogramas propios (SVG, CC0) además de emoji, para que no se vea igual a Ñerd.
