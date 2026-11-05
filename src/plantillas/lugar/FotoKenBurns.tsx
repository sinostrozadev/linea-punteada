import React from 'react';
import { Img, interpolate, staticFile } from 'remotion';
import { FORMATO, PALETA, fondoAlfa } from '../../marca/tokens';
import type { ImagenResuelta } from '../comun/guion';
import type { ModoKenBurns } from './guion';

const FY = { arriba: 0.22, centro: 0.5, abajo: 0.78 } as const;
const suave = (x: number) => x * x * (3 - 2 * x);

/**
 * Parámetros del Ken Burns en el progreso p (0–1): zoom ≥ 1 sobre el encuadre "cover" y foco (fx, fy) en
 * fracciones de la foto. El desplazamiento se calcula en píxeles dentro del sobrante, así NUNCA asoma un borde.
 */
export const kenBurns = (modo: ModoKenBurns, p: number, fy: number) => {
  const q = suave(Math.min(1, Math.max(0, p)));
  switch (modo) {
    case 'acercar': return { zoom: 1.02 + 0.2 * q, fx: 0.5, fy };
    case 'alejar': return { zoom: 1.22 - 0.2 * q, fx: 0.5, fy };
    case 'izquierda': return { zoom: 1.12, fx: 0.66 - 0.32 * q, fy };
    case 'derecha': return { zoom: 1.12, fx: 0.34 + 0.32 * q, fy };
  }
};

/**
 * Foto a pantalla completa con Ken Burns determinista (solo depende de `frame`), velos arriba (subtítulos) y abajo
 * (crédito), y fundidos de entrada y salida. `frames` = duración total de la capa (incluye el solape).
 */
export const FotoKenBurns: React.FC<{
  imagen: ImagenResuelta; frame: number; frames: number; modo: ModoKenBurns; entrada: boolean; salida: boolean; solape: number;
}> = ({ imagen, frame, frames, modo, entrada, salida, solape }) => {
  const W = FORMATO.ancho;
  const H = FORMATO.alto;
  const fy = FY[imagen.encuadre ?? (imagen.alto > imagen.ancho * 1.1 ? 'arriba' : 'centro')];
  const { zoom, fx, fy: fyy } = kenBurns(modo, frame / Math.max(1, frames), fy);
  const cubre = Math.max(W / imagen.ancho, H / imagen.alto) * zoom;
  const rw = imagen.ancho * cubre;
  const rh = imagen.alto * cubre;
  // Foco (fx, fy) de la foto al centro de la pantalla, acotado para no salir del sobrante.
  const x = Math.min(0, Math.max(W - rw, W / 2 - fx * rw));
  const y = Math.min(0, Math.max(H - rh, H / 2 - fyy * rh));
  const aIn = entrada ? interpolate(frame, [0, solape], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 1;
  const aOut = salida ? interpolate(frame, [frames - solape, frames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 1;
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity: aIn * aOut, background: PALETA.fondo }}>
      <Img src={staticFile(imagen.src)} style={{
        position: 'absolute', left: x, top: y, width: rw, height: rh, filter: 'saturate(1.08) contrast(1.06)',
      }} />
      {/* Velos: arriba para cabecera y subtítulos, abajo para el crédito; viñeta suave. */}
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${fondoAlfa(0.62)} 0%, ${fondoAlfa(0.1)} 34%, transparent 50%, ${fondoAlfa(0.15)} 70%, ${fondoAlfa(0.7)} 100%)` }} />
      <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 220px rgba(0,0,0,0.45)' }} />
    </div>
  );
};
