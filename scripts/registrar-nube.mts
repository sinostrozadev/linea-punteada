/**
 * Registra en la bandeja local un Short renderizado en la nube (producir.yml lanzado a mano, sin commit del bot):
 * copia el mp4 a salida/bandeja/, arma el json de bandeja (descripción + créditos de los props del run, duración real)
 * y mueve el guion de contenido/backlog a contenido/guiones con el id que le dio la nube.
 *   gh run download <run> -R sinostrozadev/linea-punteada -D salida/nube/<run>
 *   npx tsx scripts/registrar-nube.mts salida/nube/<run>
 */
import fs from 'node:fs';
import path from 'node:path';
import { DIR_BANDEJA, RAIZ, duracionVideo, escribirJson } from './lib/operacion.mjs';
import { agregarCreditos } from './imagenes.mjs';

const dir = process.argv[2];
if (!dir) { console.error('uso: npx tsx scripts/registrar-nube.mts <carpeta del run descargado>'); process.exit(2); }
const shorts = fs.readdirSync(dir).filter((d) => d.startsWith('shorts-')).map((d) => path.join(dir, d));
if (!shorts.length) { console.error('no hay artifact shorts-* en', dir); process.exit(1); }
for (const s of shorts) {
  for (const mp4 of fs.readdirSync(s).filter((f) => f.endsWith('.mp4'))) {
    const id = mp4.replace(/\.mp4$/, '');
    const g = JSON.parse(fs.readFileSync(path.join(s, `${id}.json`), 'utf8'));
    const rutaProps = path.join(dir, 'preparado', 'salida', 'trabajo', `${id}.props.json`);
    const creditos = fs.existsSync(rutaProps) ? (JSON.parse(fs.readFileSync(rutaProps, 'utf8')).creditos as string | undefined) : undefined;
    if (!creditos) console.warn(`  ⚠ ${id}: sin props del run, la descripción va sin créditos de mapas/fotos`);
    const destino = path.join(DIR_BANDEJA, mp4);
    fs.copyFileSync(path.join(s, mp4), destino);
    const duracionSeg = Math.round((await duracionVideo(destino)) * 10) / 10;
    escribirJson(path.join(DIR_BANDEJA, `${id}.json`), {
      id, plantilla: g.plantilla, titulo: g.titulo, descripcion: agregarCreditos(g.descripcion, creditos), hashtags: g.hashtags,
      duracionSeg, estado: 'listo', tipo: 'short', artefacto: path.basename(s),
    });
    // El guion: de backlog (pendiente-…) a guiones (<fecha>-…), como haría el diario.
    const slug = id.replace(/^\d{4}-\d{2}-\d{2}-/, '');
    const enBacklog = path.join(RAIZ, 'contenido', 'backlog', `${slug}.json`);
    const enGuiones = path.join(RAIZ, 'contenido', 'guiones', `${id}.json`);
    if (!fs.existsSync(enGuiones)) fs.writeFileSync(enGuiones, JSON.stringify(g, null, 2) + '\n');
    if (fs.existsSync(enBacklog)) fs.unlinkSync(enBacklog);
    console.log(`✓ ${id}: ${duracionSeg} s → ${path.relative(RAIZ, destino)} (+ json de bandeja, guion en contenido/guiones)`);
  }
}
