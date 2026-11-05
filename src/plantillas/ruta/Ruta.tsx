import React, { useMemo } from 'react';
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig, type CalculateMetadataFunction } from 'remotion';
import { z } from 'zod';
import { FORMATO, PALETA, TIPO } from '../../marca/tokens';
import { cargarFuentes } from '../../marca/fuentes';
import { MarcaDeAgua } from '../../marca/MarcaDeAgua';
import { Cierre } from '../../marca/Cierre';
import { ImagenesResueltas } from '../comun/guion';
import { FRAMES_CIERRE, buscarPalabra, estimarTiempos, planificar, type Bloque, type Plan, type Tiempos } from '../comun/plan';
import { Subtitulos } from '../comun/Subtitulos';
import { Cabecera } from '../comun/Cabecera';
import { Rotulo, type EstiloRotulo } from '../comun/Rotulo';
import { TarjetaImagen } from '../comun/TarjetaImagen';
import { Remate, mitadesRemate } from '../comun/Remate';
import { FondoResuelto } from '../frontera/guion';
import { CamposRuta } from './guion';
import { MapaRuta } from './MapaRuta';
import { Contador, TOP_CONTADOR } from './Contador';
import { camaraEn } from './camara';
import { cabezaEn, type Trazado } from './trazado';
import { DISPOSICION_RUTA, modeloDe, trazadoDe } from './modelo';

/** Props de la composición: el guion + lo que agrega preparar-ruta. */
export const PropsRuta = CamposRuta.extend({
  duracionFrames: z.number().optional(),
  tiempos: z.any().optional(),
  /** Polilínea densificada, km y fechas por punto, puntitos (lo precalcula preparar-ruta; si falta se calcula aquí). */
  trazado: z.any().optional(),
  imagenes: ImagenesResueltas.optional(),
  /** Recorte satelital (solo proyección plano). */
  fondoMapa: FondoResuelto.optional(),
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
  const plan = planificar(props, tiempos, FPS);
  return { durationInFrames: plan.duracionFrames, props: { ...props, tiempos, duracionFrames: plan.duracionFrames } };
};

const estiloDe = (tipo: string): EstiloRotulo => (tipo === 'mito' ? 'mito' : tipo === 'giro' ? 'giro' : 'clave');

/** Una escena: subtítulos, rótulo (más arriba que en `frontera`: la cabeza de la línea va debajo) y foto. */
const Escena: React.FC<{ bloque: Bloque; props: PropsRuta }> = ({ bloque, props }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const escena = props.escenas[bloque.indice - 1];
  const imagen = props.imagenes?.[String(bloque.indice)];
  const rotuloDesde = bloque.rotuloEn === null ? null : Math.round(bloque.rotuloEn * fps);
  const iVerdad = escena.tipo === 'mito' ? buscarPalabra(bloque.linea.palabras, 'verdad') : -1;
  const tacharEn = iVerdad >= 0 && rotuloDesde !== null ? Math.round(bloque.linea.palabras[iVerdad].inicio * fps) - rotuloDesde : undefined;
  return (
    <AbsoluteFill>
      {imagen && (
        <AbsoluteFill style={{ transform: `translateY(${-DISPOSICION_RUTA.subirTarjeta}px)` }}>
          <TarjetaImagen imagen={imagen} frame={frame} frames={bloque.frames} variante={bloque.indice} />
        </AbsoluteFill>
      )}
      {escena.rotulo && rotuloDesde !== null && (
        <Rotulo texto={escena.rotulo.texto} frame={frame - rotuloDesde} frames={bloque.frames - rotuloDesde} estilo={estiloDe(escena.tipo)}
          centroY={imagen ? DISPOSICION_RUTA.rotuloYConImagen : DISPOSICION_RUTA.rotuloY} tacharEn={tacharEn} />
      )}
      <Subtitulos linea={bloque.linea} frameLocal={frame} resaltar={bloque.palabraRotulo >= 0 ? [bloque.palabraRotulo] : []} />
    </AbsoluteFill>
  );
};

const Gancho: React.FC<{ bloque: Bloque; props: PropsRuta }> = ({ bloque, props }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Rotulo texto={props.gancho.rotulo} frame={frame} frames={bloque.frames} inmediato centroY={DISPOSICION_RUTA.rotuloY} />
      <Subtitulos linea={bloque.linea} frameLocal={frame} />
    </AbsoluteFill>
  );
};

const BloqueRemate: React.FC<{ bloque: Bloque; texto: string }> = ({ bloque, texto }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [a] = mitadesRemate(texto);
  const nA = a.split(/\s+/).filter(Boolean).length;
  const p = bloque.linea.palabras[nA];
  const segundaEn = p ? Math.round(p.inicio * fps) : Math.round(bloque.frames * 0.45);
  return <Remate texto={texto} frame={frame} segundaEn={segundaEn} />;
};

/** Franja vertical del rótulo enorme si hay uno en pantalla en este frame (para atenuar etiquetas debajo). */
const franjaRotulo = (plan: Plan, props: PropsRuta, frame: number, fps: number): [number, number] | null => {
  const b = plan.bloques.find((x) => frame >= x.desde && frame < x.desde + x.frames);
  if (!b || b.tipo === 'remate' || b.rotuloEn === null || frame - b.desde < Math.round(b.rotuloEn * fps)) return null;
  const y = b.tipo === 'escena' && props.imagenes?.[String(b.indice)] ? DISPOSICION_RUTA.rotuloYConImagen : DISPOSICION_RUTA.rotuloY;
  return [y - DISPOSICION_RUTA.medioAltoRotulo, y + DISPOSICION_RUTA.medioAltoRotulo];
};

export const Ruta: React.FC<PropsRuta> = (props) => {
  cargarFuentes();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tiempos: Tiempos = props.tiempos ?? estimarTiempos(props);
  const plan: Plan = useMemo(() => planificar(props, tiempos, FPS), [props, tiempos]);
  const tr: Trazado = useMemo(() => (props.trazado as Trazado | undefined) ?? trazadoDe(props), [props]);
  const modelo = useMemo(() => modeloDe(props, plan, tr, (i) => !!props.imagenes?.[String(i)]), [props, plan, tr]);
  const t = frame / fps;
  const cam = camaraEn(modelo.ctx, t);
  const cabeza = cabezaEn(tr, modelo.rec, t);
  const finGancho = modelo.ctx.finGancho;
  const fantasma = interpolate(t, [finGancho - 0.3, finGancho + 1.2], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const verContador = (props.mapa.mostrarContador ?? true) ? interpolate(t, [finGancho, finGancho + 0.6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 0;
  const hayVoz = !!props.tiempos;
  return (
    <AbsoluteFill style={{ background: PALETA.fondo }}>
      <MapaRuta mapa={props.mapa} tr={tr} rec={modelo.rec} cam={cam} cabeza={cabeza} frame={frame} fondo={props.fondoMapa}
        fantasma={fantasma} franjaRotulo={franjaRotulo(plan, props, frame, fps)} />
      {hayVoz && <Audio src={staticFile(`audio/generado/${props.id}.wav`)} volume={1} />}
      {hayVoz && tiempos.lineas.map((l) => (
        <Sequence key={l.indice} from={Math.round(l.inicio * FPS)} durationInFrames={Math.ceil(l.duracionAudio * FPS) + 2}>
          <Audio src={staticFile(l.archivo)} volume={1} />
        </Sequence>
      ))}
      {props.fondoMapa && props.mapa.proyeccion === 'plano' && (
        <div style={{
          position: 'absolute', left: FORMATO.seguro.lados, top: TOP_CONTADOR - 30, fontFamily: TIPO.texto, fontWeight: 500,
          fontSize: 19, color: PALETA.tintaSuave, opacity: 0.8, textShadow: '0 1px 4px rgba(0,0,0,0.9)',
        }}>{props.fondoMapa.credito}</div>
      )}
      <Contador km={cabeza.km * (props.mapa.kmReales ? props.mapa.kmReales / tr.totalKm : 1)} anio={cabeza.anio} anio0={tr.anioPunto[0]} opacidad={verContador} />
      <Cabecera texto={props.cabecera} />
      <Sequence from={plan.gancho.desde} durationInFrames={plan.gancho.frames}>
        <Gancho bloque={plan.gancho} props={props} />
      </Sequence>
      {plan.escenas.map((b) => (
        <Sequence key={b.indice} from={b.desde} durationInFrames={b.frames}>
          <Escena bloque={b} props={props} />
        </Sequence>
      ))}
      <Sequence from={plan.remate.desde} durationInFrames={plan.remate.frames}>
        <BloqueRemate bloque={plan.remate} texto={props.remate} />
      </Sequence>
      <MarcaDeAgua />
      <Sequence from={plan.cierreDesde} durationInFrames={FRAMES_CIERRE}>
        <Cierre />
      </Sequence>
    </AbsoluteFill>
  );
};
