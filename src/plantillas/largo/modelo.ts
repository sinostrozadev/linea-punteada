/**
 * Línea de tiempo y cámara del `largo` (módulo PURO: lo usan la composición y scripts/preparar-largo.mts).
 * Reutiliza el plan común (comun/plan.ts), la línea de tiempo visual v2 de `ruta` (visualRuta) y la cámara v2 de
 * `ruta` (camaraV2) con medidas de 16:9. Lo único propio: las pausas sin voz (tarjeta de título y tarjetas de
 * capítulo), los capítulos con su minuto, y el validador de ritmo.
 */
import { estimarTiempos, planificar, type Plan, type Tiempos } from '../comun/plan';
import { contarPalabras } from '../comun/guion';
import { T_TITULO, type Visual } from '../frontera/visual';
import { lineasConPlanos } from '../lugar/compartido/visualV2';
import { limitesEscala, vistaGeneral, type Contexto, type ContextoV2 } from '../ruta/camara';
import { visualRuta } from '../ruta/modelo';
import { armarRecorrido, calcularTrazado, pasoPuntitoPara, resolverTramos, type Recorrido, type Trazado } from '../ruta/trazado';
import { aplanar, mapaEscenas, type Aplanado, type GuionLargo } from './guion';

/** Formato y disposición del largo. */
export const LARGO = {
  ancho: 1920,
  alto: 1080,
  fps: 30,
  /** Ancho de referencia de la escala del globo/zoom: el lado corto (como el 1080 del Short). */
  ref: 1080,
  /** y del centro de la cámara (un poco arriba del medio: abajo van los subtítulos). */
  camY: 500,
  /** Zona segura 16:9: nada vital en los 120 px de abajo (barra de progreso) ni a los lados. */
  abajo: 120,
  lados: 80,
  /** Centro vertical de los subtítulos y su franja (las etiquetas del mapa la evitan). */
  subY: 900,
  franjaSub: [850, 955] as [number, number],
  /** Esquina de las tarjetas finales de YouTube (últimos 20 s): 300×150 abajo a la derecha. */
  tarjetasFinales: { ancho: 300, alto: 150, segundos: 20 },
} as const;

/** Segundos de la tarjeta de título (sin voz) tras la apertura, y de la tarjeta de cada capítulo (desde el 2.º). */
export const TITULO_SEG = 3.2;
export const PAUSA_CAPITULO = 2.0;
export const FINALES_SEG = 12;

/** Duración total aceptada (s). */
export const DURACION_MIN = 480;
export const DURACION_MAX = 630;

/** Índice de línea de voz del primer bloque de cada capítulo (0 = apertura). */
export const lineasInicioCapitulo = (g: Pick<GuionLargo, 'capitulos'>) => mapaEscenas(g).primera.map((k) => k + 1);

/** Inserta las pausas sin voz: TITULO_SEG tras la apertura y PAUSA_CAPITULO antes de cada capítulo desde el 2.º. */
export const ajustarTiempos = (t: Tiempos, g: Pick<GuionLargo, 'capitulos'>): Tiempos => {
  const inicios = lineasInicioCapitulo(g);
  const extra = (i: number) => (i >= 1 ? TITULO_SEG : 0) + PAUSA_CAPITULO * inicios.filter((l, c) => c > 0 && l <= i).length;
  const lineas = t.lineas.map((l) => ({ ...l, inicio: +(l.inicio + extra(l.indice)).toFixed(3) }));
  return { ...t, lineas, total: +(t.total + extra(t.lineas.length - 1)).toFixed(3) };
};

export const tiemposEstimadosLargo = (g: GuionLargo): Tiempos => ajustarTiempos(estimarTiempos(aplanar(g)), g);

export const framesFinales = (g: GuionLargo) => Math.round((g.cierre.segundosFinales ?? FINALES_SEG) * LARGO.fps);

export const planLargo = (g: GuionLargo, tiempos: Tiempos): Plan => planificar(aplanar(g), tiempos, LARGO.fps, framesFinales(g));

export type CapituloEnTiempo = { titulo: string; n: number; desde: number; hasta: number; voz: number };

/**
 * Capítulos con su ventana (s). El 0 es la apertura + tarjeta de título ("Introducción", empieza en 0:00 como pide
 * YouTube); cada capítulo empieza con su tarjeta (PAUSA_CAPITULO antes de su primer bloque). `voz` = inicio de la voz.
 */
export const capitulosEn = (g: GuionLargo, plan: Plan): CapituloEnTiempo[] => {
  const L = plan.tiempos.lineas;
  const inicios = lineasInicioCapitulo(g);
  const finApertura = L[0].inicio + L[0].duracionHablada;
  const caps = g.capitulos.map((c, i) => ({
    titulo: c.titulo, n: i + 1, voz: L[inicios[i]].inicio,
    desde: i === 0 ? finApertura : L[inicios[i]].inicio - PAUSA_CAPITULO, hasta: 0,
  }));
  caps.forEach((c, i) => { c.hasta = caps[i + 1]?.desde ?? plan.duracionSeg; });
  return [{ titulo: 'Introducción', n: 0, voz: 0, desde: 0, hasta: caps[0].desde }, ...caps];
};

/** "m:ss" para la descripción de YouTube. */
export const marcaTiempo = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

// ---------------------------------------------------------------- cámara (la de `ruta` con medidas 16:9)

export const trazadoLargo = (g: Pick<GuionLargo, 'mapa'>): Trazado =>
  calcularTrazado(g.mapa.puntos, pasoPuntitoPara(limitesEscala(g.mapa, LARGO.ref).kMax));

export type ModeloLargo = { flat: Aplanado; tr: Trazado; tramos: [number, number][]; rec: Recorrido; ctx: Contexto; vis: Visual; v2: ContextoV2 };

export const modeloLargo = (g: GuionLargo, plan: Plan, tr: Trazado): ModeloLargo => {
  const flat = aplanar(g);
  const tramos = resolverTramos(flat.escenas, g.mapa.puntos.length);
  const escenas = plan.escenas.map((b) => ({ inicio: b.desde / plan.fps, fin: (b.desde + b.frames) / plan.fps }));
  const rec = armarRecorrido(tr, tramos, escenas);
  const ctx: Contexto = {
    tr, rec, mapa: g.mapa as Contexto['mapa'], ancho: LARGO.ref,
    general: vistaGeneral(tr, g.mapa, LARGO.ref),
    finGancho: plan.escenas[0].desde / plan.fps,
    inicioRemate: plan.remate.desde / plan.fps,
    yObjetivo: () => LARGO.camY, yGeneral: LARGO.camY,
  };
  const vis = visualRuta(flat, plan);
  const v2: ContextoV2 = {
    c: ctx,
    planos: vis.v2 ? vis.planos : [],
    conPlanos: vis.v2 ? lineasConPlanos(flat) : plan.bloques.map(() => false),
    inicios: plan.bloques.map((b, i) => (i === 0 ? T_TITULO : b.linea.inicio)),
    yPlano: LARGO.camY,
  };
  return { flat, tr, tramos, rec, ctx, vis, v2 };
};

// ---------------------------------------------------------------- ritmo

export type ProblemaRitmo = { regla: string; t: number; donde: string; mensaje: string };

/**
 * Rechazos de ritmo del largo (preparar-largo los aplica con la voz real):
 *  - estático: ningún tramo > 8 s sin un cambio visual (plano del guion, capa que entra o sale, línea que avanza,
 *    tarjeta de capítulo). Los micro-movimientos que agrega la plantilla NO cuentan.
 *  - plano: ningún capítulo > 150 s sin un plano nuevo del guion.
 *  - flash: ninguna capa de texto/foto < 1 s en pantalla.
 *  - lectura: tarjetas, contextos y fuentes con ≥ 1 s por cada 3 palabras.
 *  - apertura: la voz de la apertura ≤ 20 s.
 */
export const problemasDeRitmo = (g: GuionLargo, plan: Plan, m: ModeloLargo): ProblemaRitmo[] => {
  const out: ProblemaRitmo[] = [];
  const caps = capitulosEn(g, plan);
  const donde = (t: number) => {
    const c = [...caps].reverse().find((x) => t >= x.desde) ?? caps[0];
    return `${c.n === 0 ? 'introducción' : `cap. ${c.n} "${c.titulo}"`} @ ${marcaTiempo(t)}`;
  };
  const fin = plan.cierreDesde / plan.fps;
  const { vis } = m;
  const cambios: number[] = [0, T_TITULO];
  const planosGuion = vis.planos.filter((p) => !p.micro);
  planosGuion.forEach((p) => cambios.push(p.t0));
  const capas = [...vis.areas, ...vis.etiquetas, ...vis.cotas, ...vis.iconos, ...vis.resaltes, ...vis.tarjetas, ...vis.fotos, ...vis.polaroids, ...vis.contextos, ...vis.fuentes];
  capas.forEach((c) => { cambios.push(c.desde); if (Number.isFinite(c.hasta)) cambios.push(c.hasta); });
  (vis.indice?.items ?? []).forEach((i) => cambios.push(i.desde));
  vis.remateEtiquetas.forEach((e) => cambios.push(e.desde));
  caps.forEach((c) => cambios.push(c.desde, c.voz));
  // La línea que avanza es movimiento continuo: se muestrea cada 2 s mientras se dibuja.
  m.rec.movimientos.filter((x) => x.hasta > x.desde).forEach((x) => { for (let t = x.t0; t <= x.t1; t += 2) cambios.push(t); cambios.push(x.t1); });
  // Líneas sin planos propios: la cámara sigue la cabeza (si la cabeza se mueve, ya está muestreado arriba).
  const orden = [...new Set(cambios.filter((t) => t >= 0 && t <= fin).map((t) => +t.toFixed(2)))].sort((a, b) => a - b);
  orden.push(fin);
  for (let i = 1; i < orden.length; i++) {
    const gap = orden[i] - orden[i - 1];
    if (gap > 8) out.push({ regla: 'estático', t: orden[i - 1], donde: donde(orden[i - 1]), mensaje: `${gap.toFixed(1)} s sin cambio visual (máx. 8): agrega un plano, una etiqueta, una tarjeta o avanza la línea` });
  }
  // Capítulos sin plano nuevo > 150 s.
  caps.forEach((c) => {
    const ts = [c.desde, ...planosGuion.map((p) => p.t0).filter((t) => t > c.desde && t < c.hasta), c.hasta].sort((a, b) => a - b);
    for (let i = 1; i < ts.length; i++) if (ts[i] - ts[i - 1] > 150) out.push({ regla: 'plano', t: ts[i - 1], donde: donde(ts[i - 1]), mensaje: `${(ts[i] - ts[i - 1]).toFixed(0)} s sin un plano nuevo (máx. 150)` });
  });
  // Flash y lectura.
  const textoDe = (c: { d: unknown }): string => {
    const d = c.d as { texto?: string; sub?: string; pie?: string };
    return [d.texto, d.sub, d.pie].filter(Boolean).join(' ');
  };
  const conTexto = [...vis.tarjetas.map((c) => ({ c, tipo: 'tarjeta' })), ...vis.contextos.map((c) => ({ c, tipo: 'contexto' })), ...vis.fuentes.map((c) => ({ c, tipo: 'fuente' })),
    ...vis.fotos.map((c) => ({ c, tipo: 'foto' })), ...vis.polaroids.map((c) => ({ c, tipo: 'polaroid' }))];
  conTexto.forEach(({ c, tipo }) => {
    const dur = Math.min(c.hasta, fin) - c.desde;
    if (dur < 1) out.push({ regla: 'flash', t: c.desde, donde: donde(c.desde), mensaje: `${tipo} "${textoDe(c).slice(0, 30)}" dura ${dur.toFixed(2)} s (mín. 1)` });
    else if (tipo === 'tarjeta' || tipo === 'contexto' || tipo === 'fuente') {
      const palabras = contarPalabras(textoDe(c));
      if (dur < palabras / 3) out.push({ regla: 'lectura', t: c.desde, donde: donde(c.desde), mensaje: `${tipo} "${textoDe(c).slice(0, 30)}": ${palabras} palabras en ${dur.toFixed(1)} s (mín. 1 s cada 3 palabras); alarga duracionSeg o adelanta su palabra` });
    }
  });
  const ap = plan.tiempos.lineas[0].duracionHablada;
  if (ap > 20) out.push({ regla: 'apertura', t: 0, donde: 'apertura', mensaje: `la apertura dura ${ap.toFixed(1)} s de voz (máx. 20)` });
  return out;
};
