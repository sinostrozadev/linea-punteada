import React, { useMemo } from 'react';
import { AbsoluteFill, Audio, Sequence, spring, staticFile, useCurrentFrame, type CalculateMetadataFunction } from 'remotion';
import { z } from 'zod';
import { ACENTOS, FORMATO, PALETA, TIPO, fondoAlfa } from '../../marca/tokens';
import { cargarFuentes } from '../../marca/fuentes';
import { ImagenResuelta, ImagenesResueltas } from '../comun/guion';
import { estimarTiempos, planificar, type Plan, type Tiempos } from '../comun/plan';
import { Pin } from '../frontera/Mapa';
import { FRAMES_CIERRE_V2, T_TITULO, camaraAsentada, camaraEn } from '../frontera/visual';
import { CamposLugar, FondoNivel, type ModoKenBurns } from './guion';
import { FotoKenBurns } from './FotoKenBurns';
import { MapaLugarVista, inicioDeEscenaLugar } from './MapaLugar';
import {
  OFFSET_COMPLETO, PUNTO_Y_COMPLETO, SOLAPE, proyeccionLugar, alfaInset, bloqueEn, fotoTapaMapa, visualLugar, zoomCompletoEn, kenBurnsDelPlan, vistasDelPlan, zoomInsetEn,
} from './camara';
import { CapasMapa, paisPorNombre } from './compartido/CapasMapa';
import { CapasPantalla, CierreV2, reservasPantalla } from './compartido/CapasPantalla';
import { ALTO_MAPA_TITULO, TarjetaTituloBase } from './compartido/TarjetaTituloBase';

/** Props de la composición: el guion + lo que agrega preparar-lugar. */
export const PropsLugar = CamposLugar.extend({
  duracionFrames: z.number().optional(),
  tiempos: z.any().optional(),
  /** Foto principal resuelta (si falta, el video pasa a vista mapa). */
  fotoPrincipal: ImagenResuelta.optional(),
  /** Fotos propias de escena por índice de línea de voz (1..n). */
  imagenes: ImagenesResueltas.optional(),
  /** v2: foto a pantalla completa y polaroid por línea de voz (0 = gancho). */
  fotos: ImagenesResueltas.optional(),
  polaroids: ImagenesResueltas.optional(),
  /** Recortes satelitales del más lejano al más cercano (v1: por nivel de zoom; v2: por plano). Vacío = vectores. */
  fondosMapa: z.array(FondoNivel).optional(),
  /** Atribución para la descripción (no se usa en el render). */
  creditos: z.string().optional(),
});
export type PropsLugar = z.infer<typeof PropsLugar>;

const FPS = FORMATO.fps;
/** v2: altura relativa del centro de cámara en el mapa a pantalla completa (encima de los subtítulos). */
const FY_V2 = 0.46;
/** v2: inset más chico y bajo los subtítulos (la franja 1080–1310 es de ellos). */
const D_INSET = 300;
const TOP_INSET = 1330;
const ALTERNANCIA: ModoKenBurns[] = ['acercar', 'izquierda', 'alejar', 'derecha'];

export const calcularMetadataLugar: CalculateMetadataFunction<PropsLugar> = async ({ props }) => {
  let tiempos: Tiempos | undefined = props.tiempos;
  if (!tiempos) {
    try {
      const res = await fetch(staticFile(`voz/${props.id}/tiempos.json`));
      if (!res.ok) throw new Error(String(res.status));
      tiempos = (await res.json()) as Tiempos;
    } catch {
      tiempos = estimarTiempos(props);
    }
  }
  const plan = planificar(props, tiempos, FPS, FRAMES_CIERRE_V2);
  return { durationInFrames: plan.duracionFrames, props: { ...props, tiempos, duracionFrames: plan.duracionFrames } };
};

/** Segmento de foto: uno por plano declarado en esa línea (cortes de Ken Burns), o el bloque entero. */
type Segmento = { desde: number; frames: number; modo: ModoKenBurns; entrada: boolean; salida: boolean; bloque: number };

const autorCorto = (a: string) => (a.length > 34 ? `${a.slice(0, 32).trim()}…` : a);

const Credito: React.FC<{ texto: string }> = ({ texto }) => (
  <div style={{
    position: 'absolute', left: FORMATO.seguro.lados + D_INSET + 30, right: 30, bottom: FORMATO.seguro.abajo - 30, textAlign: 'right', fontFamily: TIPO.texto, fontWeight: 500,
    fontSize: 15, color: PALETA.tintaSuave, opacity: 0.7, textShadow: '0 1px 4px rgba(0,0,0,0.9)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  }}>{texto}</div>
);

/** Pastilla "● CABECERA" sobre las fotos (la cabecera ya no es permanente): entra con la foto y se va a los 3 s. */
const Pastilla: React.FC<{ texto: string; frameLocal: number }> = ({ texto, frameLocal }) => {
  const e = spring({ frame: frameLocal - 6, fps: FPS, config: { damping: 14, stiffness: 170 } });
  const o = Math.min(1, e * 1.5) * Math.max(0, Math.min(1, (3.2 * FPS - frameLocal) / 12));
  if (o <= 0) return null;
  return (
    <div style={{
      position: 'absolute', top: 252, left: FORMATO.seguro.lados, display: 'flex', alignItems: 'center', gap: 14, padding: '9px 20px 7px 16px',
      borderRadius: 8, background: fondoAlfa(0.86), transform: `translateX(${(1 - e) * -60}px)`, opacity: o,
      fontFamily: TIPO.condensada, fontSize: 42, letterSpacing: 2, color: PALETA.tinta, textTransform: 'uppercase', whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 14, height: 14, borderRadius: 7, background: PALETA.coral, boxShadow: `0 0 10px ${PALETA.coral}` }} />{texto}
    </div>
  );
};

const creditoMapaDe = (fondos: FondoNivel[], zoom: number) => {
  if (!fondos.length) return '';
  const f = [...fondos].reverse().find((x) => zoom >= x.zoom - 0.6) ?? fondos[0];
  return /s2cloudless/.test(f.capa) ? 'Sentinel-2 cloudless 2016 · EOX · CC BY 4.0' : /Landsat/.test(f.capa) ? 'NASA · Landsat WELD' : 'NASA Blue Marble';
};

export const Lugar: React.FC<PropsLugar> = (props) => {
  cargarFuentes();
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const tiempos: Tiempos = props.tiempos ?? estimarTiempos(props);
  const plan: Plan = useMemo(() => planificar(props, tiempos, FPS, FRAMES_CIERRE_V2), [props, tiempos]);
  const vis = useMemo(() => visualLugar(props, plan), [props, plan]);
  const acento = ACENTOS[props.acento ?? 'amarillo'];
  const hayVoz = !!props.tiempos;
  const fondos = props.fondosMapa ?? [];
  const imagenDe = (i: number) => (i === 0 ? props.fotoPrincipal : props.imagenes?.[String(i)] ?? props.fotoPrincipal);
  const vistas = useMemo(() => vistasDelPlan(plan, props.escenas, !!props.fotoPrincipal, (i) => !!props.imagenes?.[String(i)]), [plan, props]);
  const modos = useMemo(() => kenBurnsDelPlan(plan, props.escenas, vistas), [plan, props.escenas, vistas]);
  const apariciones = (props.mapa.marcadores ?? []).map((m) => inicioDeEscenaLugar((i) => plan.escenas[i]?.linea.inicio, m.aparecerEn));

  // Cámara: v2 = planos (camaraEn de frontera); v1 = zoom lento global que frena por los marcadores.
  const cam = vis.v2
    ? camaraEn(vis.planos, t)
    : { centro: props.mapa.punto, zoom: zoomCompletoEn(props.mapa, frame, plan.duracionFrames, FPS, apariciones, FORMATO.alto) };
  const fyMapa = vis.v2 ? FY_V2 : PUNTO_Y_COMPLETO;
  // Anticolisión de etiquetas: cámara asentada del plano (estable en los vuelos) + lo que ocupan las capas de encima.
  const hayRasterMapa = fondos.length > 0 && Math.abs(props.mapa.punto[1]) <= 60;
  const camRef = vis.v2 ? camaraAsentada(vis.planos, t) : cam;
  const proyRef = proyeccionLugar(camRef.centro, camRef.zoom, FORMATO.ancho, FORMATO.alto, fyMapa, hayRasterMapa).clipExtent(null);
  const xyRef = (p: [number, number]) => (proyRef(p) as [number, number] | null) ?? null;
  const reservas = reservasPantalla(vis, t, FORMATO.ancho);
  const zInset = vis.v2 ? Math.max(1.5, cam.zoom - OFFSET_COMPLETO) : zoomInsetEn(props.mapa, frame, plan.duracionFrames);

  // Segmentos de foto: cada plano de una línea con vista foto es un corte a otro Ken Burns.
  const segmentos = useMemo(() => {
    const out: Segmento[] = [];
    let k = 0;
    plan.bloques.forEach((b, i) => {
      if (vistas[i] !== 'foto' || !imagenDe(b.indice)) return;
      const fin = b.desde + b.frames;
      const cortes = vis.v2 ? vis.planos.filter((p) => p.linea === i).map((p) => Math.round(p.t0 * FPS)) : [];
      const inicios = [b.desde, ...cortes.filter((f) => f > b.desde + FPS * 0.8 && f < fin - FPS * 0.8)];
      const siguienteFoto = i + 1 < vistas.length && vistas[i + 1] === 'foto';
      inicios.forEach((d, j) => {
        const hasta = j + 1 < inicios.length ? inicios[j + 1] : fin;
        const ultimo = j === inicios.length - 1;
        const modo = j === 0 ? modos[i] : ALTERNANCIA[(k + j) % ALTERNANCIA.length];
        out.push({ desde: d, frames: hasta - d + (ultimo ? SOLAPE : 0), modo, entrada: j === 0 && i > 0, salida: ultimo && !siguienteFoto, bloque: i });
      });
      k++;
    });
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan, vistas, modos, vis]);

  const iActual = bloqueEn(plan, frame);
  const bActual = plan.bloques[iActual];
  const vistaActual = vistas[iActual];
  const aInset = alfaInset(plan, vistas, frame);
  const imagenActual = vistaActual === 'foto' ? imagenDe(bActual.indice) : undefined;
  const creditoFoto = imagenActual ? `Foto: ${autorCorto(imagenActual.autor)} · ${imagenActual.licencia} · Wikimedia Commons` : '';
  const creditoMapa = creditoMapaDe(fondos, cam.zoom);
  // Pastilla de cabecera: al empezar cada racha de fotos (gancho tras la tarjeta de título, o al volver del mapa).
  const inicioRacha = (() => {
    if (vistaActual !== 'foto') return null;
    let i = iActual;
    while (i > 0 && vistas[i - 1] === 'foto') i--;
    return i === 0 ? Math.round(T_TITULO * FPS) : plan.bloques[i].desde;
  })();

  // Tarjeta de título: mapa chico centrado en el punto (o en tarjetaTitulo.centro) con contorno de países y pines.
  const tt = props.tarjetaTitulo;
  const zTitulo = tt?.zoom ?? (vis.v2 ? vis.planos[0].zoom - 1.6 : props.mapa.zoomInicial + OFFSET_COMPLETO - 0.6);
  const sinApariciones = apariciones.map(() => 1e6);

  return (
    <AbsoluteFill style={{ background: PALETA.fondo }}>
      {!fotoTapaMapa(plan, vistas, frame) && (
        <MapaLugarVista mapa={props.mapa} fondos={fondos} ancho={FORMATO.ancho} alto={FORMATO.alto} zoom={cam.zoom} frame={frame} fps={FPS}
          modo="completo" apariciones={apariciones} centro={cam.centro} fy={fyMapa} v2
          capas={(xy, camino, pxKm) => <CapasMapa vis={vis} t={t} xy={xy} camino={camino} acento={acento} ancho={FORMATO.ancho} alto={FORMATO.alto} pxKm={pxKm} xyRef={xyRef} reservas={reservas} />} />
      )}
      {segmentos.map((s, n) => (
        <Sequence key={`f-${n}`} from={s.desde} durationInFrames={Math.max(1, s.frames)}>
          <CapaFoto imagen={imagenDe(plan.bloques[s.bloque].indice)!} frames={s.frames} modo={s.modo} entrada={s.entrada} salida={s.salida} />
        </Sequence>
      ))}
      {hayVoz && <Audio src={staticFile(`audio/generado/${props.id}.wav`)} volume={1} />}
      {hayVoz && tiempos.lineas.map((l) => (
        <Sequence key={l.indice} from={Math.round(l.inicio * FPS)} durationInFrames={Math.ceil(l.duracionAudio * FPS) + 2}>
          <Audio src={staticFile(l.archivo)} volume={1} />
        </Sequence>
      ))}
      {/* Mapa inset redondo con el punto: solo sobre la foto; salta de zoom con los planos. */}
      {aInset > 0 && (
        <div style={{
          position: 'absolute', left: FORMATO.seguro.lados, top: TOP_INSET, width: D_INSET, height: D_INSET,
          borderRadius: '50%', overflow: 'hidden', opacity: aInset, border: `5px solid ${PALETA.tinta}`, boxShadow: '0 20px 60px rgba(0,0,0,0.65)',
        }}>
          <MapaLugarVista mapa={props.mapa} fondos={fondos} ancho={D_INSET - 10} alto={D_INSET - 10} zoom={zInset} frame={frame} fps={FPS}
            modo="inset" apariciones={apariciones} v2 />
        </div>
      )}
      {inicioRacha !== null && <Pastilla texto={props.cabecera} frameLocal={frame - inicioRacha} />}
      {bActual.tipo !== 'remate' && t >= T_TITULO && (vistaActual === 'foto'
        ? <Credito texto={creditoMapa ? `${creditoFoto} · Mapa: NASA` : creditoFoto} />
        : creditoMapa ? <Credito texto={creditoMapa} /> : null)}
      <CapasPantalla vis={vis} plan={plan} frame={frame} fps={FPS} acento={acento} fotos={props.fotos} polaroids={props.polaroids} />
      {t < T_TITULO && (
        <TarjetaTituloBase texto={tt?.texto ?? props.gancho.rotulo} clave={tt?.clave} acento={acento} t={t} icono={tt?.icono}>
          <MapaLugarVista mapa={props.mapa} fondos={fondos} ancho={FORMATO.ancho} alto={ALTO_MAPA_TITULO} zoom={zTitulo + 0.12 * (t / T_TITULO)} frame={frame} fps={FPS}
            modo="completo" apariciones={sinApariciones} centro={tt?.centro ?? props.mapa.punto} fy={0.5} v2
            capas={(xy, camino) => (
              <>
                <svg width={FORMATO.ancho} height={ALTO_MAPA_TITULO} style={{ position: 'absolute', inset: 0 }}>
                  {(tt?.paises ?? []).map((n) => {
                    const f = paisPorNombre(n);
                    return f ? <path key={n} d={camino(f) ?? ''} fill={acento} fillOpacity={0.12} stroke={acento} strokeWidth={4} /> : null;
                  })}
                </svg>
                {(tt?.pines ?? []).map((p, i) => {
                  const q = xy([p.lon, p.lat]);
                  return q ? <Pin key={i} x={q[0]} y={q[1]} texto={p.texto} e={1} o={1} escala={0.9} /> : null;
                })}
              </>
            )} />
        </TarjetaTituloBase>
      )}
      <CierreV2 plan={plan} frame={frame} acento={acento} />
    </AbsoluteFill>
  );
};

/** Capa de foto dentro de su <Sequence> (lee el frame local). */
const CapaFoto: React.FC<{ imagen: ImagenResuelta; frames: number; modo: ModoKenBurns; entrada: boolean; salida: boolean }> = (p) => {
  const frame = useCurrentFrame();
  return <FotoKenBurns imagen={p.imagen} frame={frame} frames={p.frames} modo={p.modo} entrada={p.entrada} salida={p.salida} solape={SOLAPE} />;
};
