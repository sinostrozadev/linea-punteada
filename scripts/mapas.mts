/**
 * Fondo raster de los mapas: recorte de NASA GIBS por WMS (EPSG:4326, sin clave, datos NASA de uso libre).
 *   npx tsx scripts/mapas.mts <ruta-guion.json>     (prueba suelta; normalmente lo llama preparar-frontera)
 * - Escala de ciudad/región (< 400 m por píxel pedido): Landsat WELD (30 m, color verdadero).
 * - Escala de país/continente: Blue Marble Next Generation (satelite) o Blue Marble con relieve y batimetría (relieve).
 * Guarda public/mapas/<id>.jpg + <id>.json (caché por URL). Si GIBS no responde o devuelve algo que no es
 * un JPEG razonable, prueba Blue Marble; si también falla devuelve undefined y el mapa cae a vectores oscuros.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { FondoResuelto, MapaFrontera } from '../src/plantillas/frontera/guion';
import { cajaVisible } from '../src/plantillas/frontera/mapa';
import { FORMATO } from '../src/marca/tokens';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WMS = 'https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi';
const LADO_MAX = 2048;
const USER_AGENT = 'LineaPunteada/1.0 (canal de YouTube Línea Punteada; contacto: sinostrozadev@gmail.com)';

const CAPAS = {
  landsat: { capa: 'Landsat_WELD_CorrectedReflectance_TrueColor_Global_Annual', credito: 'Imagen: NASA GIBS · Landsat WELD (USGS/NASA)' },
  bluemarble: { capa: 'BlueMarble_NextGeneration', credito: 'Imagen: NASA Blue Marble · GIBS' },
  relieve: { capa: 'BlueMarble_ShadedRelief_Bathymetry', credito: 'Imagen: NASA Blue Marble (relieve) · GIBS' },
} as const;

const urlWms = (capa: string, bbox: number[], ancho: number, alto: number) =>
  `${WMS}?SERVICE=WMS&REQUEST=GetMap&VERSION=1.1.1&LAYERS=${capa}&SRS=EPSG:4326&BBOX=${bbox.join(',')}&WIDTH=${ancho}&HEIGHT=${alto}&FORMAT=image/jpeg`;

const pedir = async (url: string): Promise<Buffer | null> => {
  for (let intento = 1; intento <= 3; intento++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(60_000) });
      const tipo = r.headers.get('content-type') ?? '';
      if (r.ok && tipo.startsWith('image/jpeg')) {
        const b = Buffer.from(await r.arrayBuffer());
        if (b.length > 15_000) return b; // un JPEG casi vacío = zona sin datos
        console.warn(`  ⚠ GIBS devolvió un JPEG de ${b.length} bytes (¿sin datos?)`);
        return null;
      }
      console.warn(`  ⚠ GIBS respondió ${r.status} ${tipo} (intento ${intento})`);
      if (r.status < 500 && r.status !== 429) return null;
    } catch (e) {
      console.warn(`  ⚠ GIBS: ${(e as Error).message} (intento ${intento})`);
    }
    await new Promise((ok) => setTimeout(ok, 1500 * intento));
  }
  return null;
};

/** Descarga (o reutiliza) el recorte satelital de un mapa. undefined = usar vectores. */
export const prepararFondo = async (id: string, mapa: MapaFrontera): Promise<FondoResuelto | undefined> => {
  if (mapa.fondo === 'oscuro') return undefined;
  if (Math.abs(mapa.centro[1]) > 60) {
    console.log('  mapa: |lat| > 60 → globo ortográfico con vectores (el raster equirectangular no encaja)');
    return undefined;
  }
  const bbox = cajaVisible(mapa, FORMATO.ancho, FORMATO.alto);
  const [w, s, e, n] = bbox;
  const dLon = e - w;
  const dLat = n - s;
  const ancho = Math.round(dLon >= dLat ? LADO_MAX : (LADO_MAX * dLon) / dLat);
  const alto = Math.round(dLat >= dLon ? LADO_MAX : (LADO_MAX * dLat) / dLon);
  const metrosPorPx = (dLon / ancho) * 111_320 * Math.cos((((s + n) / 2) * Math.PI) / 180);
  const preferida = metrosPorPx < 400 ? CAPAS.landsat : mapa.fondo === 'relieve' ? CAPAS.relieve : CAPAS.bluemarble;
  const orden = preferida === CAPAS.landsat ? [CAPAS.landsat, CAPAS.bluemarble] : [preferida];
  const dir = path.join(RAIZ, 'public', 'mapas');
  fs.mkdirSync(dir, { recursive: true });
  const rutaJpg = path.join(dir, `${id}.jpg`);
  const rutaMeta = path.join(dir, `${id}.json`);
  for (const c of orden) {
    const url = urlWms(c.capa, bbox, ancho, alto);
    try {
      const previo = JSON.parse(fs.readFileSync(rutaMeta, 'utf8')) as FondoResuelto & { url: string };
      if (previo.url === url && fs.existsSync(rutaJpg)) {
        console.log(`  mapa: en caché (${c.capa}, ${ancho}×${alto})`);
        return { src: previo.src, bbox: previo.bbox, capa: previo.capa, credito: previo.credito };
      }
    } catch { /* primera vez */ }
    console.log(`  mapa: GIBS ${c.capa} bbox [${bbox.join(', ')}] ${ancho}×${alto} (~${Math.round(metrosPorPx)} m/px)`);
    const datos = await pedir(url);
    if (!datos) continue;
    fs.writeFileSync(rutaJpg, datos);
    const fondo: FondoResuelto = { src: `mapas/${id}.jpg`, bbox, capa: c.capa, credito: c.credito };
    fs.writeFileSync(rutaMeta, JSON.stringify({ ...fondo, url }, null, 2) + '\n');
    console.log(`  mapa: ${path.relative(RAIZ, rutaJpg)} (${Math.round(datos.length / 1024)} KB)`);
    return fondo;
  }
  console.warn('  ⚠ mapa: sin recorte satelital; el video usará el mapa oscuro de Natural Earth.');
  return undefined;
};

const esPrincipal = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (esPrincipal) {
  const ruta = process.argv[2];
  if (!ruta) { console.error('uso: npx tsx scripts/mapas.mts <ruta-guion.json>'); process.exit(2); }
  const crudo = JSON.parse(fs.readFileSync(path.resolve(ruta), 'utf8'));
  const g = crudo.plantilla ? crudo.props : crudo;
  const f = await prepararFondo(g.id, g.mapa);
  console.log(f ?? 'sin fondo');
  process.exit(0);
}
