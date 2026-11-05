/**
 * Fotogramas de revisión de un mp4 (0 s, 1,5 s, 25 %, 50 %, 75 %, último) + hoja de contacto.
 *   npx tsx scripts/fotogramas.mts <video.mp4> [carpeta-salida]
 * Por defecto los deja junto al video en <nombre>-fotogramas/. Míralos con Read antes de dar por bueno un render.
 */
import path from 'node:path';
import { extraerFotogramas } from './lib/fotogramas.mjs';
import { infoVideo } from './lib/operacion.mjs';

const mp4 = process.argv[2];
if (!mp4) { console.error('uso: npx tsx scripts/fotogramas.mts <video.mp4> [carpeta]'); process.exit(2); }
const base = path.basename(mp4, '.mp4');
const dir = process.argv[3] ?? path.join(path.dirname(mp4), `${base}-fotogramas`);
const info = await infoVideo(path.resolve(mp4));
const { rutas, hoja } = await extraerFotogramas(path.resolve(mp4), base, dir, info.duracion, info.alto / info.ancho);
console.log(`${info.ancho}×${info.alto}, ${info.duracion.toFixed(1)} s, audio ${info.tieneAudio ? 'sí' : 'NO'}`);
for (const r of [...rutas, hoja]) console.log(r);
