import React from 'react';
import { interpolate, spring, useVideoConfig } from 'remotion';
import { FORMATO, PALETA, TIPO } from '../../marca/tokens';

export type EstiloRotulo = 'clave' | 'mito' | 'giro';

/** Tamaño que cabe en el ancho útil: parte de `base` y baja según la palabra más larga y el total. */
const tamanoRotulo = (texto: string, base: number) => {
  const palabras = texto.split(/\s+/);
  const larga = Math.max(...palabras.map((p) => p.length));
  const util = FORMATO.ancho - FORMATO.seguro.lados * 2 - 40;
  // Bricolage 800 en mayúsculas ≈ 0,62 em por letra.
  const porLarga = util / (larga * 0.62);
  const porTotal = (util * 2) / (texto.length * 0.62); // hasta dos líneas
  return Math.max(70, Math.min(base, porLarga, porTotal));
};

/**
 * Rótulo ENORME de 1–3 palabras (Bricolage 800, mayúsculas, borde oscuro grueso).
 *  - clave: amarillo · mito: blanco y, cuando la voz dice "verdad", una raya coral lo tacha · giro: coral.
 *  - `inmediato` (gancho): se ve ENTERO desde el frame 0 (entrada 0,88 + 0,12·spring, nunca desde 0).
 * `frame` es relativo a la aparición; `frames` = cuánto dura visible (sale con un encogido corto).
 */
export const Rotulo: React.FC<{ texto: string; frame: number; frames: number; centroY: number; estilo?: EstiloRotulo; inmediato?: boolean; tacharEn?: number }> = ({
  texto, frame, frames, centroY, estilo = 'clave', inmediato = false, tacharEn,
}) => {
  const { fps } = useVideoConfig();
  if (frame < 0 || frame > frames) return null;
  const s = spring({ frame, fps, config: { damping: 11, stiffness: 190, mass: 0.8 } });
  const entrada = inmediato ? 0.88 + 0.12 * s : s;
  const salida = interpolate(frame, [frames - 8, frames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const escala = (inmediato ? entrada : 0.55 + 0.45 * entrada) * (0.85 + 0.15 * salida);
  const fontSize = tamanoRotulo(texto, 156);
  const color = estilo === 'giro' ? PALETA.coral : estilo === 'mito' ? PALETA.tinta : PALETA.amarillo;
  const deriva = Math.sin(frame / 40) * 5;
  const tachado = tacharEn === undefined ? 0 : interpolate(frame, [tacharEn, tacharEn + 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{
      position: 'absolute', left: FORMATO.seguro.lados, right: FORMATO.seguro.lados, top: centroY - 300, height: 600,
      display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
    }}>
      <div style={{
        position: 'relative', transform: `translateY(${deriva}px) scale(${escala}) rotate(${estilo === 'giro' ? -2 : 0}deg)`,
        opacity: Math.min(1, inmediato ? 1 : entrada * 1.6) * salida,
        fontFamily: TIPO.display, fontWeight: TIPO.pesoRotulo, fontSize, lineHeight: 0.98, letterSpacing: -1,
        textTransform: 'uppercase', textAlign: 'center', color,
        WebkitTextStroke: `${Math.round(fontSize * 0.11)}px ${PALETA.fondo}`, paintOrder: 'stroke fill',
        textShadow: `0 ${fontSize * 0.06}px ${fontSize * 0.12}px rgba(0,0,0,0.65)`,
      }}>
        {texto}
        {tachado > 0 && (
          <div style={{
            position: 'absolute', left: '-4%', top: '50%', height: Math.max(12, fontSize * 0.12), width: `${108 * tachado}%`,
            background: PALETA.coral, borderRadius: 999, transform: 'rotate(-4deg)', boxShadow: `0 0 0 6px ${PALETA.fondo}`,
          }} />
        )}
      </div>
    </div>
  );
};
