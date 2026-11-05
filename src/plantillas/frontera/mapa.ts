/**
 * Geometría del mapa de `frontera` (módulo puro: lo usan la composición y preparar-frontera).
 * - Zoom tipo mapa web: a zoom z la Tierra mide 256·2^z px de ancho → escala d3 = 256·2^z / 2π px por radián.
 * - Proyección: equirectangular cuando hay fondo raster (el recorte NASA viene en EPSG:4326, así encaja
 *   exacto como un rectángulo), Mercator con vectores solos, ortográfica (globo) si |lat| > 60.
 */
import { geoEquirectangular, geoMercator, geoOrthographic, type GeoProjection } from 'd3-geo';
import versor from 'versor';
import type { MapaFrontera } from './guion';

export type LonLat = [number, number];
export type TipoProyeccion = 'equirectangular' | 'mercator' | 'ortografica';
export type Camara = { centro: LonLat; zoom: number };

export const escalaDeZoom = (zoom: number) => (256 * Math.pow(2, zoom)) / (2 * Math.PI);

/** Qué proyección usa un mapa, según su centro y si hay fondo raster resuelto. */
export const tipoProyeccion = (mapa: Pick<MapaFrontera, 'centro'>, hayRaster: boolean): TipoProyeccion =>
  Math.abs(mapa.centro[1]) > 60 ? 'ortografica' : hayRaster ? 'equirectangular' : 'mercator';

/** Proyección d3 para una cámara y un lienzo (ancho × alto px). */
export const proyeccion = (tipo: TipoProyeccion, cam: Camara, ancho: number, alto: number): GeoProjection => {
  const k = escalaDeZoom(cam.zoom);
  if (tipo === 'ortografica') {
    return geoOrthographic().scale(k).translate([ancho / 2, alto / 2]).rotate([-cam.centro[0], -cam.centro[1], 0]).clipAngle(90);
  }
  const base = tipo === 'mercator' ? geoMercator() : geoEquirectangular();
  return base.scale(k).center(cam.centro).translate([ancho / 2, alto / 2]).clipExtent([[-80, -80], [ancho + 80, alto + 80]]);
};

/** Interpola el centro entre dos cámaras (en el globo, por el arco corto con versor). */
export const interpolarCentro = (a: LonLat, b: LonLat, t: number, tipo: TipoProyeccion): LonLat => {
  if (tipo === 'ortografica') {
    const r = versor.interpolate([-a[0], -a[1], 0], [-b[0], -b[1], 0])(t);
    return [-r[0], -r[1]];
  }
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
};

/** Fotogramas clave de la cámara: el arranque y los saltos por escena (segundos absolutos). */
export const clavesCamara = (mapa: MapaFrontera, inicioEscena: (i: number) => number): { t: number; cam: Camara }[] => {
  const claves = [{ t: 0, cam: { centro: mapa.centro, zoom: mapa.zoomInicial } }];
  for (const z of [...(mapa.zooms ?? [])].sort((a, b) => a.escena - b.escena)) {
    claves.push({ t: inicioEscena(z.escena), cam: { centro: z.centro, zoom: z.zoom } });
  }
  return claves;
};

/** Grados por píxel horizontal a un zoom dado (equirectangular/Mercator en el ecuador). */
export const gradosPorPx = (zoom: number) => 360 / (256 * Math.pow(2, zoom));

/**
 * Caja [oeste, sur, este, norte] que cubre todo lo que la cámara llegará a mostrar (todas las claves al
 * zoom mínimo efectivo, con margen). Es la que se pide a NASA GIBS.
 */
export const cajaVisible = (mapa: MapaFrontera, ancho: number, alto: number, margen = 1.25): [number, number, number, number] => {
  const deriva = Math.min(0, mapa.zoomFinal - mapa.zoomInicial);
  const centros: LonLat[] = [mapa.centro, ...(mapa.zooms ?? []).map((z) => z.centro)];
  const zoomMin = Math.min(mapa.zoomInicial, ...(mapa.zooms ?? []).map((z) => z.zoom)) + deriva;
  const g = gradosPorPx(zoomMin);
  const medioAncho = (ancho / 2) * g * margen;
  const medioAlto = (alto / 2) * g * margen;
  let [w, s, e, n] = [Infinity, Infinity, -Infinity, -Infinity];
  for (const [lon, lat] of centros) {
    w = Math.min(w, lon - medioAncho); e = Math.max(e, lon + medioAncho);
    s = Math.min(s, lat - medioAlto); n = Math.max(n, lat + medioAlto);
  }
  const r = (x: number) => Math.round(x * 1e5) / 1e5;
  return [r(Math.max(-180, w)), r(Math.max(-90, s)), r(Math.min(180, e)), r(Math.min(90, n))];
};

/** Cuánto tarda en dibujarse una línea (segundos). */
export const DURACION_TRAZO_SEG = 1.6;

/** Segundo absoluto en que se dibuja / aparece algo anclado a una escena (-1 = gancho). */
export const inicioDeEscena = (inicioEscena: (i: number) => number | undefined, escena: number) =>
  escena < 0 ? 0.25 : (inicioEscena(escena) ?? 0) + 0.3;
