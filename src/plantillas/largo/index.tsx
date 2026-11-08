import React from 'react';
import { Composition } from 'remotion';
import { Largo, PropsLargo, calcularMetadataLargo } from './Largo';
import { LARGO } from './modelo';
import ejemplo from './ejemplo.json';

export { CamposLargo, EnvoltorioLargo, GuionLargoValidado } from './guion';

/**
 * Registra la composición "Largo" (16:9, 1920×1080, 30 fps). Las props reales llegan por --props desde
 * salida/trabajo/<id>.props.json (scripts/preparar-largo.mts); las de por defecto son el ejemplo corto, sin voz
 * (en Studio se ve con tiempos estimados).
 */
export const registrar = (): React.ReactNode => (
  <Composition
    id="Largo"
    component={Largo}
    schema={PropsLargo}
    calculateMetadata={calcularMetadataLargo}
    width={LARGO.ancho}
    height={LARGO.alto}
    fps={LARGO.fps}
    durationInFrames={60 * LARGO.fps}
    defaultProps={ejemplo.props as PropsLargo}
  />
);
