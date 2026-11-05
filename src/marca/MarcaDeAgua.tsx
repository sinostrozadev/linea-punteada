import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FORMATO, MARCA, PALETA, TIPO } from './tokens';
import { cargarFuentes } from './fuentes';
import { Logo } from './Logo';

/** Marca de agua discreta: isotipo + nombre, arriba a la derecha, dentro de la zona segura. */
export const MarcaDeAgua: React.FC = () => {
  cargarFuentes();
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{
        position: 'absolute', top: FORMATO.seguro.arriba, right: FORMATO.seguro.lados,
        display: 'flex', alignItems: 'center', gap: 10, opacity: MARCA.marcaDeAgua.opacidad,
        fontFamily: TIPO.display, fontWeight: TIPO.pesoDisplay, fontSize: MARCA.marcaDeAgua.tamano, color: PALETA.tinta,
        textShadow: '0 2px 8px rgba(0,0,0,0.8)',
      }}>
        <Logo tamano={40} />
        {MARCA.nombre}
      </div>
    </AbsoluteFill>
  );
};
