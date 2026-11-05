import React from 'react';
import { FORMATO, PALETA, TIPO, fondoAlfa } from '../../marca/tokens';
import { ZONA } from './disposicion';

/** Cabecera fija con el lugar, arriba a la izquierda, pequeña, mayúsculas con tracking. */
export const Cabecera: React.FC<{ texto: string }> = ({ texto }) => (
  <div style={{
    position: 'absolute', top: ZONA.cabecera.top, left: FORMATO.seguro.lados, maxWidth: FORMATO.ancho - FORMATO.seguro.lados * 2 - 120,
    display: 'flex', alignItems: 'center', gap: 12, padding: '8px 18px 8px 14px', borderRadius: 999, background: fondoAlfa(0.7),
    fontFamily: TIPO.texto, fontWeight: 700, fontSize: 25, letterSpacing: 3, color: PALETA.tinta, textTransform: 'uppercase',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  }}>
    <span style={{ width: 14, height: 14, borderRadius: '50%', background: PALETA.coral, flex: 'none', boxShadow: `0 0 10px ${PALETA.coral}` }} />
    {texto}
  </div>
);
