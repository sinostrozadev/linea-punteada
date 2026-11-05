import React from 'react';
import { Composition, Folder } from 'remotion';
import { FORMATO } from './marca/tokens';
import { Cierre } from './marca/Cierre';
// Cada plantilla vive en src/plantillas/<nombre>/ y exporta `registrar()` con sus <Composition>.
// Pendientes: `lugar` (foto + mapa inset) y `ruta` (trayecto animado) — docs/DECISIONES.md.
import { registrar as frontera } from './plantillas/frontera';

export const Root: React.FC = () => (
  <>
    <Folder name="Frontera">{frontera()}</Folder>
    <Folder name="Marca">
      <Composition id="CierreMarca" component={Cierre} width={FORMATO.ancho} height={FORMATO.alto} fps={FORMATO.fps} durationInFrames={90} />
    </Folder>
  </>
);
