/**
 * GRAMÁTICA DE CÁMARA (docs/DIRECCION-VISUAL.md §1b): reglas duras y medibles sobre la secuencia de `planos` de un
 * guion v2 (frontera, lugar, ruta comparten el contrato `Plano`). Nace del feedback de Santiago (2026-11-05) sobre
 * "Laguna del Desierto": cortes bruscos dentro del mapa que dejaban perdido (diente de sierra de zoom y cortes secos
 * a lugares fuera de cuadro). Módulo puro: lo usan el `superRefine` de las 3 plantillas y `scripts/camara.mts`.
 *
 * Geometría: zoom tipo mapa web (teselas de 256 px) sobre un lienzo de 1080×1920 → grados por px = `gradosPorPx`
 * (la misma de `frontera/mapa.ts`; equirectangular, la proyección de los fondos raster). El encuadre al final de un
 * plano usa `zoom + deriva` (la deriva por defecto es +0,3, como en `frontera/visual.ts`).
 * Tiempos: si no hay voz medida, se estiman por palabras (`estimarTiempos`), igual que Studio sin voz.
 */
import type { z } from 'zod';
import { estimarTiempos, normalizar, type Palabra, type Tiempos } from './plan';

export type LonLat = [number, number];
export type PlanoCam = { centro: LonLat; zoom: number; entrada: 'corte' | 'zoom' | 'paneo'; en?: string | number; duracionSeg?: number; deriva?: number };
type LineaGuion = { texto: string; planos?: PlanoCam[] };
export type GuionCam = { id?: string; voz?: string; gancho: LineaGuion; escenas: (LineaGuion & { tipo?: string })[]; remate: string; rematePlanos?: PlanoCam[] };

/** Lienzo vertical (Short). */
export const LIENZO = { ancho: 1080, alto: 1920 } as const;
/** Grados por px a un zoom dado (misma fórmula que `frontera/mapa.ts`; se repite para no importar d3 en el esquema). */
const gradosPorPx = (zoom: number) => 360 / (256 * Math.pow(2, zoom));
const DERIVA_DEFECTO = 0.3;
/**
 * Tiempos estimados por palabras (sin voz medida): cada plano puede errar ±15 % (holgura en los mínimos por plano),
 * pero el total sale ~7 % MÁS LARGO que la voz real (triángulo 140,7 vs 131,5 s; Laguna 155,8 vs 147,8 s), así que el
 * promedio por plano se exige 7 % más alto.
 */
export const TOLERANCIA_ESTIMADO = 0.85;
export const SESGO_ESTIMADO = 1.07;

/**
 * Umbrales de la gramática. Distancias en MEDIOS CUADROS del encuadre anterior al final de su plano (zoom + deriva):
 * 1 = el borde de la pantalla en ese eje (ancho 1080 px / alto 1920 px). Ajustados con el triángulo terrestre (la
 * referencia aprobada, 0 fallas) frente a Laguna del Desierto (la que desorientaba). Ver docs/DIRECCION-VISUAL.md §1b.
 */
export const GRAMATICA = {
  /** R1/R2: corte "mismo encuadre": |Δzoom| máximo (y el centro nuevo a la vista). */
  corteMismoZoom: 0.7,
  /** R1: cambio de escala claro (plano general ↔ detalle): |Δzoom| mínimo. */
  corteEscala: 3,
  /** R2: "a la vista" = el centro nuevo cae en el 90 % central del cuadro anterior. */
  margenDentro: 0.9,
  /** R1: corte que acerca entre 0,7 y 3 niveles ("golpe" al sujeto): el centro nuevo a ≤ 0,6 medio cuadro del centro. */
  ejeAcercar: 0.6,
  /** R2/R5: corte que aleja ≥ 3 niveles: el general se centra a ≤ 1,7 medios cuadros del plano anterior (mismo lugar). */
  ejeAlejar: 1.7,
  /** R2: paneo solo a un centro adyacente: ≤ 1,5 cuadros de distancia. */
  paneoAdyacente: 1.5,
  /** R1: un paneo no cambia de escala más que esto. */
  paneoMaxZoom: 1.5,
  /** R3: tramo de zoom "medio" (cuenta para el diente de sierra): 0,5 ≤ |Δzoom| < corteEscala. */
  sierraMin: 0.5,
  /** R4: duración mínima de un plano (s). */
  durMin: 1.0,
  /** R4: ráfaga = dos planos seguidos de menos de esto (s). */
  rafaga: 2.0,
  /** R4: promedio mínimo de segundos por plano en el video (triángulo 4,2; Laguna 3,4). */
  promedioMin: 3.8,
} as const;

export type PlanoMedido = {
  /** Línea de voz: 0 = gancho, 1..n = escenas[0..n-1], n+1 = remate. */
  linea: number;
  j: number;
  nombre: string;
  path: (string | number)[];
  p: PlanoCam;
  t0: number;
  t1: number;
  dur: number;
  /** Zoom al final del plano (zoom + deriva). */
  zoomFin: number;
  /** Respecto del plano anterior (null si no hay anterior conocido). */
  dz: number | null;
  /** Distancia del centro nuevo al anterior, en grados y en "cuadros" (fracción del ancho/alto del encuadre anterior). */
  distGrados: number | null;
  /** max(|dx|/(ancho/2), |dy|/(alto/2)) en el encuadre ANTERIOR al final: ≤ 1 = el centro nuevo estaba en cuadro. */
  enCuadroPrevio: number | null;
  /** Lo mismo, pero el centro anterior en el encuadre NUEVO: ≤ 1 = el plano nuevo contiene al anterior. */
  previoEnCuadroNuevo: number | null;
};

/** `error` rechaza el guion (corte seco a otro lugar, parpadeo); `aviso` se imprime pero no rechaza (recomendaciones de zoom/ritmo). */
export type Severidad = 'error' | 'aviso';
export type Violacion = { regla: 'R1' | 'R2' | 'R3' | 'R4' | 'R5'; severidad: Severidad; path: (string | number)[]; donde: string; mensaje: string };

const nombreLinea = (k: number, n: number) => (k === 0 ? 'gancho' : k === n + 1 ? 'remate' : `escenas[${k - 1}]`);
const pathLinea = (k: number, n: number): (string | number)[] => (k === 0 ? ['gancho', 'planos'] : k === n + 1 ? ['rematePlanos'] : ['escenas', k - 1, 'planos']);

/** Busca la n-ésima aparición de una palabra ("Hito#2") en las palabras (palabra completa normalizada). */
const buscarN = (palabras: Palabra[], palabra: string): number => {
  const m = /^(.*?)#(\d+)$/.exec(palabra.trim());
  const w = normalizar(m ? m[1] : palabra);
  let veces = m ? Number(m[2]) : 1;
  for (let i = 0; i < palabras.length; i++) if (normalizar(palabras[i].texto) === w && --veces === 0) return i;
  return -1;
};

/**
 * Mide la secuencia de planos: tiempos (mismo criterio que `resolverVisual`: `en`, `duracionSeg` o reparto parejo
 * ajustado a límite de frase), zoom final con deriva y relación geométrica con el plano anterior.
 * `continua`: en frontera una línea sin planos hereda el último (la cámara es continua); en lugar/ruta vuelve al
 * seguimiento automático, así que el primer plano después de una línea sin planos no tiene "anterior" conocido.
 */
export const medirCamara = (g: GuionCam, opciones: { continua: boolean; tiempos?: Tiempos }): PlanoMedido[] => {
  const tiempos = opciones.tiempos ?? estimarTiempos({ id: g.id ?? 'x', voz: g.voz as never, gancho: g.gancho as never, escenas: g.escenas as never, remate: g.remate });
  const n = g.escenas.length;
  const lineas: (PlanoCam[] | undefined)[] = [g.gancho.planos, ...g.escenas.map((e) => e.planos), g.rematePlanos];
  const fin = tiempos.total + 0.4;
  const res: PlanoMedido[] = [];
  lineas.forEach((ps, k) => {
    if (!ps?.length) return;
    const L = tiempos.lineas[k];
    if (!L) return;
    const inicio = k === 0 ? 0.9 : L.inicio; // el gancho arranca tras la tarjeta de título (T_TITULO)
    const finLinea = k + 1 < tiempos.lineas.length ? tiempos.lineas[k + 1].inicio : fin;
    const frases = L.palabras.filter((_, i) => i > 0 && /[.,;:?!…]["»”)]*$/.test(L.palabras[i - 1].texto)).map((p) => L.inicio + p.inicio - 0.05);
    const ajustar = (t: number) => { let m = t, d = 1.4; for (const c of frases) if (Math.abs(c - t) < d) { d = Math.abs(c - t); m = c; } return m; };
    const en = (m: string | number) => {
      let t = L.inicio;
      if (typeof m === 'number') t += m;
      else { const i = buscarN(L.palabras, m); if (i >= 0) t += Math.max(0, L.palabras[i].inicio - 0.06); }
      return Math.min(Math.max(t, inicio), finLinea - 0.3);
    };
    let previo = inicio;
    ps.forEach((p, j) => {
      let t0: number;
      if (j === 0) t0 = inicio;
      else if (p.en !== undefined) t0 = en(p.en);
      else if (ps[j - 1].duracionSeg) t0 = previo + ps[j - 1].duracionSeg!;
      else t0 = ajustar(inicio + ((finLinea - inicio) * j) / ps.length);
      t0 = Math.max(t0, previo + (j === 0 ? 0 : 0.8));
      res.push({ linea: k, j, nombre: nombreLinea(k, n), path: [...pathLinea(k, n), j], p, t0, t1: 0, dur: 0, zoomFin: p.zoom + (p.deriva ?? DERIVA_DEFECTO), dz: null, distGrados: null, enCuadroPrevio: null, previoEnCuadroNuevo: null });
      previo = t0;
    });
  });
  res.forEach((m, i) => {
    m.t1 = res[i + 1]?.t0 ?? fin;
    // En lugar/ruta, una línea sin planos entre medio = seguimiento automático: el plano siguiente no tiene anterior conocido.
    const a = res[i - 1];
    const lineasSinPlanos = a ? lineas.slice(a.linea + 1, m.linea).some((ps) => !ps?.length) : false;
    // En lugar/ruta, la línea con planos ocupa la línea: el último plano dura hasta el fin de su línea si sigue una sin planos.
    if (!opciones.continua && res[i + 1] && res[i + 1].linea !== m.linea && lineas.slice(m.linea + 1, res[i + 1].linea).some((ps) => !ps?.length)) {
      m.t1 = tiempos.lineas[m.linea + 1]?.inicio ?? m.t1;
    }
    m.dur = m.t1 - m.t0;
    if (!a || (!opciones.continua && lineasSinPlanos)) return;
    const gA = gradosPorPx(a.zoomFin), gN = gradosPorPx(m.p.zoom);
    const dx = m.p.centro[0] - a.p.centro[0], dy = m.p.centro[1] - a.p.centro[1];
    m.dz = m.p.zoom - a.zoomFin;
    m.distGrados = Math.hypot(dx, dy);
    m.enCuadroPrevio = Math.max(Math.abs(dx) / (gA * LIENZO.ancho / 2), Math.abs(dy) / (gA * LIENZO.alto / 2));
    m.previoEnCuadroNuevo = Math.max(Math.abs(dx) / (gN * LIENZO.ancho / 2), Math.abs(dy) / (gN * LIENZO.alto / 2));
  });
  return res;
};

const f1 = (x: number) => x.toFixed(1).replace('.', ',');
const f2 = (x: number) => x.toFixed(2).replace('.', ',');
const fmtLL = (c: LonLat) => `[${c[0]}, ${c[1]}]`;

/** Aplica las reglas R1–R5 a una secuencia medida. Devuelve las violaciones con mensajes accionables. */
export const violacionesCamara = (medidos: PlanoMedido[], opciones: { estimado?: boolean } = {}): Violacion[] => {
  const G = GRAMATICA;
  // Con tiempos estimados por palabras (sin voz) el error es ±15 %: las reglas de duración se aplican con esa holgura.
  const holgura = opciones.estimado ? TOLERANCIA_ESTIMADO : 1;
  const v: Violacion[] = [];
  const donde = (m: PlanoMedido) => `${m.nombre}.planos[${m.j}]`;
  const signo = (x: number) => (x > 0 ? '+' : '') + f1(x);
  medidos.forEach((m, i) => {
    if (m.dz === null || m.enCuadroPrevio === null) return;
    const a = medidos[i - 1];
    const dz = m.dz, adz = Math.abs(dz), cuadro = m.enCuadroPrevio;
    // R5 = la misma falta cuando ocurre al empezar una línea de voz (cambio de escena); R2 dentro de la escena.
    const R = m.j === 0 ? 'R5' : 'R2';
    const alEmpezar = m.j === 0 ? ' al empezar la escena' : '';
    const add = (regla: Violacion['regla'], mensaje: string) => v.push({ regla, severidad: regla === 'R1' ? 'aviso' : 'error', path: m.path, donde: donde(m), mensaje });
    if (m.p.entrada === 'corte') {
      if (adz <= G.corteMismoZoom) {
        if (cuadro > G.margenDentro) add(R, `corte al mismo zoom (Δ ${signo(dz)}) a un lugar que no estaba en cuadro (${f2(m.distGrados!)}° = ${f1(cuadro / 2)} cuadros)${alEmpezar} → usa entrada "paneo" si está a ≤ ${f1(G.paneoAdyacente)} cuadros o "zoom" (vuelo)`);
      } else if (dz > 0 && dz < G.corteEscala) {
        if (cuadro > G.ejeAcercar) add(R, `corte que acerca ${signo(dz)} a un punto descentrado (a ${f2(cuadro)} medio cuadro del centro; máx. ${f1(G.ejeAcercar)})${alEmpezar} → usa entrada "zoom" o centra el plano anterior en ese punto`);
      } else if (dz >= G.corteEscala) {
        if (cuadro > G.margenDentro) add(R, `corte que acerca ${signo(dz)} a un punto que no se veía${alEmpezar} → usa entrada "zoom" (vuelo) o un plano anterior que lo contenga`);
      } else if (dz <= -G.corteEscala) {
        if (cuadro > G.ejeAlejar) add(R, `corte que aleja ${f1(-dz)} niveles y además cambia de lugar (el general se centra a ${f2(m.distGrados!)}° = ${f2(cuadro / 2)} cuadros del plano anterior; máx. ${f2(G.ejeAlejar / 2)})${alEmpezar} → usa entrada "zoom" (que el espectador vea el alejamiento) o centra el general sobre ${fmtLL(a.p.centro)}`);
      } else {
        add('R1', `corte con Δzoom ${signo(dz)} (diente de sierra: un corte que aleja debe ser ≤ ${f1(G.corteMismoZoom)} o ≥ ${G.corteEscala} niveles) → usa entrada "zoom", deja el zoom en ${f1(a.zoomFin)} o aleja hasta ≤ ${f1(a.zoomFin - G.corteEscala)}`);
      }
    } else if (m.p.entrada === 'paneo') {
      if (cuadro > 2 * G.paneoAdyacente) add(R, `paneo a ${f1(cuadro / 2)} cuadros de distancia (máx. ${f1(G.paneoAdyacente)}) → usa entrada "zoom" (vuelo)`);
      if (adz > G.paneoMaxZoom) add('R1', `paneo con Δzoom ${signo(dz)}: un paneo desliza, no cambia de escala (máx. ±${f1(G.paneoMaxZoom)}) → usa entrada "zoom"`);
    }
  });
  // R3: diente de sierra de zoom. Tramo "medio" = 0,5 ≤ |Δz| < 3 (los cambios de escala claros no cuentan).
  // Solo cuenta si el centro se queda en el mismo lugar (a la vista): los vuelos entre lugares distintos (ruta) no son sierra.
  const medio = (m: PlanoMedido) => m.dz !== null && m.enCuadroPrevio !== null && m.enCuadroPrevio <= G.margenDentro && Math.abs(m.dz) >= G.sierraMin && Math.abs(m.dz) < G.corteEscala;
  const golpe = (m: PlanoMedido) => m.p.entrada === 'corte' && m.dz !== null && m.dz > G.corteMismoZoom && m.dz < G.corteEscala;
  for (let i = 1; i < medidos.length; i++) {
    const [b, c] = [medidos[i - 1], medidos[i]];
    // (a) ida y vuelta: un corte que acerca de golpe, pegado a un tramo medio en sentido contrario.
    if ((golpe(b) || golpe(c)) && medio(b) && medio(c) && Math.sign(b.dz!) !== Math.sign(c.dz!)) {
      v.push({ regla: 'R3', severidad: 'aviso', path: c.path, donde: donde(c), mensaje: `ida y vuelta de zoom: ${signo(b.dz!)} (${b.p.entrada}) y luego ${signo(c.dz!)} (${c.p.entrada}) entre ${donde(b)} y ${donde(c)} → si acercas de golpe, quédate ahí (|Δ| < ${f1(G.sierraMin)}) o sal con un cambio de escala claro (≥ ${G.corteEscala}); o quita el plano intermedio` });
      continue;
    }
    // (b) tres tramos medios seguidos alternando el sentido (acercar → alejar → acercar).
    const a = medidos[i - 2];
    if (a && medio(a) && medio(b) && medio(c) && Math.sign(a.dz!) === -Math.sign(b.dz!) && Math.sign(b.dz!) === -Math.sign(c.dz!)) {
      v.push({ regla: 'R3', severidad: 'aviso', path: c.path, donde: donde(c), mensaje: `diente de sierra de zoom: ${[a, b, c].map((m) => signo(m.dz!)).join(' → ')} en planos seguidos (${donde(a)}…${donde(c)}) → mantén el zoom (|Δ| < ${f1(G.sierraMin)}), haz un cambio de escala claro (≥ ${G.corteEscala}) o quita un plano` });
    }
  }
  // R4: duración (el primero arranca con la tarjeta; el último dura hasta el cierre).
  medidos.forEach((m, i) => {
    if (i === 0 || i === medidos.length - 1) return;
    if (m.dur < G.durMin * holgura) v.push({ regla: 'R4', severidad: 'error', path: m.path, donde: donde(m), mensaje: `plano de ${f1(m.dur)} s (mín. ${f1(G.durMin)}; un plano más corto es un parpadeo) → mueve su "en" más tarde, júntalo con el vecino o quítalo` });
    else if (i + 1 < medidos.length - 1 && m.dur < G.rafaga * holgura && medidos[i + 1].dur < G.rafaga * holgura) v.push({ regla: 'R4', severidad: 'aviso', path: m.path, donde: donde(m), mensaje: `ráfaga: dos planos seguidos de menos de ${f1(G.rafaga)} s (${f1(m.dur)} y ${f1(medidos[i + 1].dur)} s) → junta dos en uno o reparte los "en"` });
  });
  if (medidos.length >= 2) {
    const total = medidos[medidos.length - 1].t1 - medidos[0].t0;
    const prom = total / medidos.length;
    const minimo = G.promedioMin * (opciones.estimado ? SESGO_ESTIMADO : 1);
    if (prom < minimo) {
      const max = Math.floor(total / minimo);
      v.push({ regla: 'R4', severidad: 'aviso', path: ['escenas'], donde: 'video', mensaje: `${medidos.length} planos en ${Math.round(total)} s (${f1(prom)} s/plano; mín. ${f1(minimo)}${opciones.estimado ? ' con tiempos estimados' : ''}) → quita ${medidos.length - max} plano(s): máx. ${max} para este largo (≈ ${Math.floor(150 / minimo)} en 150 s)` });
    }
  }
  return v;
};

/** Solo los errores (los avisos no rechazan el guion). */
export const erroresCamara = (v: Violacion[]) => v.filter((x) => x.severidad === 'error');
export const avisosCamara = (v: Violacion[]) => v.filter((x) => x.severidad === 'aviso');

/** Para el `superRefine` de cada plantilla: agrega una issue por ERROR de cámara (solo si el guion usa planos v2). Los avisos no rechazan. */
export const validarCamara = (g: GuionCam, ctx: z.RefinementCtx, opciones: { continua: boolean }) => {
  const usa = (g.gancho.planos ?? []).length || g.escenas.some((e) => (e.planos ?? []).length) || (g.rematePlanos ?? []).length;
  if (!usa) return;
  const medidos = medirCamara(g, opciones);
  for (const x of erroresCamara(violacionesCamara(medidos, { estimado: true }))) ctx.addIssue({ code: 'custom', path: x.path, message: `gramática de cámara ${x.regla} · ${x.donde}: ${x.mensaje}` });
};
