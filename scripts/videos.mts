/**
 * Librería de video real (extractos de archivo con licencia libre): CLI.
 *   npx tsx scripts/videos.mts buscar "<consulta>" [--fuente commons|nasa|archive|pexels|pixabay] [--formato vertical|horizontal] [--n 12]
 *       Lista candidatos con licencia permitida (y cuántos se rechazaron y por qué) para elegir el `archivo` exacto.
 *   npx tsx scripts/videos.mts bajar "<archivo>" [--fuente …] [--desde 3] [--dur 4] [--formato …] [--encuadre centro] [--id prueba]
 *       Descarga y recorta UN clip a public/videos/<id>/ (prueba rápida: mirar cómo queda antes de ponerlo en un guion).
 *   npx tsx scripts/videos.mts fuentes
 *       Qué fuentes están activas (Pexels y Pixabay solo con clave gratuita en secrets/pexels.key / secrets/pixabay.key).
 * Lógica y reglas de licencia: scripts/lib/videos.mts. Uso en guiones: `medios[]` (docs/GUION.md §4c).
 */
import { FUENTES_VIDEO, buscarVideos, fuentesActivas, prepararVideo, type FormatoClip, type FuenteVideo } from './lib/videos.mjs';

const args = process.argv.slice(2);
const op = (n: string) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : undefined; };
const [orden, texto] = args;
const fuente = op('fuente') as FuenteVideo | undefined;
if (fuente && !FUENTES_VIDEO.includes(fuente)) { console.error(`fuente desconocida: ${fuente}`); process.exit(2); }
const formato = (op('formato') ?? 'vertical') as FormatoClip;

if (orden === 'fuentes') {
  console.log(`activas: ${fuentesActivas().join(', ')}`);
  console.log('Pexels/Pixabay: clave gratuita en secrets/pexels.key o secrets/pixabay.key (o PEXELS_API_KEY / PIXABAY_API_KEY).');
} else if (orden === 'buscar' && texto) {
  const { candidatos, rechazos } = await buscarVideos({ buscar: texto, fuente }, formato, Number(op('n') ?? 20));
  for (const c of candidatos.slice(0, Number(op('n') ?? 20))) {
    console.log(`${c.fuente.padEnd(8)} ${c.licencia.padEnd(16)} ${String(c.ancho || '?').padStart(4)}×${String(c.alto || '?').padEnd(4)} ${(c.duracion ? `${c.duracion.toFixed(0)} s` : '? s').padStart(6)}  ${c.archivo}\n         ${c.autor.slice(0, 50)} · ${c.pagina}`);
  }
  console.log(`\n${candidatos.length} candidato(s) con licencia permitida; ${rechazos.length} descartado(s)${rechazos.length ? `: ${rechazos.slice(0, 6).join(' | ')}` : ''}`);
} else if (orden === 'bajar' && texto) {
  const ev = await prepararVideo(op('id') ?? 'prueba', (op('etiqueta') ?? texto).replace(/^File:/, '').replace(/[^a-z0-9]+/gi, '-').slice(0, 40), {
    buscar: texto, archivo: texto, fuente, desdeSeg: op('desde') ? Number(op('desde')) : undefined, duracionSeg: op('dur') ? Number(op('dur')) : undefined,
    encuadre: op('encuadre') as never,
  }, formato);
  if (!ev) process.exit(1);
  console.log(`→ public/${ev.video.src} · ${ev.video.autor} · ${ev.video.licencia} · ${ev.video.pagina}`);
} else {
  console.error('uso: npx tsx scripts/videos.mts buscar "<consulta>" | bajar "<archivo>" | fuentes   (ver cabecera del archivo)');
  process.exit(2);
}
process.exit(0);
