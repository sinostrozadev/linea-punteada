/**
 * Render AUTÓNOMO de un video `largo` 16:9 (no pasa por diario.mts):
 *   npx tsx scripts/render-largo.mts <guion-largo.json> [--escala 0.5] [--muestra 10] [--sin-preparar] [--prueba]
 * 1) corre scripts/preparar-largo.mts (salvo --sin-preparar con props ya hechos),
 * 2) parte el video en TRAMOS de ≤ ~3 min cortados en límite de capítulo y renderiza cada uno sin audio
 *    (--frames, --muted, concurrency LINEA_CONCURRENCIA o 2) bajo el lock de render compartido
 *    (/tmp/bolita-render.lock, flock -w 30 min por tramo: otro canal puede renderizar entre tramos) y esperando
 *    RAM ≥ 1500 MB; un tramo ya renderizado con las mismas props se reutiliza (reanudar tras un corte),
 * 3) une los tramos con ffmpeg -c copy, mezcla el audio en Node/ffmpeg (cama + SFX + cada línea de voz en su
 *    segundo exacto) y lo pega (AAC 192 k),
 * 4) deja salida/bandeja/<id>.mp4 + <id>.json (tipo 'largo', capítulos con minuto, descripción con capítulos,
 *    fuentes y créditos, `miniatura` si el envoltorio la trae).
 * --muestra N: solo N s desde el inicio de cada capítulo (prueba de la plantilla y del corte por tramos) →
 * salida/pruebas/largo/<id>-muestra.mp4 (no toca la bandeja). --escala: escala del render (1 = 1920×1080).
 * --sin-lock: SOLO para pruebas cortas a escala reducida (concurrency 1, exige ≥ 4000 MB libres); el render final va con lock.
 * Variables: LINEA_CONCURRENCIA (2), LINEA_LOCK_RENDER (/tmp/bolita-render.lock), LINEA_RENDER_MAX_MIN (150, por tramo).
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import { DIR_BANDEJA, FFMPEG, escribirJson, memoriaDisponibleMb, type EntradaBandeja } from './lib/operacion.mjs';

const RAIZ = process.cwd();
const args = process.argv.slice(2);
const valor = (n: string) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
const rutaGuion = args.find((a, i) => !a.startsWith('--') && !['--escala', '--muestra'].includes(args[i - 1] ?? ''));
if (!rutaGuion) { console.error('uso: npx tsx scripts/render-largo.mts <guion-largo.json> [--escala 0.5] [--muestra 10] [--sin-preparar] [--prueba]'); process.exit(2); }
const escala = Number(valor('--escala') ?? '1');
const muestra = valor('--muestra') ? Number(valor('--muestra')) : 0;
const SIN_LOCK = args.includes('--sin-lock');
const CONCURRENCIA = process.env.LINEA_CONCURRENCIA ?? (SIN_LOCK ? '1' : '2');
const LOCK = process.env.LINEA_LOCK_RENDER ?? '/tmp/bolita-render.lock';
const MAX_MIN = parseInt(process.env.LINEA_RENDER_MAX_MIN ?? '150', 10);
const TRAMO_SEG = 180;
const REMOTION = path.join(RAIZ, 'node_modules', '.bin', 'remotion');
const FFMPEG_BIN = FFMPEG === 'ffmpeg' ? 'ffmpeg' : FFMPEG;

const correr = (cmd: string, argv: string[], timeoutMin = MAX_MIN): Promise<number> => new Promise((ok) => {
  const p = spawn(cmd, argv, { cwd: RAIZ, stdio: ['ignore', 'inherit', 'inherit'] });
  const reloj = setTimeout(() => { console.error(`✗ ${path.basename(cmd)} pasó ${timeoutMin} min: se corta`); p.kill('SIGTERM'); }, timeoutMin * 60_000);
  p.on('close', (c) => { clearTimeout(reloj); ok(c ?? 1); });
});
const ffmpeg = async (argv: string[]) => {
  const c = await correr(FFMPEG_BIN, ['-hide_banner', '-loglevel', 'error', '-y', ...argv], 30);
  if (c !== 0) throw new Error(`ffmpeg salió con ${c}: ${argv.slice(0, 8).join(' ')}…`);
};
const esperarRam = async () => {
  const limite = Date.now() + 30 * 60_000;
  while (memoriaDisponibleMb() < 1500) {
    if (Date.now() > limite) throw new Error('sin RAM (≥ 1500 MB) en 30 min');
    console.log(`  ⏳ RAM ${memoriaDisponibleMb()} MB < 1500: espero…`);
    await new Promise((r) => setTimeout(r, 20_000));
  }
};

const crudo = JSON.parse(fs.readFileSync(path.resolve(rutaGuion), 'utf8'));
const envoltorio = crudo.plantilla ? crudo : null;
const id: string = envoltorio ? envoltorio.props.id : crudo.id;

// 1) preparar
if (!args.includes('--sin-preparar')) {
  const c = await correr('npx', ['tsx', 'scripts/preparar-largo.mts', rutaGuion, ...(args.includes('--prueba') || muestra ? ['--prueba'] : [])], 30);
  if (c !== 0) { console.error('✗ preparar-largo rechazó el guion: no se renderiza.'); process.exit(1); }
}
const rutaProps = path.join(RAIZ, 'salida/trabajo', `${id}.props.json`);
const caps = JSON.parse(fs.readFileSync(path.join(RAIZ, 'salida/trabajo', `${id}.capitulos.json`), 'utf8')) as {
  duracionSeg: number; duracionFrames: number; fps: number; capitulos: { titulo: string; desde: number; hasta: number; marca: string; frameDesde: number }[]; creditos: string;
};
const props = JSON.parse(fs.readFileSync(rutaProps, 'utf8'));
const huella = crypto.createHash('sha256').update(fs.readFileSync(rutaProps)).update(`${escala}|${muestra}`).digest('hex').slice(0, 12);
const D = caps.duracionFrames, fps = caps.fps;

// 2) tramos [desde, hasta] (frames inclusive)
type Tramo = { a: number; b: number };
let tramos: Tramo[] = [];
if (muestra) {
  tramos = caps.capitulos.map((c, i) => {
    const fin = i + 1 < caps.capitulos.length ? caps.capitulos[i + 1].frameDesde : D;
    return { a: c.frameDesde, b: Math.min(fin, c.frameDesde + Math.round(muestra * fps)) - 1 };
  });
} else {
  const cortes = caps.capitulos.map((c) => c.frameDesde).filter((f) => f > 0);
  let a = 0;
  for (let i = 0; i <= cortes.length; i++) {
    const siguiente = cortes[i] ?? D;
    const despues = cortes[i + 1] ?? D;
    // Corta aquí si seguir hasta el próximo límite de capítulo pasaría de ~3 min (o es el final).
    if (siguiente === D || despues - a > TRAMO_SEG * fps) { tramos.push({ a, b: siguiente - 1 }); a = siguiente; }
    if (siguiente === D) break;
  }
}
const dirTramos = path.join(RAIZ, 'salida/trabajo', `${id}-tramos`);
fs.mkdirSync(dirTramos, { recursive: true });
console.log(`render ${id}: ${(D / fps).toFixed(1)} s, ${tramos.length} tramo(s) ${tramos.map((t) => `${(t.a / fps).toFixed(0)}–${((t.b + 1) / fps).toFixed(0)} s`).join(' · ')} · escala ${escala} · concurrency ${CONCURRENCIA}`);

const inicio = Date.now();
const partes: string[] = [];
for (const [i, t] of tramos.entries()) {
  const parte = path.join(dirTramos, `${huella}-${String(i).padStart(2, '0')}.mp4`);
  partes.push(parte);
  if (fs.existsSync(parte) && fs.statSync(parte).size > 10_000) { console.log(`  = tramo ${i + 1}/${tramos.length} ya renderizado`); continue; }
  await esperarRam();
  const t0 = Date.now();
  console.log(`  🎬 tramo ${i + 1}/${tramos.length}: frames ${t.a}–${t.b} (espera el lock ${LOCK} si otro canal renderiza)`);
  const tmp = parte.replace(/\.mp4$/, '.tmp.mp4');
  if (SIN_LOCK && memoriaDisponibleMb() < 4000) { console.error(`✗ --sin-lock exige ≥ 4000 MB libres (hay ${memoriaDisponibleMb()}): reintenta luego o usa el lock.`); process.exit(1); }
  const c = await correr(SIN_LOCK ? REMOTION : 'flock', [...(SIN_LOCK ? [] : ['-w', '1800', LOCK, REMOTION]), 'render', 'src/index.ts', 'Largo', tmp,
    `--props=${rutaProps}`, `--frames=${t.a}-${t.b}`, '--muted', '--codec=h264', '--crf=18', '--x264-preset=veryfast',
    `--concurrency=${CONCURRENCIA}`, `--scale=${escala}`, '--timeout=180000', '--log=error']);
  if (c !== 0 || !fs.existsSync(tmp)) { console.error(`✗ el tramo ${i + 1} falló (código ${c}). Vuelve a correr el comando: retoma desde este tramo.`); process.exit(1); }
  fs.renameSync(tmp, parte);
  const seg = (Date.now() - t0) / 1000;
  console.log(`    ✓ ${seg.toFixed(0)} s para ${((t.b - t.a + 1) / fps).toFixed(1)} s de video (${(seg / ((t.b - t.a + 1) / fps)).toFixed(1)} s de render por s de video)`);
}

// 3) unir video, mezclar audio, pegar
const lista = path.join(dirTramos, `${huella}-lista.txt`);
fs.writeFileSync(lista, partes.map((p) => `file '${p}'`).join('\n') + '\n');
const video = path.join(dirTramos, `${huella}-video.mp4`);
await ffmpeg(['-f', 'concat', '-safe', '0', '-i', lista, '-c', 'copy', video]);

const lineas = (props.tiempos.lineas as { inicio: number; archivo: string }[]);
const cama = path.join(RAIZ, 'public/audio/generado', `${id}.wav`);
const audioCompleto = path.join(dirTramos, `${huella}-audio.wav`);
const entradas = [cama, ...lineas.map((l) => path.join(RAIZ, 'public', l.archivo))];
const filtro = [
  ...lineas.map((l, k) => `[${k + 1}:a]aresample=48000,adelay=${Math.round(l.inicio * 1000)}|${Math.round(l.inicio * 1000)}[v${k}]`),
  `[0:a]aresample=48000[c]`,
  `[c]${lineas.map((_, k) => `[v${k}]`).join('')}amix=inputs=${lineas.length + 1}:duration=first:dropout_transition=0:normalize=0[mezcla]`,
].join(';');
await ffmpeg([...entradas.flatMap((e) => ['-i', e]), '-filter_complex', filtro, '-map', '[mezcla]', '-ac', '2', '-c:a', 'pcm_s16le', '-t', (D / fps).toFixed(3), audioCompleto]);
let audio = audioCompleto;
if (muestra) {
  // La muestra junta trozos: se corta el audio igual.
  const trozos = tramos.map((t, i) => {
    const s = path.join(dirTramos, `${huella}-audio-${i}.wav`);
    return { s, a: t.a / fps, d: (t.b - t.a + 1) / fps };
  });
  for (const tr of trozos) await ffmpeg(['-ss', tr.a.toFixed(3), '-t', tr.d.toFixed(3), '-i', audioCompleto, '-c:a', 'pcm_s16le', tr.s]);
  const listaA = path.join(dirTramos, `${huella}-lista-audio.txt`);
  fs.writeFileSync(listaA, trozos.map((t) => `file '${t.s}'`).join('\n') + '\n');
  audio = path.join(dirTramos, `${huella}-audio-muestra.wav`);
  await ffmpeg(['-f', 'concat', '-safe', '0', '-i', listaA, '-c', 'copy', audio]);
}
const destino = muestra ? path.join(RAIZ, 'salida/pruebas/largo', `${id}-muestra.mp4`) : path.join(DIR_BANDEJA, `${id}.mp4`);
fs.mkdirSync(path.dirname(destino), { recursive: true });
await ffmpeg(['-i', video, '-i', audio, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', destino]);
const minutos = (Date.now() - inicio) / 60000;
const segVideo = tramos.reduce((s, t) => s + (t.b - t.a + 1), 0) / fps;
console.log(`✓ ${path.relative(RAIZ, destino)} · render ${minutos.toFixed(1)} min para ${segVideo.toFixed(0)} s de video (${(minutos / (segVideo / 60)).toFixed(1)} min de render por min de video, escala ${escala})`);

// 4) bandeja
if (!muestra) {
  const capitulos = caps.capitulos.map((c) => ({ titulo: c.titulo, desde: c.desde, marca: c.marca }));
  const entrada: EntradaBandeja & Record<string, unknown> = {
    id,
    plantilla: 'largo',
    titulo: envoltorio?.titulo ?? id,
    descripcion: [envoltorio?.descripcion ?? '', '', caps.creditos].join('\n').trim(),
    hashtags: envoltorio?.hashtags ?? [],
    duracionSeg: +(D / fps).toFixed(2),
    estado: 'listo',
    tipo: 'largo',
    capitulos,
    ...(envoltorio?.miniatura ? { miniatura: envoltorio.miniatura } : {}),
  };
  escribirJson(path.join(DIR_BANDEJA, `${id}.json`), entrada);
  console.log(`bandeja → salida/bandeja/${id}.json (tipo largo, ${capitulos.length} capítulos)`);
  fs.rmSync(dirTramos, { recursive: true, force: true });
}
process.exit(0);
