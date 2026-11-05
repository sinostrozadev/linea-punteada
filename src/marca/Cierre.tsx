import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { MARCA, PALETA, TIPO, fondoAlfa } from './tokens';
import { cargarFuentes } from './fuentes';
import { Logo } from './Logo';

/**
 * Cierre de marca (1,5 s): una línea punteada amarilla se dibuja de lado a lado y termina en el
 * punto coral; encima, el isotipo, el nombre y el handle. Se monta en una <Sequence> al final.
 * El velo entra rápido pero no desde negro: la última escena se alcanza a ver detrás.
 */
export const Cierre: React.FC = () => {
  cargarFuentes();
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const velo = interpolate(frame, [0, 10], [0.3, 0.9], { extrapolateRight: 'clamp' });
  const avance = interpolate(frame, [0, 0.9 * fps], [0, 1], { extrapolateRight: 'clamp' });
  const entrada = spring({ frame, fps, config: { damping: 13, stiffness: 170 } });
  const x0 = 120;
  const x1 = width - 120;
  const y = 1240;
  const xFin = x0 + (x1 - x0) * avance;
  return (
    <AbsoluteFill style={{ background: fondoAlfa(velo), justifyContent: 'center', alignItems: 'center', fontFamily: TIPO.display }}>
      <svg width={width} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <line x1={x0} y1={y} x2={xFin} y2={y} stroke={PALETA.amarillo} strokeWidth={14} strokeLinecap="round" strokeDasharray="0.1 34" />
        <circle cx={xFin} cy={y} r={avance > 0.97 ? 22 * spring({ frame: frame - 0.85 * fps, fps, config: { damping: 9 } }) : 0} fill={PALETA.coral} stroke={PALETA.fondo} strokeWidth={5} />
      </svg>
      <div style={{ transform: `scale(${0.85 + 0.15 * entrada})`, opacity: Math.min(1, 0.2 + entrada), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, marginTop: -160 }}>
        <Logo tamano={190} avance={avance} />
        <div style={{ fontSize: 96, fontWeight: 800, color: PALETA.tinta, letterSpacing: -2 }}>{MARCA.nombre}</div>
        <div style={{ fontSize: 42, fontWeight: 700, color: PALETA.amarillo, fontFamily: TIPO.texto }}>{MARCA.handle} · suscríbete</div>
      </div>
    </AbsoluteFill>
  );
};
