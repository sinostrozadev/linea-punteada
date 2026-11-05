/**
 * DIRECCIÓN VISUAL compartida (frontera v2; lugar y ruta pueden adoptarla). Son las capas que NO dependen del
 * mapa: tarjetas de cifra, fotos a pantalla completa, polaroids, índice de enumeración, etiqueta de contexto,
 * tarjeta de fuente y palabra clave del subtítulo. Lo que depende del mapa (planos, máscaras, etiquetas, cotas,
 * iconos) vive en src/plantillas/frontera/guion.ts. Guía para guionistas: docs/DIRECCION-VISUAL.md.
 *
 * MOMENTOS. Todo lo que "aparece" usa un `Momento`, relativo a la línea de voz (escena) donde está declarado:
 *   - string: una palabra EXACTA del texto de esa escena ("1929", "Concordia"). Si se repite, "Hito#2" = 2.ª vez.
 *   - número: segundos desde que empieza la escena (0 = al empezar).
 * Lo declarado en una escena desaparece al terminar la escena, salvo `quedarse` (n.º de escenas extra, o
 * "siempre" = hasta el final del video).
 */
import { z } from 'zod';
import { ACENTOS } from '../../marca/tokens';

/** Palabra exacta de la escena ("1929", "Hito#2") o segundos desde su inicio. */
export const Momento = z.union([z.string().min(1), z.number().min(0)]);
export type Momento = z.infer<typeof Momento>;

/** Cuántas escenas extra sigue visible (0 = solo esta) o "siempre" (hasta el remate incluido). */
export const Quedarse = z.union([z.number().int().min(0).max(9), z.literal('siempre')]);
export type Quedarse = z.infer<typeof Quedarse>;

/** Acento del video: caja del subtítulo, palabra clave del título y tarjetas. Varíalo entre videos. */
export const AcentoVideo = z.enum(Object.keys(ACENTOS) as [keyof typeof ACENTOS, ...(keyof typeof ACENTOS)[]]);

/**
 * Icono: un emoji (se dibuja con Noto Color Emoji: "⚔️", "🚂", "⚖️", "📍", "🌊", "🔍", "❄️", "👑") o el nombre
 * de un pictograma propio (trazo amarillo/blanco, CC0): guerra, tren, rio, tratado, dinero, tribunal, hielo,
 * isla, barco, montana, carretera, bandera.
 */
export const IconoNombre = z.string().min(1).max(16);

/**
 * Tarjeta de cifra arriba de la pantalla (máx. 1 por escena). Grande, condensada, con subtítulo pequeño.
 *  - cifra: "3,7 HA" / "CINCO CANCHAS DE FÚTBOL". La parte numérica cuenta hacia arriba al entrar.
 *  - barras: comparación de 2–3 barras horizontales (`barras`), ej. OFERTA 50 / PAGADO 10.
 *  - linea-tiempo: "16 AÑOS" + barra que se llena entre `desde` y `hasta` ("1841" → "1857").
 *  - ranking: "2º" + "PAÍS MÁS GRANDE DEL MUNDO".
 * `pictos` agrega una fila de pictogramas repetidos (ej. 5 canchas, 10 personitas) que entran uno a uno.
 */
export const Tarjeta = z.object({
  texto: z.string().min(1).max(16),
  sub: z.string().max(40).optional(),
  tipo: z.enum(['cifra', 'barras', 'linea-tiempo', 'ranking']).optional(),
  icono: IconoNombre.optional(),
  barras: z.array(z.object({ etiqueta: z.string().max(14), valor: z.number().min(0) })).min(2).max(3).optional(),
  desde: z.string().max(10).optional(),
  hasta: z.string().max(10).optional(),
  pictos: z.object({ icono: IconoNombre, n: z.number().int().min(2).max(12) }).optional(),
  aparecerEn: Momento.optional(),
  /** Segundos en pantalla (por defecto hasta 3,2 s o el fin de la escena). */
  duracionSeg: z.number().min(1).max(12).optional(),
});
export type Tarjeta = z.infer<typeof Tarjeta>;

/** Búsqueda en Wikimedia Commons (misma regla que `imagen`: PD/CC0/CC BY/CC BY-SA sin restricciones). */
const BusquedaCommons = {
  /** EN INGLÉS, 2–5 palabras, como los títulos de Commons ("Peace Palace The Hague"). */
  buscar: z.string().min(2).max(70),
  /** "File:...jpg" exacto para fijar la elección (la licencia se valida igual). */
  archivo: z.string().optional(),
  encuadre: z.enum(['arriba', 'centro', 'abajo']).optional(),
};

/**
 * Foto a PANTALLA COMPLETA 2–3 s (tapa el mapa) con zoom leve y pastilla arriba a la izquierda
 * "● LUGAR · QUÉ ES". Máx. 1 por escena. Si Commons no da una válida, la escena sigue con el mapa.
 */
export const Foto = z.object({
  ...BusquedaCommons,
  /** Pastilla: "PLAYA DEL HITO 1 · ARICA". Máx. 46 caracteres. */
  pie: z.string().min(3).max(46),
  aparecerEn: Momento.optional(),
  duracionSeg: z.number().min(1.5).max(4).optional(),
});
export type Foto = z.infer<typeof Foto>;

/**
 * Polaroid sobre el mapa (retratos, documentos, edificios): marco blanco, leve giro, crédito debajo y, si se
 * da, un año gigante arriba. `forma: "circulo"` = foto redonda incrustada en el mapa.
 */
export const Polaroid = z.object({
  ...BusquedaCommons,
  /** Texto del pie, ANTES del crédito automático: "Palacio de la Paz, La Haya (sede de la CIJ)". */
  pie: z.string().max(60).optional(),
  anio: z.string().max(10).optional(),
  forma: z.enum(['marco', 'circulo']).optional(),
  lado: z.enum(['izquierda', 'derecha']).optional(),
  aparecerEn: Momento.optional(),
  duracionSeg: z.number().min(1.5).max(8).optional(),
});
export type Polaroid = z.infer<typeof Polaroid>;

/**
 * Ítem del índice de enumeración (solo en la escena `mapa-de-ruta`). Aparece en la palabra `dice` y se queda
 * hasta el giro; en cada `acto` se ilumina el ítem que le toca (acto 1 → ítem 1…).
 */
export const ItemIndice = z.object({
  icono: IconoNombre,
  texto: z.string().min(1).max(14),
  dice: Momento.optional(),
});
export type ItemIndice = z.infer<typeof ItemIndice>;

/** Etiqueta de contexto: amarilla, arriba, 1–4 palabras ("¿CÓMO QUEDÓ ASÍ?", "EL GIRO"). Reemplaza al rótulo gigante. */
export const Contexto = z.object({
  texto: z.string().min(1).max(28),
  dice: Momento.optional(),
});
export type Contexto = z.infer<typeof Contexto>;

/** Fuente en pantalla (cuando la voz la nombra): tarjeta discreta abajo, 2,4 s. */
export const FuentePantalla = z.object({
  /** "Corte Internacional de Justicia · sentencia 2014". Máx. 60. */
  texto: z.string().min(3).max(60),
  dice: Momento.optional(),
});
export type FuentePantalla = z.infer<typeof FuentePantalla>;

/** Campos de dirección visual NO cartográficos que puede llevar cualquier línea de voz (gancho o escena). */
export const DireccionComun = {
  /** Palabras que se pintan en acento en el subtítulo (nombres, cifras). Si falta, la plantilla elige. */
  clave: z.array(z.string()).max(6).optional(),
  contexto: Contexto.optional(),
  tarjetas: z.array(Tarjeta).max(2).optional(),
  foto: Foto.optional(),
  polaroid: Polaroid.optional(),
  fuente: FuentePantalla.optional(),
};
