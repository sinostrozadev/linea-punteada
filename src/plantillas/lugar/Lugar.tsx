import React, { useMemo } from 'react';
import { AbsoluteFill, Audio, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig, type CalculateMetadataFunction } from 'remotion';
import { z } from 'zod';
import { FORMATO, PALETA, TIPO } from '../../marca/tokens';
import { cargarFuentes } from '../../marca/fuentes';
import { MarcaDeAgua } from '../../marca/MarcaDeAgua';
import { Cierre } from '../../marca/Cierre';
import { ImagenResuelta, ImagenesResueltas } from '../comun/guion';
import { FRAMES_CIERRE, buscarPalabra, estimarTiempos, planificar, type Bloque, type Plan, type Tiempos } from '../comun/plan';
import { Subtitulos } from '../comun/Subtitulos';
import { Cabecera } from '../comun/Cabecera';
import { Rotulo, type EstiloRotulo } from '../comun/Rotulo';
import { Remate, mitadesRemate } from '../comun/Remate';
import { ZONA } from '../comun/disposicion';
import { CamposLugar, FondoNivel, type ModoKenBurns } from './guion';
import { FotoKenBurns } from './FotoKenBurns';
import { MapaLugarVista, inicioDeEscenaLugar } from './MapaLugar';
import {
  DIAMETRO_INSET, INSET_TOP, SOLAPE, alfaInset, bloqueEn, fotoTapaMapa, zoomCompletoEn, kenBurnsDelPlan, vistasDelPlan, zoomInsetEn, type Vista,
} from './camara';

/** Props de la composición: el guion + lo que agrega preparar-lugar. */
export const PropsLugar = CamposLugar.extend({
  duracionFrames: z.number().optional(),
  tiempos: z.any().optional(),
  /** Foto principal resuelta (si falta, el video pasa a vista mapa). */
  fotoPrincipal: ImagenResuelta.optional(),
  /** Fotos propias de escena por índice de línea de voz (1..n). */
  imagenes: ImagenesResueltas.optional(),
  /** Recortes satelitales por nivel de zoom, del más lejano al más cercano (vacío = vectores oscuros). */
  fondosMapa: z.array(FondoNivel).optional(),
  /** Atribución para la descripción (no se usa en el render). */
  creditos: z.string().optional(),
});
export type PropsLugar = z.infer<typeof PropsLugar>;

const FPS = FORMATO.fps;
/** Centro del rótulo: con foto, arriba del inset; con mapa, arriba del punto (que va al 68 % del alto). */
const ROTULO_Y: Record<Vista, number> = { foto: 800, mapa: 860 };

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
  const plan = planificar(props, tiempos, FPS);
  return { durationInFrames: plan.duracionFrames, props: { ...props, tiempos, duracionFrames: plan.duracionFrames } };
};

const estiloDe = (tipo: string): EstiloRotulo => (tipo === 'mito' ? 'mito' : tipo === 'giro' ? 'giro' : 'clave');

/** Subtítulos y rótulo de una escena (en la palabra `dice`; el del mito se tacha en "verdad"). */
const Escena: React.FC<{ bloque: Bloque; props: PropsLugar; vista: Vista }> = ({ bloque, props, vista }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const escena = props.escenas[bloque.indice - 1];
  const rotuloDesde = bloque.rotuloEn === null ? null : Math.round(bloque.rotuloEn * fps);
  const iVerdad = escena.tipo === 'mito' ? buscarPalabra(bloque.linea.palabras, 'verdad') : -1;
  const tacharEn = iVerdad >= 0 && rotuloDesde !== null ? Math.round(bloque.linea.palabras[iVerdad].inicio * fps) - rotuloDesde : undefined;
  return (
    <AbsoluteFill>
      {escena.rotulo && rotuloDesde !== null && (
        <Rotulo texto={escena.rotulo.texto} frame={frame - rotuloDesde} frames={bloque.frames - rotuloDesde} estilo={estiloDe(escena.tipo)}
          centroY={ROTULO_Y[vista]} tacharEn={tacharEn} />
      )}
      <Subtitulos linea={bloque.linea} frameLocal={frame} resaltar={bloque.palabraRotulo >= 0 ? [bloque.palabraRotulo] : []} />
    </AbsoluteFill>
  );
};

const Gancho: React.FC<{ bloque: Bloque; props: PropsLugar; vista: Vista }> = ({ bloque, props, vista }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Rotulo texto={props.gancho.rotulo} frame={frame} frames={bloque.frames} inmediato centroY={ROTULO_Y[vista]} />
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

/** Crédito de una línea al pie (dentro de la zona segura). */
const Credito: React.FC<{ texto: string }> = ({ texto }) => (
  <div style={{
    position: 'absolute', left: FORMATO.seguro.lados, right: FORMATO.seguro.lados + 80, bottom: ZONA.creditoMapa.bottom, fontFamily: TIPO.texto, fontWeight: 500,
    fontSize: 19, color: PALETA.tintaSuave, opacity: 0.85, textShadow: '0 1px 4px rgba(0,0,0,0.9)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  }}>{texto}</div>
);

const autorCorto = (a: string) => (a.length > 34 ? `${a.slice(0, 32).trim()}…` : a);

export const Lugar: React.FC<PropsLugar> = (props) => {
  cargarFuentes();
  const frame = useCurrentFrame();
  const tiempos: Tiempos = props.tiempos ?? estimarTiempos(props);
  const plan: Plan = useMemo(() => planificar(props, tiempos, FPS), [props, tiempos]);
  const hayVoz = !!props.tiempos;
  const fondos = props.fondosMapa ?? [];
  const imagenDe = (i: number) => (i === 0 ? props.fotoPrincipal : props.imagenes?.[String(i)] ?? props.fotoPrincipal);
  const vistas = useMemo(() => vistasDelPlan(plan, props.escenas, !!props.fotoPrincipal, (i) => !!props.imagenes?.[String(i)]), [plan, props]);
  const modos = useMemo(() => kenBurnsDelPlan(plan, props.escenas, vistas), [plan, props.escenas, vistas]);
  const apariciones = (props.mapa.marcadores ?? []).map((m) => inicioDeEscenaLugar((i) => plan.escenas[i]?.linea.inicio, m.aparecerEn));

  const zInset = zoomInsetEn(props.mapa, frame, plan.duracionFrames);
  const iActual = bloqueEn(plan, frame);
  const bActual = plan.bloques[iActual];
  const vistaActual = vistas[iActual];
  // Franja del rótulo en pantalla (para atenuar etiquetas del mapa grande que caigan debajo).
  const rotuloVisible = bActual.tipo !== 'remate' && bActual.rotuloEn !== null && frame - bActual.desde >= Math.round(bActual.rotuloEn * FPS);
  const franja: [number, number] | null = rotuloVisible ? [ROTULO_Y[vistaActual] - 200, ROTULO_Y[vistaActual] + 200] : null;
  const aInset = alfaInset(plan, vistas, frame);
  const eInset = spring({ frame: frame - bActual.desde, fps: FPS, config: { damping: 14, stiffness: 120 } });
  const escalaInset = iActual === 0 || (iActual > 0 && vistas[iActual - 1] === 'foto') || vistaActual !== 'foto' ? 1 : 0.85 + 0.15 * eInset;
  const imagenActual = vistaActual === 'foto' ? imagenDe(bActual.indice) : undefined;
  const creditoFoto = imagenActual ? `Foto: ${autorCorto(imagenActual.autor)} · ${imagenActual.licencia} · Wikimedia Commons` : '';
  const creditoMapa = fondos.length ? fondos[fondos.length - 1].credito : '';

  return (
    <AbsoluteFill style={{ background: PALETA.fondo }}>
      {!fotoTapaMapa(plan, vistas, frame) && (
        <MapaLugarVista mapa={props.mapa} fondos={fondos} ancho={FORMATO.ancho} alto={FORMATO.alto} zoom={zoomCompletoEn(props.mapa, frame, plan.duracionFrames, FPS, apariciones, FORMATO.alto)} frame={frame} fps={FPS}
          modo="completo" apariciones={apariciones} franjaRotulo={franja} />
      )}
      {/* Fotos: una capa por bloque con vista foto, alargada SOLAPE frames para fundirse con la siguiente. */}
      {plan.bloques.map((b, i) => {
        const img = vistas[i] === 'foto' ? imagenDe(b.indice) : undefined;
        if (!img) return null;
        const siguienteFoto = i + 1 < vistas.length && vistas[i + 1] === 'foto';
        return (
          <Sequence key={`f-${i}`} from={b.desde} durationInFrames={b.frames + SOLAPE}>
            <CapaFoto imagen={img} frames={b.frames + SOLAPE} modo={modos[i]} entrada={i > 0} salida={!siguienteFoto} />
          </Sequence>
        );
      })}
      {hayVoz && <Audio src={staticFile(`audio/generado/${props.id}.wav`)} volume={1} />}
      {hayVoz && tiempos.lineas.map((l) => (
        <Sequence key={l.indice} from={Math.round(l.inicio * FPS)} durationInFrames={Math.ceil(l.duracionAudio * FPS) + 2}>
          <Audio src={staticFile(l.archivo)} volume={1} />
        </Sequence>
      ))}
      {/* Mapa inset redondo con el punto: solo sobre la foto. */}
      {aInset > 0 && (
        <div style={{
          position: 'absolute', left: (FORMATO.ancho - DIAMETRO_INSET) / 2, top: INSET_TOP, width: DIAMETRO_INSET, height: DIAMETRO_INSET,
          borderRadius: '50%', overflow: 'hidden', opacity: aInset, transform: `scale(${escalaInset})`,
          border: `6px solid ${PALETA.tinta}`, boxShadow: '0 24px 70px rgba(0,0,0,0.65)',
        }}>
          <MapaLugarVista mapa={props.mapa} fondos={fondos} ancho={DIAMETRO_INSET - 12} alto={DIAMETRO_INSET - 12} zoom={zInset} frame={frame} fps={FPS}
            modo="inset" apariciones={apariciones} />
        </div>
      )}
      {bActual.tipo !== 'remate' && (vistaActual === 'foto'
        ? <Credito texto={creditoMapa ? `${creditoFoto} · Mapa: NASA` : creditoFoto} />
        : creditoMapa ? <Credito texto={creditoMapa} /> : null)}
      <Cabecera texto={props.cabecera} />
      <Sequence from={plan.gancho.desde} durationInFrames={plan.gancho.frames}>
        <Gancho bloque={plan.gancho} props={props} vista={vistas[0]} />
      </Sequence>
      {plan.escenas.map((b) => (
        <Sequence key={b.indice} from={b.desde} durationInFrames={b.frames}>
          <Escena bloque={b} props={props} vista={vistas[b.indice]} />
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

/** Capa de foto dentro de su <Sequence> (lee el frame local). */
const CapaFoto: React.FC<{ imagen: ImagenResuelta; frames: number; modo: ModoKenBurns; entrada: boolean; salida: boolean }> = (p) => {
  const frame = useCurrentFrame();
  return <FotoKenBurns imagen={p.imagen} frame={frame} frames={p.frames} modo={p.modo} entrada={p.entrada} salida={p.salida} solape={SOLAPE} />;
};
