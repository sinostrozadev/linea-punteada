import React, { useMemo } from 'react';
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig, type CalculateMetadataFunction } from 'remotion';
import { z } from 'zod';
import { ACENTOS, FORMATO, PALETA, TIPO } from '../../marca/tokens';
import { cargarFuentes } from '../../marca/fuentes';
import { ImagenesResueltas } from '../comun/guion';
import { estimarTiempos, planificar, type Plan, type Tiempos } from '../comun/plan';
import { FondoCapa, FondoResuelto } from '../frontera/guion';
import { FRAMES_CIERRE_V2, T_TITULO } from '../frontera/visual';
import { CapasMapa } from '../lugar/compartido/CapasMapa';
import { CapasPantalla, CierreV2, reservasPantalla } from '../lugar/compartido/CapasPantalla';
import { ALTO_MAPA_TITULO, TarjetaTituloBase } from '../lugar/compartido/TarjetaTituloBase';
import { CamposRuta } from './guion';
import { MapaRuta } from './MapaRuta';
import { ALTO_CONTADOR, Contador, TOP_CONTADOR } from './Contador';
import { geoDistance } from 'd3-geo';
import { camaraAsentadaV2, camaraV2, proyeccionDe } from './camara';
import { cabezaEn, type Trazado } from './trazado';
import { contextoV2De, modeloDe, trazadoDe, visualRuta } from './modelo';

/** Props de la composición: el guion + lo que agrega preparar-ruta. */
export const PropsRuta = CamposRuta.extend({
  duracionFrames: z.number().optional(),
  tiempos: z.any().optional(),
  /** Polilínea densificada, km y fechas por punto, puntitos (lo precalcula preparar-ruta; si falta se calcula aquí). */
  trazado: z.any().optional(),
  /** v1 `imagen` de escena (en v2 se muestra como polaroid). */
  imagenes: ImagenesResueltas.optional(),
  /** v2: foto a pantalla completa y polaroid por línea de voz (0 = gancho). */
  fotos: ImagenesResueltas.optional(),
  polaroids: ImagenesResueltas.optional(),
  /** Recorte satelital (solo proyección plano). */
  fondoMapa: FondoResuelto.optional(),
  /** v2: texturas Blue Marble del globo (mundial + regionales de los planos cercanos). */
  texturasGlobo: z.array(FondoCapa).optional(),
  creditos: z.string().optional(),
});
export type PropsRuta = z.infer<typeof PropsRuta>;

const FPS = FORMATO.fps;

export const calcularMetadataRuta: CalculateMetadataFunction<PropsRuta> = async ({ props }) => {
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

export const Ruta: React.FC<PropsRuta> = (props) => {
  cargarFuentes();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tiempos: Tiempos = props.tiempos ?? estimarTiempos(props);
  const plan: Plan = useMemo(() => planificar(props, tiempos, FPS, FRAMES_CIERRE_V2), [props, tiempos]);
  const tr: Trazado = useMemo(() => (props.trazado as Trazado | undefined) ?? trazadoDe(props), [props]);
  const vis = useMemo(() => visualRuta(props, plan), [props, plan]);
  const modelo = useMemo(() => modeloDe(props, plan, tr, () => false, true), [props, plan, tr]);
  const ctxV2 = useMemo(() => contextoV2De(props, plan, modelo, vis), [props, plan, modelo, vis]);
  const acento = ACENTOS[props.acento ?? 'amarillo'];
  const t = frame / fps;
  const cam = camaraV2(ctxV2, t);
  const cabeza = cabezaEn(tr, modelo.rec, t);
  const finGancho = modelo.ctx.finGancho;
  const fantasma = interpolate(t, [finGancho - 0.3, finGancho + 1.2], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const verContador = (props.mapa.mostrarContador ?? true) && frame < plan.cierreDesde ? interpolate(t, [finGancho, finGancho + 0.6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 0;
  const hayVoz = !!props.tiempos;
  const texturas = props.mapa.proyeccion === 'globo' ? props.texturasGlobo ?? [] : [];
  const W = FORMATO.ancho, H = FORMATO.alto;
  // Anticolisión de etiquetas: cámara asentada (estable en los vuelos) + capas de encima y el contador.
  const camRef = camaraAsentadaV2(ctxV2, t);
  const proyRef = proyeccionDe(props.mapa, camRef, W);
  const xyRef = (p: [number, number]) =>
    props.mapa.proyeccion === 'globo' && geoDistance(p, camRef.centro) > Math.PI / 2 - 0.1 ? null : ((proyRef(p) as [number, number] | null) ?? null);
  const reservas = reservasPantalla(vis, t, W, verContador > 0 ? { x0: FORMATO.seguro.lados - 10, y0: TOP_CONTADOR - 10, x1: FORMATO.seguro.lados + 520, y1: TOP_CONTADOR + ALTO_CONTADOR + 10 } : null);

  // Tarjeta de título: el globo con la ruta entera en fantasma, más chico y arriba.
  const general = modelo.ctx.general;
  const camTitulo = { centro: props.tarjetaTitulo?.centro ?? general.centro, k: general.k * 1.02 * (1 + 0.03 * (t / T_TITULO)), y: ALTO_MAPA_TITULO * 0.5 };
  const tt = props.tarjetaTitulo;

  return (
    <AbsoluteFill style={{ background: PALETA.fondo }}>
      <MapaRuta mapa={props.mapa} tr={tr} rec={modelo.rec} cam={cam} cabeza={cabeza} frame={frame} fondo={props.fondoMapa}
        fantasma={fantasma} franjaRotulo={null} texturas={texturas}
        v2={{ acento, capas: (xy, camino, pxKm) => <CapasMapa vis={vis} t={t} xy={xy} camino={camino} acento={acento} ancho={W} alto={H} pxKm={pxKm} xyRef={xyRef} reservas={reservas} /> }} />
      {/* Viñeta suave (como frontera v2). */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 85% 70% at 50% 48%, rgba(0,0,0,0) 55%, rgba(4,12,22,0.45) 100%)' }} />
      {hayVoz && <Audio src={staticFile(`audio/generado/${props.id}.wav`)} volume={1} />}
      {hayVoz && tiempos.lineas.map((l) => (
        <Sequence key={l.indice} from={Math.round(l.inicio * FPS)} durationInFrames={Math.ceil(l.duracionAudio * FPS) + 2}>
          <Audio src={staticFile(l.archivo)} volume={1} />
        </Sequence>
      ))}
      {t >= T_TITULO && (texturas.length || props.fondoMapa) && (
        <div style={{ position: 'absolute', right: 30, bottom: FORMATO.seguro.abajo - 30, fontFamily: TIPO.texto, fontWeight: 500, fontSize: 15, color: PALETA.tintaSuave, opacity: 0.55, textShadow: '0 1px 3px #000' }}>
          {texturas.length ? 'NASA Blue Marble' : props.fondoMapa?.credito}
        </div>
      )}
      <Contador km={cabeza.km * (props.mapa.kmReales ? props.mapa.kmReales / tr.totalKm : 1)} anio={cabeza.anio} anio0={tr.anioPunto[0]} opacidad={verContador} acento={acento} />
      <CapasPantalla vis={vis} plan={plan} frame={frame} fps={FPS} acento={acento} fotos={props.fotos} polaroids={props.polaroids} imagenes={props.imagenes} />
      {t < T_TITULO && (
        <TarjetaTituloBase texto={tt?.texto ?? props.gancho.rotulo} clave={tt?.clave} acento={acento} t={t} icono={tt?.icono}>
          <MapaRuta mapa={props.mapa} tr={tr} rec={modelo.rec} cam={camTitulo} cabeza={cabezaEn(tr, modelo.rec, 0)} frame={frame} fondo={props.fondoMapa}
            fantasma={1} franjaRotulo={null} texturas={texturas} v2={{ acento }} />
        </TarjetaTituloBase>
      )}
      <CierreV2 plan={plan} frame={frame} acento={acento} />
    </AbsoluteFill>
  );
};
