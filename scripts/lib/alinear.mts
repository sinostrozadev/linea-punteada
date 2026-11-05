/**
 * Alinea los límites de palabra (WordBoundary) de msedge-tts con los tokens visibles del texto.
 *
 * Qué hace el servicio con las cifras (medido): NO da un límite por palabra hablada. Junta la cifra con
 * sus vecinos en UN solo límite ("437 acres", "unas 177 hectáreas", "164.000 kilómetros", "3.000 km."),
 * con el texto escrito (no la lectura). El alineador viejo le daba ese límite entero al primer token y
 * desplazaba el resto: "437" duraba lo de "437 acres" y "acres" se interpolaba tarde.
 * Acá cada límite se REPARTE entre los tokens visibles que contiene, ponderando por lo que de verdad
 * se dice (la cifra pesa lo que su lectura en palabras), y un token que cubre varios límites los absorbe.
 */
import { desfaseMaximo, estimarPalabras, normalizar, tokenizar, type Palabra } from '../../src/plantillas/comun/plan';
import { esNumerico, numeroAPalabras, palabrasDeLectura, pesoDeLectura } from '../../src/plantillas/comun/numeros';

/** Sube cuando cambia el algoritmo: los sidecars con otra versión se realinean (sin llamar al servicio). */
export const VERSION_ALINEACION = 2;

export type Habladas = { texto: string; inicio: number; fin: number };
export type Limite = { Type: string; Data: { Offset: number; Duration: number; text: { Text: string } } };

export const habladasDe = (limites: Limite[]): Habladas[] =>
  limites.filter((l) => l.Type === 'WordBoundary').map((l) => ({ texto: l.Data.text.Text, inicio: l.Data.Offset / 1e7, fin: (l.Data.Offset + l.Data.Duration) / 1e7 }));

type Asignacion = { m0: number; m1: number } | null;

export const alinearHabladas = (texto: string, habladas: Habladas[], duracionAudio: number): { palabras: Palabra[]; reales: boolean; desfaseMax: number } => {
  const tokens = tokenizar(texto);
  if (habladas.length === 0) {
    const palabras = estimarPalabras(texto, duracionAudio);
    return { palabras, reales: false, desfaseMax: 0 };
  }
  // Cada límite como lista de subpalabras normalizadas (puede traer varias: "unas 177 hectáreas").
  const subs = habladas.map((h) => h.texto.split(/\s+/).map(normalizar).filter(Boolean));
  const asig: Asignacion[] = [];
  let m = 0; // límite actual
  let s = 0; // subpalabra actual dentro de subs[m]
  const normaliza = () => { while (m < subs.length && s >= subs[m].length) { m++; s = 0; } };

  /** Intenta que el token `nt` empiece en la subpalabra (k, s0); devuelve hasta dónde llega. */
  const intentar = (nt: string, k: number, s0: number) => {
    let acc = '', mm = k, ss = s0;
    while (mm < subs.length) {
      const sub = subs[mm][ss];
      if (sub === undefined) { mm++; ss = 0; continue; }
      acc += sub;
      const ultimo = mm;
      ss++;
      if (acc === nt) return { m1: ultimo, m: mm, s: ss };
      // Tolerancia de una sola subpalabra: el servicio dice "esterlinas" por "esterlina", etc.
      if (acc === sub && nt.length >= 4 && sub.length >= 4 && (sub.startsWith(nt) || nt.startsWith(sub)) && Math.abs(sub.length - nt.length) <= 2) return { m1: ultimo, m: mm, s: ss };
      if (!nt.startsWith(acc)) return null;
    }
    return null;
  };

  for (const tok of tokens) {
    const nt = normalizar(tok);
    if (!nt) { asig.push(null); continue; }
    normaliza();
    const lectura = esNumerico(tok) ? numeroAPalabras(tok).split(/\s+/).map(normalizar).filter(Boolean) : [];
    // Ventana proporcional a lo que se lee: una palabra común mira 3 límites; una cifra, 3 + sus palabras.
    const ventana = 3 + (esNumerico(tok) ? palabrasDeLectura(tok) : 0);
    let hecho = false;
    for (let k = m; k < Math.min(subs.length, m + ventana) && !hecho; k++) {
      const s0 = k === m ? s : 0;
      for (let q = s0; q < subs[k].length && q < s0 + 1 && !hecho; q++) {
        const r = intentar(nt, k, q);
        if (r) { asig.push({ m0: k, m1: r.m1 }); m = r.m; s = r.s; hecho = true; }
      }
    }
    if (!hecho && lectura.length) {
      // El servicio dijo la cifra con palabras ("cuatrocientos", "treinta", "y", "siete"): las absorbe todas.
      const conjunto = new Set(lectura);
      let k = m; const tope = Math.min(subs.length, m + ventana + lectura.length);
      while (k < tope && !subs[k].every((x) => conjunto.has(x))) k++;
      if (k < tope) {
        let fin = k;
        while (fin + 1 < tope && subs[fin + 1].every((x) => conjunto.has(x)) && fin - k + 1 < lectura.length) fin++;
        asig.push({ m0: k, m1: fin }); m = fin + 1; s = 0; hecho = true;
      }
    }
    if (!hecho) asig.push(undefined as unknown as Asignacion); // sin coincidencia: se interpola abajo
  }

  // Reparto: tokens que comparten límite se dividen su tiempo según lo que se dice.
  const palabras: Palabra[] = tokens.map((t) => ({ texto: t, inicio: NaN, fin: NaN }));
  const porLimite = new Map<number, number[]>();
  asig.forEach((a, i) => { if (a && a.m0 === a.m1) (porLimite.get(a.m0) ?? porLimite.set(a.m0, []).get(a.m0)!).push(i); });
  asig.forEach((a, i) => {
    if (!a) return;
    if (a.m0 !== a.m1) { palabras[i].inicio = habladas[a.m0].inicio; palabras[i].fin = habladas[a.m1].fin; return; }
    const grupo = porLimite.get(a.m0)!;
    const h = habladas[a.m0];
    if (grupo.length === 1) { palabras[i].inicio = h.inicio; palabras[i].fin = h.fin; return; }
    const pesos = grupo.map((g) => Math.max(1, pesoDeLectura(tokens[g])));
    const suma = pesos.reduce((x, y) => x + y, 0);
    let t = h.inicio;
    grupo.forEach((g, n) => { const d = ((h.fin - h.inicio) * pesos[n]) / suma; palabras[g].inicio = t; palabras[g].fin = t + d; t += d; });
  });
  // Sin coincidencia: interpolamos entre la anterior y la siguiente conocida.
  for (let i = 0; i < palabras.length; i++) {
    if (!Number.isNaN(palabras[i].inicio)) continue;
    const prev = palabras[i - 1];
    let s = i + 1; while (s < palabras.length && Number.isNaN(palabras[s].inicio)) s++;
    const sig = palabras[s];
    const inicio = prev && !Number.isNaN(prev.fin) ? prev.fin + 0.02 : 0.1;
    const fin = sig ? Math.max(inicio + 0.08, sig.inicio - 0.02) : Math.min(duracionAudio, inicio + 0.25);
    palabras[i].inicio = inicio; palabras[i].fin = Math.max(fin, inicio + 0.05);
  }
  return { palabras, reales: true, desfaseMax: desfaseMaximo(palabras) };
};

/** Compatibilidad con voz.mts: alinea desde los límites crudos del servicio. */
export const alinear = (texto: string, limites: Limite[], duracionAudio: number) => alinearHabladas(texto, habladasDe(limites), duracionAudio);
