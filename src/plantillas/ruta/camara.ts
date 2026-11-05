/**
 * Cámara de `ruta` (módulo puro). Sigue la cabeza de la línea con un promedio ponderado de sus posiciones en
 * una ventana de ±1,8 s (en 3D, así cruzar ±180° no salta), y se aleja sola cuando la cabeza recorre mucho
 * arco en poco tiempo (tramos entre continentes). En el gancho y en el remate muestra la ruta entera
 * ("vista general"); la transición entre ambas es un slerp de centros + interpolación logarítmica de escala.
 * Todo depende solo del segundo t: determinista, sin estado entre frames.
 */
import { geoDistance, geoEquirectangular, geoOrthographic, type GeoProjection } from 'd3-geo';
import { cabezaEn, type LonLat, type Recorrido, type Trazado } from './trazado';
import type { MapaRuta } from './guion';

export type Camara = { centro: LonLat; /** escala d3 (px por radián) */ k: number; /** y en pantalla del centro de la cámara */ y: number };

const RAD = Math.PI / 180;
type V3 = [number, number, number];
export const vector = ([lon, lat]: LonLat): V3 => [Math.cos(lat * RAD) * Math.cos(lon * RAD), Math.cos(lat * RAD) * Math.sin(lon * RAD), Math.sin(lat * RAD)];
export const lonLatDe = ([x, y, z]: V3): LonLat => {
  const n = Math.hypot(x, y, z) || 1;
  return [Math.atan2(y, x) / RAD, Math.asin(Math.max(-1, Math.min(1, z / n))) / RAD];
};
/** Slerp de verdad entre dos puntos de la esfera (robusto cerca de antípodas). */
const slerp = (a: LonLat, b: LonLat, t: number): LonLat => {
  const va = vector(a);
  const vb = vector(b);
  const cos = Math.max(-1, Math.min(1, va[0] * vb[0] + va[1] * vb[1] + va[2] * vb[2]));
  const om = Math.acos(cos);
  if (om < 1e-6) return a;
  if (Math.PI - om < 1e-3) {
    // Casi antípodas: se pasa por el polo más cercano para no dividir por cero.
    const mitad: LonLat = [a[0], a[1] >= 0 ? 90 : -90];
    return t < 0.5 ? slerp(a, mitad, t * 2) : slerp(mitad, b, (t - 0.5) * 2);
  }
  const s0 = Math.sin((1 - t) * om) / Math.sin(om);
  const s1 = Math.sin(t * om) / Math.sin(om);
  return lonLatDe([va[0] * s0 + vb[0] * s1, va[1] * s0 + vb[1] * s1, va[2] * s0 + vb[2] * s1]);
};

/**
 * Centro de la vista general en la fracción `f` (0 = inicio, 1 = final) de la ruta: media 3D de los vértices
 * con peso gaussiano en km alrededor de f·total (sigma en fracción del total). Con f animado en el gancho la
 * cámara sobrevuela la ruta fantasma de punta a punta, aunque la ruta abarque más de un hemisferio.
 */
export const centroEnFraccion = (tr: Trazado, f: number, sigma: number): LonLat => {
  const suma: V3 = [0, 0, 0];
  const objetivo = f * tr.totalKm;
  const s = Math.max(1, sigma * tr.totalKm);
  for (let i = 0; i < tr.denso.length; i++) {
    const w = Math.exp(-0.5 * Math.pow((tr.km[i] - objetivo) / s, 2));
    const v = vector(tr.denso[i]);
    suma[0] += v[0] * w; suma[1] += v[1] * w; suma[2] += v[2] * w;
  }
  return lonLatDe(suma);
};

export const escalaDeZoom = (zoom: number) => (256 * Math.pow(2, zoom)) / (2 * Math.PI);

/** Límites de escala de la cámara para un mapa. */
export const limitesEscala = (mapa: MapaRuta, ancho: number) => {
  if (mapa.proyeccion === 'globo') return { kMin: ancho * 0.435, kMax: ancho * (mapa.escala ?? 1.1) };
  const kMax = escalaDeZoom(mapa.zoom ?? 6);
  return { kMin: Math.min(kMax, escalaDeZoom(2)), kMax };
};

/** Vista general: centro = media 3D de la ruta; escala para que toda la ruta (o el hemisferio) quepa. */
export const vistaGeneral = (tr: Trazado, mapa: MapaRuta, ancho: number): { centro: LonLat; k: number } => {
  const centro = centroEnFraccion(tr, 0.5, 10); // sigma enorme = media de toda la ruta
  const { kMin, kMax } = limitesEscala(mapa, ancho);
  let theta = 0;
  for (const p of tr.denso) theta = Math.max(theta, geoDistance(centro, p));
  const radioUtil = ancho * 0.4;
  if (mapa.proyeccion === 'globo') {
    const k = theta >= Math.PI / 2 ? kMin : radioUtil / Math.sin(theta);
    return { centro, k: Math.max(kMin, Math.min(kMax, k)) };
  }
  return { centro, k: Math.max(escalaDeZoom(1), Math.min(kMax, radioUtil / Math.max(theta, 1e-4))) };
};

const VENTANA = 1.8;
const MUESTRAS = 13;
const suave = (p: number) => (p <= 0 ? 0 : p >= 1 ? 1 : p * p * (3 - 2 * p));

export type Contexto = {
  tr: Trazado;
  rec: Recorrido;
  mapa: MapaRuta;
  ancho: number;
  general: { centro: LonLat; k: number };
  /** Fin del gancho e inicio del remate (s). */
  finGancho: number;
  inicioRemate: number;
  /** y objetivo del centro de la cámara en el segundo t (sube si la escena tiene foto). */
  yObjetivo: (t: number) => number;
  yGeneral: number;
};

/** Cámara de seguimiento (sin vista general). */
const seguimiento = (c: Contexto, t: number): Camara => {
  const { kMin, kMax } = limitesEscala(c.mapa, c.ancho);
  const suma: V3 = [0, 0, 0];
  let logK = 0;
  let y = 0;
  let pesos = 0;
  for (let i = 0; i < MUESTRAS; i++) {
    const s = -VENTANA + (2 * VENTANA * i) / (MUESTRAS - 1);
    const w = 1 - 0.75 * Math.abs(s / VENTANA);
    const ti = t + s;
    const v = vector(cabezaEn(c.tr, c.rec, ti).pos);
    suma[0] += v[0] * w; suma[1] += v[1] * w; suma[2] += v[2] * w;
    // Arco que la cabeza recorre en ±2,2 s: si es grande, la cámara se aleja para que quepa.
    const arco = geoDistance(cabezaEn(c.tr, c.rec, ti - 2.2).pos, cabezaEn(c.tr, c.rec, ti + 2.2).pos);
    const kCrudo = Math.max(kMin, Math.min(kMax, (c.ancho * 0.5) / Math.max(arco, 1e-6)));
    logK += Math.log(kCrudo) * w;
    y += c.yObjetivo(ti) * w;
    pesos += w;
  }
  // Respiro lento continuo: nada queda quieto aunque la cabeza esté detenida.
  const respiro = 1 + 0.035 * Math.sin((2 * Math.PI * t) / 9);
  return { centro: lonLatDe(suma), k: Math.exp(logK / pesos) * respiro, y: y / pesos };
};

/**
 * Vista general en el segundo t. Si la ruta cabe entera en la vista (plano o globo con ruta corta) la cámara
 * queda fija en la media; si no (ruta de más de un hemisferio) sobrevuela la ruta: en el gancho del inicio al
 * final, y en el remate se queda sobre el final con una media más ancha.
 */
const generalEn = (c: Contexto, t: number): Camara => {
  const k = c.general.k * (1 + 0.04 * (t / 10));
  const cabe = c.mapa.proyeccion === 'plano' || c.general.k > limitesEscala(c.mapa, c.ancho).kMin * 1.01;
  if (cabe) return { centro: c.general.centro, k, y: c.yGeneral };
  if (t < c.inicioRemate) {
    const f = suave(t / Math.max(1, c.finGancho - 1));
    return { centro: centroEnFraccion(c.tr, 0.08 + 0.84 * f, 0.12), k, y: c.yGeneral };
  }
  return { centro: centroEnFraccion(c.tr, 0.8, 0.25), k, y: c.yGeneral };
};

/** Cámara en el segundo t: vista general en el gancho y el remate, seguimiento en el medio. */
export const camaraEn = (c: Contexto, t: number): Camara => {
  const entrada = suave((t - (c.finGancho - 0.5)) / 2.0); // 0 = general, 1 = seguimiento
  const salida = suave((t - c.inicioRemate) / 2.4);
  const b = Math.min(entrada, 1 - salida); // peso del seguimiento
  const general = generalEn(c, t);
  if (b <= 0) return general;
  const seg = seguimiento(c, t);
  if (b >= 1) return seg;
  return {
    centro: slerp(general.centro, seg.centro, b),
    k: Math.exp(Math.log(general.k) + (Math.log(seg.k) - Math.log(general.k)) * b),
    y: general.y + (seg.y - general.y) * b,
  };
};

/** Proyección d3 de una cámara. */
export const proyeccionDe = (mapa: MapaRuta, cam: Camara, ancho: number): GeoProjection =>
  mapa.proyeccion === 'globo'
    ? geoOrthographic().scale(cam.k).translate([ancho / 2, cam.y]).rotate([-cam.centro[0], -cam.centro[1], 0]).clipAngle(90).precision(0.5)
    : geoEquirectangular().scale(cam.k).center(cam.centro).translate([ancho / 2, cam.y]).precision(0.5);
