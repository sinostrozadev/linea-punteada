/**
 * Prepara un guion de la plantilla `frontera` para renderizar:
 *   npx tsx scripts/preparar-frontera.mts contenido/guiones/<guion>.json
 * 1) valida el guion (EnvoltorioFrontera: fórmula, palabras, índices del mapa),
 * 2) voz (msedge-tts, tiempos por palabra) → public/voz/<id>/,
 * 3) rechaza si el video queda fuera de 110–175 s,
 * 4) cama + SFX (whoosh por escena, tic/trazo por línea dibujada) → public/audio/generado/<id>.wav,
 * 5) fotos de Commons → public/imagenes/<id>/, 6) recorte satelital NASA → public/mapas/<id>.jpg,
 * y escribe salida/trabajo/<id>.props.json (guion + duracionFrames + tiempos + imagenes + fondoMapa + creditos).
 * `creditos` (fuentes, mapa, fotos, voz sintética) lo agrega el diario a la descripción. Luego:
 *   npx remotion render src/index.ts Frontera salida/bandeja/<id>.mp4 --props=salida/trabajo/<id>.props.json
 */
import fs from 'node:fs';
import path from 'node:path';
import { generarVoz } from './voz.mjs';
import { generarSonido } from './sonido.mjs';
import { prepararImagenes } from './imagenes.mjs';
import { prepararFondo } from './mapas.mjs';
import { EnvoltorioFrontera, GuionFrontera } from '../src/plantillas/frontera/guion';
import { DURACION_TRAZO_SEG, inicioDeEscena } from '../src/plantillas/frontera/mapa';
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
const plan = planificar(guion, tiempos, FORMATO.fps);
if (plan.duracionSeg < RITMO.shortMin || plan.duracionSeg > RITMO.shortMax) {
  console.error(`✗ duración ${plan.duracionSeg.toFixed(1)} s fuera de ${RITMO.shortMin}–${RITMO.shortMax} s (${guion.id}). ${plan.duracionSeg < RITMO.shortMin ? 'Alarga' : 'Recorta'} escenas.`);
  process.exit(1);
}

// Eventos propios del mapa: un "trazo" (tic + ticks suaves) por cada línea que se dibuja.
const inicioEscena = (i: number) => plan.escenas[i]?.linea.inicio;
const eventos: Evento[] = [
  ...plan.eventos,
  ...guion.mapa.lineas.map((l) => ({ t: inicioDeEscena(inicioEscena, l.dibujarEn), tipo: 'trazo' as const, fuerza: 1, dur: DURACION_TRAZO_SEG })),
  ...(guion.mapa.marcadores ?? []).filter((m) => m.aparecerEn >= 0).map((m) => ({ t: inicioDeEscena(inicioEscena, m.aparecerEn), tipo: 'tic' as const, fuerza: 0.7 })),
].sort((a, b) => a.t - b.t);
generarSonido(guion.id, plan.duracionSeg, eventos);

const { imagenes, creditos: creditosFotos } = await prepararImagenes(guion.id, guion);
const fondoMapa = await prepararFondo(guion.id, guion.mapa);

const creditos = [
  'Fuentes:',
  ...guion.fuentes.map((f) => `- ${f.texto}: ${f.url}`),
  '',
  `Mapa: ${fondoMapa ? `${fondoMapa.credito.replace(/^Imagen: /, 'imagen satelital ')} (dominio público); ` : ''}vectores de Natural Earth (dominio público). Mapa propio; trazados aproximados.`,
  ...(creditosFotos ? ['', creditosFotos] : []),
  '',
  'Voz sintetizada (contenido sintético). Música y efectos: composición propia.',
].join('\n');

const finales = { ...guion, duracionFrames: plan.duracionFrames, tiempos, imagenes, fondoMapa, creditos };
const salida = path.join(raiz, 'salida/trabajo', `${guion.id}.props.json`);
fs.mkdirSync(path.dirname(salida), { recursive: true });
fs.writeFileSync(salida, JSON.stringify(finales, null, 2) + '\n');
console.log(`props → ${path.relative(raiz, salida)} (${plan.duracionSeg.toFixed(1)} s, ${Object.keys(imagenes).length} foto(s), fondo ${fondoMapa?.capa ?? 'oscuro'})`);
process.exit(0);
