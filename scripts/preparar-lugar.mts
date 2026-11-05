/**
 * Prepara un guion de la plantilla `lugar` para renderizar:
 *   npx tsx scripts/preparar-lugar.mts contenido/guiones/<guion>.json
 * 1) valida el guion (EnvoltorioLugar: fórmula, palabras, índices de marcadores),
 * 2) voz (msedge-tts, tiempos por palabra) → public/voz/<id>/,
 * 3) rechaza si el video queda fuera de 110–175 s,
 * 4) cama + SFX (whoosh por escena, tic + trazo por marcador) → public/audio/generado/<id>.wav,
 * 5) fotos de Commons (la principal + las de escena, ≤ 1280 px) → public/imagenes/<id>/,
 * 6) recortes satelitales NASA por niveles de zoom (si fondo ≠ oscuro) → public/mapas/<id>-n<k>.jpg,
 * y escribe salida/trabajo/<id>.props.json (guion + duracionFrames + tiempos + fotoPrincipal + imagenes + fondosMapa + creditos).
 * Luego:
 *   npx remotion render src/index.ts Lugar salida/bandeja/<id>.mp4 --props=salida/trabajo/<id>.props.json
 */
import fs from 'node:fs';
import path from 'node:path';
import { generarVoz } from './voz.mjs';
import { generarSonido } from './sonido.mjs';
import { prepararImagenes, textoCreditos } from './imagenes.mjs';
import { prepararFondo } from './mapas.mjs';
import { bajarFondos, planificarFondos, type Vista } from './lib/satelite.mjs';
import { EnvoltorioLugar, GuionLugar, type FondoNivel } from '../src/plantillas/lugar/guion';
import type { MapaFrontera } from '../src/plantillas/frontera/guion';
import { OFFSET_COMPLETO, centroParaRecorte, nivelesRaster, visualLugar } from '../src/plantillas/lugar/camara';
import { eventosV2 } from '../src/plantillas/lugar/compartido/visualV2';
import { FRAMES_CIERRE_V2 } from '../src/plantillas/frontera/visual';
import { inicioDeEscenaLugar } from '../src/plantillas/lugar/MapaLugar';
import { planificar, type Evento } from '../src/plantillas/comun/plan';
import { palabrasDelGuion, type ImagenesResueltas } from '../src/plantillas/comun/guion';
import { FORMATO, RITMO } from '../src/marca/tokens';

const ruta = process.argv[2];
if (!ruta) { console.error('uso: npx tsx scripts/preparar-lugar.mts <ruta-guion.json>'); process.exit(2); }
const raiz = process.cwd();
const crudo = JSON.parse(fs.readFileSync(path.resolve(ruta), 'utf8'));
const validacion = crudo.plantilla ? EnvoltorioLugar.safeParse(crudo) : GuionLugar.safeParse(crudo);
if (!validacion.success) {
  console.error(`✗ guion inválido: ${validacion.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`);
  process.exit(1);
}
const guion = crudo.plantilla ? EnvoltorioLugar.parse(crudo).props : GuionLugar.parse(crudo);
console.log(`guion ${guion.id}: ${guion.escenas.length} escenas, ${palabrasDelGuion(guion)} palabras habladas`);

const tiempos = await generarVoz(guion.id, guion);
const plan = planificar(guion, tiempos, FORMATO.fps, FRAMES_CIERRE_V2);
if (plan.duracionSeg < RITMO.shortMin || plan.duracionSeg > RITMO.shortMax) {
  console.error(`✗ duración ${plan.duracionSeg.toFixed(1)} s fuera de ${RITMO.shortMin}–${RITMO.shortMax} s (${guion.id}). ${plan.duracionSeg < RITMO.shortMin ? 'Alarga' : 'Recorta'} escenas.`);
  process.exit(1);
}

// SFX: los de la dirección visual v2 + por marcador un tic al aparecer y un trazo mientras se dibuja la línea al punto.
const vis = visualLugar(guion, plan);
const inicioEscena = (i: number) => plan.escenas[i]?.linea.inicio;
const propios: Evento[] = [
  // v1 (sin planos): un whoosh por escena, como antes.
  ...(vis.v2 ? [] : plan.eventos.filter((e) => e.tipo === 'whoosh')),
  ...(guion.mapa.marcadores ?? []).flatMap((m) => {
    const t = inicioDeEscenaLugar(inicioEscena, m.aparecerEn);
    return [{ t, tipo: 'tic' as const, fuerza: 0.7 }, { t, tipo: 'trazo' as const, fuerza: 0.8, dur: 1.3 }];
  }),
];
generarSonido(guion.id, plan.duracionSeg, eventosV2(vis, plan, propios));

// Fotos: prepararImagenes indexa por escena (1..n). Se le pasa la principal como "escena 0" y se reindexa:
// devuelto 1 = principal, devuelto k+2 = escena k (línea de voz k+1). Así la principal pasa por el mismo filtro de
// licencias, tamaño, restricciones y caché que el resto.
const { imagenes: crudas } = await prepararImagenes(guion.id, { escenas: [{ tipo: 'acto', texto: '', imagen: guion.imagenPrincipal }, ...guion.escenas] });
const fotoPrincipal = crudas['1'];
const imagenes: ImagenesResueltas = {};
guion.escenas.forEach((_, k) => { const im = crudas[String(k + 2)]; if (im) imagenes[String(k + 1)] = im; });
if (!fotoPrincipal) console.warn('  ⚠ sin foto principal válida: el video pasa a vista mapa (salvo escenas con foto propia).');
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
const creditosFotos = textoCreditos({
  ...(fotoPrincipal ? { p: fotoPrincipal } : {}), ...imagenes,
  ...Object.fromEntries(Object.entries(fotos.imagenes).map(([k, v]) => [`f${k}`, v])),
  ...Object.fromEntries(Object.entries(polaroids.imagenes).map(([k, v]) => [`p${k}`, v])),
});

// Satélite. v2: recortes por plano (los mismos helpers que frontera). v1: un recorte por nivel de zoom.
const fondosMapa: FondoNivel[] = [];
if (guion.mapa.fondo !== 'oscuro' && vis.v2) {
  const punto = guion.mapa.punto as [number, number];
  const vistas: Vista[] = vis.planos.map((p) => ({ centro: p.centro as [number, number], zoomMin: Math.min(p.zoom, p.zoom + p.deriva), zoomMax: Math.max(p.zoom, p.zoom + p.deriva) }));
  // Vuelos largos de cámara: vistas intermedias cada ~2,5 niveles (como frontera).
  vis.planos.forEach((p, i) => {
    const a = vis.planos[i - 1];
    if (!a || p.entrada !== 'zoom') return;
    const [z0, z1] = [a.zoom + a.deriva, p.zoom];
    const pasos = Math.floor(Math.abs(z1 - z0) / 2.5);
    for (let k = 1; k <= pasos; k++) {
      const z = z0 + ((z1 - z0) * k) / (pasos + 1);
      vistas.push({ centro: (z1 > z0 ? p.centro : a.centro) as [number, number], zoomMin: z - 0.6, zoomMax: z + 0.6 });
    }
  });
  // El inset (centrado en el punto, zoom del plano − OFFSET_COMPLETO) y la tarjeta de título.
  const zInsetMin = Math.max(1.5, Math.min(...vis.planos.map((p) => p.zoom)) - OFFSET_COMPLETO);
  vistas.push({ centro: punto, zoomMin: zInsetMin, zoomMax: zInsetMin + 1 });
  const tt = guion.tarjetaTitulo;
  const zTitulo = tt?.zoom ?? vis.planos[0].zoom - 1.6;
  vistas.push({ centro: (tt?.centro ?? punto) as [number, number], zoomMin: zTitulo, zoomMax: zTitulo + 0.2 });
  fondosMapa.push(...(await bajarFondos(raiz, guion.id, planificarFondos(vistas, FORMATO.ancho, FORMATO.alto, undefined))));
  if (!fondosMapa.length) console.warn('  ⚠ sin recortes satelitales: el mapa usará vectores oscuros de Natural Earth.');
} else if (guion.mapa.fondo !== 'oscuro') {
  for (const [k, zoom] of nivelesRaster(guion.mapa).entries()) {
    const falso = { fondo: guion.mapa.fondo, centro: centroParaRecorte(guion.mapa.punto, zoom, FORMATO.alto), zoomInicial: zoom, zoomFinal: zoom, lineas: [] } as unknown as MapaFrontera;
    const f = await prepararFondo(`${guion.id}-n${k}`, falso);
    if (f) fondosMapa.push({ ...f, zoom });
  }
  if (!fondosMapa.length) console.warn('  ⚠ sin recortes satelitales: el mapa usará vectores oscuros de Natural Earth.');
}
const capas = [...new Set(fondosMapa.map((f) => f.credito.replace(/^Imagen: /, '')))];

const creditos = [
  'Fuentes:',
  ...guion.fuentes.map((f) => `- ${f.texto}: ${f.url}`),
  '',
  `Mapa: ${capas.length ? `imagen satelital ${capas.join(' y ')} (dominio público); ` : ''}vectores de Natural Earth (dominio público). Mapa propio.`,
  ...(creditosFotos ? ['', creditosFotos] : []),
  '',
  'Voz sintetizada (contenido sintético). Música y efectos: composición propia.',
].join('\n');

const finales = { ...guion, duracionFrames: plan.duracionFrames, tiempos, fotoPrincipal, imagenes, fotos: fotos.imagenes, polaroids: polaroids.imagenes, fondosMapa, creditos };
const salida = path.join(raiz, 'salida/trabajo', `${guion.id}.props.json`);
fs.mkdirSync(path.dirname(salida), { recursive: true });
fs.writeFileSync(salida, JSON.stringify(finales, null, 2) + '\n');
console.log(`props → ${path.relative(raiz, salida)} (${plan.duracionSeg.toFixed(1)} s, foto principal ${fotoPrincipal ? 'sí' : 'NO'}, ${Object.keys(imagenes).length} foto(s) de escena, ${Object.keys(fotos.imagenes).length} foto(s) v2, ${Object.keys(polaroids.imagenes).length} polaroid(s), ${fondosMapa.length} recorte(s) satelital(es))`);
process.exit(0);
