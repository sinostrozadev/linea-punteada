/**
 * Modelo de un video `ruta` (módulo puro): junta el trazado, los tramos, el recorrido de la cabeza y el
 * contexto de cámara a partir de las props y del plan común. Lo usan la composición y preparar-ruta.
 */
import type { Plan } from '../comun/plan';
import type { GuionRuta } from './guion';
import { limitesEscala, vistaGeneral, type Contexto, type ContextoV2 } from './camara';
import { T_TITULO, type Visual } from '../frontera/visual';
import { lineasConPlanos, resolverV2 } from '../lugar/compartido/visualV2';
import { armarRecorrido, calcularTrazado, pasoPuntitoPara, resolverTramos, type Recorrido, type Trazado } from './trazado';

/** Disposición vertical propia de `ruta` (1080×1920). Ver README. */
export const DISPOSICION_RUTA = {
  /** Centro del rótulo enorme y y de la cabeza de la línea, sin foto y con foto en la escena. */
  rotuloY: 820,
  rotuloYConImagen: 720,
  cabezaY: 1250,
  cabezaYConImagen: 990,
  /** Centro del globo en la vista general (gancho y remate). */
  generalY: 1010,
  /** La tarjeta de foto común se sube para dejar sitio al contador. */
  subirTarjeta: 90,
  /** Medio alto de la franja que ocupa un rótulo de dos líneas. */
  medioAltoRotulo: 170,
} as const;

export const ANCHO = 1080;

/** Índices de los puntos que son hitos (etiqueta o hito: true). */
export const hitosDe = (mapa: GuionRuta['mapa']) => mapa.puntos.map((p, i) => (p.etiqueta || p.hito ? i : -1)).filter((i) => i >= 0);

export const trazadoDe = (g: Pick<GuionRuta, 'mapa'>): Trazado =>
  calcularTrazado(g.mapa.puntos, pasoPuntitoPara(limitesEscala(g.mapa, ANCHO).kMax));

export type Modelo = { tr: Trazado; tramos: [number, number][]; rec: Recorrido; ctx: Contexto };

/** v2: la cabeza va ENCIMA de los subtítulos en bloques (franja 1080–1310) y el globo general un poco más arriba. */
export const DISPOSICION_RUTA_V2 = { cabezaY: 840, generalY: 900, planoY: 860 } as const;

export const modeloDe = (g: Pick<GuionRuta, 'mapa' | 'escenas'>, plan: Plan, tr: Trazado, conImagen: (indiceLinea: number) => boolean, v2 = false): Modelo => {
  const tramos = resolverTramos(g.escenas, g.mapa.puntos.length);
  const escenas = plan.escenas.map((b) => ({ inicio: b.desde / plan.fps, fin: (b.desde + b.frames) / plan.fps }));
  const rec = armarRecorrido(tr, tramos, escenas);
  const yObjetivo = (t: number) => {
    const f = t * plan.fps;
    const b = plan.escenas.find((x) => f >= x.desde && f < x.desde + x.frames);
    if (v2) return DISPOSICION_RUTA_V2.cabezaY;
    return b && conImagen(b.indice) ? DISPOSICION_RUTA.cabezaYConImagen : DISPOSICION_RUTA.cabezaY;
  };
  const ctx: Contexto = {
    tr, rec, mapa: g.mapa as Contexto['mapa'], ancho: ANCHO,
    general: vistaGeneral(tr, g.mapa, ANCHO),
    finGancho: plan.escenas[0].desde / plan.fps,
    inicioRemate: plan.remate.desde / plan.fps,
    yObjetivo, yGeneral: v2 ? DISPOSICION_RUTA_V2.generalY : DISPOSICION_RUTA.generalY,
  };
  return { tr, tramos, rec, ctx };
};

// ------------------------------------------------------------------------------------------------ v2

/** Línea de tiempo visual v2 (resolverVisual de frontera). Una `imagen` v1 de escena se muestra como polaroid. */
export const visualRuta = (g: Pick<GuionRuta, 'gancho' | 'escenas' | 'remate' | 'mapa' | 'rematePlanos' | 'remateEtiquetas'>, plan: Plan): Visual =>
  resolverV2(g, plan, { centro: [g.mapa.puntos[0].lon, g.mapa.puntos[0].lat], zoomInicial: 3, zoomFinal: 3 }, false);

/** Contexto de la cámara v2: planos por línea + seguimiento automático donde no hay. */
export const contextoV2De = (g: Pick<GuionRuta, 'gancho' | 'escenas' | 'rematePlanos'>, plan: Plan, modelo: Modelo, vis: Visual): ContextoV2 => ({
  c: modelo.ctx,
  planos: vis.v2 ? vis.planos : [],
  conPlanos: vis.v2 ? lineasConPlanos(g) : plan.bloques.map(() => false),
  inicios: plan.bloques.map((b, i) => (i === 0 ? T_TITULO : b.linea.inicio)),
  yPlano: DISPOSICION_RUTA_V2.planoY,
});
