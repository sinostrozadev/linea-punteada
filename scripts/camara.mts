/**
 * Revisión de la GRAMÁTICA DE CÁMARA de uno o varios guiones (docs/DIRECCION-VISUAL.md §1b):
 *   npx tsx scripts/camara.mts <guion.json> [<guion2.json> …] [--props salida/trabajo/<id>.props.json] [--solo-resumen]
 * Imprime la tabla de planos (línea, en, zoom→zoom final, Δzoom, distancia, en cuadro, entrada, duración) y las
 * violaciones R1–R5. Duración: por palabras (estimada) o, con --props, con los tiempos reales de la voz.
 * Sale con código 1 si algún guion tiene violaciones (sirve en la mejora continua y en CI).
 */
import fs from 'node:fs';
import path from 'node:path';
import { medirCamara, violacionesCamara, type GuionCam } from '../src/plantillas/comun/camara';
import type { Tiempos } from '../src/plantillas/comun/plan';

const args = process.argv.slice(2);
const iProps = args.indexOf('--props');
const propsRuta = iProps >= 0 ? args[iProps + 1] : undefined;
const soloResumen = args.includes('--solo-resumen');
const rutas = args.filter((a, i) => !a.startsWith('--') && (iProps < 0 || i !== iProps + 1));
if (!rutas.length) { console.error('uso: npx tsx scripts/camara.mts <guion.json> [...] [--props <props.json>] [--solo-resumen]'); process.exit(2); }

const f = (x: number | null, d = 1) => (x === null ? '—' : x.toFixed(d).replace('.', ','));
const pad = (s: string, n: number) => (s.length >= n ? s.slice(0, n) : s + ' '.repeat(n - s.length));
let fallas = 0;

for (const ruta of rutas) {
  const crudo = JSON.parse(fs.readFileSync(path.resolve(ruta), 'utf8'));
  const plantilla: string = crudo.plantilla ?? (crudo.mapa?.punto ? 'lugar' : crudo.mapa?.lineas ? 'frontera' : 'ruta');
  const g: GuionCam = crudo.props ?? crudo;
  const tiempos: Tiempos | undefined = propsRuta && rutas.length === 1 ? JSON.parse(fs.readFileSync(path.resolve(propsRuta), 'utf8')).tiempos : crudo.tiempos;
  const medidos = medirCamara(g, { continua: plantilla === 'frontera', tiempos });
  const v = violacionesCamara(medidos, { estimado: !tiempos });
  if (v.length) fallas++;
  const total = medidos.length ? medidos[medidos.length - 1].t1 - medidos[0].t0 : 0;
  const cortes = medidos.filter((m) => m.p.entrada === 'corte').length;
  console.log(`\n■ ${path.basename(ruta)} (${plantilla}, tiempos ${tiempos ? 'reales' : 'estimados'}): ${medidos.length} planos en ${f(total)} s → ${f(total / Math.max(1, medidos.length), 2)} s/plano · ${cortes} cortes · ${v.length} violaciones`);
  if (!soloResumen) {
    console.log(`  ${pad('línea', 13)}${pad('j', 3)}${pad('t0', 7)}${pad('dur', 6)}${pad('en', 14)}${pad('zoom→fin', 12)}${pad('Δz', 7)}${pad('dist°', 8)}${pad('cuadro', 8)}entrada`);
    for (const m of medidos) {
      const en = m.p.en === undefined ? (m.p.duracionSeg ? `dur ${m.p.duracionSeg}` : '') : String(m.p.en);
      const cuadro = m.enCuadroPrevio === null ? '—' : f(m.enCuadroPrevio, 2);
      console.log(`  ${pad(m.nombre, 13)}${pad(String(m.j), 3)}${pad(f(m.t0), 7)}${pad(f(m.dur), 6)}${pad(en, 14)}${pad(`${f(m.p.zoom)}→${f(m.zoomFin)}`, 12)}${pad(m.dz === null ? '—' : (m.dz > 0 ? '+' : '') + f(m.dz), 7)}${pad(f(m.distGrados, 2), 8)}${pad(cuadro, 8)}${m.p.entrada}`);
    }
    console.log('  (cuadro = distancia del centro nuevo en medios cuadros del encuadre anterior: ≤ 0,9 = estaba a la vista)');
  }
  for (const x of v) console.log(`  ✗ ${x.regla} · ${x.donde}: ${x.mensaje}`);
}
process.exit(fallas ? 1 : 0);
