import React from 'react';
import { Folder } from 'remotion';
// Raíz de PRUEBA de la plantilla `ruta` (mientras no esté cableada en src/Root.tsx):
//   npx remotion render src/index.ruta.ts Ruta salida/pruebas/<id>.mp4 --props=salida/trabajo/<id>.props.json
import { registrar as ruta } from './plantillas/ruta';

export const RootRuta: React.FC = () => <Folder name="Ruta">{ruta()}</Folder>;
