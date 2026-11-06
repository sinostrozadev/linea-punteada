/**
 * Guion de la plantilla `ruta`: la historia es un TRAYECTO (una persona, una expedición, un tren, una
 * migración). Sobre un globo (o un mapa plano regional) la línea punteada se va dibujando punto a punto,
 * la cámara sigue la cabeza de la línea, cada hito deja un marcador coral con su fecha y un contador
 * discreto suma los kilómetros (por grandes círculos) y el tiempo transcurrido.
 * = GuionBase (src/plantillas/comun/guion.ts) + `mapa` + `tramo` opcional por escena.
 *
 * Coordenadas en grados decimales (oeste y sur negativos).
 */
import { z } from 'zod';
import { CamposBase, Escena, envoltorioDe, validarFormula } from '../comun/guion';
import { validarCamara } from '../comun/camara';
import { CamposV2, DireccionMapaV2, validarDireccionV2 } from '../lugar/compartido/direccionMapa';

/** Fecha de un punto: "AAAA", "AAAA-MM" o "AAAA-MM-DD". */
export const FechaPunto = z.string().regex(/^\d{4}(-\d{2}(-\d{2})?)?$/, 'fecha en formato AAAA, AAAA-MM o AAAA-MM-DD');

export const PuntoRuta = z.object({
  lon: z.number().min(-180).max(180),
  lat: z.number().min(-90).max(90),
  /** Nombre corto del lugar en el mapa ("PUNTA ARENAS"), 1–3 palabras. Si lo tiene, el punto es un hito con marcador. */
  etiqueta: z.string().min(1).max(22).optional(),
  /**
   * Fecha en que el viajero pasó por ahí (AAAA o AAAA-MM-DD). Solo fechas VERIFICADAS: los puntos sin fecha
   * toman una interpolada por distancia entre los fechados vecinos (para el contador de tiempo). Si un punto
   * repite lugar con otra fecha (el viajero se quedó trabado), el contador de tiempo salta y el de km no.
   */
  fecha: FechaPunto.optional(),
  /** true = hito con marcador aunque no tenga etiqueta. Sin etiqueta ni hito, el punto solo da forma al trazado. */
  hito: z.boolean().optional(),
});
export type PuntoRuta = z.infer<typeof PuntoRuta>;

export const MapaRuta = z.object({
  /**
   * globo = globo ortográfico que rota siguiendo la cabeza (trayectos entre continentes);
   * plano = equirectangular centrado en la cabeza (trayectos regionales, admite satélite).
   */
  proyeccion: z.enum(['globo', 'plano']),
  /**
   * satelite = recorte NASA GIBS; relieve = Blue Marble con relieve. v2: en el `globo` ambos se ven como textura
   * Blue Marble reproyectada sobre la esfera (mundial + recortes regionales en los planos cercanos) con brillo de
   * costa e iluminación; oscuro = vectores Natural Earth en la paleta del canal.
   */
  fondo: z.enum(['satelite', 'relieve', 'oscuro']),
  /** Puntos del viaje EN ORDEN (≥ 3). El primero y el último suelen tener etiqueta y fecha. */
  puntos: z.array(PuntoRuta).min(3).max(60),
  /** Color de la línea (por defecto amarillo). */
  color: z.enum(['amarillo', 'celeste', 'coral']).optional(),
  /** Solo `plano`: zoom máximo tipo mapa web (3 continente · 6 país · 9 región). La cámara se aleja sola en los tramos largos. Por defecto 6. */
  zoom: z.number().min(1).max(14).optional(),
  /** Solo `globo`: radio máximo del globo en anchos de pantalla (1 = 1080 px de radio). Por defecto 1,1. */
  escala: z.number().min(0.4).max(4).optional(),
  /**
   * Distancia REAL del viaje según las fuentes (km), si se conoce. La ruta del mapa son grandes círculos entre
   * puntos (un esquema: siempre sale más corta que lo caminado); con este dato el contador escala sus km para
   * terminar en la cifra que dice la voz. Sin él, el contador muestra los km de los grandes círculos.
   */
  kmReales: z.number().positive().optional(),
  /** Contador de distancia y tiempo abajo a la izquierda (por defecto true). */
  mostrarContador: z.boolean().optional(),
  /**
   * v2, solo `globo` con fondo satelite/relieve: mes (1–12) del Blue Marble mensual de NASA para la textura del globo
   * (nieve y hielo marino de esa estación). Sin `mes`: Blue Marble con relieve sombreado y batimetría.
   */
  mes: z.number().int().min(1).max(12).optional(),
});
export type MapaRuta = z.infer<typeof MapaRuta>;

export const EscenaRuta = Escena.extend({
  /**
   * Índices de `mapa.puntos` (inclusive) que se dibujan durante esta escena: [desde, hasta]. La línea sigue
   * desde donde quedó hasta `hasta`. Si falta, los puntos que quedan se reparten entre las escenas sin `tramo`.
   * Un tramo [i, i] deja la cabeza quieta en el punto i. El gancho nunca dibuja (muestra la ruta entera en fantasma).
   */
  tramo: z.tuple([z.number().int().min(0), z.number().int().min(0)]).optional(),
  /**
   * v2 (docs/DIRECCION-VISUAL.md): planos, máscaras, etiquetas, cotas, iconos, tarjetas, foto, polaroid, contexto,
   * fuente, índice. En `ruta` una escena SIN `planos` sigue la cabeza de la línea (cámara automática); una escena CON
   * `planos` fija la cámara del globo (centro = hacia dónde mira, zoom 3 ≈ medio planeta · 4,5 un continente ·
   * 6 un país · 8 un estrecho) y la línea sigue dibujándose debajo.
   */
  ...DireccionMapaV2,
});
export type EscenaRuta = z.infer<typeof EscenaRuta>;

export const CamposRuta = CamposBase.extend({
  gancho: CamposBase.shape.gancho.extend(DireccionMapaV2),
  ...CamposV2,
  /** 5–9 escenas en orden de locución (cada una con su `tramo` opcional). */
  escenas: z.array(EscenaRuta).min(5).max(9),
  mapa: MapaRuta,
});

/** Props de la plantilla `ruta` (lo que viaja en `props` del envoltorio). */
export const GuionRuta = CamposRuta.superRefine((g, ctx) => {
  validarFormula(g, ctx);
  validarDireccionV2(g, ctx);
  // Gramática de cámara (docs/DIRECCION-VISUAL.md §1b): una línea sin planos vuelve a la cámara automática.
  validarCamara(g, ctx, { continua: false });
  const n = g.mapa.puntos.length;
  let ultimo = 0;
  g.escenas.forEach((e, i) => {
    if (!e.tramo) return;
    const [a, b] = e.tramo;
    if (a > b) ctx.addIssue({ code: 'custom', path: ['escenas', i, 'tramo'], message: `tramo [${a}, ${b}] al revés` });
    if (b >= n) ctx.addIssue({ code: 'custom', path: ['escenas', i, 'tramo'], message: `el punto ${b} no existe (hay ${n})` });
    if (b < ultimo) ctx.addIssue({ code: 'custom', path: ['escenas', i, 'tramo'], message: `el tramo retrocede (${b} < ${ultimo}): los tramos van en el orden del viaje` });
    ultimo = Math.max(ultimo, b);
  });
  if (!g.mapa.puntos.some((p, i) => i > 0 && (p.etiqueta || p.hito))) {
    ctx.addIssue({ code: 'custom', path: ['mapa', 'puntos'], message: 'al menos un hito (etiqueta o hito: true) además del primero' });
  }
});
export type GuionRuta = z.infer<typeof CamposRuta>;

/** Envoltorio completo de un guion `ruta`. */
export const EnvoltorioRuta = envoltorioDe('ruta', GuionRuta);
export type EnvoltorioRuta = z.infer<typeof EnvoltorioRuta>;
