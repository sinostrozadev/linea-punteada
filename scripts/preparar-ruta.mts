/**
 * Prepara un guion de la plantilla `ruta` para renderizar:
 *   npx tsx scripts/preparar-ruta.mts contenido/guiones/<guion>.json
 * 1) valida el guion (EnvoltorioRuta: fórmula, palabras, tramos, hitos),
 * 2) voz (msedge-tts, tiempos por palabra) → public/voz/<id>/,
 * 3) rechaza si el video queda fuera de 110–175 s,
 * 4) precalcula el trazado: polilínea densificada por grandes círculos (~50 km), km acumulados, fecha por punto
 *    y puntitos de la línea (el componente solo busca y proyecta por frame),
 * 5) cama + SFX (whoosh por escena, trazo cuando la línea arranca, tic en cada hito) → public/audio/generado/<id>.wav,
 * 6) fotos de Commons → public/imagenes/<id>/, 7) satélite NASA (solo proyección plano) → public/mapas/<id>.jpg,
 * y escribe salida/trabajo/<id>.props.json (guion + duracionFrames + tiempos + trazado + imagenes + fondoMapa + creditos).
 * Luego:
 *   npx remotion render src/index.ts Ruta salida/bandeja/<id>.mp4 --props=salida/trabajo/<id>.props.json
 */
import fs from 'node:fs';
import path from 'node:path';
import { generarVoz } from './voz.mjs';
import { generarSonido } from './sonido.mjs';
import { prepararImagenes } from './imagenes.mjs';
import { prepararFondo } from './mapas.mjs';
import { EnvoltorioRuta, GuionRuta } from '../src/plantillas/ruta/guion';
import type { MapaFrontera } from '../src/plantillas/frontera/guion';
import { DISPOSICION_RUTA, hitosDe, modeloDe, trazadoDe } from '../src/plantillas/ruta/modelo';
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
const plan = planificar(guion, tiempos, FORMATO.fps);
if (plan.duracionSeg < RITMO.shortMin || plan.duracionSeg > RITMO.shortMax) {
  console.error(`✗ duración ${plan.duracionSeg.toFixed(1)} s fuera de ${RITMO.shortMin}–${RITMO.shortMax} s (${guion.id}). ${plan.duracionSeg < RITMO.shortMin ? 'Alarga' : 'Recorta'} escenas.`);
  process.exit(1);
}

const { imagenes, creditos: creditosFotos } = await prepararImagenes(guion.id, guion);

// Trazado precalculado (lo pesado: densificar, km, fechas, puntitos).
const trazado = trazadoDe(guion);
const { tramos, rec } = modeloDe(guion, plan, trazado, (i) => !!imagenes[String(i)]);
console.log(`trazado: ${Math.round(trazado.totalKm).toLocaleString('es-CL')} km, ${trazado.denso.length} vértices, ${trazado.puntitos.length} puntitos cada ${trazado.pasoPuntitoKm.toFixed(1)} km`);
console.log(`tramos por escena: ${tramos.map(([a, b]) => `${a}→${b}`).join(' · ')}`);

// Sonido: trazo cuando la línea arranca en cada escena que se mueve, tic en cada hito alcanzado.
const eventos: Evento[] = [
  ...plan.eventos,
  ...rec.movimientos.filter((m) => m.hasta > m.desde).map((m) => ({ t: m.t0, tipo: 'trazo' as const, fuerza: 0.9, dur: Math.min(1.6, m.t1 - m.t0) })),
  ...hitosDe(guion.mapa).filter((i) => i > 0).map((i) => ({ t: momentoDePunto(rec, i), tipo: 'tic' as const, fuerza: 0.7 })).filter((e) => Number.isFinite(e.t)),
].sort((a, b) => a.t - b.t);
generarSonido(guion.id, plan.duracionSeg, eventos);

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

const creditos = [
  'Fuentes:',
  ...guion.fuentes.map((f) => `- ${f.texto}: ${f.url}`),
  '',
  `Mapa: ${fondoMapa ? `${fondoMapa.credito.replace(/^Imagen: /, 'imagen satelital ')} (dominio público); ` : ''}vectores de Natural Earth (dominio público). Mapa propio; ruta y distancias aproximadas (grandes círculos entre puntos).`,
  ...(creditosFotos ? ['', creditosFotos] : []),
  '',
  'Voz sintetizada (contenido sintético). Música y efectos: composición propia.',
].join('\n');

const finales = { ...guion, duracionFrames: plan.duracionFrames, tiempos, trazado, imagenes, fondoMapa, creditos };
const salida = path.join(raiz, 'salida/trabajo', `${guion.id}.props.json`);
fs.mkdirSync(path.dirname(salida), { recursive: true });
fs.writeFileSync(salida, JSON.stringify(finales) + '\n');
console.log(`props → ${path.relative(raiz, salida)} (${plan.duracionSeg.toFixed(1)} s, ${Object.keys(imagenes).length} foto(s), ${guion.mapa.proyeccion}, cabeza en y=${DISPOSICION_RUTA.cabezaY})`);
process.exit(0);
