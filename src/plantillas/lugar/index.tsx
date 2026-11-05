import React from 'react';
import { Composition } from 'remotion';
import { FORMATO } from '../../marca/tokens';
import { Lugar, PropsLugar, calcularMetadataLugar } from './Lugar';
import ejemplo from '../../../contenido/borradores/lugar-clipperton-1917.json';

export { GuionLugar, EnvoltorioLugar } from './guion';

/**
 * Registra la composición "Lugar". Las props reales llegan por --props desde salida/trabajo/<id>.props.json;
 * las de por defecto son el guion de Clipperton (sin voz, foto ni satélite: en Studio se ve con tiempos estimados
 * y todo en vista mapa con vectores oscuros).
 */
export const registrar = (): React.ReactNode => (
  <Composition
    id="Lugar"
    component={Lugar}
    schema={PropsLugar}
    calculateMetadata={calcularMetadataLugar}
    width={FORMATO.ancho}
    height={FORMATO.alto}
    fps={FORMATO.fps}
    durationInFrames={140 * FORMATO.fps}
    defaultProps={ejemplo.props as PropsLugar}
  />
);
