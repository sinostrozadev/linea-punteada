/**
 * Contrato de guion COMPARTIDO por las tres plantillas de Línea Punteada (`frontera`, `lugar`, `ruta`).
 * Este archivo es a la vez el validador (zod) y el texto que lee `scripts/generar-guiones.mts` para
 * explicarle a Claude qué escribir: cada campo lleva su documentación. Cambiarlo obliga a revisar
 * voz.mts, preparar-*.mts, generar-guiones.mts y docs/GUION.md.
 *
 * Fórmula (Ñerd, ver docs/GUION.md): gancho visual → mito ("dicen que…") → "La verdad es más rara." →
 * mapa de ruta ("Todo se explica con dos cosas…") → actos con la fuente nombrada en la voz →
 * "Y aquí está el giro…" → hoy → remate simétrico.
 */
import { z } from 'zod';

export const PLANTILLAS_CANAL = ['frontera', 'lugar', 'ruta'] as const;

/** Voces de msedge-tts permitidas. Por defecto es-MX-JorgeNeural (A/B con es-CL-LorenzoNeural en los primeros videos). */
export const VOCES = ['es-MX-JorgeNeural', 'es-CL-LorenzoNeural', 'es-ES-AlvaroNeural', 'es-MX-DaliaNeural'] as const;
export const VOZ_POR_DEFECTO: (typeof VOCES)[number] = 'es-MX-JorgeNeural';

/** Límites de palabras habladas (gancho + escenas + remate): ≈ 110–175 s con la voz a +4 %. */
export const PALABRAS_MIN = 300;
export const PALABRAS_MAX = 480;

/**
 * Imagen de archivo para una escena (opcional). `scripts/imagenes.mts` la busca en Wikimedia Commons y
 * solo acepta dominio público, CC0, CC BY o CC BY-SA sin `Restrictions`. Si no hay una válida, la
 * escena se queda solo con el mapa: nunca rompe el render.
 */
export const ImagenEscena = z.object({
  /** Búsqueda en Commons, EN INGLÉS, 2–5 palabras, como sus títulos ("Chamizal National Memorial", "Rio Grande El Paso 1910"). */
  buscar: z.string().min(2).max(70),
  /** Título exacto de un archivo de Commons ("File:...jpg") para fijar la elección (la licencia se valida igual). */
  archivo: z.string().optional(),
  /** Qué parte de la foto conservar al recortar (en retratos "arriba" deja la cara). */
  encuadre: z.enum(['arriba', 'centro', 'abajo']).optional(),
});
export type ImagenEscena = z.infer<typeof ImagenEscena>;

/** Imagen ya descargada (la escribe scripts/imagenes.mts en el json de props; NO va en los guiones). */
export const ImagenResuelta = z.object({
  /** Relativa a public/, ej. imagenes/<id>/2.jpg */
  src: z.string(),
  ancho: z.number(),
  alto: z.number(),
  titulo: z.string(),
  pagina: z.string(),
  autor: z.string(),
  licencia: z.string(),
  licenciaUrl: z.string().optional(),
  encuadre: z.enum(['arriba', 'centro', 'abajo']).optional(),
});
export type ImagenResuelta = z.infer<typeof ImagenResuelta>;

/** Imágenes por línea de voz: 0 = gancho, 1..n = escenas, n+1 = remate. */
export const ImagenesResueltas = z.record(z.string(), ImagenResuelta);
export type ImagenesResueltas = z.infer<typeof ImagenesResueltas>;

export const TIPOS_ESCENA = ['mito', 'mapa-de-ruta', 'acto', 'giro', 'hoy'] as const;

export const Escena = z.object({
  /**
   * Papel de la escena en la fórmula:
   *  - mito: lo que la gente cree ("Dicen que…") y enseguida "La verdad es más rara." (al menos 1).
   *  - mapa-de-ruta: "Todo se explica con dos cosas: X e Y."
   *  - acto: una causa / un hecho de la historia ("Primero, el río…").
   *  - giro: EXACTAMENTE una; su texto empieza por "Y aquí está el giro".
   *  - hoy: consecuencia visible hoy; SIEMPRE la última escena.
   */
  tipo: z.enum(TIPOS_ESCENA),
  /** Lo que dice la voz en esta escena: UNA idea, frases cortas, cifras redondeadas ("unas 177 hectáreas"). */
  texto: z.string().min(1),
  /**
   * Rótulo ENORME de 1–3 palabras (mayúsculas no hace falta: la plantilla lo pone). Aparece cuando la voz
   * dice la palabra `dice` (o al empezar la escena si no se da) y se va al terminar la escena.
   */
  rotulo: z.object({
    texto: z.string().min(1).max(28),
    /** Palabra EXACTA del texto de la voz en la que aparece el rótulo (ej. "1864"). */
    dice: z.string().optional(),
  }).optional(),
  /** Foto de Commons (tarjeta en el tercio inferior) cuando la idea tiene un sujeto visible. */
  imagen: ImagenEscena.optional(),
  /** true si el texto nombra la fuente en voz alta ("según la Oficina del Historiador…"). Obligatorio en ≥ 1 escena. */
  fuenteEnVoz: z.boolean().optional(),
});
export type Escena = z.infer<typeof Escena>;

/** Campos comunes de los props (sin las reglas cruzadas, para poder extenderlos con .extend()). */
export const CamposBase = z.object({
  /** Igual al id del envoltorio (el pipeline lo reescribe al promover el guion). */
  id: z.string().min(1),
  voz: z.enum(VOCES).optional(),
  /** Lugar en mayúsculas, arriba y pequeño, todo el video: "NOGALES — LA LÍNEA PARTE LA CIUDAD". Máx. 44 caracteres. */
  cabecera: z.string().min(3).max(44),
  gancho: z.object({
    /** Voz del gancho: imperativo visual ("Mira la frontera entre…") + lo raro + la pregunta. 1–3 frases. */
    texto: z.string().min(1),
    /** 1–3 palabras ENORMES visibles enteras en el frame 0 (ej. "¿UN RÍO MUDO?", "177 HECTÁREAS"). */
    rotulo: z.string().min(1).max(28),
  }),
  /** 5–9 escenas en orden de locución. */
  escenas: z.array(Escena).min(5).max(9),
  /** Frase final SIMÉTRICA (dos mitades espejo), se ve gigante en dos líneas. Máx. ~110 caracteres. */
  remate: z.string().min(1).max(130),
  /** Fuentes verificables: van a la descripción del video. */
  fuentes: z.array(z.object({ texto: z.string().min(1), url: z.string().url() })).min(1),
});

/** Cuenta palabras habladas (tokens separados por espacio que tienen letra o número). */
export const contarPalabras = (texto: string) => texto.split(/\s+/).filter((t) => /[\p{L}\p{N}]/u.test(t)).length;

/** Total de palabras habladas de un guion: gancho + escenas + remate. */
export const palabrasDelGuion = (g: Pick<z.infer<typeof CamposBase>, 'gancho' | 'escenas' | 'remate'>) =>
  contarPalabras(g.gancho.texto) + g.escenas.reduce((s, e) => s + contarPalabras(e.texto), 0) + contarPalabras(g.remate);

/**
 * Reglas cruzadas de la fórmula. Se aplican con .superRefine() sobre CamposBase o sobre su extensión
 * por plantilla (GuionFrontera, GuionLugar, GuionRuta).
 */
export const validarFormula = (g: z.infer<typeof CamposBase>, ctx: z.RefinementCtx) => {
  const tipos = g.escenas.map((e) => e.tipo);
  if (!tipos.includes('mito')) ctx.addIssue({ code: 'custom', path: ['escenas'], message: 'falta al menos una escena "mito"' });
  const giros = g.escenas.filter((e) => e.tipo === 'giro');
  if (giros.length !== 1) ctx.addIssue({ code: 'custom', path: ['escenas'], message: `debe haber exactamente 1 escena "giro" (hay ${giros.length})` });
  giros.forEach((e) => {
    if (!/^y aqu[ií] est[aá] el giro/i.test(e.texto.trim())) ctx.addIssue({ code: 'custom', path: ['escenas'], message: 'el texto del "giro" debe empezar por "Y aquí está el giro"' });
  });
  if (tipos[tipos.length - 1] !== 'hoy') ctx.addIssue({ code: 'custom', path: ['escenas'], message: 'la última escena debe ser "hoy"' });
  if (!g.escenas.some((e) => e.fuenteEnVoz)) ctx.addIssue({ code: 'custom', path: ['escenas'], message: 'al menos una escena debe nombrar la fuente en la voz (fuenteEnVoz: true)' });
  g.escenas.forEach((e, i) => {
    if (e.rotulo?.dice && !e.texto.toLowerCase().includes(e.rotulo.dice.toLowerCase())) {
      ctx.addIssue({ code: 'custom', path: ['escenas', i, 'rotulo', 'dice'], message: `"${e.rotulo.dice}" no aparece en el texto de la escena` });
    }
  });
  const n = palabrasDelGuion(g);
  if (n < PALABRAS_MIN || n > PALABRAS_MAX) ctx.addIssue({ code: 'custom', path: ['escenas'], message: `${n} palabras habladas: deben ser entre ${PALABRAS_MIN} y ${PALABRAS_MAX}` });
};

/** Props comunes validados (las plantillas usan su propia extensión). */
export const GuionBase = CamposBase.superRefine(validarFormula);
export type GuionBase = z.infer<typeof CamposBase>;

/**
 * Envoltorio de un guion (`contenido/backlog/*.json`, `contenido/guiones/*.json`).
 * `titulo` ≤ 70 caracteres, con contradicción explícita, casi siempre "¿Por qué…?".
 */
export const envoltorioDe = <P extends z.ZodTypeAny>(plantilla: (typeof PLANTILLAS_CANAL)[number], props: P) =>
  z.object({
    plantilla: z.literal(plantilla),
    id: z.string().min(1),
    /** ≤ 70 caracteres, contradicción explícita ("¿Por qué México recuperó tierra moviendo un río?"). */
    titulo: z.string().min(1).max(70),
    /** 2–4 líneas naturales, SIN hashtags (las fuentes y créditos se agregan solos). */
    descripcion: z.string(),
    /** 4–8 hashtags en minúsculas; siempre "#shorts". */
    hashtags: z.array(z.string()),
    props,
  });
