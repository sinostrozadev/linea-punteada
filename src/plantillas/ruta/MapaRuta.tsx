import React from 'react';
import { Img, interpolate, spring, staticFile, useVideoConfig } from 'remotion';
import { geoDistance, geoGraticule10, geoPath } from 'd3-geo';
import { feature, mesh } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { FeatureCollection, MultiLineString } from 'geojson';
import paises50 from 'world-atlas/countries-50m.json';
import tierra50 from 'world-atlas/land-50m.json';
import { COLORES_GUION, FORMATO, PALETA, TIPO } from '../../marca/tokens';
import type { FondoResuelto } from '../frontera/guion';
import type { MapaRuta as TipoMapaRuta } from './guion';
import { proyeccionDe, type Camara } from './camara';
import { hitosDe } from './modelo';
import { momentoDePunto, type Cabeza, type Recorrido, type Trazado } from './trazado';

// ---------------------------------------------------------------- datos (una vez por pestaña)
const topoPaises = paises50 as unknown as Topology<{ countries: GeometryCollection }>;
const topoTierra = tierra50 as unknown as Topology<{ land: GeometryCollection }>;
const TIERRA = feature(topoTierra, topoTierra.objects.land) as FeatureCollection;
const BORDES = mesh(topoPaises, topoPaises.objects.countries, (a, b) => a !== b) as MultiLineString;
const GRATICULA = geoGraticule10();


/** Cuántas etiquetas de hitos alcanzados quedan a la vista a la vez (la más reciente y la anterior). */
const ETIQUETAS_VIVAS = 2;

type Props = {
  mapa: TipoMapaRuta;
  tr: Trazado;
  rec: Recorrido;
  cam: Camara;
  cabeza: Cabeza;
  frame: number;
  fondo?: FondoResuelto;
  /** Vista general (gancho): ruta fantasma entera + inicio y fin rotulados. */
  fantasma: number;
  /** Franja vertical [y0, y1] ocupada por un rótulo enorme ahora (las etiquetas que caen ahí se atenúan). */
  franjaRotulo: [number, number] | null;
};

/**
 * Mapa de `ruta`: globo ortográfico (o plano equirectangular con satélite) que sigue la cabeza; ruta fantasma,
 * puntitos ya recorridos (a distancia geográfica fija), cabeza brillante, marcadores coral de los hitos y
 * etiquetas solo de los dos últimos hitos alcanzados (las demás quedan como punto: el mapa no se ensucia).
 */
export const MapaRuta: React.FC<Props> = ({ mapa, tr, rec, cam, cabeza, frame, fondo, fantasma, franjaRotulo }) => {
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const globo = mapa.proyeccion === 'globo';
  const proy = proyeccionDe(mapa, cam, width);
  const camino = geoPath(proy);
  const color = COLORES_GUION[mapa.color ?? 'amarillo'];

  /** Visibilidad 0..1 de un punto (lado oculto del globo / fuera de cuadro), con fundido cerca del horizonte. */
  const visible = (p: [number, number]): number => {
    if (globo) {
      const d = geoDistance(p, cam.centro);
      return Math.max(0, Math.min(1, (Math.PI / 2 - 0.03 - d) / 0.14));
    }
    return 1;
  };
  const enPantalla = (x: number, y: number, m = 20) => x > -m && x < width + m && y > -m && y < height + m;

  // Puntitos: radio según la escala (al alejarse se afinan y no se funden).
  const kRef = globo ? width * (mapa.escala ?? 1.1) : cam.k;
  const radio = Math.max(2.6, Math.min(7, 7 * (cam.k / kRef)));
  const recorridos: React.ReactNode[] = [];
  const fantasmas: React.ReactNode[] = [];
  for (let i = 0; i < tr.puntitos.length; i++) {
    const [lon, lat, km] = tr.puntitos[i];
    const hecho = km <= cabeza.km;
    if (!hecho && fantasma <= 0.01) continue;
    const v = visible([lon, lat]);
    if (v <= 0) continue;
    const q = proy([lon, lat]);
    if (!q || !enPantalla(q[0], q[1])) continue;
    if (hecho) {
      recorridos.push(<circle key={i} cx={q[0]} cy={q[1]} r={radio} fill={color} stroke={PALETA.fondo} strokeWidth={2.2} opacity={v} />);
    } else {
      fantasmas.push(<circle key={i} cx={q[0]} cy={q[1]} r={radio * 0.85} fill={PALETA.tinta} opacity={0.6 * v * fantasma} />);
    }
  }

  // Raster (solo plano): se posiciona proyectando las esquinas del bbox EPSG:4326.
  const raster = !globo ? fondo : undefined;
  const [x0, y0] = raster ? proy([raster.bbox[0], raster.bbox[3]]) ?? [0, 0] : [0, 0];
  const [x1, y1] = raster ? proy([raster.bbox[2], raster.bbox[1]]) ?? [0, 0] : [0, 0];

  // ---------------------------------------------------------------- hitos
  const hitos = hitosDe(mapa);
  const llegadas = hitos.map((i) => ({ i, t: momentoDePunto(rec, i) }));
  const alcanzados = llegadas.filter((h) => h.t <= t).sort((a, b) => a.t - b.t);
  const ultimoIndice = mapa.puntos.length - 1;
  const marcadores: React.ReactNode[] = [];
  const etiquetas: React.ReactNode[] = [];
  const atenuar = (y: number) => (franjaRotulo && y > franjaRotulo[0] && y < franjaRotulo[1] ? 0.18 : 1);

  const cajas: number[][] = [];
  /** Etiquetas pendientes; se colocan de la más reciente a la más vieja (prioridad menor = primero). */
  const pendientes: { prioridad: number; args: [number, number, number, string] }[] = [];
  const dibujarEtiqueta = (i: number, opacidad: number, escala: number, clave: string) => {
    const p = mapa.puntos[i];
    const q = proy([p.lon, p.lat]);
    if (!q || opacidad <= 0.01) return;
    if (q[1] < 600 || q[1] > height - FORMATO.seguro.abajo - 20) return; // fuera de la zona útil del mapa
    const texto = p.etiqueta ?? '';
    const anio = p.fecha ? p.fecha.slice(0, 4) : '';
    if (!texto && !anio) return;
    const anchoTexto = Math.max(texto.length * 25, anio.length * 19) + 10;
    // Lado: hacia el centro de la pantalla; si choca con una etiqueta más reciente prueba el otro lado y, si
    // también choca, no se dibuja (los hitos muy juntos —Calais/Dover— no se pisan).
    const alto = anio ? 76 : 44;
    const top = q[1] - (anio ? 64 : 34);
    const preferida = q[0] < width / 2;
    let derecha = preferida;
    let x = 0;
    let libre = false;
    for (const lado of [preferida, !preferida]) {
      const xi = Math.max(FORMATO.seguro.lados, Math.min(width - FORMATO.seguro.lados - anchoTexto, lado ? q[0] + 26 : q[0] - 26 - anchoTexto));
      const caja = [xi - 6, top - 6, xi + anchoTexto + 6, top + alto + 6];
      if (!cajas.some((c) => !(c[2] < caja[0] || c[0] > caja[2] || c[3] < caja[1] || c[1] > caja[3]))) {
        derecha = lado; x = xi; libre = true; cajas.push(caja);
        break;
      }
    }
    if (!libre) return;
    etiquetas.push(
      <div key={clave} style={{
        position: 'absolute', left: x, top, width: anchoTexto, textAlign: derecha ? 'left' : 'right',
        opacity: opacidad * atenuar(q[1]), transform: `scale(${escala})`, transformOrigin: derecha ? 'left center' : 'right center',
        WebkitTextStroke: `8px ${PALETA.fondo}`, paintOrder: 'stroke fill', whiteSpace: 'nowrap', lineHeight: 1.02,
      }}>
        <div style={{ fontFamily: TIPO.display, fontWeight: 800, fontSize: 40, color: PALETA.tinta, letterSpacing: 0.5 }}>{texto}</div>
        {anio && <div style={{ fontFamily: TIPO.texto, fontWeight: 800, fontSize: 30, color: PALETA.amarillo, letterSpacing: 1, fontVariantNumeric: 'tabular-nums' }}>{anio}</div>}
      </div>,
    );
  };

  alcanzados.forEach((h, orden) => {
    const p = mapa.puntos[h.i];
    const v = visible([p.lon, p.lat]);
    const q = proy([p.lon, p.lat]);
    if (!q || v <= 0 || !enPantalla(q[0], q[1], 40)) return;
    const f = Math.round(h.t * fps);
    // El punto de partida se ve entero desde el frame 0 (gancho).
    const e = h.i === 0 ? 1 : spring({ frame: frame - f, fps, config: { damping: 11, stiffness: 160 } });
    const reciente = orden >= alcanzados.length - ETIQUETAS_VIVAS;
    const tamano = reciente ? 13 : 8;
    const pulso = reciente ? 1 + 0.6 * (((frame - f) % 90) / 90) : 0;
    marcadores.push(
      <g key={`m-${h.i}`} transform={`translate(${q[0]} ${q[1]}) scale(${e})`} opacity={v}>
        {reciente && <circle r={26 * pulso} fill="none" stroke={PALETA.coral} strokeWidth={3} opacity={Math.max(0, 1.6 - pulso)} />}
        <circle r={tamano} fill={PALETA.coral} stroke={PALETA.tinta} strokeWidth={reciente ? 4 : 3} />
      </g>,
    );
    // Etiqueta: la más reciente plena, la anterior tenue; al salir de las dos últimas se desvanece.
    const posicion = alcanzados.length - 1 - orden; // 0 = la más reciente
    let op = posicion === 0 ? 1 : posicion === 1 ? 0.6 : 0;
    if (posicion === ETIQUETAS_VIVAS && alcanzados[orden + ETIQUETAS_VIVAS]) {
      const relevo = alcanzados[orden + ETIQUETAS_VIVAS].t;
      op = 0.6 * interpolate(t, [relevo, relevo + 0.4], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    }
    if (posicion === 1) {
      const relevo = alcanzados[orden + 1].t;
      op = interpolate(t, [relevo, relevo + 0.4], [1, 0.6], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    }
    pendientes.push({ prioridad: posicion, args: [h.i, op * v * Math.min(1, e * 1.3), 0.85 + 0.15 * Math.min(1, e), `e-${h.i}`] });
  });

  // Gancho: el destino final como anillo blanco con su nombre (la promesa del video).
  if (fantasma > 0.01 && !alcanzados.some((h) => h.i === ultimoIndice)) {
    const p = mapa.puntos[ultimoIndice];
    const v = visible([p.lon, p.lat]);
    const q = proy([p.lon, p.lat]);
    if (q && v > 0) {
      marcadores.push(<circle key="destino" cx={q[0]} cy={q[1]} r={12} fill="none" stroke={PALETA.tinta} strokeWidth={4} opacity={v * fantasma} />);
      pendientes.push({ prioridad: 0.5, args: [ultimoIndice, v * fantasma, 1, 'e-destino'] });
    }
  }

  pendientes.sort((a, b) => a.prioridad - b.prioridad).forEach((p) => dibujarEtiqueta(...p.args));

  // Cabeza de la línea: punto brillante con halo (solo cuando ya salió).
  const qc = proy(cabeza.pos);
  const vCabeza = visible(cabeza.pos);
  const brilloCabeza = 1 + 0.25 * Math.sin((frame / fps) * 2 * Math.PI * 1.2);

  return (
    <div style={{ position: 'absolute', inset: 0, background: PALETA.fondo, overflow: 'hidden' }}>
      {raster && <Img src={staticFile(raster.src)} style={{ position: 'absolute', left: x0, top: y0, width: x1 - x0, height: y1 - y0, filter: 'saturate(1.3) contrast(1.15)' }} />}
      {raster && <div style={{ position: 'absolute', inset: 0, background: 'rgba(11,29,46,0.4)' }} />}
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id="atmosfera" cx="50%" cy="50%" r="50%">
            <stop offset="88%" stopColor={PALETA.celeste} stopOpacity={0.0} />
            <stop offset="95%" stopColor={PALETA.celeste} stopOpacity={0.22} />
            <stop offset="100%" stopColor={PALETA.celeste} stopOpacity={0} />
          </radialGradient>
        </defs>
        {globo && <circle cx={width / 2} cy={cam.y} r={cam.k * 1.09} fill="url(#atmosfera)" />}
        {globo && <path d={camino({ type: 'Sphere' }) ?? ''} fill="#0E2438" stroke={PALETA.borde} strokeWidth={2} />}
        {!raster && <path d={camino(GRATICULA) ?? ''} fill="none" stroke={PALETA.borde} strokeOpacity={0.35} strokeWidth={1.2} />}
        {!raster && <path d={camino(TIERRA) ?? ''} fill={PALETA.fondo2} stroke={PALETA.borde} strokeWidth={1.2} />}
        <path d={camino(BORDES) ?? ''} fill="none" stroke={raster ? PALETA.tinta : PALETA.borde} strokeOpacity={raster ? 0.3 : 0.9} strokeWidth={1.4} />
        {fantasmas}
        {recorridos}
        {marcadores}
        {qc && vCabeza > 0 && cabeza.u > 0.001 && (
          <g transform={`translate(${qc[0]} ${qc[1]})`} opacity={vCabeza}>
            <circle r={22 * brilloCabeza} fill={color} opacity={0.22} />
            <circle r={10} fill={color} stroke={PALETA.fondo} strokeWidth={3} />
          </g>
        )}
      </svg>
      {etiquetas}
    </div>
  );
};
