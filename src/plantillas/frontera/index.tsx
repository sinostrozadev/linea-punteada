import React from 'react';
import { Composition } from 'remotion';
import { FORMATO } from '../../marca/tokens';
import { Frontera, PropsFrontera, calcularMetadataFrontera } from './Frontera';
import ejemplo from './ejemplo.json';

export { GuionFrontera } from './guion';

/**
 * Registra la composición "Frontera". Las props reales llegan por --props desde
 * salida/trabajo/<id>.props.json; las de por defecto son el guion de El Chamizal (sin voz ni satélite:
 * en Studio se ve con tiempos estimados y mapa oscuro).
 */
export const registrar = (): React.ReactNode => (
  <Composition
    id="Frontera"
    component={Frontera}
    schema={PropsFrontera}
    calculateMetadata={calcularMetadataFrontera}
    width={FORMATO.ancho}
    height={FORMATO.alto}
    fps={FORMATO.fps}
    durationInFrames={140 * FORMATO.fps}
    defaultProps={ejemplo.props as PropsFrontera}
  />
);
