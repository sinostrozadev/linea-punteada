/**
 * Cama ambiental + SFX de las plantillas del canal, sintetizados en Node con scripts/lib/wav.mts.
 * Lo llaman los preparar-*: reciben la duración y la lista de eventos del plan (comun/plan.ts +
 * los que agrega cada plantilla, p. ej. el "trazo" de una línea del mapa) y escriben
 * public/audio/generado/<id>.wav. La voz NO va aquí: la composición la reproduce aparte.
 *
 * Carácter: narración geográfica, no dato rápido. Cama GRAVE y LENTA (dron en la tónica con quinta,
 * acordes de pad que cambian cada ~8 s, viento filtrado), whoosh suave en cada cambio de escena,
 * "tic" seco cuando empieza a dibujarse una línea y ticks muy suaves mientras se dibuja.
 * Niveles: la cama queda ~26 dB bajo la voz y los SFX ~12 dB bajo la voz (mezcla ≈ −16 LUFS con la voz).
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SR, barrido, crearPista, escribirWav, golpe, midiAHz, mezclar, nota } from './lib/wav.mjs';
import { semillaDesde } from '../src/lib/azar';
import type { Evento } from '../src/plantillas/comun/plan';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VOL_CAMA = 0.05;
const VOL_SFX = 0.32;

/** Ruido filtrado con envolvente seno y filtro que abre: whoosh de cambio de escena. */
const whoosh = (pista: Float32Array, inicio: number, duracion: number, volumen: number, semilla: number) => {
  const desde = Math.floor(inicio * SR);
  const total = Math.floor(duracion * SR);
  let s = semilla >>> 0 || 1;
  let lp = 0;
  let lp2 = 0;
  for (let i = 0; i < total; i++) {
    const idx = desde + i;
    if (idx < 0 || idx >= pista.length) continue;
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const ruido = (s / 4294967296) * 2 - 1;
    const x = i / total;
    const tono = 0.02 + 0.22 * Math.sin(Math.PI * x); // abre y cierra: suave, sin siseo
    lp += tono * (ruido - lp);
    lp2 += tono * (lp - lp2);
    pista[idx] += lp2 * Math.pow(Math.sin(Math.PI * x), 1.8) * volumen * 2.6;
  }
};

/** Tic seco de "pluma sobre papel": golpe agudo cortito + seno muy breve. */
const tic = (pista: Float32Array, t: number, volumen: number, semilla: number) => {
  golpe(pista, t, { duracion: 0.018, volumen: volumen * 0.8, tono: 0.9, semilla });
  nota(pista, { inicio: t, hz: 2100, duracion: 0.01, volumen: volumen * 0.25, timbre: 'seno', ataque: 0.001, caida: 0.01, sostenido: 0.2, liberacion: 0.03 });
};

/** Cama: dron en la tónica + quinta, pad de acordes menores lentos y viento. */
const cama = (duracion: number, semilla: number) => {
  const pista = crearPista(duracion);
  const tonica = 38 + (semilla % 5); // Re2..Fa#2: cada guion tiene su tono
  // i – VI – III – VII, cada acorde ~8 s
  const acordes = [[0, 3, 7], [-4, 0, 3], [3, 7, 10], [-2, 2, 5]];
  const largo = 8;
  for (let c = 0; c * largo < duracion; c++) {
    const ac = acordes[c % 4];
    const t0 = c * largo;
    nota(pista, { inicio: t0, hz: midiAHz(tonica - 12), duracion: largo, volumen: 0.5, timbre: 'seno', ataque: 2.5, caida: 1, sostenido: 0.9, liberacion: 2.5 });
    nota(pista, { inicio: t0, hz: midiAHz(tonica - 5), duracion: largo, volumen: 0.18, timbre: 'seno', ataque: 3, caida: 1, sostenido: 0.9, liberacion: 2.5 });
    ac.forEach((g, k) => {
      // dos osciladores levemente desafinados = pad ancho
      for (const desafino of [-0.07, 0.07]) {
        nota(pista, { inicio: t0 + k * 0.4, hz: midiAHz(tonica + 12 + g + desafino), duracion: largo - 1, volumen: 0.07, timbre: 'triangulo', ataque: 2.8, caida: 1, sostenido: 0.8, liberacion: 3 });
      }
    });
  }
  // Viento: ruido muy filtrado con LFO lento.
  let s = semilla >>> 0 || 7;
  let lp = 0;
  let lp2 = 0;
  for (let i = 0; i < pista.length; i++) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const r = (s / 4294967296) * 2 - 1;
    lp += 0.012 * (r - lp);
    lp2 += 0.012 * (lp - lp2);
    const lfo = 0.6 + 0.4 * Math.sin((2 * Math.PI * i) / (SR * 11));
    pista[i] += lp2 * 9 * lfo;
  }
  // Fundidos
  const fin = Math.floor(1.2 * SR);
  const fout = Math.floor(2.0 * SR);
  for (let i = 0; i < fin && i < pista.length; i++) pista[i] *= i / fin;
  for (let i = 0; i < fout && i < pista.length; i++) pista[pista.length - 1 - i] *= i / fout;
  return pista;
};

const sfx = (duracion: number, eventos: Evento[], semilla: number) => {
  const pista = crearPista(duracion);
  eventos.forEach((e, i) => {
    const s = semilla + i * 7919;
    switch (e.tipo) {
      case 'whoosh': whoosh(pista, e.t, 0.7, 0.5 * e.fuerza, s); break;
      case 'tic': tic(pista, e.t, 0.8 * e.fuerza, s); break;
      case 'trazo': {
        // Tic al empezar y ticks muy suaves cada ~0,16 s mientras la línea se dibuja.
        tic(pista, e.t, 0.85 * e.fuerza, s);
        const dur = e.dur ?? 1.6;
        for (let k = 1; k * 0.16 < dur; k++) tic(pista, e.t + k * 0.16, 0.22 * e.fuerza * (1 - (k * 0.16) / dur), s + k);
        break;
      }
      case 'pop':
        barrido(pista, e.t, 520, 260, 0.09, 0.35 * e.fuerza, 'seno');
        break;
      case 'golpe':
        nota(pista, { inicio: e.t, hz: 55, duracion: 0.25, volumen: 0.9 * e.fuerza, timbre: 'seno', ataque: 0.004, caida: 0.2, sostenido: 0.4, liberacion: 0.9 });
        golpe(pista, e.t, { duracion: 0.09, volumen: 0.35 * e.fuerza, tono: 0.18, semilla: s });
        break;
      case 'riser':
        barrido(pista, e.t, 90, 360, 0.9, 0.16, 'triangulo');
        whoosh(pista, e.t, 0.95, 0.45, s);
        break;
      case 'cierre':
        // Dos notas limpias (quinta) que suben: firma del canal.
        nota(pista, { inicio: e.t + 0.05, hz: midiAHz(74), duracion: 0.08, volumen: 0.45, timbre: 'seno', ataque: 0.003, caida: 0.2, sostenido: 0.4, liberacion: 1.1 });
        nota(pista, { inicio: e.t + 0.3, hz: midiAHz(81), duracion: 0.08, volumen: 0.4, timbre: 'seno', ataque: 0.003, caida: 0.2, sostenido: 0.4, liberacion: 1.3 });
        break;
    }
  });
  return pista;
};

/** dBFS RMS de una pista (aprox. de sonoridad para el log). */
const rmsDb = (p: Float32Array) => {
  let s = 0;
  for (const x of p) s += x * x;
  return 10 * Math.log10(s / p.length + 1e-12);
};

/** Sintetiza cama + SFX y escribe public/audio/generado/<id>.wav. */
export const generarSonido = (id: string, duracionSeg: number, eventos: Evento[]) => {
  const semilla = semillaDesde(id);
  const mezcla = crearPista(duracionSeg);
  mezclar(mezcla, cama(duracionSeg, semilla), VOL_CAMA);
  mezclar(mezcla, sfx(duracionSeg, eventos, semilla), VOL_SFX);
  let pico = 0;
  for (const x of mezcla) pico = Math.max(pico, Math.abs(x));
  if (pico > 0.89) for (let i = 0; i < mezcla.length; i++) mezcla[i] *= 0.89 / pico; // picos < −1 dBFS
  const salida = path.join(RAIZ, 'public/audio/generado', `${id}.wav`);
  escribirWav(salida, [mezcla]);
  console.log(`sonido: ${path.relative(RAIZ, salida)} (${duracionSeg.toFixed(2)} s, ${eventos.length} eventos, RMS ${rmsDb(mezcla).toFixed(1)} dBFS, pico ${(20 * Math.log10(Math.max(pico, 1e-9))).toFixed(1)} dBFS)`);
  return salida;
};
