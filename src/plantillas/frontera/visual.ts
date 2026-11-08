/**
 * Línea de tiempo VISUAL de frontera v2 (módulo puro, sin React): resuelve la dirección visual del guion
 * (planos, máscaras, etiquetas, cotas, iconos, tarjetas, fotos, índice…) a segundos absolutos usando los
 * tiempos por palabra de la voz. La usan la composición (qué dibujar en cada frame), preparar-frontera
 * (SFX sincronizados y qué recortes satelitales bajar) y la hoja de contacto. Determinista.
 */
import type { Plan, Palabra } from '../comun/plan';
import { normalizar } from '../comun/plan';
import type { Contexto, Foto, FuentePantalla, ItemIndice, Momento, Polaroid, Quedarse, Tarjeta } from '../comun/direccion';
import type { Area, Cota, EtiquetaMapa, GuionFrontera, IconoMapa, Plano } from './guion';
import { gradosPorPx, type LonLat } from './mapa';

/** Duración de la tarjeta de título del frame 0 (s). Después, corte al satélite. */
export const T_TITULO = 0.9;
/** Frames del cierre de marca de frontera v2 (0,8 s de línea punteada con el handle). */
export const FRAMES_CIERRE_V2 = 48;

export type Ventana = { desde: number; hasta: number };
/** `micro`: movimiento de cámara que agregó la plantilla (no el guion): paneo lento, sin SFX. */
export type PlanoResuelto = Plano & { t0: number; t1: number; linea: number; deriva: number; micro?: boolean };
/** Una capa con su ventana de tiempo: `d` = lo declarado en el guion, `k` = línea de voz donde se declaró. */
export type ConVentana<T> = Ventana & { d: T; k: number; id: string };

export type Visual = {
  v2: boolean;
  planos: PlanoResuelto[];
  areas: ConVentana<Area>[];
  etiquetas: ConVentana<EtiquetaMapa>[];
  contextos: ConVentana<{ texto: string }>[];
  cotas: ConVentana<Cota>[];
  iconos: ConVentana<IconoMapa>[];
  resaltes: ConVentana<{ lon: number; lat: number; radio: number }>[];
  tarjetas: ConVentana<Tarjeta>[];
  fotos: ConVentana<Foto>[];
  polaroids: ConVentana<Polaroid & { v1?: boolean }>[];
  fuentes: ConVentana<FuentePantalla>[];
  indice: { items: (ItemIndice & { desde: number })[]; hasta: number; activo: { item: number; desde: number; hasta: number }[]; posicion: 'fila' | 'vertical-mapa'; ancla?: LonLat } | null;
  remateEtiquetas: { lon: number; lat: number; texto: string; desde: number }[];
  /** Segundo en que se dibuja cada línea de `mapa.lineas` y aparece cada `mapa.marcadores`. */
  trazos: number[];
  marcadoresDesde: number[];
  /** Palabras clave (normalizadas) por línea de voz, para el subtítulo. */
  claves: string[][];
  /** Fin del video antes del cierre (s). */
  fin: number;
};

type Dir = Partial<GuionFrontera['escenas'][number]> & { texto: string };

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/** Busca la n-ésima aparición de una palabra ("Hito#2") en las palabras de la línea (palabra completa normalizada). */
export const buscarPalabraN = (palabras: Palabra[], palabra: string): number => {
  const m = /^(.*?)#(\d+)$/.exec(palabra.trim());
  const w = normalizar(m ? m[1] : palabra);
  let veces = m ? Number(m[2]) : 1;
  if (!w) return -1;
  for (let i = 0; i < palabras.length; i++) {
    const n = normalizar(palabras[i].texto);
    if (n === w && --veces === 0) return i; // palabra completa: "Según" no calza con "Segundo"
  }
  return -1;
};

/** Resolver de momentos de una línea de voz. */
const resolverDe = (plan: Plan, k: number) => {
  const b = plan.bloques[k];
  const base = b.linea.inicio;
  const fin = (b.desde + b.frames) / plan.fps;
  const piso = k === 0 ? T_TITULO : base;
  const en = (m: Momento | undefined, defecto: number): number => {
    let t = base + defecto;
    if (typeof m === 'number') t = base + m;
    else if (typeof m === 'string') {
      const i = buscarPalabraN(b.linea.palabras, m);
      if (i >= 0) t = base + Math.max(0, b.linea.palabras[i].inicio - 0.06);
    }
    return Math.min(Math.max(t, piso), fin - 0.3);
  };
  return { base, fin, piso, en };
};

/** Arranques de frase de la línea (s absolutos): candidatos naturales para cortar de plano. */
const cortesDeFrase = (plan: Plan, k: number): number[] => {
  const l = plan.bloques[k].linea;
  return l.palabras.filter((_, i) => i > 0 && /[.,;:?!…]["»”)]*$/.test(l.palabras[i - 1].texto)).map((p) => l.inicio + p.inicio - 0.05);
};

const ajustarAFrase = (t: number, candidatos: number[], tolerancia = 1.4) => {
  let mejor = t;
  let d = tolerancia;
  for (const c of candidatos) if (Math.abs(c - t) < d) { d = Math.abs(c - t); mejor = c; }
  return mejor;
};

/** Primera palabra de la línea con cifra que coincide con el texto de la tarjeta (para que la cifra caiga con la voz). */
const palabraDeCifra = (palabras: Palabra[], texto: string) => {
  const cifra = normalizar(texto.replace(/[^\d,.]/g, '').split(/[,.]/)[0] ?? '');
  if (!cifra) return -1;
  return palabras.findIndex((p) => normalizar(p.texto).startsWith(cifra));
};

/** Claves automáticas: cifras y nombres propios (mayúscula que no abre frase). */
const clavesAuto = (texto: string): string[] => {
  const t = texto.split(/\s+/);
  return t.filter((w, i) => /\d/.test(w) || (i > 0 && /^[A-ZÁÉÍÓÚÑ]/.test(w) && !/[.?!:]$/.test(t[i - 1]))).map(normalizar).filter((w) => w.length > 1);
};

export const resolverVisual = (g: GuionFrontera, plan: Plan): Visual => {
  const fps = plan.fps;
  const ultima = plan.bloques.length - 1; // remate
  const fin = plan.cierreDesde / fps;
  const dirs: Dir[] = [g.gancho as unknown as Dir, ...(g.escenas as Dir[]), { texto: g.remate, planos: g.rematePlanos } as Dir];
  const finDeLinea = (k: number) => { const b = plan.bloques[k]; return (b.desde + b.frames) / fps; };
  const ventana = (k: number, r: ReturnType<typeof resolverDe>, a: Momento | undefined, d: Momento | undefined, q: Quedarse | undefined, defA = 0.25): Ventana => {
    const desde = r.en(a, defA);
    let hasta = q === 'siempre' ? fin : finDeLinea(Math.min(ultima, k + (q ?? 0)));
    if (d !== undefined) hasta = Math.max(desde + 0.4, r.en(d, 0));
    return { desde, hasta };
  };
  const v2 = dirs.some((d) => (d.planos ?? []).length);

  // ---------------------------------------------------------------- planos
  const planos: PlanoResuelto[] = [];
  if (v2) {
    dirs.forEach((d, k) => {
      const ps = d.planos ?? [];
      if (!ps.length) return;
      const r = resolverDe(plan, k);
      const inicio = r.piso;
      const frases = cortesDeFrase(plan, k);
      let previo = inicio;
      ps.forEach((p, j) => {
        let t0: number;
        if (j === 0) t0 = inicio;
        else if (p.en !== undefined) t0 = r.en(p.en, 0);
        else if (ps[j - 1].duracionSeg) t0 = previo + ps[j - 1].duracionSeg!;
        else t0 = ajustarAFrase(inicio + ((r.fin - inicio) * j) / ps.length, frases);
        t0 = Math.max(t0, previo + (j === 0 ? 0 : 0.8));
        planos.push({ ...p, t0, t1: 0, linea: k, deriva: p.deriva ?? 0.3 });
        previo = t0;
      });
    });
  } else {
    // v1: el zoom lento global de zoomInicial a zoomFinal + los saltos de `zooms`.
    const total = fin;
    const dz = g.mapa.zoomFinal - g.mapa.zoomInicial;
    planos.push({ centro: g.mapa.centro, zoom: g.mapa.zoomInicial, entrada: 'corte', t0: 0, t1: 0, linea: 0, deriva: 0 });
    for (const z of [...(g.mapa.zooms ?? [])].sort((a, b) => a.escena - b.escena)) {
      const t0 = plan.escenas[z.escena]?.linea.inicio ?? 0;
      planos.push({ centro: z.centro, zoom: z.zoom + (dz * t0) / total, entrada: 'zoom', t0, t1: 0, linea: z.escena + 1, deriva: 0 });
    }
    planos.forEach((p, i) => { p.deriva = (dz * ((planos[i + 1]?.t0 ?? total) - p.t0)) / total; });
  }
  planos.forEach((p, i) => { p.t1 = planos[i + 1]?.t0 ?? fin + 1; });
  if (v2) microMovimientos(planos, fin);

  // ---------------------------------------------------------------- capas por línea
  const areas: Visual['areas'] = [];
  const etiquetas: Visual['etiquetas'] = [];
  const contextos: Visual['contextos'] = [];
  const cotas: Visual['cotas'] = [];
  const iconos: Visual['iconos'] = [];
  const resaltes: Visual['resaltes'] = [];
  const tarjetas: Visual['tarjetas'] = [];
  const fotos: Visual['fotos'] = [];
  const polaroids: Visual['polaroids'] = [];
  const fuentes: Visual['fuentes'] = [];
  const claves: string[][] = [];
  let indice: Visual['indice'] = null;

  dirs.forEach((d, k) => {
    const r = resolverDe(plan, k);
    const palabras = plan.bloques[k].linea.palabras;
    claves.push((d.clave?.length ? d.clave.map(normalizar) : clavesAuto(d.texto)));
    if (k === ultima) return;
    (d.areas ?? []).forEach((a, i) => areas.push({ d: a, ...ventana(k, r, a.aparecerEn, a.desaparecerEn, a.quedarse), k, id: `a${k}-${i}` }));
    (d.etiquetas ?? []).forEach((e, i) => {
      const w = ventana(k, r, e.aparecerEn, e.desaparecerEn, e.quedarse);
      if (e.tipo === 'contexto') contextos.push({ d: { texto: e.texto }, ...w, hasta: Math.min(w.hasta, w.desde + 3), k, id: `c${k}-${i}` });
      else etiquetas.push({ d: e, ...w, k, id: `e${k}-${i}` });
    });
    (d.cotas ?? []).forEach((c, i) => cotas.push({ d: c, ...ventana(k, r, c.aparecerEn, c.desaparecerEn, c.quedarse), k, id: `q${k}-${i}` }));
    (d.iconos ?? []).forEach((c, i) => iconos.push({ d: c, ...ventana(k, r, c.aparecerEn, c.desaparecerEn, c.quedarse), k, id: `i${k}-${i}` }));
    (d.resaltes ?? []).forEach((c, i) => {
      const desde = r.en(c.aparecerEn, 0.4);
      resaltes.push({ d: { lon: c.lon, lat: c.lat, radio: c.radio ?? 90 }, desde, hasta: desde + (c.duracionSeg ?? 1.6), k, id: `r${k}-${i}` });
    });
    // Contexto: el de la escena, o el `rotulo` v1 convertido (arriba, pequeño, en acento).
    const ctx: Contexto | undefined = d.contexto ?? (d.rotulo ? { texto: d.rotulo.texto, dice: d.rotulo.dice } : undefined);
    if (ctx) {
      const desde = r.en(ctx.dice, 0.15);
      contextos.push({ d: { texto: ctx.texto }, desde, hasta: Math.min(r.fin, desde + 2.8), k, id: `cx${k}` });
    }
    (d.tarjetas ?? []).forEach((t, i) => {
      const iw = t.aparecerEn === undefined ? palabraDeCifra(palabras, t.texto) : -1;
      const desde = iw >= 0 ? Math.max(r.piso, r.base + palabras[iw].inicio - 0.06) : r.en(t.aparecerEn, 0.6);
      tarjetas.push({ d: t, desde, hasta: Math.min(r.fin, desde + (t.duracionSeg ?? 3.2)), k, id: `t${k}-${i}` });
    });
    if (d.foto) {
      const desde = r.en(d.foto.aparecerEn, 0.35);
      fotos.push({ d: d.foto, desde, hasta: Math.min(r.fin, desde + (d.foto.duracionSeg ?? 2.6)), k, id: `f${k}` });
    }
    const pol: (Polaroid & { v1?: boolean }) | undefined = d.polaroid ?? (d.imagen && !d.foto ? { ...d.imagen, v1: true } : undefined);
    if (pol) {
      const desde = r.en(pol.aparecerEn, 0.5);
      polaroids.push({ d: pol, desde, hasta: Math.min(r.fin, desde + (pol.duracionSeg ?? 4.2)), k, id: `p${k}` });
    }
    if (d.fuente) {
      const i = d.fuente.dice === undefined ? buscarPalabraN(palabras, 'según') : -1;
      const desde = i >= 0 ? r.base + palabras[i].inicio : r.en(d.fuente.dice, 0.5);
      fuentes.push({ d: d.fuente, desde, hasta: Math.min(r.fin, desde + 2.6), k, id: `s${k}` });
    }
    if (d.indice?.length) {
      const n = d.indice.length;
      const items = d.indice.map((it, j) => ({ ...it, desde: it.dice !== undefined ? r.en(it.dice, 0) : r.base + (r.fin - r.base) * (0.25 + (0.65 * j) / n) }));
      // Se queda hasta que terminan los actos que siguen; en el acto j se ilumina el ítem j.
      const activo: { item: number; desde: number; hasta: number }[] = [];
      let j = 0;
      let hasta = r.fin;
      for (let m = k + 1; m < ultima; m++) {
        const tipo = g.escenas[m - 1].tipo;
        if (tipo !== 'acto' || j >= n) break;
        activo.push({ item: j, desde: plan.bloques[m].linea.inicio, hasta: finDeLinea(m) });
        hasta = finDeLinea(m);
        j++;
      }
      indice = { items, hasta, activo, posicion: d.indicePosicion ?? 'fila', ancla: d.indiceAncla };
    }
  });

  // Remate: 1.ª etiqueta al empezar, 2.ª cuando la voz llega a la segunda mitad.
  const rem = plan.bloques[ultima];
  const corte = rem.linea.palabras.findIndex((p, i) => i > 0 && /[.;:]$/.test(rem.linea.palabras[i - 1].texto));
  const remateEtiquetas = (g.remateEtiquetas ?? []).map((e, i) => ({
    ...e, desde: rem.linea.inicio + (i === 0 ? 0.2 : corte > 0 ? rem.linea.palabras[corte].inicio : rem.linea.duracionHablada * 0.5),
  }));

  // Líneas y marcadores de `mapa` (índice de escena; -1 = gancho, que arranca tras la tarjeta de título).
  const deEscena = (e: number) => (e < 0 ? T_TITULO + 0.3 : (plan.escenas[e]?.linea.inicio ?? 0) + 0.3);
  const trazos = g.mapa.lineas.map((l) => (l.dice !== undefined ? resolverDe(plan, l.dibujarEn + 1).en(l.dice, 0.3) : deEscena(l.dibujarEn)));
  const marcadoresDesde = (g.mapa.marcadores ?? []).map((m) => deEscena(m.aparecerEn));

  return { v2, planos, trazos, marcadoresDesde, areas, etiquetas, contextos, cotas, iconos, resaltes, tarjetas, fotos, polaroids, fuentes, indice, remateEtiquetas, claves, fin };
};

// ---------------------------------------------------------------- micro-movimientos

/**
 * Ritmo de cámara mínimo (docs/DIRECCION-VISUAL.md §1): ningún encuadre se queda > `maxQuieto` s sin un cambio
 * NOTABLE (|Δzoom| ≥ 0,6 o el centro se corre ≥ 22 % del ancho). Si el guion no lo da, la plantilla inserta un
 * micro-movimiento cada `cada` s: paneo lento de `paneo`·ancho (hacia el centro del plano siguiente si está cerca,
 * o de ida y vuelta) alternado con un zoom de ±10 % (`zoom` niveles), con easing largo. Un `corte` a un encuadre
 * casi idéntico (salto de pocos px que se lee como error) se convierte en un paneo suave. Todo determinista; los
 * desplazamientos se alternan para no salir de los recortes satelitales (margen ×2, scripts/lib/satelite.mts).
 */
export const MICRO = { maxQuieto: 8, cada: 5, paneo: 0.15, zoom: Math.log2(1.1), anchoPx: 1080 } as const;

const corrimientoPx = (a: LonLat, b: LonLat, zoom: number) => Math.hypot(a[0] - b[0], a[1] - b[1]) / gradosPorPx(zoom);
const esNotable = (antes: PlanoResuelto, p: PlanoResuelto) =>
  Math.abs(p.zoom - (antes.zoom + antes.deriva)) >= 0.6 || corrimientoPx(antes.centro, p.centro, p.zoom) >= 0.22 * MICRO.anchoPx;

const microMovimientos = (planos: PlanoResuelto[], fin: number) => {
  // 1) Cortes a casi el mismo encuadre → paneo suave.
  for (let j = 1; j < planos.length; j++) {
    if (planos[j].entrada === 'corte' && !esNotable(planos[j - 1], planos[j])) { planos[j].entrada = 'paneo'; planos[j].micro = true; }
  }
  // 2) Tramos sin cambio notable: momentos donde hace falta mover la cámara.
  const notables = planos.map((p, j) => j === 0 || esNotable(planos[j - 1], p));
  const momentos: number[] = [];
  let quietoDesde = planos[0].t0;
  for (let j = 1; j <= planos.length; j++) {
    if (j < planos.length && !notables[j]) continue;
    const hasta = j < planos.length ? planos[j].t0 : fin;
    if (hasta - quietoDesde > MICRO.maxQuieto) for (let tm = quietoDesde + MICRO.cada; tm < hasta - 2.5; tm += MICRO.cada) momentos.push(tm);
    if (j < planos.length) quietoDesde = planos[j].t0 + DURACION_TRANSICION(planos[j]);
  }
  // 3) Aplicar: si ya hay un plano (no notable) que empieza a ±1,2 s, se le suma el movimiento; si no, se parte el plano.
  momentos.forEach((tm, c) => {
    const k = planos.findIndex((p) => tm >= p.t0 && tm < p.t1);
    if (k < 0) return;
    const cerca = planos.findIndex((p, j) => j > 0 && Math.abs(p.t0 - tm) <= 1.2 && !notables[j]);
    let destino: PlanoResuelto;
    if (cerca >= 0) {
      destino = planos[cerca];
    } else {
      const q = planos[k];
      const T = Math.max(0.5, q.t1 - q.t0);
      const parte = (tm - q.t0) / T;
      destino = { ...q, t0: tm, t1: q.t1, zoom: q.zoom + q.deriva * parte, deriva: q.deriva * (1 - parte), en: undefined, duracionSeg: undefined };
      q.deriva *= parte;
      q.t1 = tm;
      planos.splice(k + 1, 0, destino);
      notables.splice(k + 1, 0, false);
    }
    destino.entrada = 'paneo';
    destino.micro = true;
    const ida = Math.floor(c / 2) % 2 === 0 ? 1 : -1;
    if (c % 2 === 0) {
      // Paneo: hacia el centro del siguiente plano del guion si está a la vista; si no, ida y vuelta en horizontal.
      const g = gradosPorPx(destino.zoom), paso = MICRO.paneo * MICRO.anchoPx * g;
      const sig = planos.slice(planos.indexOf(destino) + 1).find((p) => !p.micro);
      const dx = sig ? sig.centro[0] - destino.centro[0] : 0, dy = sig ? sig.centro[1] - destino.centro[1] : 0;
      const d = Math.hypot(dx, dy);
      const [ux, uy] = sig && d / g > 20 && d / g < MICRO.anchoPx ? [dx / d, dy / d] : [ida, 0];
      const largo = Math.min(paso, d / g > 20 && d / g < MICRO.anchoPx ? d : paso);
      destino.centro = [destino.centro[0] + ux * largo, destino.centro[1] + uy * largo];
    } else {
      destino.zoom -= ida * MICRO.zoom; // primero un pequeño retroceso, la vez siguiente vuelve a acercarse
    }
  });
};

// ---------------------------------------------------------------- cámara

export type EstadoCamara = { centro: LonLat; zoom: number };

/** Cámara de un plano sin transición (zoom lento continuo). */
const base = (p: PlanoResuelto, t: number): EstadoCamara => {
  const T = Math.max(0.5, p.t1 - p.t0);
  return { centro: p.centro, zoom: p.zoom + p.deriva * Math.min(1.2, Math.max(0, (t - p.t0) / T)) };
};

export const DURACION_TRANSICION = (p: PlanoResuelto) => {
  const T = p.t1 - p.t0;
  if (p.micro) return Math.min(2.4, Math.max(1.2, 0.5 * T)); // micro-movimiento: lento, casi imperceptible como "corte"
  return p.entrada === 'zoom' ? Math.min(1.7, Math.max(0.8, 0.55 * T)) : p.entrada === 'paneo' ? Math.min(1.3, Math.max(0.6, 0.5 * T)) : 0;
};

/** Cámara en el segundo `t`: plano vigente + transición con easing largo (vuelo con escala tipo van Wijk en los zooms). */
export const camaraEn = (planos: PlanoResuelto[], t: number, i?: number): EstadoCamara => {
  let k = i ?? 0;
  if (i === undefined) for (let j = 0; j < planos.length; j++) if (planos[j].t0 <= t) k = j;
  const p = planos[k];
  const destino = base(p, t);
  const D = DURACION_TRANSICION(p);
  if (k === 0 || D === 0 || t >= p.t0 + D) return destino;
  const desde = camaraEn(planos, p.t0 - 1e-3, k - 1);
  const u = ease(Math.max(0, Math.min(1, (t - p.t0) / D)));
  const zoom = desde.zoom + (destino.zoom - desde.zoom) * u;
  const [c0, c1] = [desde.centro, destino.centro];
  let w = 1 - u; // peso del centro de partida
  if (p.entrada === 'zoom' && Math.abs(destino.zoom - desde.zoom) > 0.4) {
    const s0 = Math.pow(2, desde.zoom), s1 = Math.pow(2, destino.zoom), s = Math.pow(2, zoom);
    // Acercarse: el punto de destino viaja al centro en proporción a la escala (no se escapa del cuadro).
    if (s1 > s0) w = (s0 / s - s0 / s1) / (1 - s0 / s1);
    else w = 1 - (s1 / s - s1 / s0) / (1 - s1 / s0);
    w = Math.max(0, Math.min(1, w));
  }
  return { centro: [c1[0] + (c0[0] - c1[0]) * w, c1[1] + (c0[1] - c1[1]) * w], zoom };
};

/**
 * Cámara "asentada" del plano vigente en `t`: la de después de su transición (o la del final del plano si la deriva
 * aleja, que es la más abierta). La usa la resolución de colisiones de etiquetas para que su decisión no salte de
 * un cuadro a otro mientras la cámara vuela.
 */
export const camaraAsentada = (planos: PlanoResuelto[], t: number): EstadoCamara => {
  let k = 0;
  for (let j = 0; j < planos.length; j++) if (planos[j].t0 <= t) k = j;
  const p = planos[k];
  const tRef = p.deriva >= 0 ? p.t0 + DURACION_TRANSICION(p) : Math.max(p.t0, p.t1 - 1e-3);
  return camaraEn(planos, tRef, k);
};

/** Opacidad de entrada/salida de una capa con ventana (rápida: 0,25 s). */
export const opacidadVentana = (v: Ventana, t: number, entrada = 0.25, salida = 0.3) =>
  Math.max(0, Math.min(1, (t - v.desde) / entrada, (v.hasta - t) / salida));

/** ¿Hay una foto a pantalla completa en `t`? (el índice, las tarjetas y el contexto se esconden debajo). */
export const fotoEn = (vis: Visual, t: number) => vis.fotos.find((f) => t >= f.desde && t < f.hasta);
