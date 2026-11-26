/**
 * MEDIOS REALES a pantalla completa: extractos de VIDEO de archivo con licencia libre (scripts/lib/videos.mts) y fotos
 * en secuencia (`medios[]` de cada línea de voz; src/plantillas/comun/direccion.ts). Sirve a las plantillas 9:16
 * (frontera, lugar, ruta) y a la 16:9 (largo): se acomoda al tamaño de la composición.
 *
 * El clip va SIN su audio, con zoom lento, viñeta, la pastilla "● LUGAR · QUÉ ES" y el crédito EN PANTALLA
 * (autor · licencia · fuente) mientras se ve: así se cumple la atribución de CC BY / CC BY-SA sin depender de la descripción.
 */
import React from 'react';
import { AbsoluteFill, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { FORMATO, PALETA, TIPO, fondoAlfa } from '../../../marca/tokens';
import type { ImagenResuelta } from '../guion';

/** Clip resuelto por scripts/lib/videos.mts (mismo contrato que `VideoResuelto`). */
export type VideoMedio = { tipo: 'video'; src: string; ancho: number; alto: number; duracion: number; titulo: string; pagina: string; autor: string; licencia: string; licenciaUrl?: string; fuente: string; velocidad?: number };
export type FotoMedio = ImagenResuelta & { tipo: 'foto' };
export type MedioResuelto = VideoMedio | FotoMedio;
export type MediosResueltos = Record<string, MedioResuelto>;

type Ventana = { id: string; desde: number; hasta: number; k: number; d: { pie: string; medio?: string } };

const autorCorto = (a: string, n = 34) => (a.length > n ? `${a.slice(0, n - 2).trim()}…` : a);
const POSICION = { arriba: 'center 22%', centro: 'center center', abajo: 'center 78%' } as const;

/** Pastilla "● PIE" + crédito, ubicados según el formato de la composición. */
const Rotulos: React.FC<{ pie: string; credito: string; frame: number; fps: number; horizontal: boolean; grabando?: boolean }> = ({ pie, credito, frame, fps, horizontal, grabando }) => {
  const e = spring({ frame: frame - 3, fps, config: { damping: 15, stiffness: 150 } });
  const { height } = useVideoConfig();
  return (
    <>
      <div style={{
        position: 'absolute', top: horizontal ? 118 : 252, left: horizontal ? 60 : FORMATO.seguro.lados, display: 'flex', alignItems: 'center', gap: 14, padding: '9px 20px 7px 16px',
        borderRadius: 8, background: fondoAlfa(0.86), transform: `translateX(${(1 - e) * -60}px)`, opacity: Math.min(1, e * 1.5),
        fontFamily: TIPO.condensada, fontSize: horizontal ? 36 : 42, letterSpacing: 2, color: PALETA.tinta, textTransform: 'uppercase', whiteSpace: 'nowrap',
      }}>
        <span style={{ width: 14, height: 14, borderRadius: 7, background: PALETA.coral, boxShadow: `0 0 10px ${PALETA.coral}`, opacity: grabando ? 0.55 + 0.45 * Math.sin((frame / fps) * 6) : 1 }} />{pie}
      </div>
      <div style={{
        position: 'absolute', left: horizontal ? 60 : FORMATO.seguro.lados, right: horizontal ? 60 : 200, top: horizontal ? height - 52 : FORMATO.alto - FORMATO.seguro.abajo - 30,
        fontFamily: TIPO.texto, fontWeight: 500, fontSize: horizontal ? 19 : 22, color: '#E6EEF5', opacity: 0.82, textShadow: '0 1px 4px #000, 0 0 3px #000', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>{credito}</div>
    </>
  );
};

/** Extracto de video real a pantalla completa. `frame` = frames desde que entró; `frames` = cuánto dura en pantalla. */
export const VideoClip: React.FC<{ video: VideoMedio; pie: string; frame: number; frames: number; variante?: number }> = ({ video, pie, frame, frames, variante = 0 }) => {
  const { fps, width, height } = useVideoConfig();
  const horizontal = width > height;
  const p = interpolate(frame, [0, Math.max(1, frames)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const sentido = variante % 2 ? -1 : 1;
  // Entrada: golpe de escala de 4 frames (se siente el corte); después zoom lento continuo.
  const golpe = interpolate(frame, [0, 4], [1.05, 1], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ background: '#000', overflow: 'hidden' }}>
      <OffthreadVideo src={staticFile(video.src)} muted playbackRate={video.velocidad ?? 1}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${(1.03 + 0.07 * p) * golpe}) translateX(${sentido * 0.8 * p}%)`, filter: 'saturate(1.1) contrast(1.05)' }} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 24%, rgba(0,0,0,0) 66%, rgba(0,0,0,0.5) 100%)' }} />
      <Rotulos pie={pie} credito={`Video: ${autorCorto(video.autor)} · ${video.licencia} · ${video.fuente}`} frame={frame} fps={fps} horizontal={horizontal} grabando />
    </AbsoluteFill>
  );
};

/** Foto de la secuencia de medios (mismo lenguaje que FotoCompleta, con los rótulos ubicados para 9:16 o 16:9). */
const FotoMedioCompleta: React.FC<{ imagen: FotoMedio; pie: string; frame: number; frames: number; variante?: number }> = ({ imagen, pie, frame, frames, variante = 0 }) => {
  const { fps, width, height } = useVideoConfig();
  const p = interpolate(frame, [0, Math.max(1, frames)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const sentido = variante % 2 ? -1 : 1;
  const golpe = interpolate(frame, [0, 4], [1.05, 1], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ background: PALETA.fondo, overflow: 'hidden' }}>
      <Img src={staticFile(imagen.src)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: POSICION[imagen.encuadre ?? 'centro'],
        transform: `scale(${(variante % 3 === 2 ? 1.16 - 0.1 * p : 1.06 + 0.1 * p) * golpe}) translateX(${sentido * 1.6 * p}%)`, filter: 'saturate(1.08) contrast(1.06)' }} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0) 26%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.38) 100%)' }} />
      <Rotulos pie={pie} credito={`Foto: ${autorCorto(imagen.autor)} · ${imagen.licencia} · Wikimedia Commons`} frame={frame} fps={fps} horizontal={width > height} />
    </AbsoluteFill>
  );
};

/**
 * Todas las entradas de `vis.fotos` que vienen de `medios[]` (tienen `d.medio`), cada una en su ventana de tiempo.
 * Las plantillas la ponen donde ponen sus fotos a pantalla completa (encima del mapa, debajo de los subtítulos).
 */
export const MediosCompletos: React.FC<{ ventanas: Ventana[]; medios?: MediosResueltos }> = ({ ventanas, medios }) => {
  const { fps } = useVideoConfig();
  return (
    <>
      {ventanas.filter((v) => v.d.medio && medios?.[v.d.medio]).map((v, i) => {
        const m = medios![v.d.medio!];
        const desde = Math.round(v.desde * fps), frames = Math.max(1, Math.round((v.hasta - v.desde) * fps));
        return (
          <Sequence key={v.id} from={desde} durationInFrames={frames} layout="none">
            <FrameLocal>{(f) => (m.tipo === 'video' ? <VideoClip video={m} pie={v.d.pie} frame={f} frames={frames} variante={i} /> : <FotoMedioCompleta imagen={m} pie={v.d.pie} frame={f} frames={frames} variante={i} />)}</FrameLocal>
          </Sequence>
        );
      })}
    </>
  );
};

/** Dentro de un <Sequence>, useCurrentFrame ya es local (0 = entrada del medio). */
const FrameLocal: React.FC<{ children: (frame: number) => React.ReactElement }> = ({ children }) => children(useCurrentFrame());
