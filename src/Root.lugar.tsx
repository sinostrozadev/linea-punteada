import React from 'react';
import { Composition, Folder } from 'remotion';
import { FORMATO } from './marca/tokens';
import { Cierre } from './marca/Cierre';
// Cada plantilla vive en src/plantillas/<nombre>/ y exporta `registrar()` con sus <Composition>.
// ARCHIVO TEMPORAL de la plantilla `lugar` (copia de Root.tsx + lugar) hasta que se cablee en Root.tsx.
import { registrar as frontera } from './plantillas/frontera';
import { registrar as lugar } from './plantillas/lugar';

export const Root: React.FC = () => (
  <>
    <Folder name="Frontera">{frontera()}</Folder>
    <Folder name="Lugar">{lugar()}</Folder>
    <Folder name="Marca">
      <Composition id="CierreMarca" component={Cierre} width={FORMATO.ancho} height={FORMATO.alto} fps={FORMATO.fps} durationInFrames={90} />
    </Folder>
  </>
);
