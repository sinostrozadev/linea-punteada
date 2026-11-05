import React, { useMemo } from 'react';
import { Img, interpolate, spring, staticFile } from 'remotion';
import { geoArea, geoPath, type GeoProjection } from 'd3-geo';
import { mesh } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { LineString, MultiLineString, MultiPolygon } from 'geojson';
import paises50 from 'world-atlas/countries-50m.json';
import { COLORES_GUION, COLORES_MASCARA, FORMATO, MAPA, PALETA, TIPO } from '../../marca/tokens';
import { Icono } from '../comun/Icono';
import type { FondoResuelto, GeoRecortado, MapaFrontera, Poligonos } from './guion';
import { DURACION_TRAZO_SEG, escalaDeZoom, proyeccion, tipoProyeccion, type LonLat } from './mapa';
import { opacidadVentana, type EstadoCamara, type Visual } from './visual';

// ---------------------------------------------------------------- datos
type Props = { name?: string };
const topoPaises = paises50 as unknown as Topology<{ countries: GeometryCollection<Props> }>;
const esPais = (f: { id?: string | number; properties: Props | null }, clave: string) =>
  String(f.id ?? '') === clave || (f.properties?.name ?? '').toLowerCase() === clave.toLowerCase();
const cacheFronteras = new Map<string, MultiLineString>();
/** Frontera de Natural Earth 1:50 M entre dos países (para líneas `fronteraEntre`). */
const fronteraEntre = (a: string, b: string): MultiLineString => {
  const k = `${a}|${b}`;
  if (!cacheFronteras.has(k)) {
    cacheFronteras.set(k, mesh(topoPaises, topoPaises.objects.countries, (x, y) =>
      x !== y && ((esPais(x as never, a) && esPais(y as never, b)) || (esPais(x as never, b) && esPais(y as never, a)))) as MultiLineString);
  }
  return cacheFronteras.get(k)!;
};

/** Polígonos → MultiPolygon con orientación válida para d3 (un anillo que encierra "el resto del mundo" se invierte). */
export const multipoligono = (polys: Poligonos): MultiPolygon => ({
  type: 'MultiPolygon',
  coordinates: polys.map((anillos) => anillos.map((r, i) => {
    const chico = geoArea({ type: 'Polygon', coordinates: [r] }) <= 2 * Math.PI;
    const exterior = chico ? r : [...r].reverse();
    return i === 0 ? exterior : [...exterior].reverse();
  })),
});

const sombra = '0 0 3px rgba(0,0,0,0.95), 0 3px 10px rgba(0,0,0,0.75)';
const FPS = FORMATO.fps;
const resorte = (t: number, desde: number, config = { damping: 13, stiffness: 190 }) => spring({ frame: Math.round((t - desde) * FPS), fps: FPS, config });
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
/** Franja de los subtítulos (~62 % de la altura): las etiquetas de mapa que caen ahí suben por encima. */
const SUB_DESDE = 1080, SUB_HASTA = 1310;
const fueraDeSubtitulo = (y: number) => (y > SUB_DESDE && y < SUB_HASTA ? SUB_DESDE - 10 : y);
/** Centro x para que un texto de `n` letras (condensada de `fs` px) no se salga del cuadro. */
const dentroX = (x: number, n: number, fs: number, ancho: number) => { const m = (n * fs * 0.46) / 2 + 40; return Math.max(m, Math.min(ancho - m, x)); };

export type Fondo = FondoResuelto & { zoom?: number; gradosPx?: number };

type PropsMapa = {
  mapa: MapaFrontera;
  /** v2: capas raster (de menos a más detalle). v1: un solo recorte. */
  fondos: Fondo[];
  geo?: GeoRecortado;
  vis: Visual;
  /** Segundo absoluto (decide qué capas se ven). */
  t: number;
  cam: EstadoCamara;
  acento: string;
  ancho: number;
  alto: number;
  /** Tarjeta de título: solo satélite, costa, bordes y contornos (sin capas de escena). */
  soloBase?: boolean;
  paisesContorno?: string[];
  children?: React.ReactNode;
};

const ESTILO_ETIQUETA: Record<string, { fontSize: number; letterSpacing: number; color: string; opacity?: number }> = {
  pais: { fontSize: 80, letterSpacing: 9, color: PALETA.tinta },
  region: { fontSize: 58, letterSpacing: 6, color: PALETA.tinta },
  rio: { fontSize: 44, letterSpacing: 5, color: '#D4F0FF' },
  mar: { fontSize: 46, letterSpacing: 12, color: '#CFE7FF', opacity: 0.92 },
};

/** Pin rojo tipo gota con punto blanco y nombre encima. */
export const Pin: React.FC<{ x: number; y: number; texto?: string; e: number; o: number; escala?: number }> = ({ x, y, texto, e, o, escala = 1 }) => (
  <div style={{ position: 'absolute', left: x, top: y, opacity: o, transform: `scale(${e * escala})`, transformOrigin: '0 0' }}>
    <svg width={48} height={62} viewBox="0 0 48 62" style={{ position: 'absolute', left: -24, top: -60, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.6))' }}>
      <path d="M24 60 C24 60 4 36 4 22 A20 20 0 0 1 44 22 C44 36 24 60 24 60 Z" fill={MAPA.pin} stroke="#fff" strokeWidth={3} />
      <circle cx={24} cy={22} r={7.5} fill="#fff" />
    </svg>
    {texto && (
      <div style={{ position: 'absolute', left: 0, top: -122, transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontFamily: TIPO.condensada, fontSize: 54, letterSpacing: 3, color: PALETA.tinta, textShadow: sombra }}>{texto}</div>
    )}
  </div>
);

/**
 * Mapa de frontera v2. Capas, de abajo arriba: recortes satelitales (se funden por zoom, bordes difuminados),
 * océano oscurecido + brillo de costa (Natural Earth 1:10 M), fronteras blancas finas, máscaras rayadas,
 * líneas que se dibujan (la protagonista con brillo), cotas, resaltes; encima en HTML: etiquetas, pines e iconos.
 * Todo depende solo de `t` y `cam` (determinista).
 */
export const Mapa: React.FC<PropsMapa> = ({ mapa, fondos, geo, vis, t, cam, acento, ancho, alto, soloBase, paisesContorno, children }) => {
  const hayRaster = fondos.length > 0;
  const tipo = hayRaster ? 'equirectangular' : tipoProyeccion(mapa, false);
  const proy: GeoProjection = proyeccion(tipo, cam, ancho, alto);
  const camino = geoPath(proy);
  const libre = tipo === 'ortografica' ? proy : proyeccion(tipo, cam, ancho, alto).clipExtent(null);
  const caminoLibre = geoPath(libre);
  const xy = (p: LonLat) => libre(p) as [number, number] | null;
  const pxKm = escalaDeZoom(cam.zoom) / 6371;

  const tierra = useMemo(() => (geo ? multipoligono(geo.tierra) : null), [geo]);
  const bordes = useMemo<MultiLineString | null>(() => (geo ? { type: 'MultiLineString', coordinates: geo.bordes } : null), [geo]);
  const paisesGeo = useMemo(() => {
    const m = new Map<string, MultiPolygon>();
    for (const [n, p] of Object.entries(geo?.paises ?? {})) m.set(n.toLowerCase(), multipoligono(p));
    return m;
  }, [geo]);
  const geomLineas = useMemo(() => mapa.lineas.map((l) => (l.puntos ? ({ type: 'LineString', coordinates: l.puntos } as LineString) : fronteraEntre(l.fronteraEntre![0], l.fronteraEntre![1]))), [mapa.lineas]);

  // Costa y océano: confiables hasta zoom ~11 (Natural Earth 1:10 M); más cerca manda el satélite.
  const oCosta = clamp01((11.6 - cam.zoom) / 1.2);
  const oBordes = clamp01((11.8 - cam.zoom) / 1.2);
  const dTierra = tierra && oCosta > 0 ? camino(tierra) ?? '' : '';
  const desfase = (t * 14) % 26; // las rayas de las máscaras se deslizan despacio: nada queda quieto

  // Capas raster que de verdad se ven. Se recorren de la más fina a la más gruesa: cuando una capa opaca cubre todo
  // el cuadro (descontando el 7 % de borde difuminado), las de debajo no se dibujan. Sin esto, a zoom 17 se
  // componían decenas de recortes escalados ×100 con filtro y máscara: el render caía a 0,4 cuadros/s.
  const capasVisibles = useMemo(() => {
    const out: { f: Fondo; i: number; a: [number, number]; b: [number, number]; o: number }[] = [];
    for (let i = fondos.length - 1; i >= 0; i--) {
      const f = fondos[i];
      const a = proy([f.bbox[0], f.bbox[3]]) as [number, number] | null;
      const b = proy([f.bbox[2], f.bbox[1]]) as [number, number] | null;
      if (!a || !b || b[0] < 0 || a[0] > ancho || b[1] < 0 || a[1] > alto) continue;
      const o = i === 0 || f.zoom === undefined ? 1 : clamp01((cam.zoom - (f.zoom - 1.4)) / 0.8);
      if (o <= 0) continue;
      out.unshift({ f, i, a, b, o });
      const mx = (b[0] - a[0]) * (i > 0 ? 0.07 : 0), my = (b[1] - a[1]) * (i > 0 ? 0.07 : 0);
      if (o >= 1 && a[0] + mx <= 0 && a[1] + my <= 0 && b[0] - mx >= ancho && b[1] - my >= alto) break;
    }
    return out;
  }, [fondos, proy, cam.zoom, ancho, alto]);

  const geometriaArea = (a: Visual['areas'][number]['d']): { d: string; ancho?: number } => {
    if (a.tipo === 'franja' && a.linea) {
      const pts = typeof a.linea === 'string' ? mapa.lineas.find((l) => l.id === a.linea)?.puntos : a.linea;
      if (!pts) return { d: '' };
      return { d: caminoLibre({ type: 'LineString', coordinates: pts }) ?? '', ancho: Math.max(6, (a.anchoKm ?? 50) * pxKm) };
    }
    if (a.poligono) return { d: caminoLibre(multipoligono([[[...a.poligono, a.poligono[0]] as [number, number][]]])) ?? '' };
    const g = a.pais ? paisesGeo.get(a.pais.toLowerCase()) : undefined;
    return { d: g ? camino(g) ?? '' : '' };
  };

  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: ancho, height: alto, background: MAPA.oceano, overflow: 'hidden' }}>
      {capasVisibles.map(({ f, i, a, b, o }) => {
        const detalle = /s2cloudless|Landsat/.test(f.capa);
        const borde = 'linear-gradient(to right, transparent 0, #000 7%, #000 93%, transparent 100%)';
        const bordeV = 'linear-gradient(to bottom, transparent 0, #000 7%, #000 93%, transparent 100%)';
        return (
          <Img key={f.src} src={staticFile(f.src)} style={{
            position: 'absolute', left: a[0], top: a[1], width: b[0] - a[0], height: b[1] - a[1], opacity: o,
            filter: detalle ? 'saturate(1.3) contrast(1.14) brightness(0.97)' : 'saturate(1.45) contrast(1.16) brightness(1.04)',
            ...(i > 0 ? { WebkitMaskImage: `${borde}, ${bordeV}`, WebkitMaskComposite: 'source-in', maskImage: `${borde}, ${bordeV}`, maskComposite: 'intersect' } : {}),
          } as React.CSSProperties} />
        );
      })}
      <svg width={ancho} height={alto} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          {Object.entries(COLORES_MASCARA).map(([n, c]) => (
            <pattern key={n} id={`rayas-${n}`} patternUnits="userSpaceOnUse" width={26} height={26} patternTransform={`rotate(45) translate(${desfase} 0)`}>
              <rect width={26} height={26} fill={c} fillOpacity={0.2} />
              <rect width={10} height={26} fill={c} fillOpacity={0.62} />
            </pattern>
          ))}
          <filter id="brillo" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={7} /></filter>
          <filter id="brilloSuave" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={3} /></filter>
          {dTierra && (<mask id="mar"><rect width={ancho} height={alto} fill="#fff" /><path d={dTierra} fill="#000" /></mask>)}
        </defs>
        {/* Océano azul marino y costa con brillo claro: la silueta se lee al instante. */}
        {dTierra && hayRaster && <rect width={ancho} height={alto} fill={MAPA.oceano} fillOpacity={0.58 * oCosta} mask="url(#mar)" />}
        {dTierra && !hayRaster && <path d={dTierra} fill={PALETA.fondo2} />}
        {dTierra && (
          <g opacity={oCosta}>
            <path d={dTierra} fill="none" stroke={MAPA.costa} strokeWidth={9} strokeOpacity={0.35} filter="url(#brillo)" />
            <path d={dTierra} fill="none" stroke={MAPA.costa} strokeWidth={2.4} strokeOpacity={0.85} />
          </g>
        )}
        {bordes && oBordes > 0 && <path d={camino(bordes) ?? ''} fill="none" stroke={MAPA.borde} strokeWidth={2.2} strokeOpacity={0.78 * oBordes} />}
        {(paisesContorno ?? []).map((n) => {
          const g = paisesGeo.get(n.toLowerCase());
          return g ? <path key={n} d={camino(g) ?? ''} fill={acento} fillOpacity={0.12} stroke={acento} strokeWidth={4} strokeOpacity={0.95} /> : null;
        })}
        {!soloBase && vis.areas.map((v) => {
          const o = opacidadVentana(v, t, 0.35, 0.4);
          if (o <= 0) return null;
          const { d, ancho: w } = geometriaArea(v.d);
          if (!d) return null;
          const c = COLORES_MASCARA[v.d.color];
          const relleno = v.d.trama === 'solida' ? c : `url(#rayas-${v.d.color})`;
          if (w) {
            return (
              <g key={v.id} opacity={o}>
                <path d={d} fill="none" stroke={c} strokeOpacity={0.35} strokeWidth={w + 6} strokeLinecap="round" strokeLinejoin="round" />
                <path d={d} fill="none" stroke={relleno} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
              </g>
            );
          }
          return (
            <g key={v.id} opacity={o}>
              <path d={d} fill={relleno} fillOpacity={v.d.trama === 'solida' ? 0.45 : 1} stroke="none" />
              <path d={d} fill="none" stroke={c} strokeWidth={10} strokeOpacity={0.4} filter="url(#brilloSuave)" />
              <path d={d} fill="none" stroke="#fff" strokeWidth={3.5} strokeOpacity={0.9} strokeLinejoin="round" />
            </g>
          );
        })}
        {!soloBase && mapa.lineas.map((l, i) => {
          const desde = vis.trazos[i];
          const avance = interpolate(t, [desde, desde + DURACION_TRAZO_SEG], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (x) => 1 - Math.pow(1 - x, 2) });
          if (avance <= 0) return null;
          const d = caminoLibre(geomLineas[i]) ?? '';
          const color = COLORES_GUION[l.color];
          const ancho0 = l.estilo === 'solida' ? 8 : 10;
          const dash = l.estilo === 'punteada' ? '0.1 22' : undefined;
          return (
            <g key={l.id}>
              <defs>
                <mask id={`trazo-${i}`} maskUnits="userSpaceOnUse" x={-4000} y={-4000} width={9000} height={9000}>
                  <path d={d} pathLength={1} stroke="#fff" strokeWidth={ancho0 + 40} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 1" strokeDashoffset={1 - avance} />
                </mask>
              </defs>
              <g mask={`url(#trazo-${i})`}>
                <path d={d} stroke={color} strokeOpacity={0.55} strokeWidth={ancho0 + 16} fill="none" strokeLinecap="round" strokeLinejoin="round" filter="url(#brillo)" strokeDasharray={dash} />
                <path d={d} stroke={PALETA.fondo} strokeOpacity={0.7} strokeWidth={ancho0 + 6} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash} />
                <path d={d} stroke={color} strokeWidth={ancho0} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash} />
              </g>
            </g>
          );
        })}
        {!soloBase && vis.cotas.map((v) => {
          const o = opacidadVentana(v, t);
          const a = xy(v.d.desde), b = xy(v.d.hasta);
          if (o <= 0 || !a || !b) return null;
          const p = interpolate(t - v.desde, [0, 0.55], [0, 1], { extrapolateRight: 'clamp', easing: (x) => 1 - Math.pow(1 - x, 3) });
          const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
          const A: [number, number] = [mx + (a[0] - mx) * p, my + (a[1] - my) * p];
          const B: [number, number] = [mx + (b[0] - mx) * p, my + (b[1] - my) * p];
          const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
          const ux = Math.cos(ang), uy = Math.sin(ang), nx = -uy, ny = ux;
          const flecha = (P: [number, number], s: number) => `M${P[0]} ${P[1]} L${P[0] - s * ux * 22 + nx * 12} ${P[1] - s * uy * 22 + ny * 12} L${P[0] - s * ux * 22 - nx * 12} ${P[1] - s * uy * 22 - ny * 12} Z`;
          const marca = (P: [number, number]) => `M${P[0] + nx * 20} ${P[1] + ny * 20} L${P[0] - nx * 20} ${P[1] - ny * 20}`;
          const trazo = `M${A[0]} ${A[1]} L${B[0]} ${B[1]} ${marca(A)} ${marca(B)}`;
          return (
            <g key={v.id} opacity={o}>
              <path d={trazo} stroke="rgba(0,0,0,0.6)" strokeWidth={9} strokeLinecap="round" fill="none" />
              <path d={trazo} stroke="#fff" strokeWidth={4.5} strokeLinecap="round" fill="none" />
              <path d={`${flecha(A, -1)} ${flecha(B, 1)}`} fill="#fff" stroke="rgba(0,0,0,0.6)" strokeWidth={1.5} />
            </g>
          );
        })}
        {!soloBase && vis.resaltes.map((v) => {
          if (t < v.desde || t >= v.hasta) return null;
          const p = xy([v.d.lon, v.d.lat]);
          if (!p) return null;
          const e = resorte(t, v.desde, { damping: 9, stiffness: 160 });
          const pulso = ((t - v.desde) % 0.9) / 0.9;
          const o = clamp01((v.hasta - t) / 0.3);
          return (
            <g key={v.id} opacity={o}>
              <circle cx={p[0]} cy={p[1]} r={v.d.radio * e} fill="none" stroke={acento} strokeWidth={7} style={{ filter: `drop-shadow(0 0 8px ${acento})` }} />
              <circle cx={p[0]} cy={p[1]} r={v.d.radio * (1 + 0.5 * pulso)} fill="none" stroke={acento} strokeWidth={3} strokeOpacity={1 - pulso} />
            </g>
          );
        })}
      </svg>
      {/* Texto de las cotas: condensada con sombra, rotada a lo largo de la línea y siempre derecha. */}
      {!soloBase && vis.cotas.map((v) => {
        const o = opacidadVentana(v, t);
        const a = xy(v.d.desde), b = xy(v.d.hasta);
        if (o <= 0 || !a || !b) return null;
        let ang = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
        if (ang > 90) ang -= 180;
        if (ang < -90) ang += 180;
        const r = (ang * Math.PI) / 180;
        const mx = (a[0] + b[0]) / 2 + Math.sin(r) * 42, my = (a[1] + b[1]) / 2 - Math.cos(r) * 42;
        const e = resorte(t, v.desde + 0.25);
        return (
          <div key={`t-${v.id}`} style={{
            position: 'absolute', left: mx, top: my, transform: `translate(-50%, -50%) rotate(${ang}deg) scale(${e})`, opacity: o, whiteSpace: 'nowrap',
            fontFamily: TIPO.condensada, fontSize: 68, letterSpacing: 3, color: '#fff', textShadow: sombra,
          }}>{v.d.texto}</div>
        );
      })}
      {/* Etiquetas dentro de las máscaras. */}
      {!soloBase && vis.areas.map((v) => {
        if (!v.d.etiqueta) return null;
        const o = opacidadVentana(v, t, 0.35, 0.4);
        if (o <= 0) return null;
        const pg = v.d.poligono;
        const ancla: LonLat | undefined = v.d.etiquetaEn ?? (pg ? [pg.reduce((s, p) => s + p[0], 0) / pg.length, pg.reduce((s, p) => s + p[1], 0) / pg.length] : undefined);
        const p = ancla ? xy(ancla) : null;
        if (!p || p[0] < 60 || p[0] > ancho - 60 || p[1] < 200 || p[1] > alto - 300) return null;
        // Un área que en pantalla mide menos de ~70 px no se nombra (a escala regional "EL TRIÁNGULO" sería ruido).
        if (pg) {
          const ps = pg.map((q) => xy(q)).filter((q): q is [number, number] => !!q);
          const lado = Math.max(Math.max(...ps.map((q) => q[0])) - Math.min(...ps.map((q) => q[0])), Math.max(...ps.map((q) => q[1])) - Math.min(...ps.map((q) => q[1])));
          if (lado < 70) return null;
        }
        p[1] = fueraDeSubtitulo(p[1]);
        p[0] = dentroX(p[0], v.d.etiqueta.length, 52, ancho);
        const e = resorte(t, v.desde + 0.15);
        return (
          <div key={`al-${v.id}`} style={{
            position: 'absolute', left: p[0], top: p[1], transform: `translate(-50%, -50%) scale(${0.85 + 0.15 * e})`, opacity: o * Math.min(1, e * 1.4), whiteSpace: 'nowrap',
            fontFamily: TIPO.condensada, fontSize: 52, letterSpacing: 5, color: '#fff', textShadow: sombra,
          }}>{v.d.etiqueta}</div>
        );
      })}
      {!soloBase && vis.etiquetas.map((v) => {
        const o = opacidadVentana(v, t, 0.3, 0.35);
        if (o <= 0 || v.d.lon === undefined || v.d.lat === undefined) return null;
        const p = xy([v.d.lon, v.d.lat]);
        if (!p || p[0] < -200 || p[0] > ancho + 200 || p[1] < 0 || p[1] > alto) return null;
        const e = resorte(t, v.desde);
        if (v.d.tipo === 'pin') return <Pin key={v.id} x={p[0]} y={p[1]} texto={v.d.texto} e={e} o={o} />;
        const est = ESTILO_ETIQUETA[v.d.tipo] ?? ESTILO_ETIQUETA.region;
        if (!v.d.rotacion) { p[1] = fueraDeSubtitulo(p[1]); p[0] = dentroX(p[0], v.d.texto.length, est.fontSize, ancho); }
        return (
          <div key={v.id} style={{
            position: 'absolute', left: p[0], top: p[1], whiteSpace: 'nowrap', textTransform: 'uppercase', fontFamily: TIPO.condensada, textShadow: sombra,
            transform: `translate(-50%, -50%) rotate(${v.d.rotacion ?? 0}deg) scale(${0.9 + 0.1 * e})`, fontSize: est.fontSize, color: est.color,
            opacity: o * Math.min(1, e * 1.5) * (est.opacity ?? 1), letterSpacing: est.letterSpacing + 6 * (1 - e),
          }}>{v.d.texto}</div>
        );
      })}
      {!soloBase && (mapa.marcadores ?? []).map((m, i) => {
        const p = xy([m.lon, m.lat]);
        const t0 = vis.marcadoresDesde[i] ?? 0;
        if (!p || t < t0 || p[0] < 30 || p[0] > ancho - 30 || p[1] < 0 || p[1] > alto) return null;
        return <Pin key={`m-${i}`} x={p[0]} y={p[1]} texto={m.etiqueta} e={resorte(t, t0)} o={1} />;
      })}
      {!soloBase && vis.iconos.map((v) => {
        const o = opacidadVentana(v, t);
        if (o <= 0) return null;
        let pos: LonLat = [v.d.lon, v.d.lat];
        if (v.d.ruta) {
          const ruta = v.d.ruta as LonLat[];
          const u = clamp01((t - v.desde - 0.2) / (v.d.duracionSeg ?? 2.5));
          const f = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
          const seg = Math.min(ruta.length - 2, Math.floor(f * (ruta.length - 1)));
          const w = f * (ruta.length - 1) - seg;
          pos = [ruta[seg][0] + (ruta[seg + 1][0] - ruta[seg][0]) * w, ruta[seg][1] + (ruta[seg + 1][1] - ruta[seg][1]) * w];
        }
        const p = xy(pos);
        if (!p) return null;
        const e = resorte(t, v.desde, { damping: 10, stiffness: 200 });
        const lado = 96 * (v.d.escala ?? 1);
        const bob = Math.sin((t - v.desde) * 3.2) * 5;
        return (
          <div key={v.id} style={{ position: 'absolute', left: p[0] - lado / 2, top: p[1] - lado / 2 + bob, width: lado, height: lado, opacity: o, transform: `scale(${e})` }}>
            <Icono nombre={v.d.icono} tamano={lado} acento={acento} />
            {v.d.tachado && (
              <svg width={lado * 1.3} height={lado * 1.3} viewBox="0 0 100 100" style={{ position: 'absolute', left: -lado * 0.15, top: -lado * 0.15 }}>
                <circle cx={50} cy={50} r={44} fill="none" stroke={PALETA.coral} strokeWidth={8} />
                <path d="M20 80 L80 20" stroke={PALETA.coral} strokeWidth={8} strokeLinecap="round" />
              </svg>
            )}
          </div>
        );
      })}
      {/* Etiqueta de cada línea (junto a su punto medio, en el color de la línea) cuando termina de dibujarse. */}
      {!soloBase && mapa.lineas.map((l, i) => {
        if (!l.etiqueta || !l.puntos) return null;
        // Transitoria (como Ñerd): se nombra al dibujarse y se va a los ~4 s, para no amontonar etiquetas.
        const desde = vis.trazos[i] + DURACION_TRAZO_SEG * 0.7;
        const hasta = vis.trazos[i] + DURACION_TRAZO_SEG + 3.5;
        if (t < desde || t >= hasta) return null;
        const oL = clamp01((hasta - t) / 0.3);
        const pts = l.puntos;
        const m = pts.length % 2 ? pts[(pts.length - 1) / 2] : ([(pts[pts.length / 2 - 1][0] + pts[pts.length / 2][0]) / 2, (pts[pts.length / 2 - 1][1] + pts[pts.length / 2][1]) / 2] as LonLat);
        const p = xy(m);
        if (!p || p[0] < 80 || p[0] > ancho - 80 || p[1] < 200 || p[1] > alto - 300) return null;
        const e = resorte(t, desde);
        return (
          <div key={`le-${l.id}`} style={{
            position: 'absolute', left: p[0], top: p[1] + 56, transform: `translate(-50%, -50%) scale(${e})`, whiteSpace: 'nowrap', opacity: oL,
            fontFamily: TIPO.condensada, fontSize: 50, letterSpacing: 4, color: COLORES_GUION[l.color], textShadow: sombra,
          }}>{l.etiqueta}</div>
        );
      })}
      {/* Remate: las dos etiquetas del cierre sobre el mapa, en acento y grandes. */}
      {!soloBase && vis.remateEtiquetas.map((r, i) => {
        if (t < r.desde) return null;
        const p = xy([r.lon, r.lat]);
        if (!p) return null;
        // Las del remate son más grandes y llevan fondo: dejan más aire sobre el subtítulo.
        if (p[1] > SUB_DESDE - 80 && p[1] < SUB_HASTA) p[1] = SUB_DESDE - 80;
        const e = resorte(t, r.desde, { damping: 12, stiffness: 170 });
        return (
          <div key={`re-${i}`} style={{
            position: 'absolute', left: dentroX(p[0], r.texto.length, 80, ancho), top: p[1], transform: `translate(-50%, -50%) scale(${0.7 + 0.3 * e})`, opacity: Math.min(1, e * 1.5),
            whiteSpace: 'nowrap', fontFamily: TIPO.condensada, fontSize: 80, letterSpacing: 4, color: acento, textShadow: sombra,
            padding: '4px 18px 0', borderRadius: 10, background: 'rgba(8,20,34,0.55)',
          }}>{r.texto}</div>
        );
      })}
      {children}
      {/* Viñeta suave (en vez del velo plano de v1): el centro queda vivo, los bordes enmarcan. */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 85% 70% at 50% 48%, rgba(0,0,0,0) 55%, rgba(4,12,22,0.5) 100%)' }} />
    </div>
  );
};
