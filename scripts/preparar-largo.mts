/**
 * Prepara un guion de la plantilla `largo` (16:9) para renderizar:
 *   npx tsx scripts/preparar-largo.mts <guion-largo.json> [--prueba] [--forzar]
 * 1) valida el guion (EnvoltorioLargo o props sueltos: esquema, cámara R1–R5 estimada, tramos, "suscríbete", cifras con
 *    punto de miles),
 * 2) voz por bloque (msedge-tts, mismo locutor y prosodia que los Shorts) → public/voz/<id>/, y le inserta las pausas
 *    de la tarjeta de título y de las tarjetas de capítulo,
 * 3) RECHAZA si: duración fuera de 8:00–10:30 (con --prueba: 30 s–10:30), cámara R1–R5 con la voz real, tramos
 *    estáticos > 8 s, capítulo > 150 s sin plano nuevo, texto flash < 1 s, tarjetas con < 1 s por 3 palabras,
 *    apertura > 20 s,
 * 4) trazado precalculado, cama + SFX (public/audio/generado/<id>.wav), fotos y polaroids de Commons, texturas del
 *    globo / recorte satelital (igual que preparar-ruta),
 * y escribe salida/trabajo/<id>.props.json (+ <id>.capitulos.json con los minutos para la descripción).
 * Luego: npx tsx scripts/render-largo.mts <guion-largo.json>
 */
import fs from 'node:fs';
import path from 'node:path';
import { generarVoz } from './voz.mjs';
import { generarSonido } from './sonido.mjs';
import { prepararImagenes } from './imagenes.mjs';
import { prepararFondo } from './mapas.mjs';
import { CAPAS, bajarFondos } from './lib/satelite.mjs';
import type { MapaFrontera } from '../src/plantillas/frontera/guion';
import type { ImagenesResueltas } from '../src/plantillas/comun/guion';
import { textosDelGuion, type Evento } from '../src/plantillas/comun/plan';
import { erroresCamara, medirCamara, violacionesCamara } from '../src/plantillas/comun/camara';
import { eventosV2 } from '../src/plantillas/lugar/compartido/visualV2';
import { gradosPorPx } from '../src/plantillas/frontera/mapa';
import { hitosDe } from '../src/plantillas/ruta/modelo';
import { limitesEscala, vistaGeneral } from '../src/plantillas/ruta/camara';
import { momentoDePunto } from '../src/plantillas/ruta/trazado';
import { EnvoltorioLargo, GuionLargoValidado, aplanar, pathOriginal, textosHablados, type GuionLargo } from '../src/plantillas/largo/guion';
import { DURACION_MAX, DURACION_MIN, LARGO, ajustarTiempos, capitulosEn, marcaTiempo, modeloLargo, planLargo, problemasDeRitmo, trazadoLargo } from '../src/plantillas/largo/modelo';
import { contarPalabras } from '../src/plantillas/comun/guion';

const args = process.argv.slice(2);
const ruta = args.find((a) => !a.startsWith('--'));
const prueba = args.includes('--prueba');
/** --forzar: SOLO para pruebas de la plantilla: imprime los rechazos de duración/cámara/ritmo pero escribe los props igual. */
const forzar = args.includes('--forzar');
if (!ruta) { console.error('uso: npx tsx scripts/preparar-largo.mts <guion-largo.json> [--prueba]'); process.exit(2); }
const raiz = process.cwd();
const crudo = JSON.parse(fs.readFileSync(path.resolve(ruta), 'utf8'));
const validacion = crudo.plantilla ? EnvoltorioLargo.safeParse(crudo) : GuionLargoValidado.safeParse(crudo);
if (!validacion.success) {
  console.error(`✗ guion inválido:\n${validacion.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n')}`);
  process.exit(1);
}
const guion: GuionLargo = crudo.plantilla ? (validacion.data as { props: GuionLargo }).props : (validacion.data as GuionLargo);
const flat = aplanar(guion);
const palabras = textosHablados(guion).reduce((s, t) => s + contarPalabras(t), 0);
console.log(`guion largo ${guion.id}: ${guion.capitulos.length} capítulos, ${flat.escenas.length} bloques, ${palabras} palabras habladas, ${guion.mapa.puntos.length} puntos`);

// 2) Voz (mismas líneas que la forma `ruta`: apertura, bloques, remate) + pausas de título y capítulos.
const tiempos = ajustarTiempos(await generarVoz(guion.id, flat, textosDelGuion(flat)), guion);
const plan = planLargo(guion, tiempos);

// 3) Rechazos.
const problemas: string[] = [];
const minimo = prueba ? 30 : DURACION_MIN;
if (plan.duracionSeg < minimo || plan.duracionSeg > DURACION_MAX) {
  problemas.push(`duración ${marcaTiempo(plan.duracionSeg)} fuera de ${marcaTiempo(minimo)}–${marcaTiempo(DURACION_MAX)} (${palabras} palabras; ≈ ${Math.round(palabras / (tiempos.total / 60))} palabras/min)`);
}
for (const x of erroresCamara(violacionesCamara(medirCamara(flat, { continua: false, tiempos }), { estimado: false }))) {
  problemas.push(`cámara ${x.regla} · ${pathOriginal(guion, x.path).join('.')} (${x.donde}): ${x.mensaje}`);
}
const tr = trazadoLargo(guion);
const m = modeloLargo(guion, plan, tr);
for (const p of problemasDeRitmo(guion, plan, m)) problemas.push(`ritmo/${p.regla} · ${p.donde}: ${p.mensaje}`);
const caps = capitulosEn(guion, plan);
caps.forEach((c) => { if (c.hasta - c.desde < 10) problemas.push(`capítulo "${c.titulo}" dura ${(c.hasta - c.desde).toFixed(1)} s: YouTube exige ≥ 10 s por capítulo`); });
if (problemas.length) {
  console.error(`✗ guion rechazado (${problemas.length}):\n${problemas.map((p) => `  - ${p}`).join('\n')}`);
  if (!forzar) process.exit(1);
  console.error('  ⚠ --forzar: sigo igual (NO renderizar esto para publicar).');
}
console.log(`duración ${marcaTiempo(plan.duracionSeg)} (${plan.duracionSeg.toFixed(1)} s) · capítulos: ${caps.map((c) => `${marcaTiempo(c.desde)} ${c.titulo}`).join(' · ')}`);

// 4) Fotos y polaroids por línea de voz (0 = apertura), como preparar-ruta.
const lineas = [flat.gancho, ...flat.escenas];
const bajarPor = async (sufijo: string, elegir: (l: (typeof lineas)[number]) => { buscar: string; archivo?: string; encuadre?: 'arriba' | 'centro' | 'abajo' } | undefined) => {
  const escenas = lineas.map((l) => ({ ...l, imagen: elegir(l) }));
  if (!escenas.some((e) => e.imagen)) return { imagenes: {} as ImagenesResueltas, creditos: '' };
  const r = await prepararImagenes(`${guion.id}-${sufijo}`, { escenas: escenas as never });
  return { imagenes: Object.fromEntries(Object.entries(r.imagenes).map(([k, v]) => [String(Number(k) - 1), v])) as ImagenesResueltas, creditos: r.creditos };
};
const fotos = await bajarPor('fotos', (l) => l.foto && { buscar: l.foto.buscar, archivo: l.foto.archivo, encuadre: l.foto.encuadre });
const polaroids = await bajarPor('polaroids', (l) => l.polaroid && { buscar: l.polaroid.buscar, archivo: l.polaroid.archivo, encuadre: l.polaroid.encuadre });
const creditosFotos = [fotos.creditos, polaroids.creditos].filter(Boolean).join('\n').replace(/\nImágenes: Wikimedia Commons/g, '');

console.log(`trazado: ${Math.round(tr.totalKm).toLocaleString('es-CL')} km, ${tr.denso.length} vértices, ${tr.puntitos.length} puntitos · tramos ${m.tramos.map(([a, b]) => `${a}→${b}`).join(' ')}`);

// Sonido: SFX de la dirección visual + trazo cuando la línea arranca + tic en cada hito.
const propios: Evento[] = [
  ...m.rec.movimientos.filter((x) => x.hasta > x.desde).map((x) => ({ t: x.t0, tipo: 'trazo' as const, fuerza: 0.9, dur: Math.min(1.6, x.t1 - x.t0) })),
  ...hitosDe(guion.mapa).filter((i) => i > 0).map((i) => ({ t: momentoDePunto(m.rec, i), tipo: 'tic' as const, fuerza: 0.7 })).filter((e) => Number.isFinite(e.t)),
  ...caps.filter((c) => c.n >= 1).map((c) => ({ t: c.desde, tipo: 'whoosh' as const, fuerza: 0.9 })),
];
generarSonido(guion.id, plan.duracionSeg, eventosV2(m.vis, plan, propios));

// Satélite (plano) o texturas Blue Marble (globo).
let fondoMapa;
if (guion.mapa.proyeccion === 'plano' && guion.mapa.fondo !== 'oscuro') {
  const { kMin } = limitesEscala(guion.mapa, LARGO.ref);
  const kVista = Math.min(kMin, vistaGeneral(tr, guion.mapa, LARGO.ref).k);
  const zoomMin = Math.log2((kVista * 2 * Math.PI) / 256) - 0.6; // 16:9 ve más a los lados
  const pseudo = {
    fondo: guion.mapa.fondo, centro: [guion.mapa.puntos[0].lon, guion.mapa.puntos[0].lat], zoomInicial: zoomMin, zoomFinal: zoomMin, lineas: [],
    zooms: guion.mapa.puntos.map((p) => ({ escena: 0, centro: [p.lon, p.lat], zoom: zoomMin })),
  } as unknown as MapaFrontera;
  fondoMapa = await prepararFondo(guion.id, pseudo);
}
let texturasGlobo: Awaited<ReturnType<typeof bajarFondos>> = [];
if (guion.mapa.proyeccion === 'globo' && guion.mapa.fondo !== 'oscuro') {
  const capaLejos = guion.mapa.mes ? CAPAS.mensual(guion.mapa.mes) : CAPAS.relieve;
  type Pedido = Parameters<typeof bajarFondos>[2][number];
  const pedidos: Pedido[] = [{ capa: capaLejos, bbox: [-180, -90, 180, 90], gradosPx: 360 / 4096, zoom: 0 }];
  for (const p of m.vis.v2 ? m.vis.planos : []) {
    const z = Math.min(p.zoom, p.zoom + p.deriva);
    if (z < 4.5) continue;
    const g = gradosPorPx(z);
    const [lon, lat] = p.centro;
    const cos = Math.max(0.2, Math.cos((lat * Math.PI) / 180));
    const r = (x: number) => Math.round(x * 1e4) / 1e4;
    const bbox: [number, number, number, number] = [
      r(Math.max(-180, lon - (LARGO.ancho / 2) * g * 2 / cos)), r(Math.max(-89, lat - (LARGO.alto / 2) * g * 2)),
      r(Math.min(180, lon + (LARGO.ancho / 2) * g * 2 / cos)), r(Math.min(89, lat + (LARGO.alto / 2) * g * 2)),
    ];
    if (pedidos.some((q) => q.zoom > 0 && q.bbox[0] <= bbox[0] && q.bbox[1] <= bbox[1] && q.bbox[2] >= bbox[2] && q.bbox[3] >= bbox[3] && q.gradosPx <= g * 1.5)) continue;
    const lado = Math.max(bbox[2] - bbox[0], bbox[3] - bbox[1]);
    pedidos.push({ capa: z >= 9 ? CAPAS.sentinel : capaLejos, respaldo: z >= 9 ? CAPAS.landsat : undefined, bbox, gradosPx: Math.max(g * 0.8, lado / 2048), zoom: z });
  }
  texturasGlobo = await bajarFondos(raiz, `${guion.id}-globo`, pedidos);
  if (!texturasGlobo.length) console.warn('  ⚠ sin textura del globo: se verá con continentes en vectores.');
}

const capitulosTexto = caps.map((c) => `${marcaTiempo(c.desde)} ${c.titulo}`).join('\n');
const creditos = [
  'Capítulos:',
  capitulosTexto,
  '',
  'Fuentes:',
  ...guion.fuentes.map((f) => `- ${f.texto}: ${f.url}`),
  '',
  `Mapa: ${fondoMapa ? `${fondoMapa.credito.replace(/^Imagen: /, 'imagen satelital ')} (dominio público); ` : ''}${texturasGlobo.length ? `${[...new Set(texturasGlobo.map((f) => f.credito))].join('; ')}; ` : ''}vectores de Natural Earth (dominio público). Mapa propio; ruta y distancias aproximadas (grandes círculos entre puntos).`,
  ...(creditosFotos ? ['', creditosFotos] : []),
  '',
  'Voz sintetizada (contenido sintético). Música y efectos: composición propia.',
].join('\n');

const finales = { ...guion, duracionFrames: plan.duracionFrames, tiempos, trazado: tr, fotos: fotos.imagenes, polaroids: polaroids.imagenes, fondoMapa, texturasGlobo, creditos };
const salida = path.join(raiz, 'salida/trabajo', `${guion.id}.props.json`);
fs.mkdirSync(path.dirname(salida), { recursive: true });
fs.writeFileSync(salida, JSON.stringify(finales) + '\n');
fs.writeFileSync(path.join(raiz, 'salida/trabajo', `${guion.id}.capitulos.json`), JSON.stringify({
  duracionSeg: plan.duracionSeg, duracionFrames: plan.duracionFrames, fps: LARGO.fps,
  capitulos: caps.map((c) => ({ titulo: c.titulo, desde: +c.desde.toFixed(2), hasta: +c.hasta.toFixed(2), marca: marcaTiempo(c.desde), frameDesde: Math.round(c.desde * LARGO.fps) })),
  creditos,
}, null, 2) + '\n');
console.log(`props → ${path.relative(raiz, salida)} (${plan.duracionSeg.toFixed(1)} s, ${Object.keys(fotos.imagenes).length} foto(s), ${Object.keys(polaroids.imagenes).length} polaroid(s), ${texturasGlobo.length} textura(s) de globo)`);
process.exit(0);
