/** Muestra estado y metadatos de videos del canal por API: npx tsx scripts/ver-video.mts <id> [...] */
import { google } from 'googleapis';
import { ARCHIVO_CLIENTE_YT, ARCHIVO_TOKEN_YT, escribirJson, leerJson } from './lib/operacion.mjs';
const cj = leerJson<{ installed?: { client_id: string; client_secret: string }; web?: { client_id: string; client_secret: string } }>(ARCHIVO_CLIENTE_YT);
const c = cj.installed ?? cj.web!;
const cliente = new google.auth.OAuth2(c.client_id, c.client_secret, 'http://127.0.0.1:8765');
const tokens = leerJson<Record<string, unknown>>(ARCHIVO_TOKEN_YT);
cliente.setCredentials(tokens);
cliente.on('tokens', (n) => escribirJson(ARCHIVO_TOKEN_YT, { ...tokens, ...n }, 0o600));
const yt = google.youtube({ version: 'v3', auth: cliente });
const r = await yt.videos.list({ part: ['snippet', 'status', 'contentDetails', 'processingDetails'], id: process.argv.slice(2) });
for (const v of r.data.items ?? []) console.log(JSON.stringify({ id: v.id, titulo: v.snippet?.title, cat: v.snippet?.categoryId, audio: v.snippet?.defaultAudioLanguage, idioma: v.snippet?.defaultLanguage, estado: v.status?.privacyStatus, publishAt: v.status?.publishAt, kids: v.status?.selfDeclaredMadeForKids, dur: v.contentDetails?.duration, proc: v.processingDetails?.processingStatus }));
