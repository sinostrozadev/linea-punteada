/**
 * Hoja de contacto de un mp4: un fotograma cada N segundos en una grilla con el tiempo en cada cuadro, para
 * compararla lado a lado con las hojas de los referentes (salida/referentes/nerd/*.jpg).
 *   npx tsx scripts/hoja-contacto.mts <video.mp4> <hoja.jpg> [--cada 2] [--columnas 6] [--ancho 300] [--desde 0] [--hasta fin]
 * Extrae con el ffmpeg de Remotion (scripts/lib/fotogramas.mts: no trae tile/hstack/drawtext) y compone la
 * grilla con Chromium headless (Playwright del piloto de Bolita Lab, solo lectura; NO toca el navegador del 8777).
 * Si la hoja sale muy alta se parte en varias: <hoja>.jpg, <hoja>-2.jpg…
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { FFMPEG_R, aJpg, correrBinario, fotogramaCrudo } from './lib/fotogramas.mjs';

const args = process.argv.slice(2);
const [mp4, salida] = args.filter((a, i) => !a.startsWith('--') && !(args[i - 1] ?? '').startsWith('--'));
if (!mp4 || !salida) { console.error('uso: npx tsx scripts/hoja-contacto.mts <video.mp4> <hoja.jpg> [--cada 2] [--columnas 6] [--ancho 300]'); process.exit(2); }
const opcion = (n: string, d: number) => { const i = args.indexOf(`--${n}`); return i >= 0 ? Number(args[i + 1]) : d; };
const cada = opcion('cada', 2), columnas = opcion('columnas', 6), ancho = opcion('ancho', 300), porHoja = opcion('por-hoja', 24);
const alto = Math.round((ancho * 16) / 9 / 2) * 2;

const info = await correrBinario(FFMPEG_R, ['-hide_banner', '-i', mp4]);
const m = /Duration: (\d+):(\d+):([\d.]+)/.exec(info.error);
if (!m) { console.error(`no pude leer la duración de ${mp4}`); process.exit(1); }
const duracion = Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
const desde = opcion('desde', 0), hasta = Math.min(duracion - 0.05, opcion('hasta', duracion));
const tiempos: number[] = [];
for (let t = desde; t <= hasta; t += cada) tiempos.push(+t.toFixed(2));

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'hoja-'));
const cuadros: { t: number; archivo: string }[] = [];
for (const t of tiempos) {
  const archivo = path.join(tmp, `${String(cuadros.length).padStart(4, '0')}.jpg`);
  await aJpg(await fotogramaCrudo(path.resolve(mp4), t, alto, ancho), ancho, alto, archivo, undefined, 3);
  cuadros.push({ t, archivo });
}

const requerir = createRequire('/home/santiago/projects/yt/bolita-lab/herramientas/navegador/package.json');
type Pagina = { goto: (u: string) => Promise<unknown>; waitForLoadState: (s: string) => Promise<void>; screenshot: (o: object) => Promise<Buffer> };
const { chromium } = requerir('playwright') as { chromium: { launch: (o: object) => Promise<{ newPage: (o: object) => Promise<Pagina>; close: () => Promise<void> }> } };
const navegador = await chromium.launch({ headless: true, args: ['--disable-gpu'] });
const pagina = await navegador.newPage({ viewport: { width: columnas * ancho, height: 800 }, deviceScaleFactor: 1 });
const hojas: string[] = [];
for (let h = 0; h * porHoja < cuadros.length; h++) {
  const trozo = cuadros.slice(h * porHoja, (h + 1) * porHoja);
  const etiqueta = (t: number) => `${t.toFixed(t % 1 ? 1 : 0).replace('.', ',')} s`;
  const html = `<html><body style="margin:0;background:#0B1D2E"><div style="display:grid;grid-template-columns:repeat(${columnas},${ancho}px)">${trozo.map((c) =>
    `<div style="position:relative;width:${ancho}px;height:${alto}px;border:1px solid #0B1D2E;box-sizing:border-box"><img src="file://${c.archivo}" style="width:100%;height:100%;display:block"/>` +
    `<div style="position:absolute;left:0;top:0;padding:2px 8px;background:rgba(5,15,25,.8);color:#FFD23F;font:700 20px sans-serif">${etiqueta(c.t)}</div></div>`).join('')}</div></body></html>`;
  const archivoHtml = path.join(tmp, `hoja-${h}.html`);
  fs.writeFileSync(archivoHtml, html);
  await pagina.goto(`file://${archivoHtml}`);
  await pagina.waitForLoadState('load');
  const destino = h === 0 ? salida : salida.replace(/\.jpg$/i, `-${h + 1}.jpg`);
  fs.mkdirSync(path.dirname(path.resolve(destino)), { recursive: true });
  await pagina.screenshot({ path: destino, fullPage: true, type: 'jpeg', quality: 82 });
  hojas.push(destino);
}
await navegador.close();
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`${cuadros.length} cuadros (cada ${cada} s, ${duracion.toFixed(1)} s) → ${hojas.join(', ')}`);
process.exit(0);
