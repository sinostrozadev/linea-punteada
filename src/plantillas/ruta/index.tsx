import React from 'react';
import { Composition } from 'remotion';
import { FORMATO } from '../../marca/tokens';
import { Ruta, PropsRuta, calcularMetadataRuta } from './Ruta';
import ejemplo from './ejemplo.json';

export { GuionRuta, EnvoltorioRuta } from './guion';

/**
 * Registra la composición "Ruta". Las props reales llegan por --props desde salida/trabajo/<id>.props.json;
 * las de por defecto son el guion de Karl Bushby (sin voz: en Studio se ve con tiempos estimados y el trazado
 * calculado en el navegador).
 */
export const registrar = (): React.ReactNode => (
  <Composition
    id="Ruta"
    component={Ruta}
    schema={PropsRuta}
    calculateMetadata={calcularMetadataRuta}
    width={FORMATO.ancho}
    height={FORMATO.alto}
    fps={FORMATO.fps}
    durationInFrames={140 * FORMATO.fps}
    defaultProps={ejemplo.props as PropsRuta}
  />
);
