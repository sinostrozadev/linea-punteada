/**
 * Línea de tiempo COMPARTIDA (módulo puro, sin Remotion): la usan las composiciones y los scripts de
 * Node (voz, sonido, preparar), así el video y el audio parten de los mismos tiempos.
 * Líneas de voz: 0 = gancho, 1..n = escenas, n+1 = remate.
 */
import type { GuionBase } from './guion';
import { pesoDeLectura } from './numeros';

/** Pausa entre líneas de voz, en segundos (narración: algo más que en un dato rápido). */
export const PAUSA = 0.32;
/** Frames del <Cierre/> al final (1,5 s a 60 fps). */
export const FRAMES_CIERRE = 90;

export type Palabra = { texto: string; inicio: number; fin: number }; // relativos a la línea, en segundos
export type TipoLinea = 'gancho' | 'escena' | 'remate';
export type LineaTiempo = {
  indice: number;
  tipo: TipoLinea;
  texto: string;
  /** Ruta relativa a public/, ej. voz/<id>/0.mp3 */
  archivo: string;
  /** Inicio absoluto en el video, segundos. */
  inicio: number;
  duracionAudio: number;
  /** Hasta el final de la última palabra (+ respiro). */
  duracionHablada: number;
  palabras: Palabra[];
  /** true si los límites de palabra vienen del servicio TTS. */
  reales: boolean;
  /** Mayor desfase (s) de una palabra frente a su posición esperada (ver desfaseMaximo); estado.mts puede avisar. */
  desfaseMax?: number;
};
export type Tiempos = { id: string; voz: string; pausa: number; lineas: LineaTiempo[]; total: number; limitesReales: boolean };

export const tokenizar = (texto: string) => texto.split(/\s+/).filter(Boolean);

/** Minúsculas, sin tildes ni puntuación (para comparar palabras). */
export const normalizar = (p: string) => p.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ñ]/g, '');

/** Estimación de tiempos por largo de palabra, para Studio sin voz o si el servicio no da límites. */
export const estimarPalabras = (texto: string, duracion?: number): Palabra[] => {
  const tokens = tokenizar(texto);
  const pesos = tokens.map((t) => 0.12 + 0.055 * pesoDeLectura(t) + (/[,.;:!?…]$/.test(t) ? 0.16 : 0));
  const suma = pesos.reduce((a, b) => a + b, 0);
  const total = duracion ?? suma + 0.1;
  const k = (total - 0.1) / suma;
  let t = 0.1;
  return tokens.map((texto, i) => {
    const d = pesos[i] * k;
    const p = { texto, inicio: t, fin: t + d * 0.9 };
    t += d;
    return p;
  });
};

/**
 * Desfase por palabra (s): cuánto se aparta su inicio de donde la pondría un reparto proporcional DENTRO de su
 * oración (anclado en el inicio y fin reales de la oración; las cifras pesan lo que su lectura). Una cifra que
 * llega tarde porque el alineador se desplazó se ve aquí; las pausas normales no (se compensan por oración).
 */
export const desfasePorPalabra = (palabras: Palabra[]): number[] => {
  const res = new Array<number>(palabras.length).fill(0);
  let a = 0;
  for (let i = 0; i < palabras.length; i++) {
    if (!/[.?!:;…]["»”)]*$/.test(palabras[i].texto) && i < palabras.length - 1) continue;
    const grupo = palabras.slice(a, i + 1);
    const pesos = grupo.map((p) => Math.max(1, pesoDeLectura(p.texto)) + (/[,]$/.test(p.texto) ? 3 : 0));
    const suma = pesos.reduce((x, y) => x + y, 0);
    const t0 = grupo[0].inicio, dur = grupo[grupo.length - 1].fin - t0;
    let acum = 0;
    grupo.forEach((p, n) => { res[a + n] = Math.abs(p.inicio - (t0 + (dur * acum) / suma)); acum += pesos[n]; });
    a = i + 1;
  }
  return res;
};
export const desfaseMaximo = (palabras: Palabra[]): number => +Math.max(0, ...desfasePorPalabra(palabras)).toFixed(2);

/** Textos de voz de cualquier guion del canal, en orden: gancho, escenas, remate. */
export const textosDelGuion = (g: Pick<GuionBase, 'gancho' | 'escenas' | 'remate'>): { tipo: TipoLinea; texto: string }[] => [
  { tipo: 'gancho', texto: g.gancho.texto },
  ...g.escenas.map((e) => ({ tipo: 'escena' as const, texto: e.texto })),
  { tipo: 'remate', texto: g.remate },
];

/** Arma la línea de tiempo absoluta a partir de líneas medidas (o estimadas). */
export const armarTiempos = (
  id: string,
  voz: string,
  medidas: { tipo: TipoLinea; texto: string; archivo: string; duracionAudio: number; palabras: Palabra[]; reales: boolean; desfaseMax?: number }[],
): Tiempos => {
  let t = 0;
  const lineas: LineaTiempo[] = medidas.map((m, indice) => {
    const ultima = m.palabras.length ? m.palabras[m.palabras.length - 1].fin : m.duracionAudio;
    const duracionHablada = Math.min(m.duracionAudio, ultima + 0.12);
    const linea: LineaTiempo = { ...m, indice, inicio: t, duracionHablada };
    // Respiro extra antes del remate: que el giro y el "hoy" asienten.
    t += duracionHablada + (indice === medidas.length - 2 ? PAUSA * 2 : PAUSA);
    return linea;
  });
  return { id, voz, pausa: PAUSA, lineas, total: t - PAUSA, limitesReales: medidas.every((m) => m.reales) };
};

/** Tiempos de respaldo sin voz (previsualizar en Studio). */
export const estimarTiempos = (g: Pick<GuionBase, 'id' | 'voz' | 'gancho' | 'escenas' | 'remate'>): Tiempos =>
  armarTiempos(
    g.id,
    g.voz ?? 'estimada',
    textosDelGuion(g).map((l, i) => {
      const palabras = estimarPalabras(l.texto);
      const fin = palabras[palabras.length - 1].fin + 0.2;
      return { ...l, archivo: `voz/${g.id}/${i}.mp3`, duracionAudio: fin, palabras, reales: false };
    }),
  );

const VACIAS = new Set(['del', 'los', 'las', 'una', 'uno', 'que', 'con', 'por', 'para', 'son', 'muy', 'el', 'la', 'de', 'en', 'y']);

/** Primera palabra hablada (desde `desde`) que coincide con alguna palabra significativa de `objetivo`. */
export const buscarPalabra = (palabras: Palabra[], objetivo: string, desde = 0) => {
  const partes = objetivo.split(/[\s–—\-:/·,]+/).map(normalizar).filter(Boolean);
  const claves = partes.filter((w, k) => (k === 0 && partes.length === 1) || (w.length >= 3 && !VACIAS.has(w)));
  if (!claves.length) return -1;
  for (let i = desde; i < palabras.length; i++) {
    const n = normalizar(palabras[i].texto);
    if (claves.some((obj) => n === obj || (obj.length >= 4 && n.startsWith(obj)))) return i;
  }
  return -1;
};

export type TipoEvento = 'whoosh' | 'golpe' | 'tic' | 'trazo' | 'pop' | 'riser' | 'cierre';
export type Evento = { t: number; tipo: TipoEvento; fuerza: number; dur?: number };

export type Bloque = {
  /** Índice de la línea de voz (0 = gancho). */
  indice: number;
  tipo: TipoLinea;
  linea: LineaTiempo;
  /** Frame absoluto de inicio y duración (hasta el inicio de la siguiente línea). */
  desde: number;
  frames: number;
  /** Segundo (relativo al bloque) en que entra el rótulo de la escena (o null si no tiene). */
  rotuloEn: number | null;
  /** Índice de la palabra del rótulo en linea.palabras (para resaltarla en el subtítulo). */
  palabraRotulo: number;
};

export type Plan = {
  fps: number;
  tiempos: Tiempos;
  bloques: Bloque[];
  gancho: Bloque;
  escenas: Bloque[];
  remate: Bloque;
  cierreDesde: number;
  duracionFrames: number;
  duracionSeg: number;
  /** Eventos de sonido comunes (las plantillas agregan los suyos). */
  eventos: Evento[];
};

/** Planifica bloques, rótulos y eventos comunes a partir del guion y los tiempos de la voz. */
/** `framesCierre`: largo del cierre de marca (90 por defecto; frontera v2 usa 48 = 0,8 s). */
export const planificar = (guion: Pick<GuionBase, 'escenas'>, tiempos: Tiempos, fps: number, framesCierre = FRAMES_CIERRE): Plan => {
  const f = (seg: number) => Math.round(seg * fps);
  const L = tiempos.lineas;
  const finDe = (i: number) => (i + 1 < L.length ? L[i + 1].inicio : tiempos.total);
  const bloques: Bloque[] = L.map((linea, i) => {
    const desde = i === 0 ? 0 : f(linea.inicio);
    const frames = f(finDe(i)) - desde;
    let rotuloEn: number | null = null;
    let palabraRotulo = -1;
    if (linea.tipo === 'gancho') rotuloEn = 0;
    if (linea.tipo === 'escena') {
      const r = guion.escenas[i - 1]?.rotulo;
      if (r) {
        palabraRotulo = r.dice ? buscarPalabra(linea.palabras, r.dice) : -1;
        rotuloEn = palabraRotulo >= 0 ? Math.max(0.1, linea.palabras[palabraRotulo].inicio - 0.05) : 0.25;
      }
    }
    return { indice: i, tipo: linea.tipo, linea, desde, frames, rotuloEn, palabraRotulo };
  });
  const eventos: Evento[] = [{ t: 0, tipo: 'golpe', fuerza: 1 }];
  bloques.forEach((b) => {
    if (b.tipo === 'escena') eventos.push({ t: Math.max(0, b.linea.inicio - 0.15), tipo: 'whoosh', fuerza: 0.8 });
    if (b.tipo === 'escena' && b.rotuloEn !== null) eventos.push({ t: b.linea.inicio + b.rotuloEn, tipo: 'pop', fuerza: 0.7 });
  });
  const remate = bloques[bloques.length - 1];
  eventos.push({ t: Math.max(0, remate.linea.inicio - 0.9), tipo: 'riser', fuerza: 1 });
  eventos.push({ t: remate.linea.inicio, tipo: 'golpe', fuerza: 1 });
  const cierreDesde = f(tiempos.total + 0.4);
  eventos.push({ t: cierreDesde / fps, tipo: 'cierre', fuerza: 1 });
  const duracionFrames = cierreDesde + framesCierre;
  // El remate dura hasta el cierre (incluye el respiro de 0,4 s).
  remate.frames = cierreDesde - remate.desde;
  eventos.sort((a, b) => a.t - b.t);
  return {
    fps, tiempos, bloques, gancho: bloques[0], escenas: bloques.slice(1, -1), remate,
    cierreDesde, duracionFrames, duracionSeg: duracionFrames / fps, eventos,
  };
};

/** Índice de la palabra que se está diciendo en `t` (segundos relativos a la línea). */
export const indicePalabraActual = (palabras: Palabra[], t: number) => {
  let actual = -1;
  for (let i = 0; i < palabras.length; i++) if (palabras[i].inicio <= t) actual = i;
  return actual;
};
