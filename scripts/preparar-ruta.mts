/**
 * Prepara un guion de la plantilla `ruta` para renderizar:
 *   npx tsx scripts/preparar-ruta.mts contenido/guiones/<guion>.json
 * 1) valida el guion (EnvoltorioRuta: fórmula, palabras, tramos, hitos),
 * 2) voz (msedge-tts, tiempos por palabra) → public/voz/<id>/,
 * 3) rechaza si el video queda fuera de 110–175 s,
 * 4) precalcula el trazado: polilínea densificada por grandes círculos (~50 km), km acumulados, fecha por punto
 *    y puntitos de la línea (el componente solo busca y proyecta por frame),
 * 5) cama + SFX desde la línea de tiempo visual v2 (cortes, máscaras, cotas, tarjetas, polaroids…) + trazo cuando la
 *    línea arranca y tic en cada hito → public/audio/generado/<id>.wav,
 * 6) fotos de Commons: v1 `imagen` → public/imagenes/<id>/; v2 `foto` → <id>-fotos/, `polaroid` → <id>-polaroids/
 *    (mismo helper que preparar-frontera),
 * 7) satélite: proyección plano = recorte NASA → public/mapas/<id>.jpg; globo (fondo ≠ oscuro) = textura Blue Marble
 *    mundial 4096×2048 + recortes regionales para los planos cercanos (scripts/lib/satelite.mts) → public/mapas/<id>-globo-f<n>.jpg,
 * y escribe salida/trabajo/<id>.props.json (guion + duracionFrames + tiempos + trazado + imagenes + fotos + polaroids +
 * fondoMapa + texturasGlobo + creditos).
 * Luego:
 *   npx remotion render src/index.ts Ruta salida/bandeja/<id>.mp4 --props=salida/trabajo/<id>.props.json
 */
import fs from 'node:fs';
import path from 'node:path';
import { generarVoz } from './voz.mjs';
import { generarSonido } from './sonido.mjs';
import { prepararImagenes } from './imagenes.mjs';
import { prepararFondo } from './mapas.mjs';
import { CAPAS, bajarFondos } from './lib/satelite.mjs';
import { EnvoltorioRuta, GuionRuta } from '../src/plantillas/ruta/guion';
import type { MapaFrontera } from '../src/plantillas/frontera/guion';
import { DISPOSICION_RUTA_V2, hitosDe, modeloDe, trazadoDe, visualRuta } from '../src/plantillas/ruta/modelo';
import { eventosV2 } from '../src/plantillas/lugar/compartido/visualV2';
import { FRAMES_CIERRE_V2 } from '../src/plantillas/frontera/visual';
import { gradosPorPx } from '../src/plantillas/frontera/mapa';
import type { ImagenesResueltas } from '../src/plantillas/comun/guion';
import { limitesEscala, vistaGeneral } from '../src/plantillas/ruta/camara';
import { momentoDePunto } from '../src/plantillas/ruta/trazado';
import { planificar, type Evento } from '../src/plantillas/comun/plan';
import { palabrasDelGuion } from '../src/plantillas/comun/guion';
import { FORMATO, RITMO } from '../src/marca/tokens';

const ruta = process.argv[2];
if (!ruta) { console.error('uso: npx tsx scripts/preparar-ruta.mts <ruta-guion.json>'); process.exit(2); }
const raiz = process.cwd();
const crudo = JSON.parse(fs.readFileSync(path.resolve(ruta), 'utf8'));
const validacion = crudo.plantilla ? EnvoltorioRuta.safeParse(crudo) : GuionRuta.safeParse(crudo);
if (!validacion.success) {
  console.error(`✗ guion inválido: ${validacion.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`);
  process.exit(1);
}
const guion = crudo.plantilla ? EnvoltorioRuta.parse(crudo).props : GuionRuta.parse(crudo);
console.log(`guion ${guion.id}: ${guion.escenas.length} escenas, ${palabrasDelGuion(guion)} palabras habladas, ${guion.mapa.puntos.length} puntos`);

const tiempos = await generarVoz(guion.id, guion);
const plan = planificar(guion, tiempos, FORMATO.fps, FRAMES_CIERRE_V2);
if (plan.duracionSeg < RITMO.shortMin || plan.duracionSeg > RITMO.shortMax) {
  console.error(`✗ duración ${plan.duracionSeg.toFixed(1)} s fuera de ${RITMO.shortMin}–${RITMO.shortMax} s (${guion.id}). ${plan.duracionSeg < RITMO.shortMin ? 'Alarga' : 'Recorta'} escenas.`);
  process.exit(1);
}

const { imagenes, creditos: creditosV1 } = await prepararImagenes(guion.id, guion);
// v2: foto a pantalla completa y polaroid por línea de voz (0 = gancho), igual que preparar-frontera.
const lineas = [guion.gancho, ...guion.escenas];
const bajarPor = async (sufijo: string, elegir: (l: (typeof lineas)[number]) => { buscar: string; archivo?: string; encuadre?: 'arriba' | 'centro' | 'abajo' } | undefined) => {
  const escenas = lineas.map((l) => ({ ...l, imagen: elegir(l) }));
  if (!escenas.some((e) => e.imagen)) return { imagenes: {} as ImagenesResueltas, creditos: '' };
  const r = await prepararImagenes(`${guion.id}-${sufijo}`, { escenas: escenas as never });
  return { imagenes: Object.fromEntries(Object.entries(r.imagenes).map(([k, v]) => [String(Number(k) - 1), v])) as ImagenesResueltas, creditos: r.creditos };
};
const fotos = await bajarPor('fotos', (l) => l.foto && { buscar: l.foto.buscar, archivo: l.foto.archivo, encuadre: l.foto.encuadre });
const polaroids = await bajarPor('polaroids', (l) => l.polaroid && { buscar: l.polaroid.buscar, archivo: l.polaroid.archivo, encuadre: l.polaroid.encuadre });
const creditosFotos = [creditosV1, fotos.creditos, polaroids.creditos].filter(Boolean).join('\n').replace(/\nImágenes: Wikimedia Commons/g, '');

// Trazado precalculado (lo pesado: densificar, km, fechas, puntitos).
const trazado = trazadoDe(guion);
const { tramos, rec } = modeloDe(guion, plan, trazado, () => false, true);
console.log(`trazado: ${Math.round(trazado.totalKm).toLocaleString('es-CL')} km, ${trazado.denso.length} vértices, ${trazado.puntitos.length} puntitos cada ${trazado.pasoPuntitoKm.toFixed(1)} km`);
console.log(`tramos por escena: ${tramos.map(([a, b]) => `${a}→${b}`).join(' · ')}`);

// Sonido: los de la dirección visual v2 + trazo cuando la línea arranca en cada escena que se mueve y tic en cada hito.
const vis = visualRuta(guion, plan);
const propios: Evento[] = [
  ...(vis.v2 ? [] : plan.eventos.filter((e) => e.tipo === 'whoosh')),
  ...rec.movimientos.filter((m) => m.hasta > m.desde).map((m) => ({ t: m.t0, tipo: 'trazo' as const, fuerza: 0.9, dur: Math.min(1.6, m.t1 - m.t0) })),
  ...hitosDe(guion.mapa).filter((i) => i > 0).map((i) => ({ t: momentoDePunto(rec, i), tipo: 'tic' as const, fuerza: 0.7 })).filter((e) => Number.isFinite(e.t)),
];
generarSonido(guion.id, plan.duracionSeg, eventosV2(vis, plan, propios));

// Satélite: solo en plano. Se pide la caja que cubre la vista alrededor de cada punto a la escala mínima.
let fondoMapa;
if (guion.mapa.proyeccion === 'plano' && guion.mapa.fondo !== 'oscuro') {
  const { kMin } = limitesEscala(guion.mapa, FORMATO.ancho);
  const kVista = Math.min(kMin, vistaGeneral(trazado, guion.mapa, FORMATO.ancho).k);
  const zoomMin = Math.log2((kVista * 2 * Math.PI) / 256);
  const pseudo = {
    fondo: guion.mapa.fondo, centro: [guion.mapa.puntos[0].lon, guion.mapa.puntos[0].lat], zoomInicial: zoomMin, zoomFinal: zoomMin, lineas: [],
    zooms: guion.mapa.puntos.map((p) => ({ escena: 0, centro: [p.lon, p.lat], zoom: zoomMin })),
  } as unknown as MapaFrontera;
  fondoMapa = await prepararFondo(guion.id, pseudo);
}

// Globo v2: textura Blue Marble mundial + recortes regionales para los planos cercanos (zoom ≥ 4,5).
let texturasGlobo: Awaited<ReturnType<typeof bajarFondos>> = [];
if (guion.mapa.proyeccion === 'globo' && guion.mapa.fondo !== 'oscuro') {
  const capaLejos = guion.mapa.mes ? CAPAS.mensual(guion.mapa.mes) : CAPAS.relieve;
  type Pedido = Parameters<typeof bajarFondos>[2][number];
  const pedidos: Pedido[] = [{ capa: capaLejos, bbox: [-180, -90, 180, 90], gradosPx: 360 / 4096, zoom: 0 }];
  for (const p of vis.v2 ? vis.planos : []) {
    const z = Math.min(p.zoom, p.zoom + p.deriva);
    if (z < 4.5) continue;
    const g = gradosPorPx(z);
    const [lon, lat] = p.centro;
    const cos = Math.max(0.2, Math.cos((lat * Math.PI) / 180));
    const r = (x: number) => Math.round(x * 1e4) / 1e4;
    const bbox: [number, number, number, number] = [
      r(Math.max(-180, lon - (FORMATO.ancho / 2) * g * 1.5 / cos)), r(Math.max(-89, lat - (FORMATO.alto / 2) * g * 1.3)),
      r(Math.min(180, lon + (FORMATO.ancho / 2) * g * 1.5 / cos)), r(Math.min(89, lat + (FORMATO.alto / 2) * g * 1.3)),
    ];
    if (pedidos.some((q) => q.zoom > 0 && q.bbox[0] <= bbox[0] && q.bbox[1] <= bbox[1] && q.bbox[2] >= bbox[2] && q.bbox[3] >= bbox[3] && q.gradosPx <= g * 1.5)) continue;
    const lado = Math.max(bbox[2] - bbox[0], bbox[3] - bbox[1]);
    pedidos.push({ capa: z >= 9 ? CAPAS.sentinel : capaLejos, respaldo: z >= 9 ? CAPAS.landsat : undefined, bbox, gradosPx: Math.max(g * 0.8, lado / 2048), zoom: z });
  }
  texturasGlobo = await bajarFondos(raiz, `${guion.id}-globo`, pedidos);
  if (!texturasGlobo.length) console.warn('  ⚠ sin textura del globo: se verá con continentes en vectores.');
}

const creditos = [
  'Fuentes:',
  ...guion.fuentes.map((f) => `- ${f.texto}: ${f.url}`),
  '',
  `Mapa: ${fondoMapa ? `${fondoMapa.credito.replace(/^Imagen: /, 'imagen satelital ')} (dominio público); ` : ''}${texturasGlobo.length ? `${[...new Set(texturasGlobo.map((f) => f.credito))].join('; ')}; ` : ''}vectores de Natural Earth (dominio público). Mapa propio; ruta y distancias aproximadas (grandes círculos entre puntos).`,
  ...(creditosFotos ? ['', creditosFotos] : []),
  '',
  'Voz sintetizada (contenido sintético). Música y efectos: composición propia.',
].join('\n');

const finales = { ...guion, duracionFrames: plan.duracionFrames, tiempos, trazado, imagenes, fotos: fotos.imagenes, polaroids: polaroids.imagenes, fondoMapa, texturasGlobo, creditos };
const salida = path.join(raiz, 'salida/trabajo', `${guion.id}.props.json`);
fs.mkdirSync(path.dirname(salida), { recursive: true });
fs.writeFileSync(salida, JSON.stringify(finales) + '\n');
console.log(`props → ${path.relative(raiz, salida)} (${plan.duracionSeg.toFixed(1)} s, ${Object.keys(imagenes).length} foto(s) v1, ${Object.keys(fotos.imagenes).length} foto(s), ${Object.keys(polaroids.imagenes).length} polaroid(s), ${texturasGlobo.length} textura(s) de globo, ${guion.mapa.proyeccion}, cabeza en y=${DISPOSICION_RUTA_V2.cabezaY})`);
process.exit(0);
