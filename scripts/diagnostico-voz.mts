/**
 * Diagnóstico de la sincronía voz ↔ texto visible (sobre todo cifras).
 *   npx tsx scripts/diagnostico-voz.mts <id> [--viejo] [--todo]
 * Lee public/voz/<id>/<n>.json (sidecars con los WordBoundary crudos del servicio) y, por línea, imprime cada token
 * visible con los límites del servicio que le tocaron y su desfase frente a la posición esperada
 * (reparto proporcional dentro de la oración, cifras ponderadas por su lectura). Marca con "!!" los > 0,4 s.
 * --viejo : usa el alineador anterior (tamaño de ventana fijo 3, un límite por token) para comparar antes/después.
 * --todo  : imprime todos los tokens (por defecto solo los numéricos y los marcados).
 */
import fs from 'node:fs';
import path from 'node:path';
import { alinearHabladas, type Habladas } from './lib/alinear.mjs';
import { RAIZ } from './voz.mjs';
import { desfasePorPalabra, normalizar, tokenizar, estimarPalabras, type Palabra } from '../src/plantillas/comun/plan';
import { esNumerico, numeroAPalabras } from '../src/plantillas/comun/numeros';

const UMBRAL = 0.4;

/** Alineador previo (commit anterior), conservado solo para medir el "antes". */
const alinearViejo = (texto: string, habladas: Habladas[], duracionAudio: number): Palabra[] => {
  const tokens = tokenizar(texto);
  if (habladas.length === 0) return estimarPalabras(texto, duracionAudio);
  const palabras: Palabra[] = [];
  let j = 0;
  for (let i = 0; i < tokens.length; i++) {
    const nt = normalizar(tokens[i]);
    let k = -1;
    for (let m = j; m < Math.min(habladas.length, j + 3); m++) {
      const nh = normalizar(habladas[m].texto);
      if (nh === nt || (nh && nt.startsWith(nh)) || (nt && nh.startsWith(nt))) { k = m; break; }
    }
    if (k >= 0) {
      let fin = habladas[k].fin;
      let m = k + 1;
      let resto = nt.slice(normalizar(habladas[k].texto).length);
      while (resto.length && m < habladas.length && resto.startsWith(normalizar(habladas[m].texto))) { resto = resto.slice(normalizar(habladas[m].texto).length); fin = habladas[m].fin; m++; }
      palabras.push({ texto: tokens[i], inicio: habladas[k].inicio, fin });
      j = m;
    } else {
      const prev = palabras[palabras.length - 1];
      const sig = habladas[j];
      const inicio = prev ? prev.fin + 0.02 : 0.1;
      const fin = sig ? Math.max(inicio + 0.08, sig.inicio - 0.02) : Math.min(duracionAudio, inicio + 0.25);
      palabras.push({ texto: tokens[i], inicio, fin });
    }
  }
  return palabras;
};

const [id, ...banderas] = process.argv.slice(2);
if (!id) { console.error('uso: npx tsx scripts/diagnostico-voz.mts <id> [--viejo] [--todo]'); process.exit(2); }
const viejo = banderas.includes('--viejo');
const todo = banderas.includes('--todo');
const dir = path.join(RAIZ, 'public/voz', id);
let marcados = 0, maxGlobal = 0;
console.log(`# ${id} — alineador ${viejo ? 'VIEJO' : 'nuevo'}, umbral ${UMBRAL}s`);
for (let i = 0; fs.existsSync(path.join(dir, `${i}.json`)); i++) {
  const sc = JSON.parse(fs.readFileSync(path.join(dir, `${i}.json`), 'utf8')) as { texto: string; duracionAudio: number; limites?: Habladas[] };
  if (!sc.limites) { console.log(`\n[${i}] sin límites crudos guardados: regenera con voz.mts`); continue; }
  const palabras = viejo ? alinearViejo(sc.texto, sc.limites, sc.duracionAudio) : alinearHabladas(sc.texto, sc.limites, sc.duracionAudio).palabras;
  const desf = desfasePorPalabra(palabras);
  const lineaMax = Math.max(0, ...desf);
  maxGlobal = Math.max(maxGlobal, lineaMax);
  console.log(`\n[${i}] desfaseMax ${lineaMax.toFixed(2)}s  (${sc.limites.length} límites, ${palabras.length} tokens)`);
  palabras.forEach((p, n) => {
    const malo = desf[n] > UMBRAL;
    if (malo) marcados++;
    if (!todo && !malo && !esNumerico(p.texto)) return;
    const cubre = sc.limites!.filter((h) => h.fin > p.inicio + 0.005 && h.inicio < p.fin - 0.005).map((h) => `«${h.texto.trim()}»@${h.inicio.toFixed(2)}`).join(' ');
    const lectura = esNumerico(p.texto) ? ` (se lee: ${numeroAPalabras(p.texto)})` : '';
    console.log(`  ${malo ? '!!' : '  '} ${p.texto.padEnd(16)} ${p.inicio.toFixed(2)}–${p.fin.toFixed(2)}  desfase ${desf[n].toFixed(2)}  límites: ${cubre || '—'}${lectura}`);
  });
}
console.log(`\nresumen: ${marcados} tokens con desfase > ${UMBRAL}s, máximo ${maxGlobal.toFixed(2)}s`);
