/**
 * Línea de tiempo visual v2 de `lugar` y `ruta` (módulo puro). No reimplementa nada: adapta el guion a la forma que
 * espera `resolverVisual` de frontera v2 (sin líneas ni marcadores de mapa) y devuelve el mismo `Visual`
 * (planos, máscaras, etiquetas, cotas, iconos, tarjetas, fotos, polaroids, índice, remate…). También arma los SFX
 * desde esa línea de tiempo, igual que preparar-frontera.
 */
import type { Evento, Plan } from '../../comun/plan';
import type { GuionFrontera } from '../../frontera/guion';
import { T_TITULO, resolverVisual, type Visual } from '../../frontera/visual';

export type BaseCamara = { centro: [number, number]; zoomInicial: number; zoomFinal: number };

/**
 * `quitarImagen`: en `lugar` la `imagen` de escena es la foto de fondo con Ken Burns (no una polaroid v1).
 * En `ruta` se deja: una `imagen` v1 se muestra como polaroid, como en frontera.
 */
export const resolverV2 = (g: { gancho: object; escenas: object[]; remate: string }, plan: Plan, base: BaseCamara, quitarImagen: boolean): Visual => {
  const adaptado = {
    ...g,
    escenas: quitarImagen ? g.escenas.map((e) => ({ ...e, imagen: undefined })) : g.escenas,
    mapa: { fondo: 'oscuro', centro: base.centro, zoomInicial: base.zoomInicial, zoomFinal: base.zoomFinal, lineas: [], marcadores: [], zooms: [] },
  } as unknown as GuionFrontera;
  return resolverVisual(adaptado, plan);
};

/** ¿Qué líneas de voz (0 = gancho … n+1 = remate) declaran planos propios? */
export const lineasConPlanos = (g: { gancho: { planos?: unknown[] }; escenas: { planos?: unknown[] }[]; rematePlanos?: unknown[] }): boolean[] =>
  [g.gancho.planos, ...g.escenas.map((e) => e.planos), g.rematePlanos].map((p) => !!p?.length);

/** SFX de la dirección visual (mismo criterio que preparar-frontera), sin los de líneas/marcadores de mapa. */
export const eventosV2 = (vis: Visual, plan: Plan, propios: Evento[] = []): Evento[] => {
  const crudos: Evento[] = [
    ...plan.eventos.filter((e) => e.tipo === 'golpe' || e.tipo === 'riser' || e.tipo === 'cierre'),
    { t: T_TITULO - 0.12, tipo: 'whoosh', fuerza: 0.9 } as Evento,
    ...(vis.v2 ? vis.planos.slice(1).map((p): Evento => (p.entrada === 'corte' ? { t: p.t0, tipo: 'tic', fuerza: 0.55 } : { t: Math.max(0, p.t0 - 0.1), tipo: 'whoosh', fuerza: 0.7 })) : []),
    ...vis.areas.map((a): Evento => ({ t: a.desde, tipo: 'pop', fuerza: 0.45 })),
    ...vis.etiquetas.map((a): Evento => ({ t: a.desde, tipo: a.d.tipo === 'pin' ? 'tic' : 'pop', fuerza: 0.35 })),
    ...vis.cotas.map((a): Evento => ({ t: a.desde, tipo: 'trazo', fuerza: 0.7, dur: 0.5 })),
    ...vis.iconos.map((a): Evento => ({ t: a.desde, tipo: 'pop', fuerza: 0.5 })),
    ...vis.tarjetas.map((a): Evento => ({ t: a.desde, tipo: 'golpe', fuerza: 0.45 })),
    ...vis.fotos.map((a): Evento => ({ t: Math.max(0, a.desde - 0.08), tipo: 'whoosh', fuerza: 0.75 })),
    ...vis.polaroids.map((a): Evento => ({ t: a.desde, tipo: 'pop', fuerza: 0.6 })),
    ...vis.contextos.map((a): Evento => ({ t: a.desde, tipo: 'pop', fuerza: 0.5 })),
    ...(vis.indice?.items ?? []).map((a): Evento => ({ t: a.desde, tipo: 'pop', fuerza: 0.65 })),
    ...vis.remateEtiquetas.map((a): Evento => ({ t: a.desde, tipo: 'pop', fuerza: 0.6 })),
    ...propios,
  ].filter((e) => Number.isFinite(e.t)).sort((a, b) => a.t - b.t);
  // Dos SFX a menos de 0,12 s se pisan: queda el más fuerte.
  const eventos: Evento[] = [];
  for (const e of crudos) {
    const u = eventos[eventos.length - 1];
    if (u && e.t - u.t < 0.12 && u.tipo !== 'golpe' && e.tipo !== 'cierre') { if (e.fuerza > u.fuerza) eventos[eventos.length - 1] = e; continue; }
    eventos.push(e);
  }
  return eventos;
};
