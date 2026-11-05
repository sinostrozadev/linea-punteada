import React from 'react';
import { PALETA } from './tokens';

/**
 * Isotipo de Línea Punteada (mismo dibujo que marca-canal/logo.svg): globo con meridianos,
 * una línea punteada amarilla y el punto coral de "aquí". `avance` (0–1) dibuja la línea.
 */
export const Logo: React.FC<{ tamano: number; avance?: number }> = ({ tamano, avance = 1 }) => {
  const largo = Math.hypot(46, 44);
  return (
    <svg viewBox="0 0 100 100" width={tamano} height={tamano} style={{ display: 'block' }}>
      <circle cx="50" cy="50" r="44" fill="#12304A" stroke={PALETA.celeste} strokeWidth="5" />
      <path d="M50 6 C32 24 32 76 50 94 M50 6 C68 24 68 76 50 94 M8 50 H92" fill="none" stroke={PALETA.celeste} strokeOpacity=".35" strokeWidth="2.5" />
      <defs>
        <mask id="logo-trazo">
          <path d="M22 76 L68 32" stroke="#fff" strokeWidth="12" strokeLinecap="round" strokeDasharray={`${largo * avance} ${largo}`} fill="none" />
        </mask>
      </defs>
      <path d="M22 76 L68 32" fill="none" stroke={PALETA.amarillo} strokeWidth="9" strokeLinecap="round" strokeDasharray="0.1 13.2" mask="url(#logo-trazo)" />
      <circle cx="74" cy="26" r={9 * Math.min(1, Math.max(0, (avance - 0.85) / 0.15))} fill={PALETA.coral} stroke={PALETA.fondo} strokeWidth="3" />
    </svg>
  );
};
