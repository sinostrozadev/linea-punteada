/**
 * Resuelve la SECUENCIA DE MEDIOS (`medios[]` de cada línea de voz: fotos y videos reales a pantalla completa) de un
 * guion: fotos por Wikimedia Commons (scripts/imagenes.mts) y videos por la librería de video (scripts/lib/videos.mts).
 * Devuelve `medios` (clave "<línea>-<n>", 0 = gancho/apertura) para las props y el texto de créditos para la descripción,
 * y deja la evidencia de licencia de cada video en contenido/licencias-video/<id>.json.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepararImagenes } from '../imagenes.mjs';
import { creditoVideo, prepararVideo, rutaEvidencia, type Evidencia, type FormatoClip, type VideoResuelto } from './videos.mjs';
import type { ImagenResuelta } from '../../src/plantillas/comun/guion';
import type { Medio } from '../../src/plantillas/comun/direccion';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export type MedioResuelto = VideoResuelto | (ImagenResuelta & { tipo: 'foto' });

export const prepararMedios = async (id: string, lineas: { medios?: Medio[] }[], formato: FormatoClip): Promise<{ medios: Record<string, MedioResuelto>; creditos: string }> => {
  const medios: Record<string, MedioResuelto> = {};
  if (!lineas.some((l) => l.medios?.length)) return { medios, creditos: '' };
  const rutaEv = rutaEvidencia(id);
  let previa: Record<string, Evidencia> = {};
  try { previa = JSON.parse(fs.readFileSync(rutaEv, 'utf8')).clips ?? {}; } catch { /* primera vez */ }
  const clips: Record<string, Evidencia> = {};
  const lineasCredito: string[] = [];
  for (const [k, l] of lineas.entries()) {
    for (const [i, m] of (l.medios ?? []).entries()) {
      const clave = `${k}-${i}`;
      if (m.tipo === 'video') {
        const ev = await prepararVideo(id, clave, m, formato, previa[clave]);
        if (!ev) continue;
        clips[clave] = ev;
        medios[clave] = ev.video;
        lineasCredito.push(creditoVideo(ev.video));
      } else {
        // prepararImagenes indexa `escenas` desde 1: una "escena" por foto, en su propia carpeta.
        const r = await prepararImagenes(`${id}-medios/${clave}`, { escenas: [{ imagen: { buscar: m.buscar, archivo: m.archivo, encuadre: m.encuadre } }] as never });
        const img = r.imagenes['1'];
        if (!img) continue;
        medios[clave] = { ...img, tipo: 'foto' };
        if (r.creditos) lineasCredito.push(...r.creditos.split('\n').filter((x) => x.startsWith('- ')));
      }
    }
  }
  if (Object.keys(clips).length) {
    fs.mkdirSync(path.dirname(rutaEv), { recursive: true });
    fs.writeFileSync(rutaEv, JSON.stringify({ id, generado: new Date().toISOString(), nota: 'Evidencia de licencia de cada extracto de video usado (metadatos de la fuente al momento de la descarga).', clips }, null, 2) + '\n');
  }
  const unicos = [...new Set(lineasCredito)];
  return { medios, creditos: unicos.length ? `Videos y fotos de archivo (extractos, sin su audio):\n${unicos.join('\n')}` : '' };
};
