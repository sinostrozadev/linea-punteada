import React, { useMemo } from 'react';
import { Img, interpolate, spring, staticFile, useVideoConfig } from 'remotion';
import { geoBounds, geoPath, type GeoProjection } from 'd3-geo';
import { feature, mesh } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { Feature, FeatureCollection, Geometry, MultiLineString, LineString } from 'geojson';
import paises50 from 'world-atlas/countries-50m.json';
import tierra50 from 'world-atlas/land-50m.json';
import { COLORES_GUION, PALETA, TIPO, fondoAlfa } from '../../marca/tokens';
import type { Plan } from '../comun/plan';
import type { FondoResuelto, MapaFrontera } from './guion';
import { DURACION_TRAZO_SEG, clavesCamara, inicioDeEscena, interpolarCentro, proyeccion, tipoProyeccion, type Camara, type TipoProyeccion } from './mapa';

// ---------------------------------------------------------------- datos (una vez por pestaña)
type Props = { name?: string };
const topoPaises = paises50 as unknown as Topology<{ countries: GeometryCollection<Props> }>;
const topoTierra = tierra50 as unknown as Topology<{ land: GeometryCollection }>;
const PAISES = (feature(topoPaises, topoPaises.objects.countries) as FeatureCollection<Geometry, Props>).features.map((f) => ({
  f, caja: geoBounds(f),
}));
const TIERRA = feature(topoTierra, topoTierra.objects.land) as FeatureCollection;
const BORDES = mesh(topoPaises, topoPaises.objects.countries, (a, b) => a !== b) as MultiLineString;

/** ¿El país coincide con un nombre NE (sin mayúsculas) o un ISO numérico? */
const esPais = (f: { id?: string | number; properties: Props | null }, clave: string) =>
  String(f.id ?? '') === clave.replace(/^0+/, '').padStart(3, '0') || String(f.id ?? '') === clave ||
  (f.properties?.name ?? '').toLowerCase() === clave.toLowerCase();

const cacheFronteras = new Map<string, MultiLineString>();
/** Frontera actual de Natural Earth entre dos países (mesh de topojson). */
const fronteraEntre = (a: string, b: string): MultiLineString => {
  const k = `${a}|${b}`;
  const previa = cacheFronteras.get(k);
  if (previa) return previa;
  const m = mesh(topoPaises, topoPaises.objects.countries, (x, y) =>
    x !== y && ((esPais(x as never, a) && esPais(y as never, b)) || (esPais(x as never, b) && esPais(y as never, a)))) as MultiLineString;
  cacheFronteras.set(k, m);
  return m;
};

/** ¿La caja [[w,s],[e,n]] de un país toca la vista? (descarta países lejanos antes de proyectar). */
const tocaVista = (caja: [[number, number], [number, number]], cam: Camara, margenGrados: number) => {
  const [[w, s], [e, n]] = caja;
  const [lon, lat] = cam.centro;
  if (lat + margenGrados < s || lat - margenGrados > n) return false;
  if (w > e) return true; // cruza el antimeridiano: no arriesgar
  return !(lon + margenGrados < w || lon - margenGrados > e);
};

// ---------------------------------------------------------------- cámara
const TRANSICION_SEG = 1.8;

/** Cámara en el frame dado: claves con spring + zoom lento continuo de zoomInicial a zoomFinal. */
export const camaraEn = (mapa: MapaFrontera, plan: Plan, frame: number, fps: number, tipo: TipoProyeccion): Camara => {
  const t = frame / fps;
  const claves = clavesCamara(mapa, (i) => plan.escenas[i]?.linea.inicio ?? 0);
  let k = 0;
  for (let i = 0; i < claves.length; i++) if (claves[i].t <= t) k = i;
  let cam = claves[k].cam;
  if (k > 0) {
    const p = spring({ frame: frame - Math.round(claves[k].t * fps), fps, config: { damping: 200, stiffness: 40, mass: 1 }, durationInFrames: Math.round(TRANSICION_SEG * fps) });
    const a = claves[k - 1].cam;
    cam = { centro: interpolarCentro(a.centro, claves[k].cam.centro, p, tipo), zoom: a.zoom + (claves[k].cam.zoom - a.zoom) * p };
  }
  const deriva = interpolate(frame, [0, plan.duracionFrames], [0, mapa.zoomFinal - mapa.zoomInicial], { extrapolateRight: 'clamp' });
  return { centro: cam.centro, zoom: cam.zoom + deriva };
};

// ---------------------------------------------------------------- capas
/** Segundo absoluto en que se dibuja / aparece algo de la escena `escena` (-1 = gancho). */
export const inicioDe = (plan: Plan, escena: number) => inicioDeEscena((i) => plan.escenas[i]?.linea.inicio, escena);

const Linea: React.FC<{ d: string; color: string; estilo: 'solida' | 'punteada'; avance: number; id: string }> = ({ d, color, estilo, avance, id }) => {
  if (!d || avance <= 0) return null;
  const mascara = `trazo-${id}`;
  const ancho = estilo === 'solida' ? 9 : 11;
  return (
    <g>
      <defs>
        <mask id={mascara} maskUnits="userSpaceOnUse" x="-2000" y="-2000" width="6000" height="6000">
          <path d={d} pathLength={1} stroke="#fff" strokeWidth={ancho + 26} fill="none" strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray="1 1" strokeDashoffset={1 - avance} />
        </mask>
      </defs>
      <g mask={`url(#${mascara})`}>
        {/* contorno oscuro para que la línea lea sobre cualquier fondo */}
        <path d={d} stroke={PALETA.fondo} strokeOpacity={0.75} strokeWidth={ancho + 7} fill="none" strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray={estilo === 'punteada' ? '0.1 24' : undefined} />
        <path d={d} stroke={color} strokeWidth={ancho} fill="none" strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray={estilo === 'punteada' ? '0.1 24' : undefined} style={{ filter: `drop-shadow(0 0 8px ${color}AA)` }} />
      </g>
    </g>
  );
};

const ALTO_ETIQUETA = 36;
const FRACCIONES = [0.5, 0.38, 0.62, 0.26, 0.74, 0.15, 0.85];

/** Punto a lo largo de una polilínea (por largo acumulado en pantalla), en [lon, lat]. */
const puntoEnFraccion = (puntos: [number, number][], xy: [number, number][], f: number): [number, number] => {
  const largos = [0];
  for (let k = 1; k < xy.length; k++) largos.push(largos[k - 1] + Math.hypot(xy[k][0] - xy[k - 1][0], xy[k][1] - xy[k - 1][1]));
  const objetivo = largos[largos.length - 1] * f;
  let k = 1;
  while (k < largos.length - 1 && largos[k] < objetivo) k++;
  const tramo = Math.max(1e-9, largos[k] - largos[k - 1]);
  const u = (objetivo - largos[k - 1]) / tramo;
  return [puntos[k - 1][0] + (puntos[k][0] - puntos[k - 1][0]) * u, puntos[k - 1][1] + (puntos[k][1] - puntos[k - 1][1]) * u];
};

/**
 * Dónde va la etiqueta de la línea `i`: prueba puntos a lo largo del trazo (centro primero), arriba y abajo,
 * y elige el primero cuya caja no toca otras líneas, otras etiquetas ni sale de la zona útil. Se calcula
 * con la cámara del frame en que aparece (`frameAparece`), así la elección no salta de un frame a otro.
 */
const posicionEtiqueta = (mapa: MapaFrontera, plan: Plan, i: number, frameAparece: number, fps: number, tipo: TipoProyeccion, ancho: number, alto: number):
  { punto: [number, number]; arriba: boolean; ancho: number } => {
  const proy = proyeccion(tipo, camaraEn(mapa, plan, frameAparece, fps, tipo), ancho, alto).clipExtent(null);
  const xyDe = (pts: [number, number][]) => pts.map((q) => proy(q) ?? [-9999, -9999]) as [number, number][];
  const l = mapa.lineas[i];
  const pts = l.puntos!;
  const xy = xyDe(pts);
  const anchoEt = (l.etiqueta ?? '').length * 21 + 16;
  // Obstáculos: puntos densificados de las demás líneas + cajas de las etiquetas anteriores.
  const otros: [number, number][] = [];
  mapa.lineas.forEach((o, j) => {
    if (j === i || !o.puntos) return;
    const oxy = xyDe(o.puntos);
    for (let k = 1; k < oxy.length; k++) for (let u = 0; u <= 1; u += 0.1) otros.push([oxy[k - 1][0] + (oxy[k][0] - oxy[k - 1][0]) * u, oxy[k - 1][1] + (oxy[k][1] - oxy[k - 1][1]) * u]);
  });
  const previas = mapa.lineas.slice(0, i).filter((o) => o.etiqueta && o.puntos);
  const cajasPrevias = previas.map((o) => {
    const j = mapa.lineas.indexOf(o);
    const r = posicionEtiqueta(mapa, plan, j, Math.round(inicioDe(plan, o.dibujarEn) * fps + DURACION_TRAZO_SEG * 0.7 * fps), fps, tipo, ancho, alto);
    const q = proy(r.punto) ?? [-9999, -9999];
    const y = q[1] + (r.arriba ? -ALTO_ETIQUETA - 14 : 14);
    return [q[0] - r.ancho / 2, y, q[0] + r.ancho / 2, y + ALTO_ETIQUETA];
  });
  let mejor: { punto: [number, number]; arriba: boolean; ancho: number } | null = null;
  for (const f of FRACCIONES) {
    const punto = puntoEnFraccion(pts, xy, f);
    const q = proy(punto) ?? [-9999, -9999];
    for (const arriba of [true, false]) {
      const y0 = q[1] + (arriba ? -ALTO_ETIQUETA - 14 : 14);
      const caja = [q[0] - anchoEt / 2 - 8, y0 - 8, q[0] + anchoEt / 2 + 8, y0 + ALTO_ETIQUETA + 8];
      const dentro = caja[0] > 40 && caja[2] < ancho - 40 && caja[1] > 600 && caja[3] < alto - 360;
      const choca = otros.some(([x, y]) => x > caja[0] && x < caja[2] && y > caja[1] && y < caja[3]) ||
        cajasPrevias.some((c) => !(c[2] < caja[0] || c[0] > caja[2] || c[3] < caja[1] || c[1] > caja[3]));
      if (dentro && !choca) return { punto, arriba, ancho: anchoEt };
      if (!mejor && dentro) mejor = { punto, arriba, ancho: anchoEt };
    }
  }
  return mejor ?? { punto: puntoEnFraccion(pts, xy, 0.5), arriba: true, ancho: anchoEt };
};

type PropsMapa = { mapa: MapaFrontera; fondo?: FondoResuelto; plan: Plan; frame: number };

/**
 * Mapa completo de la plantilla: raster NASA (o tierra oscura de Natural Earth), velo, países
 * resaltados, bordes, líneas que se dibujan, etiquetas de línea y marcadores. Todo se recalcula por
 * frame con la cámara (determinista: solo depende de `frame`).
 */
export const Mapa: React.FC<PropsMapa> = ({ mapa, fondo, plan, frame }) => {
  const { fps, width, height } = useVideoConfig();
  const tipo = tipoProyeccion(mapa, !!fondo);
  const raster = tipo === 'equirectangular' ? fondo : undefined;
  const cam = camaraEn(mapa, plan, frame, fps, tipo);
  const proy: GeoProjection = proyeccion(tipo, cam, width, height);
  const camino = geoPath(proy);
  // Para las líneas del guion: sin recorte rectangular (el recorte cambiaría el largo del trazo al moverse la cámara).
  const proyLibre = tipo === 'ortografica' ? proy : proyeccion(tipo, cam, width, height).clipExtent(null);
  const caminoLibre = geoPath(proyLibre);

  const geometriasLineas = useMemo(() => mapa.lineas.map((l) => (l.puntos
    ? ({ type: 'LineString', coordinates: l.puntos } as LineString)
    : fronteraEntre(l.fronteraEntre![0], l.fronteraEntre![1]))), [mapa.lineas]);

  // Margen en grados para descartar países fuera de vista (vista ≈ 1920 px de alto).
  const margen = Math.min(180, (1920 * 360) / (256 * Math.pow(2, cam.zoom)) + 2);
  const resaltados = (mapa.paises ?? []).length ? PAISES.filter(({ f }) => (mapa.paises ?? []).some((c) => esPais(f as never, c))) : [];
  const verBordes = cam.zoom <= 9; // a escala de ciudad Natural Earth es demasiado grueso: se oculta

  const [x0, y0] = raster ? proy([raster.bbox[0], raster.bbox[3]]) ?? [0, 0] : [0, 0];
  const [x1, y1] = raster ? proy([raster.bbox[2], raster.bbox[1]]) ?? [0, 0] : [0, 0];

  return (
    <div style={{ position: 'absolute', inset: 0, background: PALETA.fondo, overflow: 'hidden' }}>
      {raster && (
        <Img src={staticFile(raster.src)} style={{ position: 'absolute', left: x0, top: y0, width: x1 - x0, height: y1 - y0, filter: 'saturate(1.3) contrast(1.2) brightness(1.02)' }} />
      )}
      {raster && <div style={{ position: 'absolute', inset: 0, background: fondoAlfa(0.36) }} />}
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        {!raster && tipo === 'ortografica' && <path d={camino({ type: 'Sphere' }) ?? ''} fill={PALETA.fondo} stroke={PALETA.borde} strokeWidth={2} />}
        {!raster && <path d={camino(TIERRA) ?? ''} fill={PALETA.fondo2} stroke="none" />}
        {resaltados.map(({ f }, i) => (
          <path key={i} d={camino(f) ?? ''} fill={PALETA.amarillo} fillOpacity={0.1} stroke={PALETA.amarillo} strokeOpacity={0.35} strokeWidth={2} />
        ))}
        {verBordes && (
          <path d={camino(BORDES) ?? ''} fill="none" stroke={raster ? PALETA.tinta : PALETA.borde} strokeOpacity={raster ? 0.35 : 0.9} strokeWidth={2}
            strokeDasharray={raster ? '6 6' : undefined} />
        )}
        {mapa.lineas.map((l, i) => {
          const desde = inicioDe(plan, l.dibujarEn);
          const avance = interpolate(frame / fps, [desde, desde + DURACION_TRAZO_SEG], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (x) => 1 - Math.pow(1 - x, 2) });
          return <Linea key={l.id} id={`${i}`} d={caminoLibre(geometriasLineas[i]) ?? ''} color={COLORES_GUION[l.color]} estilo={l.estilo} avance={avance} />;
        })}
      </svg>
      {/* Etiquetas de línea: posición elegida una vez (con la cámara del momento en que aparecen) para no pisar otras líneas. */}
      {mapa.lineas.map((l, i) => {
        if (!l.etiqueta || !l.puntos) return null;
        const desde = inicioDe(plan, l.dibujarEn) + DURACION_TRAZO_SEG * 0.7;
        if (frame < desde * fps) return null;
        const pos = posicionEtiqueta(mapa, plan, i, Math.round(desde * fps), fps, tipo, width, height);
        const p = proyLibre(pos.punto);
        if (!p) return null;
        const e = spring({ frame: frame - Math.round(desde * fps), fps, config: { damping: 14 } });
        return (
          <div key={`e-${l.id}`} style={{
            position: 'absolute', left: p[0] - pos.ancho / 2, top: p[1] + (pos.arriba ? -ALTO_ETIQUETA - 14 : 14), width: pos.ancho, textAlign: 'center',
            transform: `scale(${e})`, fontFamily: TIPO.texto, fontWeight: 800, fontSize: 30, lineHeight: `${ALTO_ETIQUETA}px`, letterSpacing: 2,
            color: COLORES_GUION[l.color], textTransform: 'uppercase', WebkitTextStroke: `6px ${PALETA.fondo}`, paintOrder: 'stroke fill', whiteSpace: 'nowrap',
          }}>{l.etiqueta}</div>
        );
      })}
      {(mapa.marcadores ?? []).map((m, i) => {
        const p = proy([m.lon, m.lat]);
        // Fuera de cuadro (o casi en el borde) no se dibuja: una etiqueta cortada se ve como error.
        if (!p || p[0] < 30 || p[0] > width - 30 || p[1] < 0 || p[1] > height) return null;
        const aparece = Math.round(inicioDe(plan, m.aparecerEn) * fps);
        const e = spring({ frame: frame - aparece, fps, config: { damping: 11, stiffness: 160 } });
        if (frame < aparece) return null;
        const pulso = 1 + 0.6 * ((frame - aparece) % 90) / 90;
        const anchoEtiqueta = m.etiqueta.length * 27 + 30;
        const izquierda = p[0] + anchoEtiqueta > width - 40 && p[0] - anchoEtiqueta > 40;
        return (
          <div key={`m-${i}`} style={{ position: 'absolute', left: p[0], top: p[1], transform: `scale(${e})` }}>
            <div style={{ position: 'absolute', left: -26 * pulso, top: -26 * pulso, width: 52 * pulso, height: 52 * pulso, borderRadius: '50%', border: `3px solid ${PALETA.coral}`, opacity: 1.6 - pulso }} />
            <div style={{ position: 'absolute', left: -13, top: -13, width: 26, height: 26, borderRadius: '50%', background: PALETA.coral, border: `4px solid ${PALETA.tinta}` }} />
            <div style={{
              position: 'absolute', top: -24, ...(izquierda ? { right: 26 } : { left: 26 }), whiteSpace: 'nowrap',
              fontFamily: TIPO.display, fontWeight: 800, fontSize: 40, color: PALETA.tinta, letterSpacing: 1,
              WebkitTextStroke: `8px ${PALETA.fondo}`, paintOrder: 'stroke fill',
            }}>{m.etiqueta}</div>
          </div>
        );
      })}
    </div>
  );
};

export type { Feature };
