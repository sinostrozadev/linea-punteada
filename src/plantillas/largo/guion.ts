/**
 * Guion de la plantilla `largo` (video LARGO 16:9, 1920×1080, 30 fps, 8:00–10:30): un trayecto contado en capítulos
 * sobre el mismo mapa de `ruta` (globo o plano, línea punteada progresiva, hitos, contador) con la dirección visual v2
 * (planos de cámara, máscaras, etiquetas, cotas, iconos, tarjetas, fotos, polaroids, fuente en pantalla).
 *
 * Estructura: `apertura` (cold open ≤ 20 s: mapa + la pregunta) → `tarjetaTitulo` (3,2 s, sin voz) →
 * `capitulos[]` (cada uno: `titulo` para el índice/capítulos de YouTube, `bloques[]` de voz, `siguiente` = gancho al
 * próximo capítulo) → `cierre` (remate + pie de serie, SIN "suscríbete", espera de tarjetas finales y fundido).
 *
 * Por dentro se APLANA a la forma de `ruta` (gancho = apertura, escenas = todos los bloques en orden, remate = cierre):
 * así se reutilizan tal cual la voz, el plan, la cámara v2, el validador de cámara R1–R5 (comun/camara.ts), las capas
 * del mapa y el sonido. Coordenadas en grados decimales (oeste y sur negativos).
 */
import { z } from 'zod';
import { VOCES } from '../comun/guion';
import { validarCamara } from '../comun/camara';
import { AcentoVideo } from '../comun/direccion';
import { Plano } from '../frontera/guion';
import { DireccionMapaV2, validarDireccionV2 } from '../lugar/compartido/direccionMapa';
import { MapaRuta, PuntoRuta } from '../ruta/guion';


/** Mapa del largo = el de `ruta`, con más puntos (un trayecto de 9 minutos tiene más hitos). */
export const MapaLargo = MapaRuta.extend({ puntos: z.array(PuntoRuta).min(3).max(150) });
export type MapaLargo = z.infer<typeof MapaLargo>;

/** Un bloque de voz (1–4 frases, UNA idea) con su dirección visual v2 y el tramo de ruta que se dibuja mientras suena. */
export const BloqueLargo = z.object({
  /** Lo que dice la voz. Cifras ≥ 1.000 EN PALABRAS ("veintiocho mil kilómetros", "mil novecientos noventa y ocho"): la voz lee "1.000" como decimal. */
  texto: z.string().min(1),
  /**
   * Índices de `mapa.puntos` [desde, hasta] (inclusive) que se dibujan durante este bloque. La línea sigue desde donde
   * quedó. Si falta, los puntos que quedan se reparten entre los bloques sin `tramo`. [i, i] = la cabeza quieta en i.
   */
  tramo: z.tuple([z.number().int().min(0), z.number().int().min(0)]).optional(),
  /** Dirección visual v2 (docs/DIRECCION-VISUAL.md): planos, areas, etiquetas, cotas, iconos, resaltes, tarjetas, foto, polaroid, contexto, fuente, clave, indice. */
  ...DireccionMapaV2,
});
export type BloqueLargo = z.infer<typeof BloqueLargo>;

export const CapituloLargo = z.object({
  /** Nombre corto del capítulo (barra de arriba, tarjeta de capítulo y capítulos de YouTube): "EL DARIÉN". Máx. 32. */
  titulo: z.string().min(2).max(32),
  /** Bloques de voz en orden (≥ 1). */
  bloques: z.array(BloqueLargo).min(1).max(40),
  /** Gancho al siguiente capítulo: 1–2 frases que abren la próxima pregunta. Obligatorio salvo en el último capítulo. */
  siguiente: BloqueLargo.optional(),
});
export type CapituloLargo = z.infer<typeof CapituloLargo>;

export const LineaMapa = z.object({ lon: z.number(), lat: z.number(), texto: z.string().max(28) });

export const CamposLargo = z.object({
  id: z.string().min(1),
  voz: z.enum(VOCES).optional(),
  acento: AcentoVideo.optional(),
  mapa: MapaLargo,
  /** Cold open ≤ 20 s de voz: imperativo visual sobre el mapa + lo raro + LA pregunta. Debe declarar ≥ 1 plano. */
  apertura: BloqueLargo.extend({ planos: z.array(Plano).min(1).max(8) }),
  /** Tarjeta de título (3,2 s, sin voz, después de la apertura): la pregunta del video en ≤ 52 caracteres. */
  tarjetaTitulo: z.object({
    texto: z.string().min(3).max(52),
    /** Palabra(s) del texto en color de acento. */
    clave: z.string().max(24).optional(),
  }),
  /** 3–8 capítulos (2 se acepta solo para pruebas cortas). */
  capitulos: z.array(CapituloLargo).min(2).max(8),
  cierre: z.object({
    /** Remate: frase final simétrica (voz). Nada de "suscríbete". */
    texto: z.string().min(1).max(220),
    /** Plano(s) del remate (si faltan, hereda el último). */
    planos: z.array(Plano).max(3).optional(),
    /** Hasta 2 etiquetas sobre el mapa durante el remate. */
    etiquetas: z.array(LineaMapa).max(2).optional(),
    /** Nombre de la SERIE, grande en el cierre ("DEL ESTRECHO AL CANAL"). Sin la marca: "Línea Punteada" ya va una vez, pequeña. */
    serie: z.string().max(40).optional(),
    /** Teaser del próximo video, bajo la línea punteada ("La próxima: el país que se mudó de continente"). */
    pie: z.string().max(70).optional(),
    /** Segundos de mapa en calma al final para las tarjetas finales de YouTube (5–20, por defecto 12). */
    segundosFinales: z.number().min(5).max(20).optional(),
  }),
  /** Fuentes verificables (van a la descripción). */
  fuentes: z.array(z.object({ texto: z.string().min(1), url: z.string().url() })).min(1),
});
export type GuionLargo = z.infer<typeof CamposLargo>;

// ---------------------------------------------------------------- aplanado (forma de `ruta`)

export type Aplanado = {
  id: string;
  voz?: GuionLargo['voz'];
  acento?: GuionLargo['acento'];
  cabecera: string;
  mapa: MapaLargo;
  gancho: GuionLargo['apertura'] & { rotulo: string };
  escenas: (BloqueLargo & { tipo: 'acto' | 'mapa-de-ruta' })[];
  remate: string;
  rematePlanos?: GuionLargo['cierre']['planos'];
  remateEtiquetas?: GuionLargo['cierre']['etiquetas'];
  fuentes: GuionLargo['fuentes'];
};

/** Bloques de un capítulo en orden de voz (incluye `siguiente`). */
export const bloquesDe = (c: CapituloLargo): BloqueLargo[] => (c.siguiente ? [...c.bloques, c.siguiente] : c.bloques);

/** Ubicación de cada escena aplanada: capítulo y bloque (j = bloques.length → `siguiente`). */
export const mapaEscenas = (g: Pick<GuionLargo, 'capitulos'>) => {
  const donde: { c: number; j: number }[] = [];
  const primera: number[] = [];
  g.capitulos.forEach((c, ci) => {
    primera.push(donde.length);
    bloquesDe(c).forEach((_, j) => donde.push({ c: ci, j }));
  });
  return { donde, primera };
};

export const aplanar = (g: GuionLargo): Aplanado => ({
  id: g.id,
  voz: g.voz,
  acento: g.acento,
  cabecera: g.tarjetaTitulo.texto.slice(0, 44),
  mapa: g.mapa,
  gancho: { ...g.apertura, rotulo: g.tarjetaTitulo.texto.slice(0, 28) },
  escenas: g.capitulos.flatMap((c) => bloquesDe(c).map((b) => ({ ...b, tipo: (b.indice ? 'mapa-de-ruta' : 'acto') as 'acto' | 'mapa-de-ruta' }))),
  remate: g.cierre.texto,
  rematePlanos: g.cierre.planos,
  remateEtiquetas: g.cierre.etiquetas,
  fuentes: g.fuentes,
});

/** Traduce un path del aplanado (escenas[k]…, gancho…, rematePlanos…) al del guion del largo. */
export const pathOriginal = (g: Pick<GuionLargo, 'capitulos'>, p: (string | number)[]): (string | number)[] => {
  const { donde } = mapaEscenas(g);
  if (p[0] === 'gancho') return ['apertura', ...p.slice(1)];
  if (p[0] === 'rematePlanos') return ['cierre', 'planos', ...p.slice(1)];
  if (p[0] === 'escenas' && typeof p[1] === 'number' && donde[p[1]]) {
    const { c, j } = donde[p[1]];
    const n = g.capitulos[c].bloques.length;
    return ['capitulos', c, ...(j < n ? ['bloques', j] : ['siguiente']), ...p.slice(2)];
  }
  return p;
};

/** Contexto de refinamiento que reescribe los paths del aplanado. */
const ctxTraducido = (g: GuionLargo, ctx: z.RefinementCtx): z.RefinementCtx =>
  ({ ...ctx, addIssue: (i: z.IssueData) => ctx.addIssue({ ...i, path: pathOriginal(g, (i.path ?? []) as (string | number)[]) }) }) as z.RefinementCtx;

/** Textos hablados del largo en orden (apertura, bloques, remate). */
export const textosHablados = (g: GuionLargo) => [g.apertura.texto, ...g.capitulos.flatMap((c) => bloquesDe(c).map((b) => b.texto)), g.cierre.texto];

/** Cifras con punto de miles ("1.000", "28.000"): Jorge las lee como decimales. */
export const RE_MILES = /\d\.\d{3}/;

export const validarLargo = (g: GuionLargo, ctx: z.RefinementCtx) => {
  const flat = aplanar(g);
  const sub = ctxTraducido(g, ctx);
  validarDireccionV2(flat, sub);
  // Gramática de cámara R1–R5 (docs/DIRECCION-VISUAL.md §1b), con los tiempos estimados de la voz.
  validarCamara(flat, sub, { continua: false });
  g.capitulos.forEach((c, i) => {
    if (i < g.capitulos.length - 1 && !c.siguiente) ctx.addIssue({ code: 'custom', path: ['capitulos', i, 'siguiente'], message: 'falta el gancho al siguiente capítulo (`siguiente`)' });
  });
  textosHablados(g).forEach((t, k) => {
    if (/suscr[ií]b/i.test(t)) ctx.addIssue({ code: 'custom', path: k === 0 ? ['apertura', 'texto'] : ['cierre', 'texto'], message: 'nada de "suscríbete" en la voz' });
    if (RE_MILES.test(t)) ctx.addIssue({ code: 'custom', path: k === 0 ? ['apertura', 'texto'] : pathOriginal(g, ['escenas', k - 1, 'texto']), message: `cifra con punto de miles en la voz ("${t.match(/\S*\d\.\d{3}\S*/)?.[0]}"): escríbela en palabras` });
  });
  // Tramos de la ruta (mismas reglas que `ruta`).
  const n = g.mapa.puntos.length;
  let ultimo = 0;
  flat.escenas.forEach((e, i) => {
    if (!e.tramo) return;
    const [a, b] = e.tramo;
    const p = pathOriginal(g, ['escenas', i, 'tramo']);
    if (a > b) ctx.addIssue({ code: 'custom', path: p, message: `tramo [${a}, ${b}] al revés` });
    if (b >= n) ctx.addIssue({ code: 'custom', path: p, message: `el punto ${b} no existe (hay ${n})` });
    if (b < ultimo) ctx.addIssue({ code: 'custom', path: p, message: `el tramo retrocede (${b} < ${ultimo})` });
    ultimo = Math.max(ultimo, b);
  });
  if (!g.mapa.puntos.some((p, i) => i > 0 && (p.etiqueta || p.hito))) ctx.addIssue({ code: 'custom', path: ['mapa', 'puntos'], message: 'al menos un hito (etiqueta o hito: true) además del primero' });
};

/** Props del guion del largo (validado). */
export const GuionLargoValidado = CamposLargo.superRefine(validarLargo);

/** Envoltorio de un guion largo (contenido/largos/<id>.json). */
export const EnvoltorioLargo = z.object({
  plantilla: z.literal('largo'),
  id: z.string().min(1),
  /** Título de YouTube ≤ 70 caracteres (curiosidad + concreto). */
  titulo: z.string().min(1).max(70),
  /** 2–4 líneas SIN hashtags; los capítulos, fuentes y créditos se agregan solos. */
  descripcion: z.string(),
  /** 3–6 hashtags; NUNCA "#shorts". */
  hashtags: z.array(z.string()).max(8).refine((h) => !h.some((x) => /^#?shorts$/i.test(x)), 'un largo no lleva #shorts'),
  /** Ruta (relativa a la raíz) de la miniatura 1280×720 si ya existe (la carátula de GPT). */
  miniatura: z.string().optional(),
  props: GuionLargoValidado,
});
export type EnvoltorioLargo = z.infer<typeof EnvoltorioLargo>;
