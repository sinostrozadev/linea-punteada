/**
 * Modelo de un video `ruta` (módulo puro): junta el trazado, los tramos, el recorrido de la cabeza y el
 * contexto de cámara a partir de las props y del plan común. Lo usan la composición y preparar-ruta.
 */
import type { Plan } from '../comun/plan';
import type { GuionRuta } from './guion';
import { limitesEscala, vistaGeneral, type Contexto } from './camara';
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

export const modeloDe = (g: Pick<GuionRuta, 'mapa' | 'escenas'>, plan: Plan, tr: Trazado, conImagen: (indiceLinea: number) => boolean): Modelo => {
  const tramos = resolverTramos(g.escenas, g.mapa.puntos.length);
  const escenas = plan.escenas.map((b) => ({ inicio: b.desde / plan.fps, fin: (b.desde + b.frames) / plan.fps }));
  const rec = armarRecorrido(tr, tramos, escenas);
  const yObjetivo = (t: number) => {
    const f = t * plan.fps;
    const b = plan.escenas.find((x) => f >= x.desde && f < x.desde + x.frames);
    return b && conImagen(b.indice) ? DISPOSICION_RUTA.cabezaYConImagen : DISPOSICION_RUTA.cabezaY;
  };
  const ctx: Contexto = {
    tr, rec, mapa: g.mapa as Contexto['mapa'], ancho: ANCHO,
    general: vistaGeneral(tr, g.mapa, ANCHO),
    finGancho: plan.escenas[0].desde / plan.fps,
    inicioRemate: plan.remate.desde / plan.fps,
    yObjetivo, yGeneral: DISPOSICION_RUTA.generalY,
  };
  return { tr, tramos, rec, ctx };
};
