/**
 * Capas v2 que van PEGADAS AL MAPA en `lugar` (pantalla completa) y `ruta` (globo): máscaras, cotas, resaltes,
 * etiquetas (país, región, río, mar, pin), iconos y las dos etiquetas del remate. Mismo estilo que frontera/Mapa.tsx,
 * pero independiente de la proyección: recibe `xy` (lon/lat → px, null si no se ve) y `camino` (geoPath para las
 * máscaras). Candidato a comun/ (hoy frontera las dibuja dentro de su Mapa).
 */
import React, { useMemo } from 'react';
import { interpolate, spring } from 'remotion';
import { geoArea } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import paises50 from 'world-atlas/countries-50m.json';
import { COLORES_MASCARA, FORMATO, PALETA, TIPO } from '../../../marca/tokens';
import { Icono } from '../../comun/Icono';
import { Pin } from '../../frontera/Mapa';
import { opacidadVentana, type Visual } from '../../frontera/visual';

type LonLat = [number, number];
const FPS = FORMATO.fps;
const sombra = '0 0 3px rgba(0,0,0,0.95), 0 3px 10px rgba(0,0,0,0.75)';
const resorte = (t: number, desde: number, config = { damping: 13, stiffness: 190 }) => spring({ frame: Math.round((t - desde) * FPS), fps: FPS, config });
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
/** Franja del subtítulo en bloques (centro al 62 % del alto): las etiquetas que caen ahí suben. */
export const SUB_DESDE = 1080, SUB_HASTA = 1310;
const fueraDeSubtitulo = (y: number) => (y > SUB_DESDE && y < SUB_HASTA ? SUB_DESDE - 10 : y);
const dentroX = (x: number, n: number, fs: number, ancho: number) => { const m = (n * fs * 0.46) / 2 + 40; return Math.max(m, Math.min(ancho - m, x)); };

const ESTILO: Record<string, { fontSize: number; letterSpacing: number; color: string; opacity?: number }> = {
  pais: { fontSize: 74, letterSpacing: 8, color: '#FFFFFF' },
  region: { fontSize: 50, letterSpacing: 5, color: '#FFFFFF' },
  rio: { fontSize: 42, letterSpacing: 6, color: '#CFE9FF' },
  mar: { fontSize: 44, letterSpacing: 14, color: '#CFE9FF', opacity: 0.85 },
};

export const topoPaisesCapas = paises50 as unknown as Topology<{ countries: GeometryCollection<{ name: string }> }>;
let PAISES: FeatureCollection<Geometry, { name: string }> | null = null;
export const paisPorNombre = (n: string): Feature | undefined => {
  PAISES ??= feature(topoPaisesCapas, topoPaisesCapas.objects.countries) as unknown as FeatureCollection<Geometry, { name: string }>;
  const k = n.toLowerCase();
  return PAISES.features.find((f) => f.properties?.name?.toLowerCase() === k || String(f.id) === n);
};

type Props = {
  vis: Visual;
  t: number;
  xy: (p: LonLat) => [number, number] | null;
  camino: (g: object) => string | null;
  acento: string;
  ancho: number;
  alto: number;
  /** px por km en el centro (para franjas). */
  pxKm: number;
};

export const CapasMapa: React.FC<Props> = ({ vis, t, xy, camino, acento, ancho, alto, pxKm }) => {
  const desfase = (t * 14) % 26;
  const areas = useMemo(() => vis.areas.map((v) => {
    const a = v.d;
    if (a.tipo === 'franja' && Array.isArray(a.linea)) return { v, geo: { type: 'LineString', coordinates: a.linea } as object, franja: true };
    if (a.poligono) {
      // d3-geo es esférico: un anillo en el sentido "equivocado" es el planeta menos el polígono. Se orienta solo.
      let anillo = [...a.poligono, a.poligono[0]];
      if (geoArea({ type: 'Polygon', coordinates: [anillo] }) > 2 * Math.PI) anillo = [...anillo].reverse();
      return { v, geo: { type: 'Polygon', coordinates: [anillo] } as object, franja: false };
    }
    const f = a.pais ? paisPorNombre(a.pais) : undefined;
    return { v, geo: f as object | undefined, franja: false };
  }), [vis.areas]);

  return (
    <div style={{ position: 'absolute', inset: 0, width: ancho, height: alto, pointerEvents: 'none' }}>
      <svg width={ancho} height={alto} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          {Object.entries(COLORES_MASCARA).map(([n, c]) => (
            <pattern key={n} id={`rayas2-${n}`} patternUnits="userSpaceOnUse" width={26} height={26} patternTransform={`rotate(45) translate(${desfase} 0)`}>
              <rect width={26} height={26} fill={c} fillOpacity={0.2} />
              <rect width={10} height={26} fill={c} fillOpacity={0.62} />
            </pattern>
          ))}
          <filter id="brilloSuave2" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={3} /></filter>
        </defs>
        {areas.map(({ v, geo, franja }) => {
          const o = opacidadVentana(v, t, 0.35, 0.4);
          if (o <= 0 || !geo) return null;
          const d = camino(geo) ?? '';
          if (!d) return null;
          const c = COLORES_MASCARA[v.d.color];
          const relleno = v.d.trama === 'solida' ? c : `url(#rayas2-${v.d.color})`;
          if (franja) {
            const w = Math.max(6, (v.d.anchoKm ?? 50) * pxKm);
            return (
              <g key={v.id} opacity={o}>
                <path d={d} fill="none" stroke={c} strokeOpacity={0.35} strokeWidth={w + 6} strokeLinecap="round" strokeLinejoin="round" />
                <path d={d} fill="none" stroke={relleno} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
              </g>
            );
          }
          return (
            <g key={v.id} opacity={o}>
              <path d={d} fill={relleno} fillOpacity={v.d.trama === 'solida' ? 0.45 : 1} />
              <path d={d} fill="none" stroke={c} strokeWidth={10} strokeOpacity={0.4} filter="url(#brilloSuave2)" />
              <path d={d} fill="none" stroke="#fff" strokeWidth={3.5} strokeOpacity={0.9} strokeLinejoin="round" />
            </g>
          );
        })}
        {vis.cotas.map((v) => {
          const o = opacidadVentana(v, t);
          const a = xy(v.d.desde as LonLat), b = xy(v.d.hasta as LonLat);
          if (o <= 0 || !a || !b) return null;
          const p = interpolate(t - v.desde, [0, 0.55], [0, 1], { extrapolateRight: 'clamp', easing: (x) => 1 - Math.pow(1 - x, 3) });
          const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
          const A: LonLat = [mx + (a[0] - mx) * p, my + (a[1] - my) * p];
          const B: LonLat = [mx + (b[0] - mx) * p, my + (b[1] - my) * p];
          const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
          const ux = Math.cos(ang), uy = Math.sin(ang), nx = -uy, ny = ux;
          const flecha = (P: LonLat, s: number) => `M${P[0]} ${P[1]} L${P[0] - s * ux * 22 + nx * 12} ${P[1] - s * uy * 22 + ny * 12} L${P[0] - s * ux * 22 - nx * 12} ${P[1] - s * uy * 22 - ny * 12} Z`;
          const marca = (P: LonLat) => `M${P[0] + nx * 20} ${P[1] + ny * 20} L${P[0] - nx * 20} ${P[1] - ny * 20}`;
          const trazo = `M${A[0]} ${A[1]} L${B[0]} ${B[1]} ${marca(A)} ${marca(B)}`;
          return (
            <g key={v.id} opacity={o}>
              <path d={trazo} stroke="rgba(0,0,0,0.6)" strokeWidth={9} strokeLinecap="round" fill="none" />
              <path d={trazo} stroke="#fff" strokeWidth={4.5} strokeLinecap="round" fill="none" />
              <path d={`${flecha(A, -1)} ${flecha(B, 1)}`} fill="#fff" stroke="rgba(0,0,0,0.6)" strokeWidth={1.5} />
            </g>
          );
        })}
        {vis.resaltes.map((v) => {
          if (t < v.desde || t >= v.hasta) return null;
          const p = xy([v.d.lon, v.d.lat]);
          if (!p) return null;
          const e = resorte(t, v.desde, { damping: 9, stiffness: 160 });
          const pulso = ((t - v.desde) % 0.9) / 0.9;
          return (
            <g key={v.id} opacity={clamp01((v.hasta - t) / 0.3)}>
              <circle cx={p[0]} cy={p[1]} r={v.d.radio * e} fill="none" stroke={acento} strokeWidth={7} style={{ filter: `drop-shadow(0 0 8px ${acento})` }} />
              <circle cx={p[0]} cy={p[1]} r={v.d.radio * (1 + 0.5 * pulso)} fill="none" stroke={acento} strokeWidth={3} strokeOpacity={1 - pulso} />
            </g>
          );
        })}
      </svg>
      {vis.cotas.map((v) => {
        const o = opacidadVentana(v, t);
        const a = xy(v.d.desde as LonLat), b = xy(v.d.hasta as LonLat);
        if (o <= 0 || !a || !b) return null;
        let ang = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
        if (ang > 90) ang -= 180;
        if (ang < -90) ang += 180;
        const r = (ang * Math.PI) / 180;
        const mx = (a[0] + b[0]) / 2 + Math.sin(r) * 42, my = fueraDeSubtitulo((a[1] + b[1]) / 2 - Math.cos(r) * 42);
        const e = resorte(t, v.desde + 0.25);
        return (
          <div key={`t-${v.id}`} style={{
            position: 'absolute', left: dentroX(mx, v.d.texto.length, 68, ancho), top: my, transform: `translate(-50%, -50%) rotate(${ang}deg) scale(${e})`, opacity: o, whiteSpace: 'nowrap',
            fontFamily: TIPO.condensada, fontSize: 68, letterSpacing: 3, color: '#fff', textShadow: sombra,
          }}>{v.d.texto}</div>
        );
      })}
      {areas.map(({ v }) => {
        if (!v.d.etiqueta) return null;
        const o = opacidadVentana(v, t, 0.35, 0.4);
        if (o <= 0) return null;
        const pg = v.d.poligono;
        const ancla: LonLat | undefined = (v.d.etiquetaEn as LonLat | undefined) ?? (pg ? [pg.reduce((s, q) => s + q[0], 0) / pg.length, pg.reduce((s, q) => s + q[1], 0) / pg.length] : undefined);
        const p = ancla ? xy(ancla) : null;
        if (!p || p[0] < 60 || p[0] > ancho - 60 || p[1] < 200 || p[1] > alto - 300) return null;
        const e = resorte(t, v.desde + 0.15);
        return (
          <div key={`al-${v.id}`} style={{
            position: 'absolute', left: dentroX(p[0], v.d.etiqueta.length, 52, ancho), top: fueraDeSubtitulo(p[1]), transform: `translate(-50%, -50%) scale(${0.85 + 0.15 * e})`,
            opacity: o * Math.min(1, e * 1.4), whiteSpace: 'nowrap', fontFamily: TIPO.condensada, fontSize: 52, letterSpacing: 5, color: '#fff', textShadow: sombra,
          }}>{v.d.etiqueta}</div>
        );
      })}
      {vis.etiquetas.map((v) => {
        const o = opacidadVentana(v, t, 0.3, 0.35);
        if (o <= 0 || v.d.lon === undefined || v.d.lat === undefined) return null;
        const p = xy([v.d.lon, v.d.lat]);
        if (!p || p[0] < -200 || p[0] > ancho + 200 || p[1] < 0 || p[1] > alto) return null;
        const e = resorte(t, v.desde);
        if (v.d.tipo === 'pin') return <Pin key={v.id} x={p[0]} y={p[1]} texto={v.d.texto} e={e} o={o} />;
        const est = ESTILO[v.d.tipo] ?? ESTILO.region;
        let [x, y] = p;
        if (!v.d.rotacion) { y = fueraDeSubtitulo(y); x = dentroX(x, v.d.texto.length, est.fontSize, ancho); }
        return (
          <div key={v.id} style={{
            position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', textTransform: 'uppercase', fontFamily: TIPO.condensada, textShadow: sombra,
            transform: `translate(-50%, -50%) rotate(${v.d.rotacion ?? 0}deg) scale(${0.9 + 0.1 * e})`, fontSize: est.fontSize, color: est.color,
            opacity: o * Math.min(1, e * 1.5) * (est.opacity ?? 1), letterSpacing: est.letterSpacing + 6 * (1 - e),
          }}>{v.d.texto}</div>
        );
      })}
      {vis.iconos.map((v) => {
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
      {vis.remateEtiquetas.map((r, i) => {
        if (t < r.desde) return null;
        const p = xy([r.lon, r.lat]);
        if (!p) return null;
        let y = p[1];
        if (y > SUB_DESDE - 80 && y < SUB_HASTA) y = SUB_DESDE - 80;
        y = Math.max(300, Math.min(1400, y));
        const e = resorte(t, r.desde, { damping: 12, stiffness: 170 });
        return (
          <div key={`re-${i}`} style={{
            position: 'absolute', left: dentroX(p[0], r.texto.length, 80, ancho), top: y, transform: `translate(-50%, -50%) scale(${0.7 + 0.3 * e})`, opacity: Math.min(1, e * 1.5),
            whiteSpace: 'nowrap', fontFamily: TIPO.condensada, fontSize: 80, letterSpacing: 4, color: acento, textShadow: sombra,
            padding: '4px 18px 0', borderRadius: 10, background: 'rgba(8,20,34,0.55)',
          }}>{r.texto}</div>
        );
      })}
    </div>
  );
};
