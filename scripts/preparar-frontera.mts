/**
 * Prepara un guion de la plantilla `frontera` para renderizar:
 *   npx tsx scripts/preparar-frontera.mts contenido/guiones/<guion>.json
 * 1) valida el guion (EnvoltorioFrontera: fórmula, palabras, índices del mapa),
 * 2) voz (msedge-tts, tiempos por palabra) → public/voz/<id>/,
 * 3) rechaza si el video queda fuera de 110–175 s,
 * 4) cama + SFX (whoosh por escena, tic/trazo por línea dibujada) → public/audio/generado/<id>.wav,
 * 5) fotos de Commons → public/imagenes/<id>/ (v1 `imagen`), <id>-fotos/ (v2 `foto`) y <id>-polaroids/ (v2 `polaroid`),
 * 6) recortes satelitales por plano (scripts/lib/satelite.mts: Blue Marble con relieve lejos, Sentinel-2 2016 cerca)
 *    y Natural Earth 1:10 M recortado (scripts/lib/geo.mts),
 * y escribe salida/trabajo/<id>.props.json (guion + duracionFrames + tiempos + fotos + polaroids + fondos + geo + creditos).
 * Los SFX salen de la MISMA línea de tiempo visual que el video (frontera/visual.ts): whoosh en cada vuelo de cámara,
 * tic en los cortes, pop suave en máscaras/etiquetas/tarjetas, trazo en líneas y cotas.
 * `creditos` (fuentes, mapa, fotos, voz sintética) lo agrega el diario a la descripción. Luego:
 *   npx remotion render src/index.ts Frontera salida/bandeja/<id>.mp4 --props=salida/trabajo/<id>.props.json
 */
import fs from 'node:fs';
import path from 'node:path';
import { generarVoz } from './voz.mjs';
import { generarSonido } from './sonido.mjs';
import { prepararImagenes } from './imagenes.mjs';
import { bajarFondos, planificarFondos, type Vista } from './lib/satelite.mjs';
import { recortarGeo } from './lib/geo.mjs';
import { EnvoltorioFrontera, GuionFrontera } from '../src/plantillas/frontera/guion';
import { DURACION_TRAZO_SEG, gradosPorPx } from '../src/plantillas/frontera/mapa';
import { FRAMES_CIERRE_V2, T_TITULO, resolverVisual } from '../src/plantillas/frontera/visual';
import { planificar, type Evento } from '../src/plantillas/comun/plan';
import { palabrasDelGuion } from '../src/plantillas/comun/guion';
import { FORMATO, RITMO } from '../src/marca/tokens';

const ruta = process.argv[2];
if (!ruta) { console.error('uso: npx tsx scripts/preparar-frontera.mts <ruta-guion.json>'); process.exit(2); }
const raiz = process.cwd();
const crudo = JSON.parse(fs.readFileSync(path.resolve(ruta), 'utf8'));
const validacion = crudo.plantilla ? EnvoltorioFrontera.safeParse(crudo) : GuionFrontera.safeParse(crudo);
if (!validacion.success) {
  console.error(`✗ guion inválido: ${validacion.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`);
  process.exit(1);
}
const guion = crudo.plantilla ? EnvoltorioFrontera.parse(crudo).props : GuionFrontera.parse(crudo);
console.log(`guion ${guion.id}: ${guion.escenas.length} escenas, ${palabrasDelGuion(guion)} palabras habladas`);

const tiempos = await generarVoz(guion.id, guion);
const plan = planificar(guion, tiempos, FORMATO.fps, FRAMES_CIERRE_V2);
if (plan.duracionSeg < RITMO.shortMin || plan.duracionSeg > RITMO.shortMax) {
  console.error(`✗ duración ${plan.duracionSeg.toFixed(1)} s fuera de ${RITMO.shortMin}–${RITMO.shortMax} s (${guion.id}). ${plan.duracionSeg < RITMO.shortMin ? 'Alarga' : 'Recorta'} escenas.`);
  process.exit(1);
}

// ---------------------------------------------------------------- SFX desde la línea de tiempo visual
const vis = resolverVisual(guion, plan);
const crudos: Evento[] = [
  ...plan.eventos.filter((e) => e.tipo === 'golpe' || e.tipo === 'riser' || e.tipo === 'cierre'),
  { t: T_TITULO - 0.12, tipo: 'whoosh' as const, fuerza: 0.9 },
  // Los micro-movimientos que agrega la plantilla (paneos lentos) no llevan SFX: no son un cambio de plano.
  ...vis.planos.slice(1).filter((p) => !p.micro).map((p) => (p.entrada === 'corte' ? { t: p.t0, tipo: 'tic' as const, fuerza: 0.55 } : { t: Math.max(0, p.t0 - 0.1), tipo: 'whoosh' as const, fuerza: 0.7 })),
  ...vis.trazos.map((t) => ({ t, tipo: 'trazo' as const, fuerza: 1, dur: DURACION_TRAZO_SEG })),
  ...vis.marcadoresDesde.map((t) => ({ t, tipo: 'tic' as const, fuerza: 0.6 })),
  ...vis.areas.map((a) => ({ t: a.desde, tipo: 'pop' as const, fuerza: 0.45 })),
  ...vis.etiquetas.map((a) => ({ t: a.desde, tipo: a.d.tipo === 'pin' ? 'tic' as const : 'pop' as const, fuerza: 0.35 })),
  ...vis.cotas.map((a) => ({ t: a.desde, tipo: 'trazo' as const, fuerza: 0.7, dur: 0.5 })),
  ...vis.iconos.map((a) => ({ t: a.desde, tipo: 'pop' as const, fuerza: 0.5 })),
  ...vis.tarjetas.map((a) => ({ t: a.desde, tipo: 'golpe' as const, fuerza: 0.45 })),
  ...vis.fotos.map((a) => ({ t: Math.max(0, a.desde - 0.08), tipo: 'whoosh' as const, fuerza: 0.75 })),
  ...vis.polaroids.map((a) => ({ t: a.desde, tipo: 'pop' as const, fuerza: 0.6 })),
  ...vis.contextos.map((a) => ({ t: a.desde, tipo: 'pop' as const, fuerza: 0.5 })),
  ...(vis.indice?.items ?? []).map((a) => ({ t: a.desde, tipo: 'pop' as const, fuerza: 0.65 })),
  ...vis.remateEtiquetas.map((a) => ({ t: a.desde, tipo: 'pop' as const, fuerza: 0.6 })),
].sort((a, b) => a.t - b.t);
// Dos SFX a menos de 0,12 s se pisan: queda el más fuerte.
const eventos: Evento[] = [];
for (const e of crudos) {
  const u = eventos[eventos.length - 1];
  if (u && e.t - u.t < 0.12 && u.tipo !== 'golpe' && e.tipo !== 'cierre') { if (e.fuerza > u.fuerza) eventos[eventos.length - 1] = e; continue; }
  eventos.push(e);
}
generarSonido(guion.id, plan.duracionSeg, eventos);

// ---------------------------------------------------------------- fotos (v1 imagen, v2 foto y polaroid)
const { imagenes, creditos: creditosV1 } = await prepararImagenes(guion.id, guion);
const lineas = [guion.gancho, ...guion.escenas];
/** prepararImagenes indexa escenas desde 1: se le pasa la lista de líneas corrida en uno y se corrige el índice. */
const bajarPor = async (sufijo: string, elegir: (l: (typeof lineas)[number]) => { buscar: string; archivo?: string; encuadre?: 'arriba' | 'centro' | 'abajo' } | undefined) => {
  const escenas = lineas.map((l) => ({ ...l, imagen: elegir(l) }));
  if (!escenas.some((e) => e.imagen)) return { imagenes: {}, creditos: '' };
  const r = await prepararImagenes(`${guion.id}-${sufijo}`, { escenas: escenas as never });
  return { imagenes: Object.fromEntries(Object.entries(r.imagenes).map(([k, v]) => [String(Number(k) - 1), v])), creditos: r.creditos };
};
const fotos = await bajarPor('fotos', (l) => l.foto && { buscar: l.foto.buscar, archivo: l.foto.archivo, encuadre: l.foto.encuadre });
const polaroids = await bajarPor('polaroids', (l) => l.polaroid && { buscar: l.polaroid.buscar, archivo: l.polaroid.archivo, encuadre: l.polaroid.encuadre });
const creditosFotos = [creditosV1, fotos.creditos, polaroids.creditos].filter(Boolean).join('\n').replace(/\nImágenes: Wikimedia Commons/g, '');

// ---------------------------------------------------------------- satélite + Natural Earth recortado
const vistas: Vista[] = vis.planos.map((p) => ({ centro: p.centro, zoomMin: Math.min(p.zoom, p.zoom + p.deriva), zoomMax: Math.max(p.zoom, p.zoom + p.deriva) }));
// Vuelos largos de cámara (zoom de 6 a 16): vistas intermedias cada ~2,5 niveles para que no se vea un satélite estirado.
vis.planos.forEach((p, i) => {
  const a = vis.planos[i - 1];
  if (!a || p.entrada !== 'zoom') return;
  const [z0, z1] = [a.zoom + a.deriva, p.zoom];
  const pasos = Math.floor(Math.abs(z1 - z0) / 2.5);
  for (let k = 1; k <= pasos; k++) {
    const z = z0 + ((z1 - z0) * k) / (pasos + 1);
    const centro = (z1 > z0 ? p.centro : a.centro) as [number, number];
    vistas.push({ centro, zoomMin: z - 0.6, zoomMax: z + 0.6 });
  }
});
const tt = guion.tarjetaTitulo;
const zTitulo = tt?.zoom ?? vis.planos[0].zoom - 1.6;
vistas.push({ centro: tt?.centro ?? vis.planos[0].centro, zoomMin: zTitulo, zoomMax: zTitulo + 0.2 });
const fondos = guion.mapa.fondo === 'oscuro' ? [] : await bajarFondos(raiz, guion.id, planificarFondos(vistas, FORMATO.ancho, FORMATO.alto, guion.mapa.mes));
if (guion.mapa.fondo !== 'oscuro' && !fondos.length) console.warn('  ⚠ sin recortes satelitales: el video usará el mapa oscuro de Natural Earth.');
const lejana = vistas.reduce((a, v) => (v.zoomMin < a.zoomMin ? v : a), vistas[0]);
const extension = (v: Vista) => { const g = gradosPorPx(v.zoomMin) * 1.6; return [v.centro[0] - 540 * g, v.centro[1] - 960 * g, v.centro[0] + 540 * g, v.centro[1] + 960 * g]; };
const cajas = vistas.filter((v) => v.zoomMin < 12).map(extension);
const caja = (cajas.length ? cajas : [extension(lejana)]).reduce((a, c) => [Math.min(a[0], c[0]), Math.min(a[1], c[1]), Math.max(a[2], c[2]), Math.max(a[3], c[3])]);
const cajaGeo: [number, number, number, number] = [Math.max(-180, caja[0]), Math.max(-89, caja[1]), Math.min(180, caja[2]), Math.min(89, caja[3])];
const zoomDetalle = Math.min(11, Math.max(...vistas.map((v) => v.zoomMax)));
const paisesPedidos = [...lineas.flatMap((l) => (l.areas ?? []).map((a) => a.pais).filter((x): x is string => !!x)), ...(tt?.paises ?? []), ...(guion.mapa.paises ?? [])];
const geo = recortarGeo(cajaGeo, paisesPedidos, gradosPorPx(zoomDetalle) * 0.6);
console.log(`  geo: ${geo.tierra.length} polígonos de tierra, ${geo.bordes.length} tramos de borde, países ${Object.keys(geo.paises).join(', ') || '—'}`);

const capas = [...new Set(fondos.map((f) => f.credito))];
const creditos = [
  'Fuentes:',
  ...guion.fuentes.map((f) => `- ${f.texto}: ${f.url}`),
  '',
  `Mapa: ${capas.length ? `${capas.join('; ')}; ` : ''}vectores de Natural Earth (dominio público). Mapa propio; trazados aproximados.`,
  ...(creditosFotos ? ['', creditosFotos.startsWith('Imágenes') ? creditosFotos : `Imágenes: Wikimedia Commons\n${creditosFotos}`] : []),
  '',
  'Voz sintetizada (contenido sintético). Música y efectos: composición propia.',
].join('\n');

const finales = { ...guion, duracionFrames: plan.duracionFrames, tiempos, imagenes, fotos: fotos.imagenes, polaroids: polaroids.imagenes, fondos, geo, creditos };
const salida = path.join(raiz, 'salida/trabajo', `${guion.id}.props.json`);
fs.mkdirSync(path.dirname(salida), { recursive: true });
fs.writeFileSync(salida, JSON.stringify(finales, null, 2) + '\n');
console.log(`props → ${path.relative(raiz, salida)} (${plan.duracionSeg.toFixed(1)} s, ${Object.keys(fotos.imagenes).length} foto(s), ${Object.keys(polaroids.imagenes).length} polaroid(s), ${fondos.length} capa(s) satelital(es))`);
process.exit(0);
