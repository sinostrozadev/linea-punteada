/**
 * Fondos satelitales de frontera v2: VARIOS recortes por video, uno por grupo de planos según su escala.
 *  - zoom < 9  → NASA Blue Marble con relieve sombreado y batimetría (o Blue Marble mensual si `mes`), GIBS, dominio público.
 *  - zoom ≥ 9  → Sentinel-2 cloudless 2016 de EOX (10 m, CC BY 4.0: "Sentinel-2 cloudless – https://s2maps.eu by EOX
 *                IT Services GmbH (Contains modified Copernicus Sentinel data 2016)"). OJO: los años 2017+ son
 *                CC BY-NC-SA y NO se usan. Respaldo: Landsat WELD de GIBS (30 m, dominio público).
 * Cada recorte se pide en EPSG:4326 (encaja como rectángulo en la proyección equirectangular del mapa).
 * Caché por URL en public/mapas/<id>-f<n>.jpg + .json. Si todo falla, el mapa cae a vectores oscuros.
 */
import fs from 'node:fs';
import path from 'node:path';
import type { FondoCapa } from '../../src/plantillas/frontera/guion';
import { gradosPorPx, type LonLat } from '../../src/plantillas/frontera/mapa';

const GIBS = 'https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi';
const EOX = 'https://tiles.maps.eox.at/wms';
const LADO_MAX = 2048;
const USER_AGENT = 'LineaPunteada/1.0 (canal de YouTube Línea Punteada; contacto: sinostrozadev@gmail.com)';

type Capa = { id: string; url: (bbox: number[], w: number, h: number) => string; credito: string };

const wms = (base: string, capa: string, extra = '') => (bbox: number[], w: number, h: number) =>
  `${base}?SERVICE=WMS&REQUEST=GetMap&VERSION=1.1.1&LAYERS=${capa}&STYLES=&SRS=EPSG:4326&BBOX=${bbox.join(',')}&WIDTH=${w}&HEIGHT=${h}&FORMAT=image/jpeg${extra}`;

export const CAPAS = {
  relieve: { id: 'BlueMarble_ShadedRelief_Bathymetry', url: wms(GIBS, 'BlueMarble_ShadedRelief_Bathymetry'), credito: 'NASA Blue Marble (relieve) · GIBS' },
  mensual: (mes: number): Capa => ({
    id: `BlueMarble_NextGeneration_${mes}`,
    url: wms(GIBS, 'BlueMarble_NextGeneration', `&TIME=2004-${String(mes).padStart(2, '0')}-01`),
    credito: 'NASA Blue Marble Next Generation · GIBS',
  }),
  sentinel: { id: 's2cloudless', url: wms(EOX, 's2cloudless'), credito: 'Sentinel-2 cloudless – s2maps.eu by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016), CC BY 4.0' },
  landsat: { id: 'Landsat_WELD', url: wms(GIBS, 'Landsat_WELD_CorrectedReflectance_TrueColor_Global_Annual'), credito: 'NASA GIBS · Landsat WELD (USGS/NASA)' },
} as const;

/** Lo que la cámara necesita ver: centro y rango de zoom de un plano (o de la tarjeta de título). */
export type Vista = { centro: LonLat; zoomMin: number; zoomMax: number };
type Pedido = { capa: Capa; respaldo?: Capa; bbox: [number, number, number, number]; gradosPx: number; zoom: number };

const extension = (v: Vista, ancho: number, alto: number, margen: number): [number, number, number, number] => {
  const g = gradosPorPx(v.zoomMin) * margen;
  const r = (x: number) => Math.round(x * 1e5) / 1e5;
  return [r(v.centro[0] - (ancho / 2) * g), r(Math.max(-89, v.centro[1] - (alto / 2) * g)), r(v.centro[0] + (ancho / 2) * g), r(Math.min(89, v.centro[1] + (alto / 2) * g))];
};
const contiene = (a: number[], b: number[]) => a[0] <= b[0] && a[1] <= b[1] && a[2] >= b[2] && a[3] >= b[3];

/** Agrupa las vistas en recortes: reutiliza uno existente si las cubre con detalle suficiente. */
export const planificarFondos = (vistas: Vista[], ancho: number, alto: number, mes?: number): Pedido[] => {
  const pedidos: Pedido[] = [];
  for (const v of [...vistas].sort((a, b) => a.zoomMin - b.zoomMin)) {
    const lejos = v.zoomMax < 9;
    const capa = lejos ? (mes ? CAPAS.mensual(mes) : CAPAS.relieve) : CAPAS.sentinel;
    const necesario = gradosPorPx(v.zoomMax);
    const bbox = extension(v, ancho, alto, 1.4);
    const sirve = pedidos.find((p) => p.capa.id === capa.id && contiene(p.bbox, bbox) && p.gradosPx <= necesario * 1.7);
    if (sirve) { sirve.zoom = Math.min(sirve.zoom, v.zoomMin); continue; }
    const w = bbox[2] - bbox[0], h = bbox[3] - bbox[1];
    const gradosPx = Math.max(necesario, Math.max(w, h) / LADO_MAX);
    pedidos.push({ capa, respaldo: lejos ? undefined : CAPAS.landsat, bbox, gradosPx, zoom: v.zoomMin });
  }
  return pedidos;
};

const pedir = async (url: string): Promise<Buffer | null> => {
  for (let intento = 1; intento <= 3; intento++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(90_000) });
      const tipo = r.headers.get('content-type') ?? '';
      if (r.ok && tipo.startsWith('image/jpeg')) {
        const b = Buffer.from(await r.arrayBuffer());
        if (b.length > 12_000) return b;
        console.warn(`  ⚠ satélite: JPEG de ${b.length} bytes (¿sin datos?)`);
        return null;
      }
      console.warn(`  ⚠ satélite respondió ${r.status} ${tipo} (intento ${intento})`);
      if (r.status < 500 && r.status !== 429) return null;
    } catch (e) {
      console.warn(`  ⚠ satélite: ${(e as Error).message} (intento ${intento})`);
    }
    await new Promise((ok) => setTimeout(ok, 1500 * intento));
  }
  return null;
};

/** Baja (o reutiliza) los recortes. Devuelve las capas ordenadas de menos a más detalle. */
export const bajarFondos = async (raiz: string, id: string, pedidos: Pedido[]): Promise<FondoCapa[]> => {
  const dir = path.join(raiz, 'public', 'mapas');
  fs.mkdirSync(dir, { recursive: true });
  const salida: FondoCapa[] = [];
  for (let n = 0; n < pedidos.length; n++) {
    const p = pedidos[n];
    const w = Math.max(64, Math.round((p.bbox[2] - p.bbox[0]) / p.gradosPx));
    const h = Math.max(64, Math.round((p.bbox[3] - p.bbox[1]) / p.gradosPx));
    const jpg = path.join(dir, `${id}-f${n}.jpg`);
    const meta = path.join(dir, `${id}-f${n}.json`);
    let listo: FondoCapa | null = null;
    for (const capa of [p.capa, p.respaldo].filter(Boolean) as Capa[]) {
      const url = capa.url(p.bbox, w, h);
      try {
        const previo = JSON.parse(fs.readFileSync(meta, 'utf8')) as FondoCapa & { url: string };
        if (previo.url === url && fs.existsSync(jpg)) { listo = { ...previo, zoom: p.zoom }; console.log(`  satélite f${n}: en caché (${capa.id}, ${w}×${h})`); break; }
      } catch { /* primera vez */ }
      console.log(`  satélite f${n}: ${capa.id} [${p.bbox.join(', ')}] ${w}×${h} (~${Math.round(p.gradosPx * 111_320)} m/px)`);
      const datos = await pedir(url);
      if (!datos) continue;
      fs.writeFileSync(jpg, datos);
      listo = { src: `mapas/${id}-f${n}.jpg`, bbox: p.bbox, capa: capa.id, credito: capa.credito, zoom: p.zoom, gradosPx: p.gradosPx };
      fs.writeFileSync(meta, JSON.stringify({ ...listo, url }, null, 2) + '\n');
      break;
    }
    if (listo) salida.push(listo);
  }
  return salida.sort((a, b) => b.gradosPx - a.gradosPx);
};
