/**
 * Geometría y línea de tiempo del trayecto de `ruta` (módulo PURO: lo usan preparar-ruta en Node y la
 * composición en el navegador; así el sonido, los marcadores y la línea parten de los mismos tiempos).
 *
 * - `calcularTrazado` (pesado, se hace UNA vez en preparar-ruta y se guarda en las props): densifica la ruta
 *   por grandes círculos (~50 km), acumula km por vértice, fecha (año decimal) por punto y los "puntitos" de
 *   la línea punteada a distancia geográfica fija (así no reptan cuando la cámara gira o se aleja).
 * - `armarRecorrido` + `cabezaEn` (livianos, por frame): dónde está la cabeza de la línea en el segundo t.
 */
import { geoDistance, geoInterpolate } from 'd3-geo';
import type { PuntoRuta } from './guion';

export type LonLat = [number, number];
export const RADIO_TIERRA_KM = 6371;

/** Lo que precalcula preparar-ruta (va en las props como `trazado`). */
export type Trazado = {
  /** Polilínea densificada [lon, lat] (4 decimales). */
  denso: LonLat[];
  /** km acumulados en cada vértice de `denso`. */
  km: number[];
  /** km acumulados en cada punto del guion. */
  kmPunto: number[];
  /** Año decimal en cada punto (fechado o interpolado por distancia); null si no hay fechas suficientes. */
  anioPunto: (number | null)[];
  totalKm: number;
  /** Puntitos de la línea punteada: [lon, lat, km]. */
  puntitos: [number, number, number][];
  pasoPuntitoKm: number;
};

/** "AAAA" | "AAAA-MM" | "AAAA-MM-DD" → año decimal (sin Date: determinista e independiente del huso). */
export const anioDecimal = (fecha: string): number => {
  const [a, m, d] = fecha.split('-').map(Number);
  if (!m) return a + 0.5; // solo el año: mitad del año
  const dias = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let dia = 0;
  for (let i = 0; i < m - 1; i++) dia += dias[i];
  dia += d ? d - 1 : 15;
  return a + dia / 365;
};

const r4 = (x: number) => Math.round(x * 1e4) / 1e4;

export const calcularTrazado = (puntos: PuntoRuta[], pasoPuntitoKm: number, pasoKm = 50): Trazado => {
  const denso: LonLat[] = [[r4(puntos[0].lon), r4(puntos[0].lat)]];
  const km = [0];
  const kmPunto = [0];
  for (let i = 1; i < puntos.length; i++) {
    const a: LonLat = [puntos[i - 1].lon, puntos[i - 1].lat];
    const b: LonLat = [puntos[i].lon, puntos[i].lat];
    const d = geoDistance(a, b) * RADIO_TIERRA_KM;
    const n = Math.max(1, Math.ceil(d / pasoKm));
    const interp = geoInterpolate(a, b);
    const base = km[km.length - 1];
    for (let k = 1; k <= n; k++) {
      const p = interp(k / n);
      denso.push([r4(p[0]), r4(p[1])]);
      km.push(Math.round((base + (d * k) / n) * 10) / 10);
    }
    kmPunto.push(km[km.length - 1]);
  }
  const totalKm = km[km.length - 1];

  // Fechas: las verificadas se respetan; las que faltan se interpolan por km entre fechados vecinos.
  const fechados = puntos.map((p, i) => (p.fecha ? i : -1)).filter((i) => i >= 0);
  const anioPunto = puntos.map((p, i): number | null => {
    if (p.fecha) return anioDecimal(p.fecha);
    const prev = [...fechados].reverse().find((j) => j < i);
    const sig = fechados.find((j) => j > i);
    if (prev === undefined || sig === undefined) return null;
    const a0 = anioDecimal(puntos[prev].fecha!);
    const a1 = anioDecimal(puntos[sig].fecha!);
    const tramo = kmPunto[sig] - kmPunto[prev];
    return tramo > 0 ? a0 + ((kmPunto[i] - kmPunto[prev]) / tramo) * (a1 - a0) : a0;
  });

  const parcial: Trazado = { denso, km, kmPunto, anioPunto, totalKm, puntitos: [], pasoPuntitoKm: pasoPuntitoKm };
  const puntitos: [number, number, number][] = [];
  for (let d = 0; d <= totalKm; d += pasoPuntitoKm) {
    const p = posicionEnKm(parcial, d);
    puntitos.push([r4(p[0]), r4(p[1]), Math.round(d * 10) / 10]);
  }
  return { ...parcial, puntitos };
};

/** Posición [lon, lat] a `d` km del inicio (búsqueda binaria + arco corto entre vértices densos). */
export const posicionEnKm = (tr: Pick<Trazado, 'denso' | 'km'>, d: number): LonLat => {
  const { denso, km } = tr;
  if (d <= 0) return denso[0];
  if (d >= km[km.length - 1]) return denso[denso.length - 1];
  let lo = 0;
  let hi = km.length - 1;
  while (hi - lo > 1) {
    const m = (lo + hi) >> 1;
    if (km[m] <= d) lo = m; else hi = m;
  }
  const u = (d - km[lo]) / Math.max(1e-9, km[hi] - km[lo]);
  return geoInterpolate(denso[lo], denso[hi])(u) as LonLat;
};

/**
 * Tramo [desde, hasta] (índices de punto) que recorre cada escena. Con `tramo` explícito se va de donde quedó
 * la línea hasta `tramo[1]`; las escenas sin `tramo` se reparten por partes iguales lo que falta hasta el
 * siguiente tramo explícito (o hasta el último punto).
 */
export const resolverTramos = (escenas: { tramo?: [number, number] }[], nPuntos: number): [number, number][] => {
  const res: [number, number][] = [];
  let cursor = 0;
  let i = 0;
  while (i < escenas.length) {
    const t = escenas[i].tramo;
    if (t) {
      const hasta = Math.max(cursor, Math.min(nPuntos - 1, t[1]));
      res.push([cursor, hasta]);
      cursor = hasta;
      i++;
      continue;
    }
    // Racha de escenas sin tramo: hasta el comienzo del siguiente explícito o el final.
    let j = i;
    while (j < escenas.length && !escenas[j].tramo) j++;
    const objetivo = j < escenas.length ? Math.max(cursor, Math.min(nPuntos - 1, escenas[j].tramo![0])) : nPuntos - 1;
    const k = j - i;
    const inicio = cursor;
    for (let q = 0; q < k; q++) {
      const hasta = Math.round(inicio + ((objetivo - inicio) * (q + 1)) / k);
      res.push([cursor, hasta]);
      cursor = hasta;
    }
    i = j;
  }
  return res;
};

/** Movimiento de la cabeza dentro de una escena. */
export type Movimiento = {
  /** Segundos absolutos en que la cabeza sale y llega. */
  t0: number;
  t1: number;
  desde: number;
  hasta: number;
  /** Peso acumulado al llegar a cada punto desde `desde` (0 … total). */
  acumulado: number[];
};
export type Recorrido = { movimientos: Movimiento[] };

/** Curva de avance dentro de una escena: arranca y frena suave (la cámara promedia encima). */
const curva = (p: number) => 0.5 - 0.5 * Math.cos(Math.PI * p);
const curvaInversa = (q: number) => Math.acos(1 - 2 * q) / Math.PI;

/**
 * Arma los movimientos de la cabeza a partir de los tramos y de los tiempos de cada escena
 * (segundos absolutos de inicio y fin del bloque). Dentro de la escena, cada segmento recibe tiempo
 * proporcional a su largo + una constante (un tramo de 0 km —el viajero trabado— igual se toma su tiempo).
 */
export const armarRecorrido = (tr: Pick<Trazado, 'kmPunto'>, tramos: [number, number][], escenas: { inicio: number; fin: number }[]): Recorrido => ({
  movimientos: tramos.map(([desde, hasta], s) => {
    const { inicio, fin } = escenas[s];
    const t0 = inicio + 0.2;
    const t1 = Math.max(t0 + 0.6, fin - 0.4);
    const largos: number[] = [];
    for (let j = desde; j < hasta; j++) largos.push(tr.kmPunto[j + 1] - tr.kmPunto[j]);
    const suma = largos.reduce((a, b) => a + b, 0);
    const c = Math.max(60, (0.3 * suma) / Math.max(1, largos.length));
    const acumulado = [0];
    largos.forEach((l) => acumulado.push(acumulado[acumulado.length - 1] + l + c));
    return { t0, t1, desde, hasta, acumulado };
  }),
});

export type Cabeza = { km: number; anio: number | null; pos: LonLat; /** índice fraccional de punto */ u: number };

/** Estado de la cabeza en el segundo `t` (absoluto). Antes de moverse está en el punto 0. */
export const cabezaEn = (tr: Trazado, rec: Recorrido, t: number): Cabeza => {
  let u = 0;
  for (const m of rec.movimientos) {
    if (t < m.t0) break;
    if (m.hasta === m.desde) { u = m.hasta; continue; }
    if (t >= m.t1) { u = m.hasta; continue; }
    const p = curva((t - m.t0) / (m.t1 - m.t0));
    const total = m.acumulado[m.acumulado.length - 1];
    const objetivo = p * total;
    let j = 0;
    while (j < m.acumulado.length - 2 && m.acumulado[j + 1] < objetivo) j++;
    const f = (objetivo - m.acumulado[j]) / Math.max(1e-9, m.acumulado[j + 1] - m.acumulado[j]);
    u = m.desde + j + Math.min(1, Math.max(0, f));
    break;
  }
  const j = Math.min(Math.floor(u), tr.kmPunto.length - 1);
  const f = u - j;
  const k1 = tr.kmPunto[Math.min(j + 1, tr.kmPunto.length - 1)];
  const km = tr.kmPunto[j] + (k1 - tr.kmPunto[j]) * f;
  const a0 = tr.anioPunto[j];
  const a1 = tr.anioPunto[Math.min(j + 1, tr.anioPunto.length - 1)];
  const anio = a0 === null ? null : a1 === null || f === 0 ? a0 : a0 + (a1 - a0) * f;
  return { km, anio, pos: posicionEnKm(tr, km), u };
};

/** Segundo absoluto en que la cabeza llega al punto `i` (0 para el primero). */
export const momentoDePunto = (rec: Recorrido, i: number): number => {
  if (i === 0) return 0;
  for (const m of rec.movimientos) {
    if (i > m.desde && i <= m.hasta) {
      const total = m.acumulado[m.acumulado.length - 1];
      const q = m.acumulado[i - m.desde] / Math.max(1e-9, total);
      return m.t0 + curvaInversa(Math.min(1, q)) * (m.t1 - m.t0);
    }
  }
  return Infinity;
};

/** Paso de los puntitos (km) para que a la escala máxima `kMax` (px por radián) queden a ~`px` píxeles. */
export const pasoPuntitoPara = (kMax: number, px = 30) => Math.max(0.05, (px / kMax) * RADIO_TIERRA_KM);
