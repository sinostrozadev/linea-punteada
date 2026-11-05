/**
 * Geometría de Natural Earth 1:10 M (world-atlas, dominio público) recortada a una caja [o, s, e, n]: tierra
 * (para oscurecer el océano y dibujar el brillo de costa), bordes entre países y los países que pidan las
 * máscaras. Se guarda en los props de frontera v2 para no proyectar el planeta entero en cada frame.
 */
import fs from 'node:fs';
import path from 'node:path';
import { feature, mesh } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { FeatureCollection, Geometry, MultiLineString, Polygon, MultiPolygon } from 'geojson';
import type { GeoRecortado, Poligonos } from '../../src/plantillas/frontera/guion';

type P = [number, number];
type Caja = [number, number, number, number];

const leer = (n: string) => JSON.parse(fs.readFileSync(path.resolve('node_modules/world-atlas', n), 'utf8'));

/** Sutherland–Hodgman de un anillo contra la caja (en grados; vale para regiones que no cruzan el antimeridiano). */
const recortarAnillo = (anillo: P[], [o, s, e, n]: Caja): P[] => {
  const bordes: [(p: P) => boolean, (a: P, b: P) => P][] = [
    [(p) => p[0] >= o, (a, b) => [o, a[1] + ((b[1] - a[1]) * (o - a[0])) / (b[0] - a[0])]],
    [(p) => p[0] <= e, (a, b) => [e, a[1] + ((b[1] - a[1]) * (e - a[0])) / (b[0] - a[0])]],
    [(p) => p[1] >= s, (a, b) => [a[0] + ((b[0] - a[0]) * (s - a[1])) / (b[1] - a[1]), s]],
    [(p) => p[1] <= n, (a, b) => [a[0] + ((b[0] - a[0]) * (n - a[1])) / (b[1] - a[1]), n]],
  ];
  let salida = anillo;
  for (const [dentro, corte] of bordes) {
    const entrada = salida;
    salida = [];
    for (let i = 0; i < entrada.length; i++) {
      const a = entrada[(i + entrada.length - 1) % entrada.length];
      const b = entrada[i];
      if (dentro(b)) { if (!dentro(a)) salida.push(corte(a, b)); salida.push(b); }
      else if (dentro(a)) salida.push(corte(a, b));
    }
    if (!salida.length) break;
  }
  return salida;
};

/** Quita puntos más cercanos que `tol` grados al último conservado. */
const simplificar = (pts: P[], tol: number): P[] => {
  if (pts.length < 4) return pts;
  const out: P[] = [pts[0]];
  for (let i = 1; i < pts.length - 1; i++) {
    const u = out[out.length - 1];
    if (Math.abs(pts[i][0] - u[0]) > tol || Math.abs(pts[i][1] - u[1]) > tol) out.push(pts[i]);
  }
  out.push(pts[pts.length - 1]);
  return out;
};

const r5 = (x: number) => Math.round(x * 1e5) / 1e5;
const redondear = (pts: P[]) => pts.map(([x, y]) => [r5(x), r5(y)] as P);

/** ¿El anillo cruza el antimeridiano (salto de longitud > 180°)? Fiji, Chukotka… */
const cruzaAntimeridiano = (pts: P[]) => pts.some((p, i) => i > 0 && Math.abs(p[0] - pts[i - 1][0]) > 180);

const intersecta = (pts: P[], [o, s, e, n]: Caja) => {
  // Un anillo que cruza el antimeridiano tiene caja de -180 a 180 y "toca" cualquier recorte: el recorte lo
  // convertía en una franja de borde a borde (líneas blancas horizontales sobre el mapa). Se descarta si la caja
  // no llega al antimeridiano.
  if (cruzaAntimeridiano(pts) && o > -179 && e < 179) return false;
  let [a, b, c, d] = [Infinity, Infinity, -Infinity, -Infinity];
  for (const [x, y] of pts) { a = Math.min(a, x); b = Math.min(b, y); c = Math.max(c, x); d = Math.max(d, y); }
  return !(c < o || a > e || d < s || b > n);
};

const poligonosDe = (g: Geometry | null, caja: Caja, tol: number): Poligonos => {
  if (!g) return [];
  const polys = g.type === 'Polygon' ? [(g as Polygon).coordinates] : g.type === 'MultiPolygon' ? (g as MultiPolygon).coordinates : [];
  const out: Poligonos = [];
  for (const poly of polys) {
    if (!intersecta(poly[0] as P[], caja)) continue;
    const anillos = poly.filter((r) => !(cruzaAntimeridiano(r as P[]) && caja[0] > -179 && caja[2] < 179))
      .map((r) => redondear(simplificar(recortarAnillo(r as P[], caja), tol))).filter((r) => r.length >= 3).map((r) => [...r, r[0]]);
    if (anillos.length && anillos[0].length >= 3) out.push(anillos);
  }
  return out;
};

/** Parte las líneas en tramos dentro de la caja (incluye el punto que sale, para llegar al borde). */
const recortarLineas = (lineas: P[][], [o, s, e, n]: Caja, tol: number): P[][] => {
  const dentro = (p: P) => p[0] >= o && p[0] <= e && p[1] >= s && p[1] <= n;
  const out: P[][] = [];
  for (const l of lineas) {
    let actual: P[] = [];
    l.forEach((p, i) => {
      if (dentro(p) || (i > 0 && dentro(l[i - 1])) || (i < l.length - 1 && dentro(l[i + 1]))) actual.push(p);
      else if (actual.length) { out.push(actual); actual = []; }
    });
    if (actual.length > 1) out.push(actual);
  }
  return out.map((t) => redondear(simplificar(t, tol))).filter((t) => t.length > 1);
};

type Props = { name?: string };

/** Geometría recortada para el video. `paises` = nombres NE en inglés que piden las máscaras/tarjeta de título. */
export const recortarGeo = (caja: Caja, paises: string[], tol: number): GeoRecortado => {
  const topoPaises = leer('countries-10m.json') as Topology<{ countries: GeometryCollection<Props> }>;
  const topoTierra = leer('land-10m.json') as Topology<{ land: GeometryCollection }>;
  const tierraFc = feature(topoTierra, topoTierra.objects.land) as FeatureCollection;
  const tierra = tierraFc.features.flatMap((f) => poligonosDe(f.geometry, caja, tol));
  const m = mesh(topoPaises, topoPaises.objects.countries, (a, b) => a !== b) as MultiLineString;
  const bordes = recortarLineas(m.coordinates as P[][], caja, tol);
  const fc = feature(topoPaises, topoPaises.objects.countries) as FeatureCollection<Geometry, Props>;
  const salida: Record<string, Poligonos> = {};
  for (const nombre of new Set(paises)) {
    const f = fc.features.find((x) => (x.properties?.name ?? '').toLowerCase() === nombre.toLowerCase() || String(x.id) === nombre);
    if (!f) { console.warn(`  ⚠ geo: país "${nombre}" no está en Natural Earth (usa el nombre en inglés)`); continue; }
    // Los países de las máscaras se recortan a una caja más amplia (la máscara puede asomar fuera del recorte satelital).
    const [o, s, e, n] = caja;
    const dx = (e - o) * 0.5, dy = (n - s) * 0.5;
    salida[nombre] = poligonosDe(f.geometry, [o - dx, s - dy, e + dx, n + dy], tol);
  }
  return { caja, tierra, bordes, paises: salida };
};
