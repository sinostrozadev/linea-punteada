/**
 * Lista los videos PROGRAMADOS (privados con publishAt) y los últimos publicados del canal, por la API (token del canal).
 *   npx tsx scripts/programados.mts [--json]
 * Sirve para ver qué ranuras están ocupadas antes de programar o desplazar (ver scripts/reprogramar.mts).
 */
import { google } from 'googleapis';
import { ARCHIVO_CLIENTE_YT, ARCHIVO_TOKEN_YT, escribirJson, existeSecreto, leerJson } from './lib/operacion.mjs';

if (!existeSecreto(ARCHIVO_CLIENTE_YT) || !existeSecreto(ARCHIVO_TOKEN_YT)) { console.error('faltan secrets de YouTube'); process.exit(2); }
const cj = leerJson<{ installed?: { client_id: string; client_secret: string }; web?: { client_id: string; client_secret: string } }>(ARCHIVO_CLIENTE_YT);
const c = cj.installed ?? cj.web!;
const cliente = new google.auth.OAuth2(c.client_id, c.client_secret, 'http://127.0.0.1:8765');
const tokens = leerJson<Record<string, unknown>>(ARCHIVO_TOKEN_YT);
cliente.setCredentials(tokens);
cliente.on('tokens', (nuevos) => escribirJson(ARCHIVO_TOKEN_YT, { ...tokens, ...nuevos }, 0o600));
const yt = google.youtube({ version: 'v3', auth: cliente });
const canal = await yt.channels.list({ part: ['contentDetails', 'snippet'], mine: true });
const ch = canal.data.items?.[0];
const uploads = ch?.contentDetails?.relatedPlaylists?.uploads;
if (!uploads) { console.error('sin lista de subidas'); process.exit(1); }
const ids: string[] = [];
let page: string | undefined;
do {
  const r = await yt.playlistItems.list({ part: ['contentDetails'], playlistId: uploads, maxResults: 50, pageToken: page });
  ids.push(...(r.data.items ?? []).map((i) => i.contentDetails!.videoId!));
  page = r.data.nextPageToken ?? undefined;
} while (page && ids.length < 200);
const filas: { id: string; titulo: string; estado: string; cuando: string; dur: string }[] = [];
for (let i = 0; i < ids.length; i += 50) {
  const r = await yt.videos.list({ part: ['snippet', 'status', 'contentDetails'], id: ids.slice(i, i + 50) });
  for (const v of r.data.items ?? []) {
    filas.push({ id: v.id!, titulo: v.snippet!.title!, estado: v.status!.privacyStatus!, cuando: v.status!.publishAt ?? v.snippet!.publishedAt!, dur: v.contentDetails!.duration! });
  }
}
filas.sort((a, b) => a.cuando.localeCompare(b.cuando));
if (process.argv.includes('--json')) { console.log(JSON.stringify({ canal: ch?.snippet?.title, filas }, null, 1)); process.exit(0); }
console.log(`Canal: ${ch?.snippet?.title}`);
const fmt = (iso: string) => new Date(iso).toLocaleString('es-CL', { timeZone: 'America/Santiago', weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
for (const f of filas.filter((x) => x.estado !== 'public' || new Date(x.cuando).getTime() > Date.now() - 3 * 864e5)) console.log(`${f.estado.padEnd(8)} ${fmt(f.cuando).padEnd(22)} ${f.id}  ${f.dur.padEnd(9)} ${f.titulo}`);
