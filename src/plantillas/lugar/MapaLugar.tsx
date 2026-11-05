import React from 'react';
import { Img, interpolate, spring, staticFile } from 'remotion';
import { geoGraticule, geoPath } from 'd3-geo';
import { feature, mesh } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { FeatureCollection, MultiLineString } from 'geojson';
import paises50 from 'world-atlas/countries-50m.json';
import tierra50 from 'world-atlas/land-50m.json';
import { MAPA, PALETA, TIPO, fondoAlfa } from '../../marca/tokens';
import { escalaDeZoom } from '../frontera/mapa';
import { Pin } from '../frontera/Mapa';
import type { FondoNivel, MapaLugar as TMapaLugar } from './guion';
import { proyeccionLugar } from './camara';

// ---------------------------------------------------------------- datos (una vez por pestaña)
const topoPaises = paises50 as unknown as Topology<{ countries: GeometryCollection }>;
const topoTierra = tierra50 as unknown as Topology<{ land: GeometryCollection }>;
const TIERRA = feature(topoTierra, topoTierra.objects.land) as FeatureCollection;
const BORDES = mesh(topoPaises, topoPaises.objects.countries, (a, b) => a !== b) as MultiLineString;

/** Segundo absoluto en que aparece algo anclado a la escena `escena` (-1 = gancho). */
export const inicioDeEscenaLugar = (inicioEscena: (i: number) => number | undefined, escena: number) =>
  escena < 0 ? 0.25 : (inicioEscena(escena) ?? 0) + 0.3;
const DURACION_UNION = 1.3;

/** Cuadrícula de paso `paso` grados (en caché por paso). */
const cacheReticula = new Map<number, ReturnType<ReturnType<typeof geoGraticule>>>();
const reticula = (paso: number) => {
  let r = cacheReticula.get(paso);
  if (!r) { r = geoGraticule().step([paso, paso]).extentMajor([[-180, -80], [180, 80]]).precision(Math.min(2.5, paso / 4))(); cacheReticula.set(paso, r); }
  return r;
};
/** Paso grueso (20° a zoom 3, la mitad por cada nivel) y el fino que aparece de a poco: sin saltos al hacer zoom. */
const pasosReticula = (zoom: number) => {
  const n = Math.max(0, Math.floor(zoom - 3));
  const paso = 20 / Math.pow(2, n);
  return { grueso: paso, fino: paso / 2, alfaFino: Math.min(1, Math.max(0, zoom - 3 - n)) };
};

type Props = {
  mapa: TMapaLugar;
  fondos: FondoNivel[];
  ancho: number;
  alto: number;
  /** Zoom de dibujo en este lienzo. */
  zoom: number;
  frame: number;
  fps: number;
  modo: 'inset' | 'completo';
  /** Segundo absoluto de aparición de cada marcador. */
  apariciones: number[];
  /** Franja vertical [y0, y1] ocupada por un rótulo: las etiquetas que caen ahí se atenúan. */
  franjaRotulo?: [number, number] | null;
  /** v2: centro de la cámara (por defecto el punto) y altura relativa donde cae (por defecto 0,68 / 0,5 en el inset). */
  centro?: [number, number];
  fy?: number;
  /** v2: capas pegadas al mapa (CapasMapa), con la proyección de este lienzo. */
  capas?: (xy: (p: [number, number]) => [number, number] | null, camino: (g: object) => string | null, pxKm: number) => React.ReactNode;
  /** v2: estilo de etiquetas condensado (Bebas) y pines rojos para los marcadores, como frontera v2. */
  v2?: boolean;
};

/**
 * Mapa de `lugar` en un lienzo de ancho × alto: recortes NASA por niveles (el más cercano encima), velo,
 * bordes Natural Earth, líneas punteadas del punto a los marcadores, marcadores y el PUNTO coral que parpadea con su
 * etiqueta. Todo se recalcula por frame (determinista).
 */
export const MapaLugarVista: React.FC<Props> = ({ mapa, fondos, ancho, alto, zoom, frame, fps, modo, apariciones, franjaRotulo, centro, fy: fyPedido, capas, v2 }) => {
  const completo = modo === 'completo';
  const hayRaster = fondos.length > 0 && Math.abs(mapa.punto[1]) <= 60;
  const fy = fyPedido ?? (completo ? 0.68 : 0.5);
  const c = centro ?? mapa.punto;
  const proy = proyeccionLugar(c, zoom, ancho, alto, fy, hayRaster);
  const camino = geoPath(proy);
  const libre = proyeccionLugar(c, zoom, ancho, alto, fy, hayRaster).clipExtent(null);
  const xy = (p: [number, number]) => (libre(p) as [number, number] | null) ?? null;
  const pxKm = escalaDeZoom(zoom) / 6371;
  // Niveles a dibujar: el más lejano siempre (base) y los que ya tienen resolución útil a este zoom.
  // Se recorren del más fino al más grueso: cuando uno ya tiene resolución útil y cubre todo el lienzo, los de debajo
  // no se dibujan (con recortes por plano hay decenas; componerlos todos hundía el render, igual que en frontera).
  const niveles: FondoNivel[] = [];
  if (hayRaster) {
    for (let i = fondos.length - 1; i >= 0; i--) {
      const f = fondos[i];
      if (!(i === 0 || f.zoom <= zoom + 0.6)) continue;
      const a = libre([f.bbox[0], f.bbox[3]]), b = libre([f.bbox[2], f.bbox[1]]);
      if (!a || !b || b[0] <= 0 || a[0] >= ancho || b[1] <= 0 || a[1] >= alto) continue;
      // Un recorte estirado a más de ~10 px de pantalla por texel es borroso y, a zoom 13–15, mide decenas de miles de
      // px: Chrome se cae ("Page crashed"). Se omite salvo que sea lo único que hay.
      const texel = f.gradosPx ? (b[0] - a[0]) / ((f.bbox[2] - f.bbox[0]) / f.gradosPx) : 1;
      if (texel > 10 && (niveles.length || i > 0)) continue;
      niveles.unshift(f);
      if (a[0] <= 0 && a[1] <= 0 && b[0] >= ancho && b[1] >= alto) break;
    }
  }
  const atenuar = (y: number) => (franjaRotulo && y > franjaRotulo[0] && y < franjaRotulo[1] ? 0.22 : 1);
  const [px, py] = libre(mapa.punto) ?? [ancho / 2, alto * fy];
  const ret = pasosReticula(zoom);
  const k = completo ? 1 : 0.72; // escala de símbolos y textos en el inset
  const fase = (frame % 70) / 70;
  const fase2 = ((frame + 35) % 70) / 70;
  const brillo = 0.8 + 0.2 * Math.cos((frame / 70) * Math.PI * 2);
  return (
    <div style={{ position: 'absolute', inset: 0, width: ancho, height: alto, background: PALETA.fondo, overflow: 'hidden' }}>
      {niveles.map((f) => {
        const [x0, y0] = libre([f.bbox[0], f.bbox[3]]) ?? [0, 0];
        const [x1, y1] = libre([f.bbox[2], f.bbox[1]]) ?? [0, 0];
        return <Img key={f.src} src={staticFile(f.src)} style={{ position: 'absolute', left: x0, top: y0, width: x1 - x0, height: y1 - y0, filter: 'saturate(1.3) contrast(1.15) brightness(1.08)' }} />;
      })}
      {/* El océano de Blue Marble es casi negro: 'lighten' lo lleva al azul de marca sin tocar la tierra (más clara). */}
      {hayRaster && <div style={{ position: 'absolute', inset: 0, background: PALETA.fondo2, mixBlendMode: 'lighten' }} />}
      {hayRaster && <div style={{ position: 'absolute', inset: 0, background: fondoAlfa(0.12) }} />}
      <svg width={ancho} height={alto} style={{ position: 'absolute', inset: 0 }}>
        <defs><filter id="brilloCosta" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={6} /></filter></defs>
        {/* Cuadrícula de meridianos y paralelos: en mar abierto es lo que deja ver que la cámara se mueve. */}
        <path d={camino(reticula(ret.grueso)) ?? ''} fill="none" stroke={PALETA.celeste} strokeOpacity={0.16} strokeWidth={completo ? 1.5 : 1.2} />
        <path d={camino(reticula(ret.fino)) ?? ''} fill="none" stroke={PALETA.celeste} strokeOpacity={0.16 * ret.alfaFino} strokeWidth={completo ? 1.5 : 1.2} />
        {!hayRaster && <path d={camino(TIERRA) ?? ''} fill={PALETA.fondo2} stroke={PALETA.borde} strokeWidth={1.5} />}
        {/* v2: brillo claro en la costa (como frontera): la silueta se lee al instante sobre el satélite. */}
        {v2 && hayRaster && zoom <= 10.5 && (
          <g>
            <path d={camino(TIERRA) ?? ''} fill="none" stroke={MAPA.costa} strokeWidth={completo ? 8 : 5} strokeOpacity={0.3} filter="url(#brilloCosta)" />
            <path d={camino(TIERRA) ?? ''} fill="none" stroke={MAPA.costa} strokeWidth={completo ? 2.2 : 1.4} strokeOpacity={0.8} />
          </g>
        )}
        {zoom <= 9 && (
          <path d={camino(BORDES) ?? ''} fill="none" stroke={hayRaster ? PALETA.tinta : PALETA.borde} strokeOpacity={hayRaster ? 0.3 : 0.9}
            strokeWidth={completo ? 2 : 1.5} strokeDasharray={hayRaster ? '6 6' : undefined} />
        )}
        {/* Línea punteada del punto a cada marcador, dibujada al aparecer el marcador. */}
        {(mapa.marcadores ?? []).map((m, i) => {
          const t = frame / fps;
          const avance = interpolate(t, [apariciones[i], apariciones[i] + DURACION_UNION], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (x) => 1 - Math.pow(1 - x, 2) });
          if (avance <= 0) return null;
          const q = libre([m.lon, m.lat]);
          if (!q) return null;
          const x2 = px + (q[0] - px) * avance;
          const y2 = py + (q[1] - py) * avance;
          return (
            <g key={i}>
              <line x1={px} y1={py} x2={x2} y2={y2} stroke={PALETA.fondo} strokeOpacity={0.7} strokeWidth={9 * k} strokeLinecap="round" strokeDasharray={`0.1 ${20 * k}`} />
              <line x1={px} y1={py} x2={x2} y2={y2} stroke={PALETA.amarillo} strokeWidth={6 * k} strokeLinecap="round" strokeDasharray={`0.1 ${20 * k}`} />
            </g>
          );
        })}
      </svg>
      {(mapa.marcadores ?? []).map((m, i) => {
        const p = libre([m.lon, m.lat]);
        if (!p || p[0] < 20 || p[0] > ancho - 20 || p[1] < 0 || p[1] > alto) return null;
        const aparece = Math.round(apariciones[i] * fps);
        if (frame < aparece) return null;
        const e = spring({ frame: frame - aparece, fps, config: { damping: 11, stiffness: 160 } });
        if (v2) return <Pin key={`m-${i}`} x={p[0]} y={p[1]} texto={m.etiqueta} e={e} o={atenuar(p[1])} escala={completo ? 1 : 0.7} />;
        const fs = 36 * k;
        const anchoEt = m.etiqueta.length * fs * 0.66 + 30;
        const izquierda = p[0] + anchoEt > ancho - 30 && p[0] - anchoEt > 30;
        return (
          <div key={`m-${i}`} style={{ position: 'absolute', left: p[0], top: p[1], transform: `scale(${e})`, opacity: atenuar(p[1]) }}>
            <div style={{ position: 'absolute', left: -10 * k, top: -10 * k, width: 20 * k, height: 20 * k, borderRadius: '50%', background: PALETA.amarillo, border: `${4 * k}px solid ${PALETA.fondo}` }} />
            <div style={{
              position: 'absolute', top: -fs * 0.62, ...(izquierda ? { right: 20 * k } : { left: 20 * k }), whiteSpace: 'nowrap',
              fontFamily: TIPO.display, fontWeight: 800, fontSize: fs, color: PALETA.tinta, letterSpacing: 1,
              WebkitTextStroke: `${7 * k}px ${PALETA.fondo}`, paintOrder: 'stroke fill',
            }}>{m.etiqueta}</div>
          </div>
        );
      })}
      {/* El punto: anillos que se expanden (parpadeo) + núcleo coral con borde blanco + etiqueta. */}
      <div style={{ position: 'absolute', left: px, top: py }}>
        {[fase, fase2].map((f, i) => (
          <div key={i} style={{
            position: 'absolute', left: -(16 + 60 * f) * k, top: -(16 + 60 * f) * k, width: (32 + 120 * f) * k, height: (32 + 120 * f) * k,
            borderRadius: '50%', border: `${5 * k}px solid ${PALETA.coral}`, opacity: (1 - f) * 0.9,
          }} />
        ))}
        <div style={{
          position: 'absolute', left: -17 * k, top: -17 * k, width: 34 * k, height: 34 * k, borderRadius: '50%', background: PALETA.coral,
          border: `${5 * k}px solid ${PALETA.tinta}`, opacity: brillo, boxShadow: `0 0 ${24 * k}px ${PALETA.coral}`,
        }} />
        <div style={{
          // v2: si el punto cae en la mitad de abajo, la etiqueta va arriba (debajo están los subtítulos).
          position: 'absolute', left: 0, top: v2 && completo && py > alto * 0.5 ? -110 : 34 * k, transform: 'translateX(-50%)', whiteSpace: 'nowrap',
          ...(v2
            ? { fontFamily: TIPO.condensada, fontSize: completo ? 64 : 44, letterSpacing: 4, color: '#fff', textShadow: '0 0 3px rgba(0,0,0,0.95), 0 3px 10px rgba(0,0,0,0.75)' }
            : { fontFamily: TIPO.display, fontWeight: 800, fontSize: completo ? 52 : 40, letterSpacing: 1.5, color: PALETA.coral, WebkitTextStroke: `${completo ? 10 : 8}px ${PALETA.fondo}`, paintOrder: 'stroke fill' }),
          textTransform: 'uppercase',
        }}>{mapa.etiqueta}</div>
      </div>
      {capas?.(xy, (g) => camino(g as never), pxKm)}
      {v2 && completo && <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 85% 70% at 50% 48%, rgba(0,0,0,0) 55%, rgba(4,12,22,0.5) 100%)' }} />}
    </div>
  );
};
