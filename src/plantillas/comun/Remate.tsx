import React from 'react';
import { interpolate, spring, useVideoConfig } from 'remotion';
import { FORMATO, PALETA, TIPO, fondoAlfa } from '../../marca/tokens';
import { ZONA } from './disposicion';

/** Parte el remate en sus dos mitades simétricas (primer punto, punto y coma o dos puntos). */
export const mitadesRemate = (texto: string): [string, string] => {
  const m = /^(.+?[.;:])\s+(.+)$/.exec(texto.trim());
  if (m) return [m[1], m[2]];
  const coma = texto.indexOf(', ');
  if (coma > 10) return [texto.slice(0, coma + 1), texto.slice(coma + 2)];
  return [texto, ''];
};

const tamano = (a: string, b: string) => {
  const largo = Math.max(a.length, b.length);
  return Math.max(60, Math.min(96, 2400 / Math.max(1, largo)));
};

/**
 * Remate gigante: velo sobre el mapa, primera mitad en blanco, una línea punteada que se dibuja, y la
 * segunda mitad en amarillo que entra con golpe cuando la voz llega a ella.
 */
export const Remate: React.FC<{ texto: string; frame: number; segundaEn: number }> = ({ texto, frame, segundaEn }) => {
  const { fps } = useVideoConfig();
  const [a, b] = mitadesRemate(texto);
  const fs = tamano(a, b);
  const velo = interpolate(frame, [0, 14], [0, 0.62], { extrapolateRight: 'clamp' });
  const e1 = spring({ frame, fps, config: { damping: 12, stiffness: 180 } });
  const e2 = spring({ frame: frame - segundaEn, fps, config: { damping: 10, stiffness: 200 } });
  const linea = interpolate(frame, [6, segundaEn], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const ancho = FORMATO.ancho - FORMATO.seguro.lados * 2;
  const estilo: React.CSSProperties = {
    fontFamily: TIPO.display, fontWeight: TIPO.pesoDisplay, fontSize: fs, lineHeight: 1.04, letterSpacing: -1.5, textAlign: 'center',
    WebkitTextStroke: `${Math.round(fs * 0.08)}px ${PALETA.fondo}`, paintOrder: 'stroke fill', textShadow: '0 6px 18px rgba(0,0,0,0.6)',
  };
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: fondoAlfa(velo) }} />
      <div style={{
        position: 'absolute', left: FORMATO.seguro.lados, width: ancho, top: ZONA.remate.centroY - 420, height: 840,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 34,
      }}>
        <div style={{ ...estilo, color: PALETA.tinta, transform: `scale(${1.25 - 0.25 * e1})`, opacity: Math.min(1, e1 * 1.5) }}>{a}</div>
        <svg width={ancho} height={20}>
          <line x1={ancho * 0.18} y1={10} x2={ancho * (0.18 + 0.64 * linea)} y2={10} stroke={PALETA.amarillo} strokeWidth={10} strokeLinecap="round" strokeDasharray="0.1 26" />
        </svg>
        {b && <div style={{ ...estilo, color: PALETA.amarillo, transform: `scale(${1.3 - 0.3 * e2})`, opacity: frame < segundaEn ? 0 : Math.min(1, e2 * 1.5) }}>{b}</div>}
      </div>
    </>
  );
};
