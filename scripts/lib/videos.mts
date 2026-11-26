/**
 * LIBRERÍA DE VIDEO REAL (extractos de archivo con licencia libre) para cualquier plantilla del canal.
 *
 * Qué hace: busca por lugar/tema en fuentes que NO piden clave (Wikimedia Commons, NASA Image and Video Library,
 * Internet Archive con licencia explícita) y, si Santiago deja una clave gratuita, también en Pexels y Pixabay;
 * filtra por licencia permitida; descarga la versión más liviana que sirve; recorta el tramo pedido al formato del
 * video (9:16 o 16:9), le quita el audio y lo normaliza con el ffmpeg de Remotion; guarda el clip en
 * public/videos/<id>/ (ignorado por git: se vuelve a bajar bajo demanda) y la EVIDENCIA de licencia de cada clip en
 * contenido/licencias-video/<id>.json (versionado). Nunca rompe el render: sin clip válido la línea sigue con el mapa.
 *
 * Reglas de licencia (docs/GUION.md §4c y skill herramientas-disponibles):
 *  - Se acepta: dominio público, CC0, CC BY y CC BY-SA (mismo criterio que las fotos, scripts/imagenes.mts), licencias
 *    Pexels y Pixabay. Se rechaza: NC, ND, "fair use", desconocidas, con `Restrictions`, y todo lo que no declare licencia.
 *  - CC BY / BY-SA: crédito EN PANTALLA mientras se ve el clip (autor · licencia · fuente) y completo en la descripción.
 *  - NASA: dominio público salvo material de terceros; se descartan las fichas que mencionan copyright ajeno.
 *  - Internet Archive NO garantiza derechos: solo ítems con `licenseurl` de dominio público o CC BY/BY-SA.
 *
 * CLI de búsqueda (para elegir el `archivo` exacto antes de escribir el guion): scripts/videos.mts.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { FFMPEG_R, correrBinario } from './fotogramas.mjs';
import { clasificarLicencia } from '../imagenes.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const USER_AGENT = 'LineaPunteada/1.0 (canal de YouTube Línea Punteada; contacto: https://github.com/sinostrozadev/linea-punteada)';
/** Tope de la descarga cruda (se borra después de recortar). */
const MAX_CRUDO_MB = 220;

export const FUENTES_VIDEO = ['commons', 'nasa', 'archive', 'pexels', 'pixabay'] as const;
export type FuenteVideo = (typeof FUENTES_VIDEO)[number];
export type FormatoClip = 'vertical' | 'horizontal';
export type EncuadreClip = 'izquierda' | 'centro' | 'derecha' | 'arriba' | 'abajo';

/** Lo que pide el guion (ver `Video` en src/plantillas/comun/direccion.ts). */
export type PedidoVideo = {
  buscar: string;
  /** Título exacto en la fuente: "File:….webm" (Commons), nasa_id (NASA) o identificador (archive.org). */
  archivo?: string;
  fuente?: FuenteVideo;
  /** Segundo del original donde empieza el extracto (por defecto, el 12 % de su duración). */
  desdeSeg?: number;
  duracionSeg?: number;
  velocidad?: number;
  encuadre?: EncuadreClip;
};

export type Candidato = {
  fuente: FuenteVideo;
  /** Identificador estable en la fuente (título File:…, nasa_id, identifier). */
  archivo: string;
  titulo: string;
  pagina: string;
  autor: string;
  licencia: string;
  licenciaUrl?: string;
  /** libre = sin atribución obligatoria (igual se acredita); atribucion = crédito obligatorio en pantalla. */
  clase: 'libre' | 'atribucion';
  ancho: number;
  alto: number;
  duracion: number;
  /** URL de la versión que se descarga y su tamaño aproximado. */
  descarga: string;
  anchoDescarga: number;
  altoDescarga: number;
  /** Metadatos crudos que prueban la licencia (se guardan tal cual en la evidencia). */
  evidencia: Record<string, unknown>;
};

/** Clip ya recortado (va en props.medios; NO en los guiones). */
export type VideoResuelto = {
  tipo: 'video';
  /** Relativa a public/, ej. videos/<id>/1-0.mp4 */
  src: string;
  ancho: number;
  alto: number;
  duracion: number;
  titulo: string;
  pagina: string;
  autor: string;
  licencia: string;
  licenciaUrl?: string;
  /** Nombre legible de la fuente para el crédito ("Wikimedia Commons", "NASA"). */
  fuente: string;
  velocidad?: number;
};

const NOMBRE_FUENTE: Record<FuenteVideo, string> = { commons: 'Wikimedia Commons', nasa: 'NASA', archive: 'Internet Archive', pexels: 'Pexels', pixabay: 'Pixabay' };
const sinHtml = (h: string) => h.replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));

const pedir = async (url: string, cabeceras: Record<string, string> = {}): Promise<Response> => {
  for (let intento = 1; ; intento++) {
    const r = await fetch(url, { headers: { 'User-Agent': USER_AGENT, 'Api-User-Agent': USER_AGENT, ...cabeceras } });
    if (r.ok || intento >= 3 || (r.status !== 429 && r.status < 500)) return r;
    await espera(1500 * intento);
  }
};

/** Clave gratuita opcional: variable de entorno o secrets/<nombre>.key (gitignored). Sin clave, la fuente se salta. */
const clave = (nombre: 'pexels' | 'pixabay'): string | null => {
  const env = process.env[`${nombre.toUpperCase()}_API_KEY`];
  if (env) return env.trim();
  try { return fs.readFileSync(path.join(RAIZ, 'secrets', `${nombre}.key`), 'utf8').trim() || null; } catch { return null; }
};
/** Fuentes que se consultan cuando el guion no fija `fuente`. Internet Archive queda FUERA del automático: sus licencias las declara quien sube (hay copias de YouTube con CC puesto a mano); solo se usa pidiéndolo (`fuente: "archive"`) y revisando la ficha. */
export const fuentesActivas = (): FuenteVideo[] => ['commons', 'nasa', ...(clave('pexels') ? ['pexels' as const] : []), ...(clave('pixabay') ? ['pixabay' as const] : [])];

// ---------------------------------------------------------------------------------------------- Wikimedia Commons
type DerivadoCommons = { src: string; type?: string; transcodekey?: string; width?: number; height?: number };
type PaginaCommons = { index?: number; title: string; categories?: { title: string }[]; videoinfo?: { url: string; descriptionurl: string; width: number; height: number; duration?: number; size: number; mime: string; extmetadata?: Record<string, { value: unknown }>; derivatives?: DerivadoCommons[] }[] };
const CATEGORIAS_PROHIBIDAS = /trademark|nudity|nude\b|pornograph|non-free|fair use/i;

/** Elige la versión transcodificada más útil: VP9 ≤ 1080 px de lado menor; si no hay, el original si es liviano. */
const derivadoCommons = (vi: NonNullable<PaginaCommons['videoinfo']>[number]): { src: string; w: number; h: number } | null => {
  const ds = (vi.derivatives ?? []).filter((d) => /vp9\.webm$/.test(d.transcodekey ?? '') && d.width && d.height);
  const lado = (d: DerivadoCommons) => Math.min(d.width!, d.height!);
  const buenos = ds.filter((d) => lado(d) <= 1080).sort((a, b) => lado(b) - lado(a));
  if (buenos.length && lado(buenos[0]) >= 480) return { src: buenos[0].src, w: buenos[0].width!, h: buenos[0].height! };
  if (/^(video\/(webm|ogg|mp4)|application\/ogg)/.test(vi.mime) && vi.size <= MAX_CRUDO_MB * 1e6) return { src: vi.url, w: vi.width, h: vi.height };
  return buenos.length ? { src: buenos[0].src, w: buenos[0].width!, h: buenos[0].height! } : null;
};

export const buscarCommons = async (p: Pick<PedidoVideo, 'buscar' | 'archivo'>, limite = 25): Promise<{ candidatos: Candidato[]; rechazos: string[] }> => {
  const q = new URLSearchParams({
    action: 'query', format: 'json', formatversion: '1', prop: 'videoinfo|categories', cllimit: 'max',
    viprop: 'url|size|mime|extmetadata|derivatives',
    viextmetadatafilter: 'LicenseShortName|LicenseUrl|Artist|Credit|ObjectName|Restrictions|ImageDescription|DateTimeOriginal',
  });
  if (p.archivo) q.set('titles', p.archivo.startsWith('File:') ? p.archivo : `File:${p.archivo}`);
  else { q.set('generator', 'search'); q.set('gsrsearch', `${p.buscar} filetype:video`); q.set('gsrnamespace', '6'); q.set('gsrlimit', String(limite)); }
  const url = `https://commons.wikimedia.org/w/api.php?${q}`;
  const r = await pedir(url);
  if (!r.ok) throw new Error(`Commons respondió ${r.status}`);
  const d = (await r.json()) as { query?: { pages?: Record<string, PaginaCommons> } };
  const paginas = Object.values(d.query?.pages ?? {}).sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
  const candidatos: Candidato[] = [], rechazos: string[] = [];
  for (const pg of paginas) {
    const vi = pg.videoinfo?.[0];
    if (!vi) continue;
    const m = vi.extmetadata ?? {};
    const txt = (k: string) => (typeof m[k]?.value === 'string' ? sinHtml(m[k]!.value as string) : '');
    const corta = txt('LicenseShortName');
    const clase = clasificarLicencia(corta);
    const der = derivadoCommons(vi);
    const motivo =
      !/^(video\/|application\/ogg)/.test(vi.mime) ? `formato ${vi.mime}`
      : !clase ? `licencia "${corta || '?'}"`
      : txt('Restrictions') ? `restricciones "${txt('Restrictions').slice(0, 40)}"`
      : pg.categories?.some((c) => CATEGORIAS_PROHIBIDAS.test(c.title)) ? 'categoría prohibida'
      : Math.min(vi.width, vi.height) < 480 ? `chico (${vi.width}×${vi.height})`
      : (vi.duration ?? 0) < 2 ? 'dura menos de 2 s'
      : !der ? 'sin versión descargable liviana'
      : '';
    if (motivo) { rechazos.push(`${pg.title}: ${motivo}`); continue; }
    candidatos.push({
      fuente: 'commons', archivo: pg.title, titulo: pg.title.replace(/^File:/, '').replace(/\.[a-z0-9]+$/i, ''), pagina: vi.descriptionurl,
      autor: txt('Artist') || txt('Credit') || 'Autor desconocido (Wikimedia Commons)', licencia: corta, licenciaUrl: txt('LicenseUrl') || undefined, clase: clase!,
      ancho: vi.width, alto: vi.height, duracion: vi.duration ?? 0, descarga: der!.src, anchoDescarga: der!.w, altoDescarga: der!.h,
      evidencia: { api: url, consultado: new Date().toISOString(), extmetadata: Object.fromEntries(Object.entries(m).map(([k, v]) => [k, typeof v.value === 'string' ? sinHtml(v.value) : v.value])), categorias: pg.categories?.map((c) => c.title) },
    });
  }
  return { candidatos, rechazos };
};

// ---------------------------------------------------------------------------------------------- NASA (images-api.nasa.gov, sin clave)
type ItemNasa = { href: string; data: { nasa_id: string; title: string; description?: string; center?: string; photographer?: string; secondary_creator?: string; date_created?: string; keywords?: string[] }[] };
/** Material de terceros dentro de NASA (no es dominio público): se descarta por la descripción o el crédito. */
const TERCEROS_NASA = /©|\(c\)\s|copyright|all rights reserved|courtesy of (?!nasa)|credit:\s*(?!nasa)[a-z]/i;

export const buscarNasa = async (p: Pick<PedidoVideo, 'buscar' | 'archivo'>, limite = 12): Promise<{ candidatos: Candidato[]; rechazos: string[] }> => {
  const url = p.archivo ? `https://images-api.nasa.gov/search?nasa_id=${encodeURIComponent(p.archivo)}&media_type=video` : `https://images-api.nasa.gov/search?q=${encodeURIComponent(p.buscar)}&media_type=video`;
  const r = await pedir(url);
  if (!r.ok) throw new Error(`NASA respondió ${r.status}`);
  const items = ((await r.json()) as { collection: { items: ItemNasa[] } }).collection.items.slice(0, limite);
  const candidatos: Candidato[] = [], rechazos: string[] = [];
  for (const it of items) {
    const d = it.data[0];
    const texto = `${d.description ?? ''} ${d.secondary_creator ?? ''} ${d.photographer ?? ''}`;
    if (TERCEROS_NASA.test(texto)) { rechazos.push(`${d.nasa_id}: menciona derechos de terceros`); continue; }
    try {
      const a = (await (await pedir(`https://images-api.nasa.gov/asset/${encodeURIComponent(d.nasa_id)}`)).json()) as { collection: { items: { href: string }[] } };
      const mp4 = a.collection.items.map((x) => x.href).filter((h) => /\.mp4$/i.test(h));
      // Preferencia: ~large (≈1080p) → ~medium → ~orig → cualquiera; nunca ~preview/~mobile si hay otra.
      const orden = ['~large.mp4', '~medium.mp4', '~orig.mp4', '~small.mp4'];
      const elegido = orden.map((s) => mp4.find((h) => h.endsWith(s))).find(Boolean) ?? mp4.find((h) => !/~(preview|mobile)/.test(h)) ?? mp4[0];
      if (!elegido) { rechazos.push(`${d.nasa_id}: sin mp4`); continue; }
      candidatos.push({
        fuente: 'nasa', archivo: d.nasa_id, titulo: d.title, pagina: `https://images.nasa.gov/details/${d.nasa_id}`,
        autor: `NASA${d.center ? ` (${d.center})` : ''}`, licencia: 'Public domain', licenciaUrl: 'https://www.nasa.gov/nasa-brand-center/images-and-media/', clase: 'libre',
        ancho: 0, alto: 0, duracion: 0, descarga: elegido.replace(/^http:/, 'https:').replace(/ /g, '%20'), anchoDescarga: 0, altoDescarga: 0,
        evidencia: { api: url, consultado: new Date().toISOString(), ficha: d, nota: 'NASA Media Usage Guidelines: el material de NASA no tiene copyright en EE. UU. salvo indicación; ficha sin mención de terceros.' },
      });
    } catch (e) { rechazos.push(`${d.nasa_id}: ${(e as Error).message}`); }
  }
  return { candidatos, rechazos };
};

// ---------------------------------------------------------------------------------------------- Internet Archive (solo con licencia explícita)
const LICENCIA_ARCHIVE = (u: string | undefined): { corta: string; clase: 'libre' | 'atribucion' } | null => {
  const s = (u ?? '').toLowerCase();
  if (/publicdomain\/(mark|zero)/.test(s)) return { corta: /zero/.test(s) ? 'CC0' : 'Public domain', clase: 'libre' };
  const m = /creativecommons\.org\/licenses\/(by|by-sa)\/(\d\.\d)/.exec(s);
  return m ? { corta: `CC ${m[1].toUpperCase()} ${m[2]}`, clase: 'atribucion' } : null;
};

export const buscarArchive = async (p: Pick<PedidoVideo, 'buscar' | 'archivo'>, limite = 15): Promise<{ candidatos: Candidato[]; rechazos: string[] }> => {
  const consulta = p.archivo ? `identifier:${p.archivo}` : `(${p.buscar}) AND mediatype:movies AND licenseurl:*`;
  const url = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(consulta)}&fl[]=identifier&fl[]=title&fl[]=licenseurl&fl[]=creator&fl[]=year&rows=${limite}&output=json`;
  const r = await pedir(url);
  if (!r.ok) throw new Error(`archive.org respondió ${r.status}`);
  const docs = ((await r.json()) as { response: { docs: { identifier: string; title?: string; licenseurl?: string; creator?: string | string[]; year?: string }[] } }).response.docs;
  const candidatos: Candidato[] = [], rechazos: string[] = [];
  for (const d of docs) {
    const lic = LICENCIA_ARCHIVE(d.licenseurl);
    if (/^youtube-|^tiktok-|^twitter-/.test(d.identifier)) { rechazos.push(`${d.identifier}: copia de otra plataforma`); continue; }
    if (!lic) { rechazos.push(`${d.identifier}: licencia "${d.licenseurl ?? 'sin declarar'}"`); continue; }
    try {
      const meta = (await (await pedir(`https://archive.org/metadata/${d.identifier}`)).json()) as { files?: { name: string; format?: string; size?: string; width?: string; height?: string; length?: string }[]; metadata?: Record<string, unknown> };
      const mp4 = (meta.files ?? []).filter((f) => /\.mp4$/i.test(f.name) && Number(f.size ?? 0) <= MAX_CRUDO_MB * 1e6).sort((a, b) => Number(b.height ?? 0) - Number(a.height ?? 0))[0];
      if (!mp4) { rechazos.push(`${d.identifier}: sin mp4 ≤ ${MAX_CRUDO_MB} MB`); continue; }
      const dur = /:/.test(mp4.length ?? '') ? (mp4.length as string).split(':').reduce((a, x) => a * 60 + Number(x), 0) : Number(mp4.length ?? 0);
      candidatos.push({
        fuente: 'archive', archivo: d.identifier, titulo: d.title ?? d.identifier, pagina: `https://archive.org/details/${d.identifier}`,
        autor: [d.creator].flat().filter(Boolean).join(', ') || 'Internet Archive', licencia: lic.corta, licenciaUrl: d.licenseurl, clase: lic.clase,
        ancho: Number(mp4.width ?? 0), alto: Number(mp4.height ?? 0), duracion: dur, descarga: `https://archive.org/download/${d.identifier}/${encodeURIComponent(mp4.name)}`,
        anchoDescarga: Number(mp4.width ?? 0), altoDescarga: Number(mp4.height ?? 0),
        evidencia: { api: url, consultado: new Date().toISOString(), licenseurl: d.licenseurl, metadata: meta.metadata, nota: 'archive.org no garantiza el estado de derechos: se usa solo con licenseurl explícito de dominio público o CC BY/BY-SA.' },
      });
    } catch (e) { rechazos.push(`${d.identifier}: ${(e as Error).message}`); }
  }
  return { candidatos, rechazos };
};

// ---------------------------------------------------------------------------------------------- Pexels / Pixabay (opcionales, con clave gratuita)
export const buscarPexels = async (p: Pick<PedidoVideo, 'buscar' | 'archivo'>, limite = 15, formato: FormatoClip = 'vertical'): Promise<{ candidatos: Candidato[]; rechazos: string[] }> => {
  const k = clave('pexels');
  if (!k) return { candidatos: [], rechazos: ['pexels: sin clave (secrets/pexels.key o PEXELS_API_KEY)'] };
  const url = p.archivo ? `https://api.pexels.com/videos/videos/${encodeURIComponent(p.archivo)}` : `https://api.pexels.com/videos/search?query=${encodeURIComponent(p.buscar)}&per_page=${limite}&orientation=${formato === 'vertical' ? 'portrait' : 'landscape'}`;
  const r = await pedir(url, { Authorization: k });
  if (!r.ok) throw new Error(`Pexels respondió ${r.status}`);
  const j = (await r.json()) as Record<string, unknown>;
  type V = { id: number; url: string; width: number; height: number; duration: number; user: { name: string; url: string }; video_files: { link: string; width: number; height: number; file_type: string }[] };
  const videos = (p.archivo ? [j as unknown as V] : (j.videos as V[])) ?? [];
  const candidatos = videos.flatMap((v): Candidato[] => {
    const f = v.video_files.filter((x) => x.file_type === 'video/mp4' && Math.min(x.width, x.height) <= 1080).sort((a, b) => b.height * b.width - a.height * a.width)[0];
    return f ? [{ fuente: 'pexels', archivo: String(v.id), titulo: `Pexels ${v.id}`, pagina: v.url, autor: v.user.name, licencia: 'Pexels License', licenciaUrl: 'https://www.pexels.com/license/', clase: 'libre',
      ancho: v.width, alto: v.height, duracion: v.duration, descarga: f.link, anchoDescarga: f.width, altoDescarga: f.height, evidencia: { api: url.replace(k, '…'), consultado: new Date().toISOString(), autor: v.user } }] : [];
  });
  return { candidatos, rechazos: [] };
};

export const buscarPixabay = async (p: Pick<PedidoVideo, 'buscar' | 'archivo'>, limite = 15): Promise<{ candidatos: Candidato[]; rechazos: string[] }> => {
  const k = clave('pixabay');
  if (!k) return { candidatos: [], rechazos: ['pixabay: sin clave (secrets/pixabay.key o PIXABAY_API_KEY)'] };
  const url = `https://pixabay.com/api/videos/?key=${k}&${p.archivo ? `id=${encodeURIComponent(p.archivo)}` : `q=${encodeURIComponent(p.buscar)}&per_page=${Math.max(3, limite)}`}`;
  const r = await pedir(url);
  if (!r.ok) throw new Error(`Pixabay respondió ${r.status}`);
  type H = { id: number; pageURL: string; duration: number; user: string; videos: Record<string, { url: string; width: number; height: number; size: number }> };
  const hits = ((await r.json()) as { hits: H[] }).hits ?? [];
  const candidatos = hits.flatMap((h): Candidato[] => {
    const f = [h.videos.large, h.videos.medium, h.videos.small].filter((x) => x?.url && Math.min(x.width, x.height) <= 1080 && x.size <= MAX_CRUDO_MB * 1e6)[0];
    return f ? [{ fuente: 'pixabay', archivo: String(h.id), titulo: `Pixabay ${h.id}`, pagina: h.pageURL, autor: h.user, licencia: 'Pixabay Content License', licenciaUrl: 'https://pixabay.com/service/license-summary/', clase: 'libre',
      ancho: f.width, alto: f.height, duracion: h.duration, descarga: f.url, anchoDescarga: f.width, altoDescarga: f.height, evidencia: { api: url.replace(k, '…'), consultado: new Date().toISOString(), usuario: h.user } }] : [];
  });
  return { candidatos, rechazos: [] };
};

const BUSCADORES: Record<FuenteVideo, (p: Pick<PedidoVideo, 'buscar' | 'archivo'>, limite?: number, formato?: FormatoClip) => Promise<{ candidatos: Candidato[]; rechazos: string[] }>> =
  { commons: buscarCommons, nasa: buscarNasa, archive: buscarArchive, pexels: buscarPexels, pixabay: buscarPixabay };

/** Busca en una fuente o, sin `fuente`, en todas las activas en orden (Commons primero: es la que mejor cubre Latinoamérica). */
export const buscarVideos = async (p: PedidoVideo, formato: FormatoClip = 'vertical', limite = 20): Promise<{ candidatos: Candidato[]; rechazos: string[] }> => {
  const fuentes = p.fuente ? [p.fuente] : fuentesActivas();
  const candidatos: Candidato[] = [], rechazos: string[] = [];
  for (const f of fuentes) {
    try { const r = await BUSCADORES[f](p, limite, formato); candidatos.push(...r.candidatos); rechazos.push(...r.rechazos); }
    catch (e) { rechazos.push(`${f}: ${(e as Error).message}`); }
    if (p.archivo && candidatos.length) break;
  }
  return { candidatos, rechazos };
};

// ---------------------------------------------------------------------------------------------- descarga y recorte
const TAMANO: Record<FormatoClip, [number, number]> = { vertical: [720, 1280], horizontal: [1280, 720] };

/** Dimensiones y duración reales de un archivo (ffmpeg -i). */
export const sondear = async (archivo: string): Promise<{ ancho: number; alto: number; duracion: number }> => {
  const r = await correrBinario(FFMPEG_R, ['-hide_banner', '-i', archivo]);
  const d = /Duration: (\d+):(\d+):([\d.]+)/.exec(r.error);
  const v = /Video:.*?\b(\d{2,5})x(\d{2,5})\b/.exec(r.error);
  // Rotación en metadatos (celulares): ffmpeg la aplica al decodificar, así que el cuadro útil va girado.
  const rot = /rotation of (-?\d+(?:\.\d+)?) degrees/.exec(r.error);
  let [ancho, alto] = v ? [Number(v[1]), Number(v[2])] : [0, 0];
  if (rot && Math.abs(Math.round(Number(rot[1]))) % 180 === 90) [ancho, alto] = [alto, ancho];
  return { ancho, alto, duracion: d ? Number(d[1]) * 3600 + Number(d[2]) * 60 + Number(d[3]) : 0 };
};

/** Recorta [desde, desde+dur] de `crudo`, lo lleva al formato (recorte centrado o según encuadre), sin audio, H.264 30 fps. */
export const recortar = async (crudo: string, destino: string, desde: number, dur: number, formato: FormatoClip, encuadre: EncuadreClip = 'centro'): Promise<{ ancho: number; alto: number }> => {
  const { ancho: w, alto: h } = await sondear(crudo);
  if (!w || !h) throw new Error('no pude leer el tamaño del video');
  const [W, H] = TAMANO[formato];
  const aspecto = W / H;
  let cw = w, ch = h, x = 0, y = 0;
  if (w / h > aspecto) { cw = Math.floor((h * aspecto) / 2) * 2; x = encuadre === 'izquierda' ? 0 : encuadre === 'derecha' ? w - cw : Math.floor((w - cw) / 2); }
  else { ch = Math.floor(w / aspecto / 2) * 2; y = encuadre === 'arriba' ? 0 : encuadre === 'abajo' ? h - ch : Math.floor((h - ch) / 2); }
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  const r = await correrBinario(FFMPEG_R, ['-v', 'error', '-y', '-ss', desde.toFixed(2), '-t', dur.toFixed(2), '-i', crudo, '-an', '-vf', `crop=${cw}:${ch}:${x}:${y},scale=${W}:${H},format=yuv420p`,
    '-r', '30', '-c:v', 'libx264', '-preset', 'medium', '-crf', '21', '-movflags', '+faststart', destino]);
  if (r.codigo !== 0 || !fs.existsSync(destino) || fs.statSync(destino).size < 2000) throw new Error(`ffmpeg (recorte): ${r.error.trim().split('\n').pop() || 'salida vacía'}`);
  return { ancho: W, alto: H };
};

const descargar = async (url: string, destino: string): Promise<{ bytes: number; sha256: string }> => {
  const r = await pedir(url);
  if (!r.ok || !r.body) throw new Error(`descarga ${r.status}`);
  const largo = Number(r.headers.get('content-length') ?? 0);
  if (largo > MAX_CRUDO_MB * 1e6) throw new Error(`pesa ${(largo / 1e6).toFixed(0)} MB (máx. ${MAX_CRUDO_MB})`);
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  const hash = crypto.createHash('sha256');
  const salida = fs.createWriteStream(destino);
  let bytes = 0;
  for await (const trozo of r.body as unknown as AsyncIterable<Uint8Array>) {
    bytes += trozo.length;
    if (bytes > MAX_CRUDO_MB * 1e6) { salida.destroy(); fs.rmSync(destino, { force: true }); throw new Error(`pasa de ${MAX_CRUDO_MB} MB`); }
    hash.update(trozo);
    if (!salida.write(trozo)) await new Promise((ok) => salida.once('drain', ok));
  }
  await new Promise<void>((ok, mal) => { salida.end(() => ok()); salida.on('error', mal); });
  return { bytes, sha256: hash.digest('hex') };
};

export type Evidencia = { clave: string; pedido: PedidoVideo; video: VideoResuelto; candidato: Omit<Candidato, 'evidencia'>; evidencia: Record<string, unknown>; crudo: { url: string; bytes: number; sha256: string }; extracto: { desdeSeg: number; duracionSeg: number; formato: FormatoClip } };

/**
 * Resuelve UN pedido: busca, elige el primer candidato válido (o el `archivo` fijado), descarga, recorta y devuelve el
 * clip + su evidencia. Con caché: si el pedido no cambió y el mp4 existe, no toca la red.
 */
export const prepararVideo = async (id: string, etiqueta: string, pedido: PedidoVideo, formato: FormatoClip, previa?: Evidencia): Promise<Evidencia | null> => {
  const dur = Math.min(10, Math.max(1.5, pedido.duracionSeg ?? 4)) * (pedido.velocidad ?? 1) + 0.4;
  const claveCache = JSON.stringify([pedido.buscar, pedido.archivo ?? '', pedido.fuente ?? '', pedido.desdeSeg ?? null, +dur.toFixed(2), pedido.encuadre ?? 'centro', formato]);
  const src = `videos/${id}/${etiqueta}.mp4`;
  const destino = path.join(RAIZ, 'public', src);
  if (previa && previa.clave === claveCache && fs.existsSync(destino)) { console.log(`  video ${etiqueta}: en caché (${previa.video.titulo})`); return previa; }
  const { candidatos, rechazos } = await buscarVideos(pedido, formato);
  // Sin `archivo`, preferimos un clip cuya orientación calce con el formato y que dure lo suficiente.
  const sirve = (c: Candidato) => !c.duracion || c.duracion >= dur + 0.5;
  const orientado = (c: Candidato) => !c.ancho || (formato === 'vertical' ? c.alto >= c.ancho : c.ancho >= c.alto);
  const orden = pedido.archivo ? candidatos : [...candidatos.filter((c) => sirve(c) && orientado(c)), ...candidatos.filter((c) => sirve(c) && !orientado(c))];
  if (!orden.length) { console.warn(`  ⚠ video ${etiqueta} "${pedido.buscar}": ninguno válido (${rechazos.slice(0, 3).join('; ') || 'sin resultados'}). La línea sigue con el mapa.`); return null; }
  const tmp = path.join(RAIZ, 'salida', 'tmp', 'videos-crudos');
  for (const c of orden.slice(0, 3)) {
    const crudo = path.join(tmp, `${id}-${etiqueta}${path.extname(new URL(c.descarga).pathname) || '.bin'}`);
    try {
      const bajada = await descargar(c.descarga, crudo);
      const real = await sondear(crudo);
      const total = real.duracion || c.duracion;
      const desde = Math.max(0, Math.min(pedido.desdeSeg ?? total * 0.12, Math.max(0, total - dur - 0.1)));
      const durReal = Math.min(dur, total - desde);
      const { ancho, alto } = await recortar(crudo, destino, desde, durReal, formato, pedido.encuadre);
      const { evidencia, ...resto } = c;
      const video: VideoResuelto = { tipo: 'video', src, ancho, alto, duracion: +durReal.toFixed(2), titulo: c.titulo, pagina: c.pagina, autor: c.autor, licencia: c.licencia, licenciaUrl: c.licenciaUrl, fuente: NOMBRE_FUENTE[c.fuente], velocidad: pedido.velocidad };
      console.log(`  video ${etiqueta} "${pedido.buscar}" → ${c.titulo} (${c.licencia}, ${NOMBRE_FUENTE[c.fuente]}; ${desde.toFixed(1)}–${(desde + durReal).toFixed(1)} s de ${total.toFixed(0)} s; ${(fs.statSync(destino).size / 1e6).toFixed(1)} MB)`);
      return { clave: claveCache, pedido, video, candidato: { ...resto, ancho: real.ancho || c.ancho, alto: real.alto || c.alto, duracion: total }, evidencia, crudo: { url: c.descarga, ...bajada }, extracto: { desdeSeg: +desde.toFixed(2), duracionSeg: +durReal.toFixed(2), formato } };
    } catch (e) {
      console.warn(`  ⚠ video ${etiqueta}: ${c.titulo}: ${(e as Error).message}`);
    } finally { fs.rmSync(crudo, { force: true }); }
  }
  return null;
};

/** Línea de crédito para la descripción (TASL: título, autor, fuente, licencia con enlace). */
export const creditoVideo = (v: Pick<VideoResuelto, 'titulo' | 'autor' | 'licencia' | 'licenciaUrl' | 'pagina' | 'fuente'>) =>
  `- ${v.titulo} · ${v.autor} · ${v.licencia}${v.licenciaUrl && /^cc/i.test(v.licencia) ? ` (${v.licenciaUrl})` : ''} · ${v.fuente} · ${v.pagina}`;

export const rutaEvidencia = (id: string) => path.join(RAIZ, 'contenido', 'licencias-video', `${id}.json`);
