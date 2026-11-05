import React from 'react';
import { PALETA, TIPO } from '../../marca/tokens';
import { PICTOGRAMAS, esPictograma } from './pictogramas';

/**
 * Icono de la dirección visual: un pictograma propio (por nombre: "tribunal", "tren"…) o un emoji (Noto Color
 * Emoji, instalada en el sistema). `tamano` en px. Sombra suave para leer sobre el satélite.
 */
export const Icono: React.FC<{ nombre: string; tamano: number; acento?: string; sombra?: boolean }> = ({ nombre, tamano, acento = PALETA.amarillo, sombra = true }) => {
  if (esPictograma(nombre)) {
    const Dibujo = PICTOGRAMAS[nombre];
    return (
      <svg width={tamano} height={tamano} viewBox="0 0 100 100" style={{ overflow: 'visible', filter: sombra ? 'drop-shadow(0 0 2px rgba(5,15,25,0.95)) drop-shadow(0 3px 6px rgba(0,0,0,0.7))' : undefined }}>
        <Dibujo c={PALETA.tinta} a={acento} />
      </svg>
    );
  }
  return (
    <span style={{
      fontFamily: TIPO.emoji, fontSize: tamano * 0.86, lineHeight: `${tamano}px`, width: tamano, height: tamano, display: 'inline-block', textAlign: 'center',
      filter: sombra ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.6))' : undefined,
    }}>{nombre}</span>
  );
};
