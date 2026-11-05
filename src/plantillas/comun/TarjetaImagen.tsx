import React from 'react';
import { Img, interpolate, spring, staticFile, useVideoConfig } from 'remotion';
import { PALETA, TIPO, fondoAlfa } from '../../marca/tokens';
import type { ImagenResuelta } from './guion';
import { ZONA } from './disposicion';

const POSICION = { arriba: 'center 22%', centro: 'center center', abajo: 'center 78%' } as const;

/** Autor corto para el crédito en pantalla (el completo va en la descripción). */
const autorCorto = (a: string) => (a.length > 38 ? `${a.slice(0, 36).trim()}…` : a);

/**
 * Foto de Commons como tarjeta redondeada en el tercio inferior, sobre el mapa: Ken Burns lento,
 * borde blanco fino, crédito pequeño (autor · licencia). Entra con resorte y sale al final de la escena.
 */
export const TarjetaImagen: React.FC<{ imagen: ImagenResuelta; frame: number; frames: number; variante: number }> = ({ imagen, frame, frames, variante }) => {
  const { fps } = useVideoConfig();
  const e = spring({ frame: frame - 4, fps, config: { damping: 15, stiffness: 130 } });
  const salida = interpolate(frame, [frames - 10, frames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const p = interpolate(frame, [0, Math.max(1, frames)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const zoom = 1.04 + 0.08 * p;
  const sentido = variante % 2 === 0 ? 1 : -1;
  const posicion = POSICION[imagen.encuadre ?? (imagen.alto > imagen.ancho * 1.1 ? 'arriba' : 'centro')];
  const { top, alto, lados } = ZONA.tarjeta;
  return (
    <div style={{
      position: 'absolute', left: lados, right: lados, top, height: alto, borderRadius: 34, overflow: 'hidden',
      transform: `translateY(${(1 - e) * 80}px) scale(${0.92 + 0.08 * e})`, opacity: Math.min(1, e * 1.5) * salida,
      border: `4px solid ${PALETA.tinta}`, boxShadow: '0 24px 70px rgba(0,0,0,0.6)', background: PALETA.fondo2,
    }}>
      <Img src={staticFile(imagen.src)} style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: posicion,
        transform: `scale(${zoom}) translateX(${sentido * 2 * p}%)`, filter: 'saturate(0.9) contrast(1.05)',
      }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 90, background: `linear-gradient(180deg, transparent, ${fondoAlfa(0.85)})` }} />
      <div style={{
        position: 'absolute', left: 22, right: 22, bottom: 12, fontFamily: TIPO.texto, fontWeight: 500, fontSize: 21,
        color: PALETA.tintaSuave, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        Foto: {autorCorto(imagen.autor)} · {imagen.licencia} · Wikimedia Commons
      </div>
    </div>
  );
};
