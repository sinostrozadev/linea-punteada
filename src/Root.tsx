import React from 'react';
import { Composition, Folder } from 'remotion';
import { FORMATO } from './marca/tokens';
import { Cierre } from './marca/Cierre';
// Cada plantilla vive en src/plantillas/<nombre>/ y exporta `registrar()` con sus <Composition>.
import { registrar as frontera } from './plantillas/frontera';
import { registrar as lugar } from './plantillas/lugar';
import { registrar as ruta } from './plantillas/ruta';
import { registrar as largo } from './plantillas/largo';

export const Root: React.FC = () => (
  <>
    <Folder name="Frontera">{frontera()}</Folder>
    <Folder name="Lugar">{lugar()}</Folder>
    <Folder name="Ruta">{ruta()}</Folder>
    <Folder name="Largo">{largo()}</Folder>
    <Folder name="Marca">
      <Composition id="CierreMarca" component={Cierre} width={FORMATO.ancho} height={FORMATO.alto} fps={FORMATO.fps} durationInFrames={90} />
    </Folder>
  </>
);
