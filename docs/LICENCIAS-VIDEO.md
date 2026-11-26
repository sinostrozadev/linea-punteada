## Licencias de video de archivo y stock para un canal monetizado de geografía e historia (leído el 2026-11-25)

Todas las citas salen de la página oficial, leída hoy con curl o WebFetch. Cuando la página estaba bloqueada lo marco como **no verificado**, y si uso un fragmento de buscador lo digo. No creé cuentas, no usé claves propias ni descargué videos (solo consulté metadatos y pedí tamaños con HEAD).

### (1) Tabla resumen por fuente

| Fuente | Licencia exacta | ¿Comercial / YouTube monetizado? | Atribución | ¿API sin clave? | Calidad típica | Cobertura Chile/LatAm (pruebas de hoy) | Riesgo reutilizado / Content ID | Veredicto |
|---|---|---|---|---|---|---|---|---|
| Pexels | Licencia Pexels (fotos y videos) | Sí, uso gratis; la página menciona anuncios | No obligatoria. En la API se exige un enlace visible a Pexels | **No**: la clave es gratis con cuenta. 200 solicitudes/h y 20.000/mes | HD a 4K | No probada (requiere clave) | Medio: el stock genérico se repite entre canales, la licencia no dice nada de Content ID, y no se puede usar a una persona identificable "en mala luz" | USAR CON CUIDADO (relleno, no protagonista) |
| Pixabay | Content License, actualizada el 20-oct-2026 | Sí, "commercial or non-commercial" | No obligatoria. En la API se pide mostrar de dónde viene | **No**: clave obligatoria. 100 solicitudes/60 s, caché de 24 h, prohíbe descargas masivas y el hotlinking permanente | HD a 4K | No probada | Medio. Pixabay admite reclamos de Content ID solo en **música**; de video no dice nada | USAR CON CUIDADO |
| Coverr | Licencia propia, actualizada el 4-nov-2026 | Sí ("including commercially") | No obligatoria al descargar. En la API gratuita sí | API con planes (no la probé) | HD/4K, parte de la biblioteca es IA | No probada | Medio. Prohíbe registrar los clips en Content ID. **Parte del catálogo es IA**: hay que filtrar el "AI generated", porque el canal debería declararlo | USAR CON CUIDADO |
| Mixkit | "Stock Video Free License" o "Restricted" según el clip | Free: sí, nombra "YouTube videos". **Restricted: NO**, nombra "a monetized YouTube video" | No obligatoria | No | HD/4K | No probada | Medio, y hay que revisar la etiqueta de cada clip | USAR CON CUIDADO (solo Free) |
| Videvo | Ya no existe: 301 a freepik.com/videos, y los términos de Freepik redirigen a magnific.com | En la versión gratis hay que atribuir; sin atribución hace falta pagar | Obligatoria en la versión gratis | No | – | – | – | DESCARTAR (confuso y con atribución obligatoria) |
| Wikimedia Commons | Por archivo: dominio público, CC0, CC BY o CC BY-SA (vi también algún BY-SA IGO) | Sí, con BY y BY-SA | Obligatoria (autor, título, licencia, enlace) salvo dominio público o CC0. Texto: "«Título» — Autor, CC BY-SA 4.0, vía Wikimedia Commons" | **Sí**, sin clave. Hubo rate-limit al hacer consultas seguidas: hace falta esperar unos 15–30 s | De 360p a 5.760×3.240; muchos clips en 4K vertical | Buena (ver la tabla de pruebas) | Bajo si se usan clips cortos dentro de una narración propia. BY-SA obliga a cuidar la licencia del video completo | USAR |
| NASA (images-api) | Dominio público en EE. UU., con excepciones | Sí para uso editorial. No se puede insinuar respaldo de la NASA, ni usar el logo, ni mostrar astronautas en uso promocional | Pedida: "NASA" | **Sí**, sin clave. `/search` y luego `/asset/{nasa_id}` | 720p a 4K; archivos enormes (un video de 44 min pesa 6 GB en orig) | Escasa: Patagonia 0, Andes 0, Chile 13, Antártica 39 | Bajo. Ojo con la música de terceros en algunos videos; usar las versiones "No Music" | USAR |
| NASA SVS | Dominio público "(unless otherwise noted)" | Sí | Pedida (créditos por visualización) | **Sí**, sin clave. `svs.gsfc.nasa.gov/api/search/` y `/api/{id}` | Hasta 5.760×3.240 | Buena: Chile 52, Antártica 428, Amazon 108, Argentina 35 | Bajo. Quitar la música licenciada cuando la visualización la tenga | USAR (es la mejor fuente de timelapse satelital) |
| ISS Crew Earth Obs. (eol.jsc) | NASA "does not maintain a copyright" | Sí, salvo personas identificables | "Video courtesy of the Earth Science and Remote Sensing Unit, NASA Johnson Space Center" | No verificado | – | – | Bajo | USAR |
| NASA Earthdata / Worldview | CC0 salvo que se indique otra licencia (política ESDIS) | Sí | Se pide citar | El GIF se exporta desde la web (máximo 40 fotogramas, según fragmentos de buscador) | Baja: GIF | – | Bajo | USAR CON CUIDADO (calidad) |
| Earth Observatory | No pude abrir la página: hoy redirige a science.nasa.gov | – | – | – | – | – | – | No verificado |
| ESA | La web es "personal non-commercial". Solo CC BY-SA 3.0 IGO "where expressly stated" | Solo los recursos marcados con CC BY-SA IGO | Obligatoria, con enlace a la licencia e indicando cambios. Las adaptaciones van con la misma licencia | – | – | – | Alto si no está marcado | USAR CON CUIDADO (solo los marcados IGO) |
| NOAA | Dominio público (17 USC §105), según la biblioteca de NOAA | Sí | Se pide atribución | – | – | – | Bajo. Si aparece otra autoría (universidad, instituto cooperativo) no se puede asumir dominio público | USAR |
| USGS | Dominio público en EE. UU., salvo material de terceros | Sí | "Credit: U.S. Geological Survey" | – | – | – | Bajo | USAR |
| ESO | CC BY 4.0 | Sí. Prohíbe insinuar respaldo y el uso comercial de personas identificables | **Crédito VISIBLE dentro del video. La descripción de YouTube no basta** | – | HD/4K | Muy buena para Atacama: ALMA, Paranal | Bajo | USAR |
| Copernicus Sentinel | Ley UE: acceso "free, full and open" | Sí (reproducir, distribuir, adaptar) | "Contains modified Copernicus Sentinel data [Año]" | – | – | – | Bajo | USAR |
| Sentinel Hub EO Browser | Lo exportado es CC BY 4.0 | Sí | Mencionar "Sentinel Hub EO Browser" y la colección, p. ej. "Modified Copernicus Sentinel data [Año]/Sentinel Hub" | – | Media | – | Bajo | USAR |
| Google Earth / Earth Studio | Geo Guidelines de Google | **Sí en YouTube educativo o de entretenimiento, "even if your work is monetized"**. No en publicidad ni promoción | **Obligatoria en pantalla mientras se ve la imagen** ("Google Earth" más los proveedores). No basta en los créditos finales | No | Alta | – | Bajo, si se respeta la marca de agua | USAR (con la atribución quemada en la imagen) |
| Google Earth Timelapse | Términos 404 en `/timelapse/terms`. Los videos que Google subió a YouTube figuran en Commons como CC BY 3.0 (p. ej. Valparaíso, 4K) | Sí, vía Commons | "Google Earth" y "Landsat / Copernicus" | Vía Commons | 4K | Valparaíso | Bajo | USAR (vía Commons) |
| Internet Archive / Prelinger | Por ítem: CC PD dedication **o nada** | Sí con la dedicación PD. Sin ella hay que pedir permiso | No obligatoria | **Sí**, sin clave (`advancedsearch` y `/metadata/{id}`) | 320×240 a 640×480; los escaneos desde 2023 llegan a 4K | 78 ítems de LatAm (La Paz 1943, Lima 1944, Fundo in Chile 1949, Housing in Chile 1943…) | Medio. Hay noticieros con © (Fox Movietone) mezclados, y una película PD puede traer música o archivo con derechos | USAR CON CUIDADO (solo los que tengan licenseurl PD) |
| Library of Congress | No verificado (403 de Cloudflare tanto con curl como con WebFetch) | – | – | Bloqueada | – | – | – | No verificado |
| Europeana | Declaración de derechos por objeto. La API acepta `reusability=open` | Sí con PDM, CC0, BY y BY-SA | Según el objeto | Con la clave pública de demostración "api2demo" (no creé ninguna) | Noticieros | Poca: Chile 3, Argentina 15, "south america" 14, Patagonia 1. Casi todo son noticieros europeos en BY-SA | Medio | USAR CON CUIDADO |
| British Pathé | Fragmentos de buscador (la página dio 403): hay que pagar licencia, por segundo y con mínimo de 60 s | No sin pagar | – | – | – | – | Alto (Content ID) | DESCARTAR |
| AP Archive, Reuters, Getty | Páginas bloqueadas (403/401) | Pago | – | – | – | – | Alto | DESCARTAR (no verificado, pero son de pago) |
| Storyblocks | Suscripción. En los planes Individual y Small Business no hay uso perpetuo al cancelar | Solo pagando | – | – | – | – | – | DESCARTAR |
| SERPAT Chile (Archivo Nacional, Biblioteca Nacional, Memoria Chilena, Cineteca Nacional) | Todos los derechos reservados. Memoria Chilena: CC BY-SA 3.0 solo para sus investigaciones, "a excepción de sus objetos digitales" | **Prohíbe la reproducción con fines comerciales sin autorización** | – | – | – | – | Alto | **NO REUTILIZABLE SIN PERMISO** |
| argentina.gob.ar (AGN, INA) | CC BY 4.0 "excepto cuando se declare lo contrario" | El portal sí. Sobre los fondos fílmicos del AGN no encontré nada | BY | – | – | – | Medio | USAR CON CUIDADO (pedir confirmación antes de usar fondos del AGN) |
| Archivo RTA (Argentina) | Cesión onerosa: USD 1.470/min hasta 5 min | No sin pagar | – | – | – | – | Alto | **NO REUTILIZABLE SIN PAGO** |
| gob.cl, SHOA, Armada | No encontré páginas de términos | – | – | – | – | – | – | No verificado |

### (2) Citas textuales con su URL

**Stock gratuito**
- **Pexels** — https://www.pexels.com/license/ (vía WebFetch):
  - "All photos and videos on Pexels can be downloaded and used for free." / "Attribution is not required." / "Identifiable people may not appear in a bad light or in a way that is offensive." / "Don't sell unaltered copies of a photo or video…" / "Don't redistribute or sell the photos and videos on other stock photo or wallpaper platforms."
  - API, https://www.pexels.com/api/documentation/: "Authorization is required for the Pexels API." / "Anyone with a Pexels account can request an API key, which you will receive instantly." / "By default, the API is rate-limited to 200 requests per hour and 20,000 requests per month." / "Whenever you are doing an API request make sure to show a prominent link to Pexels."
  - El endpoint de búsqueda de video es `https://api.pexels.com/v1/videos/search`.
- **Pixabay**
  - https://pixabay.com/service/terms/: "we grant you an irrevocable, worldwide, perpetual … non-exclusive and royalty-free right … to download, use, copy, modify or adapt the Content for commercial or non-commercial purposes" ("Last updated: 20 October, 2026").
  - Resumen de la licencia, https://pixabay.com/service/license-summary/: "Use Content without having to attribute the author" / "You cannot use Content in a misleading or deceptive way."
  - API, https://pixabay.com/api/docs/: "key (required)" / "By default, you can make up to 100 requests per 60 seconds." / "requests must be cached for 24 hours… Systematic mass downloads are not allowed." / "permanent hotlinking of images … is not allowed." / "show your users where the images and videos are from, whenever search results are displayed."
  - Blog de Pixabay, https://pixabay.com/blog/posts/intellectual-property-explained-441/: "for music, some tracks might trigger Content ID claims on platforms like YouTube." No encontré ninguna mención para video.
- **Coverr** — https://coverr.co/license:
  - "Everything Coverr publishes is free for commercial and personal projects."
  - "No registering them as your own work or claiming them through YouTube Content ID."
  - "Part of the library is AI-generated… Look for the 'AI generated' badge" / "Labelling is on you."
  - "Do I need to credit Coverr? Not for anything you download from Coverr."
- **Mixkit**
  - https://mixkit.co/license/modal/videoFree/: "Videos under the Free license can be used in YouTube videos… Commercial projects" / "Attribution is not required".
  - https://mixkit.co/license/modal/videoRestricted/: "Personal projects never: … Appear in social media, marketing or an advertisement for a business or something that you sell or make money from (e.g. a monetized YouTube video)".
- **Videvo** — https://www.videvo.net/ responde "301 Moved Permanently" hacia https://www.freepik.com/videos. Los términos (https://www.magnific.com/legal/terms-of-use) dicen: "authorization to use Magnific Content is free of charge and conditioned upon any use by the User being duly attributed".

**Wikimedia Commons y Creative Commons**
- **Commons** — https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia:
  - "the Wikimedia Foundation does not provide any warranty regarding the copyright status"
  - "If the uploader is not the content creator, it is the content creator who must be credited, not the uploader."
- **FAQ de Creative Commons** — https://creativecommons.org/faq/:
  - "Under CC licenses, synching music in timed relation with a moving image is always considered an adaptation."
  - "a modification rises to the level of an adaptation … when the modified work is based on the prior work but manifests sufficient new creativity to be copyrightable".
  - "when remixing ShareAlike content, your adapter's license must be the same license as the license on the material you are adapting."
  - Sobre colecciones: "All Creative Commons licenses … allow licensed material to be included in collections such as anthologies, encyclopedias, and broadcasts. You may choose a license for the collection, however this does not change the license applicable to the original material."
  - Sobre la atribución: "providing attribution … in a blog post may be different than doing so in a video remix" / "may be implemented in any reasonable manner… by providing a link to a place where the attribution information may be found."
  - **Lectura:** CC no dice expresamente si un clip BY-SA dentro de un documental es una colección o una adaptación. Ese límite lo fija la ley de cada país. Un clip sin modificar intercalado parece colección y no obligaría a licenciar el video entero. Un clip recortado, con color cambiado o con texto encima probablemente sea adaptación, y esa parte quedaría en BY-SA. Si se le pone música sincronizada a un clip, CC lo trata siempre como adaptación. Para no tener que decidirlo, conviene preferir dominio público, CC0 y CC BY.

**Agencias públicas y científicas**
- **NASA** — https://www.nasa.gov/nasa-brand-center/images-and-media/:
  - "NASA content – images, audio, video… generally are not subject to copyright in the United States."
  - "NASA Insignia, Logotype, identifiers, and imagery are not in the public domain."
  - "NASA occasionally uses copyright-protected material of third parties… NASA's use does not convey any rights to others."
  - "it must not explicitly or implicitly convey NASA's endorsement"
  - "Astronauts… cannot have their names, likenesses… used on any commercial products, advertisements, promotional material".
  - images-api respondió sin clave (HTTP 200).
- **NASA SVS** — https://svs.gsfc.nasa.gov/help/:
  - "All of our content is in the public domain (unless otherwise noted)… free to download, use, and redistribute for whatever purposes you see fit."
  - "some of our visualizations feature licensed music, which is not in the public domain… you're allowed to use them without the associated audio tracks."
- **ISS Crew Earth Observations** — https://eol.jsc.nasa.gov/FAQ/: "Video courtesy of the Earth Science and Remote Sensing Unit, NASA Johnson Space Center" / "You are welcome to use our photos or videos, for which NASA does not maintain a copyright."
- **NASA Earthdata (ESDIS)** — https://www.earthdata.nasa.gov/engage/open-data-services-software-policies/data-use-guidance: "Unless the content is marked with a use restriction or license, data provided from a NASA-led mission are licensed as Creative Commons Zero (CC0)."
- **ESA**
  - https://www.esa.int/terms-and-conditions: "The contents of the ESA website are intended for the personal and non-commercial use of its users… does not grant the right… to compile or create derivative works".
  - Página de CC BY-SA 3.0 IGO (https://www.esa.int/articles/about-us/directorates/resources-and-services/creative-commons-attribution-sharealike-3-0-igo-cc-by-sa-3-0-igo-licence): "Where expressly stated, images, videos… are covered by the… CC BY-SA 3.0 IGO… Adaptation/translation/derivatives must be distributed under the same licence terms".
- **NOAA** — https://library.noaa.gov/blogs/news-research-highlights/question-of-the-quarter-noaacopyright:
  - "Works of the U.S. federal government are generally not protected by copyright… No permission is required…, however, proper attribution and citation should be applied."
  - "If any other authorship appears…, you cannot assume it's public domain."
  - La página https://www.noaa.gov/disclaimer no habla de dominio público.
- **USGS** — https://www.usgs.gov/faqs/are-usgs-reportspublications-copyrighted: "USGS-authored or produced data and information are considered to be in the U.S. public domain and can be freely used without permission. All we ask is that you acknowledge the USGS as the source."
- **ESO** — https://www.eso.org/public/copyright/:
  - "licensed under a Creative Commons Attribution 4.0 International License… provided the credit is clear and visible."
  - "Q: I want to use the footage in a YouTube video. Is it OK just to put the credit in the text description? A: No… please include the credit line 'burned in' or overlaid on the video, or clearly visible as a credit at the end."
  - "If an image includes a picture of an identifiable person, using that image for commercial purposes is not permitted."
- **Copernicus Sentinel** — PDF Sentinel_Data_Legal_Notice en sentinels.copernicus.eu:
  - "users shall have a free, full and open access to Copernicus Sentinel Data"
  - "(a) reproduction; (b) distribution; (c) communication to the public; (d) adaptation, modification"
  - Fórmula de crédito: "'Contains modified Copernicus Sentinel data [Year]'".
- **Sentinel Hub EO Browser** — https://www.sentinel-hub.com/explore/eobrowser/: "Data exported from EO Browser can be used under CC BY 4.0 license. Please mention Sentinel Hub EO Browser along with the relevant data collection in the credits."

**Google Earth / Earth Studio**
- Geo Guidelines, https://about.google/brand-resource-center/products-and-services/geo-guidelines/:
  - "If you're using Google Earth content in an online video (e.g. YouTube) primarily for educational, instructional, recreational, or entertainment purposes, you don't need to request permission, even if your work is monetized."
  - "we require attribution while the content is shown."
  - "You may not move the attribution away from the content, such as to… the credits of your film".
  - "Map data: Google, Maxar Technologies".
  - "not allowed to significantly alter our imagery without providing clear context that it's a simulation".
  - "may not use… for promotional films, advertisements or commercials."
- FAQ de Earth Studio, https://www.google.com/earth/studio/faq/: "We currently do not offer a license to use Google Earth imagery for commercial applications." Hay una tensión con la cita anterior: la propia Geo Guidelines permite el video de YouTube monetizado educativo. Lo que se prohíbe es el uso promocional.
- Atribución, https://earth.google.com/studio/docs/attribution/: "We require this attribution to be visible when Earth Studio content is shown… we automatically generate this attribution for each frame and watermark it".

**Archivos históricos**
- **Prelinger** — https://www.panix.com/~footage/prelarch.html (es la página de derechos que enlaza archive.org; revisada el 27-may-2026):
  - "DO NOT ASSUME that all Prelinger Archives films are in the public domain".
  - "Many files are available under the Creative Commons Public Domain Dedication… generally without cost or restriction."
  - "public domain materials may occasionally incorporate copyrighted elements (such as music, images and archival footage)".
  - "we do not require that you [credit]".
- **Internet Archive** — https://help.archive.org/help/rights/: "The Internet Archive does not make guarantees as to the copyright status of items… users make use of the Internet Archive's Collections at their own risk".

**Organismos de Chile y Argentina**
- **SERPAT Chile** — https://www.patrimoniocultural.gob.cl/terminos-legales-y-condiciones-generales-de-uso-del-portal-web-serpat: "se prohíbe su uso indebido y reproducción con fines comerciales sin previa autorización" (cubre "material gráfico o audiovisual (incluyendo… videos)").
- **Memoria Chilena** (pie de página): "Las investigaciones de Memoria Chilena… están bajo una Licencia Creative Commons Atribución-Compartir Igual 3.0 Unported, a excepción de sus objetos digitales."
- **Argentina** — https://www.argentina.gob.ar/terminos-y-condiciones: "El Administrador licencia todos sus contenidos bajo la licencia Creative Commons Atribución 4.0 Internacional… excepto cuando se declare lo contrario."
- **RTA** — https://www.archivorta.com.ar/reglamento/: "CONDICIONES DE CESIÓN ONEROSA A TERCEROS DEL MATERIAL EXISTENTE EN EL ARCHIVO HISTÓRICO" / "Registro audiovisual hasta 5 minutos U$D 1470 por minuto".

**De pago**
- **Storyblocks** — https://www.storyblocks.com/license (vía WebFetch): "You cannot stockpile assets for use after your Storyblocks subscription ends."

**YouTube (todas leídas hoy en support.google.com)**
- **A. Políticas de monetización** — https://support.google.com/youtube/answer/1311392
  - Hoy la página no tiene una sección titulada "Inauthentic content". En el registro de cambios figura: "July 15, 2025: … renaming this policy from 'repetitious content' to 'inauthentic content.' … There is no change to our reused content policy". La sección vigente se llama **"Generic or Repetitive Content"**.
  - Generic or Repetitive:
    - "content that looks like it's made with a template, or that may feel repetitive"
    - "the substance of each video should be materially varied and deliver creative, educational, or other value"
    - Permitido: "Same intro and outro for your videos, but the bulk of your content is different"
    - No permitido: "Image slideshows, templated storylines, or scrolling text with minimal or no narrative, commentary, or educational value"
    - No permitido: "AI-generated content made with generic or unoriginal templates giving the impression of mass production".
  - Reused content:
    - Definición: "repurpose content that's already on YouTube or another online source without adding significant original commentary, substantive modifications, or educational or entertainment value."
    - "we allow reused content if viewers can tell that there's a meaningful difference between the original video and your video."
    - Permitido: "Using clips for a critical review" / "A scene from a movie where you've rewritten the dialog and changed the voiceover" / "Edited footage from other creators where you add a storyline and commentary" / "Edited footage with audio and visual effects on top… that demonstrates substantive editing".
    - No permitido: "Clips of moments… edited together with little or no narrative" / "Content downloaded or copied from another online source without any substantive modifications" / "Content that exclusively features readings of other materials you did not originally create".
    - Clave: "This policy applies even if you have permission from the original creator… it's not based on copyright, permission, or fair use." y "applies to your channel as a whole".
  - Además, en "Unsatisfying or Off-putting" se prohíbe "deceptive or misleading imagery or narratives".
- **B. Licencias y monetización**
  - https://support.google.com/youtube/answer/2797468: "You can monetize Creative Commons content if the license agreement grants you rights to use it commercially." Para dar crédito, el título, el autor, la URL de origen y la licencia "in your video and video description… text overlay or voiceover".
  - https://support.google.com/youtube/answer/2490020:
    - "ensure that you have all the necessary rights to commercially use all visual and audio elements"
    - "You can monetize royalty-free or Creative Commons content when the license agreement grants you rights to use it commercially. Sometimes rights owners require you to credit… or give proof of purchase"
    - "If you prove that the content in your video is part of the public domain, you can monetize."
    - "Although you may have found the content online free of charge, usually its actual creator holds many of the rights".
- **C. Content ID**
  - https://support.google.com/youtube/answer/2605065 lista como no aptos para usar como referencia: "Content licensed non-exclusively from a third party / Content released under Creative Commons or similar free of charge/open licenses / Public domain footage, recordings, or compositions".
  - Disputas, https://support.google.com/youtube/answer/2797454: se puede disputar por "Having all the necessary rights"; "NOT legitimate reasons…: Giving credit to the copyright owner"; "The claimant has 30 days to respond"; "Repeated or malicious abuse of the dispute process can result in penalties".
  - https://support.google.com/youtube/answer/2797449: "only a court of law can make that determination" (sobre dominio público y fair use).
- **D. Divulgación de IA** — https://support.google.com/youtube/answer/14328491
  - Se declara lo que es realista y está generado o alterado con IA: "Alters footage of a real event or place" / "Generates a realistic scene that didn't actually occur". No dice nada sobre usar archivo real como ilustración.
  - Ejemplo que sí debe declararse: "AI generated extra footage of a real place".
  - No requiere etiqueta: "Color adjustment…", "upscaling or repair".
  - Aparte, la política de desinformación (https://support.google.com/youtube/answer/10834785) prohíbe "falsely claiming that old footage from a past event is from a current event".

### (3) Pruebas de API

**Wikimedia Commons** (sin clave; 20 resultados como máximo por búsqueda; los derivados se repiten en todos los casos). Casi todos los archivos traen versiones transcodificadas en VP9 webm (240p, 480p y 1080p) y en **mp4 solo a 360p** (`360p.mpeg4.mov`). En 1080p solo hay webm.

| Búsqueda | Videos libres / total | Mejor ejemplo (licencia, duración, resolución) | Nota |
|---|---|---|---|
| Perito Moreno glacier | 8/8 (todos BY-SA 4.0) | File:Muro de hielo del Glaciar Perito Moreno.webm — BY-SA 4.0, 64,6 s, 2160×3840 (vertical) | Relevante |
| Atacama desert | 20/20 (14 BY 4.0, 5 BY 3.0, 1 PD) | File:Lithium Ponds of Chile's Salar de Atacama (SVS15006).webm — PD, 66 s, 5760×3240; File:Lost between the Atacama Desert and the Andes.webm — BY 3.0, 122 s, 4K | Muy buena (ESO y NASA) |
| Torres del Paine | 0 | – | |
| Valparaíso | 17/17 | File:Google Timelapse- Valparaiso, Chile.webm — BY 3.0, 12,3 s, 4K; Valparaiso Port Dusk Time Lapse — BY 3.0, 25 s | Relevante |
| Lake Titicaca | 9/9 (mayoría BY-SA 4.0) | File:Lake Titicaca time-lapse.webm — BY 3.0, 22,6 s, 1080p | Relevante |
| Easter Island | 8/8 | File:Eyes looking at the sky.webm — BY 3.0, 89,5 s, 4K | Mezcla (incluye ruido) |
| Strait of Magellan | 3/3 | File:Punta Arenas, Blick von der Uferpromenade… — CC0, 365 s, 720p | |
| Santiago Chile aerial | 2/2 | Santa Isabel y Santa Rosa - Timelapse - 2024 — BY-SA 4.0, 13 s, 1080×1920 | Pobre |
| Andes flight | 1/1 | Mapa animado PD, 44 s | Pobre |
| Falkland Islands | 20/20 (14 BY 3.0) | File:Scenes of Stanley, Falkland Islands.webm — BY 3.0, 165 s, 4K | Relevante |
| La Paz Bolivia | 20/20 | File:Fiesta de las Ñatitas en La Paz, Bolivia.webm — BY-SA 4.0, 375 s, 1080p | Relevante |
| Machu Picchu | 14/14 | File:Machu-Pichu (video 2011).webm — BY-SA 4.0, 33 s, 1080p | Mucho ruido (salen Cabo Verde, Huawei) |
| Buenos Aires 1920 | 20/20 | Subte (CC0, 1080p) | **No hay archivo de 1920**: el buscador es laxo |
| Antarctica base | 20/20 (19 PD) | File:The Reference Elevation Model of Antarctica (REMA) (SVS4478…) — PD, 159 s, 4000×2000 | NASA SVS |

En todos los casos las licencias que vi eran libres (no apareció ninguna NC ni ND). Para Antarctica base, Buenos Aires 1920, Machu Picchu y Santiago Chile aerial hizo falta reintentar con 15–30 s de espera por el rate-limit.

**NASA images-api** (sin clave):
- Resultados en video: Patagonia 0, Andes 0, Chile 13 (casi todo ajíes en la ISS), Atacama 1, Antarctica 39, "Earth from ISS" 61, Amazon 21.
- Cómo se baja el archivo: `GET https://images-api.nasa.gov/asset/{nasa_id}` (o el `collection.json` del ítem) devuelve `~orig.mp4`, `~large.mp4`, `~medium.mp4`, `~small.mp4`, `~mobile.mp4` y `.srt`. Las dimensiones están en `metadata.json`.
- Ejemplo: "Earth Views from the ISS - No Music", 1280×720, 59,94 fps, 44 min. Pesa 6,08 GB en orig, 1,70 GB en large, 776 MB en medium y 502 MB en small (medido con HEAD, sin descargar).

**NASA SVS** (sin clave, `/api/search/?search=`): Chile 52, Patagonia 8, Andes 20, Atacama 7, Antarctica 428, Amazon 108, Argentina 35, Peru 19, Bolivia 21. Ejemplo: "Growth of the Escondida Mine, Chile" (id 15086), con mp4 de 5760×3240 y 1920×1080.

**Internet Archive / Prelinger:**
- La consulta pedida devolvió numFound = 78. Con licenseurl de dominio público: Housing in Chile (1943), Fundo in Chile (1949), La Paz (1943), Lima (1944), Roads South (1943), Good Neighbor Family (1943), Menace of Guatemala (1934)…
- **Sin licencia:** South Chile (1945, en color), noticieros Pathé y Fox Movietone (este último con la nota "Copyright MCMLXIII Movietonenews Inc… all rights reserved").
- Con `https://archive.org/metadata/<id>` se listan los archivos. Por ejemplo, FundoinC1949 tiene un .mp4 h.264 de 640×480 y 20 min (126 MB) y un .mpeg de 441 MB.

**Library of Congress:** `?fo=json` devolvió HTTP 403 (desafío de Cloudflare), tanto con curl como con WebFetch. **No verificado.**

**Europeana** (con la clave pública de demostración api2demo, `reusability=open`, `TYPE:VIDEO`): cada ítem trae el campo `rights` con su URL (BY-SA 4.0, PDM 1.0, BY 3.0). Los totales están en la tabla 1.

**Pexels y Pixabay:** ambas exigen clave gratis con cuenta (citas en la sección 2). No las probé.

### (4) ¿Cuánto archivo y con qué transformación es seguro?

**YouTube no da ningún número**: ni porcentaje, ni segundos, ni proporción de archivo por video. Lo que dicen sus páginas es esto:

1. **El estándar es cualitativo.** Que el público pueda notar "a meaningful difference between the original video and your video". Lo que no se permite es el archivo "without adding significant original commentary, substantive modifications, or educational or entertainment value".
2. **Las transformaciones que YouTube pone como ejemplo de permitidas** son agregar una historia y comentario propios ("add a storyline and commentary"), reescribir el diálogo o la voz en off ("rewritten the dialog and changed the voiceover"), explicar lo que se ve ("explain the moves"), y una edición sustancial con efectos de audio y video encima. En un canal de mapas eso es la voz y el guion propios, y el archivo como ilustración subordinada a mapas, gráficos y animaciones propias.
3. **Lo que no se permite:** montajes de clips "with little or no narrative", material bajado "without any substantive modifications", lectura de textos ajenos, y presentaciones de imágenes o texto con poca narración.
4. **Tener licencia o permiso no basta.** La política de reutilizado "applies even if you have permission" y no se basa en derechos de autor. La licencia resuelve los derechos (y es la base para disputar un Content ID), pero no la originalidad.
5. **Se evalúa el canal entero**, no solo un video: el tema principal, los más vistos, los más nuevos, la mayor parte del tiempo de visualización y los metadatos.
6. **Plantillas:** cada video tiene que variar en lo sustancial ("materially varied"). La misma intro y el mismo cierre están bien si el resto cambia.
7. **Fechas y contexto del archivo:** no hace falta etiqueta de IA si el archivo es real y no está alterado con IA. Pero presentar material viejo como si fuera del hecho actual cae en "misattributed content" (política de desinformación). La política de monetización también excluye "deceptive or misleading imagery". Conviene rotular "archivo" o "imagen ilustrativa".

La regla operativa que sale de lo anterior es interpretación mía, no de YouTube: que el archivo nunca sea la sustancia del video, que siempre vaya bajo la narración propia, y que cada clip venga con su crédito y la constancia de su licencia guardada.

### (5) Lo que no pude verificar
- Library of Congress (tanto el JSON como las páginas de derechos): 403.
- La página de derechos de Europeana: 403 (solo usé la API).
- British Pathé: 403; lo que tengo son solo fragmentos de buscador.
- AP Archive: el buscador rechaza ese dominio. Getty: 403. Reuters: 401.
- La página de política de Earth Observatory: redirige o falla.
- Los términos de Google Earth Timelapse: 404.
- La licencia explícita de Worldview (solo tengo la política general CC0 de ESDIS) y el límite de 40 fotogramas del GIF (sale de fragmentos de buscador).
- Un texto de NOAA con la palabra "public domain" en noaa.gov: el disclaimer no lo tiene; usé el blog de la biblioteca de NOAA.
- Términos propios de gob.cl, SHOA y Armada: no los encontré.
- Términos específicos de la Cineteca Nacional y de la Cineteca Virtual de la U. de Chile, y de la Biblioteca Nacional Digital: aplico los generales de SERPAT y el pie "Algunos derechos reservados".
- Las condiciones de los fondos fílmicos del AGN Argentina (solo verifiqué el CC BY 4.0 genérico del portal).
- La página ESA "Terms and Conditions of Use of Images and Videos": 404 en la URL antigua.
- Vidsplay, Dareful y Life of Vids: no los revisé por tiempo.
- Webcams o drones con licencia abierta: no encontré ninguna fuente seria aparte de los clips de dron sueltos en Commons (CC BY/BY-SA).
- En la licencia de Pexels, la palabra "commercial" no aparece textual (el resumen solo citó el "used for free" y los usos publicitarios).

Los textos crudos de cada página y los JSON de las APIs están en `/home/santiago/projects/yt/lab/licencias-video-2026-11-25/` (subcarpetas `pages/` y `api/`).
