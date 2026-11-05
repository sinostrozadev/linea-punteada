import React, { useMemo } from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig, type CalculateMetadataFunction } from 'remotion';
import { z } from 'zod';
import { FORMATO, PALETA, TIPO } from '../../marca/tokens';
import { cargarFuentes } from '../../marca/fuentes';
import { MarcaDeAgua } from '../../marca/MarcaDeAgua';
import { Cierre } from '../../marca/Cierre';
import { ImagenesResueltas } from '../comun/guion';
import { FRAMES_CIERRE, buscarPalabra, estimarTiempos, planificar, type Bloque, type Plan, type Tiempos } from '../comun/plan';
import { Subtitulos } from '../comun/Subtitulos';
import { Cabecera } from '../comun/Cabecera';
import { Rotulo, type EstiloRotulo } from '../comun/Rotulo';
import { TarjetaImagen } from '../comun/TarjetaImagen';
import { Remate, mitadesRemate } from '../comun/Remate';
import { ZONA } from '../comun/disposicion';
import { CamposFrontera, FondoResuelto } from './guion';
import { Mapa } from './Mapa';

/** Props de la composición: el guion + lo que agrega preparar-frontera. */
export const PropsFrontera = CamposFrontera.extend({
  duracionFrames: z.number().optional(),
  tiempos: z.any().optional(),
  /** Fotos de Commons por índice de línea (0 = gancho). */
  imagenes: ImagenesResueltas.optional(),
  /** Recorte satelital descargado (si falta o falló, el mapa usa vectores oscuros). */
  fondoMapa: FondoResuelto.optional(),
  /** Atribución para la descripción (no se usa en el render). */
  creditos: z.string().optional(),
});
export type PropsFrontera = z.infer<typeof PropsFrontera>;

const FPS = FORMATO.fps;

export const calcularMetadataFrontera: CalculateMetadataFunction<PropsFrontera> = async ({ props }) => {
  let tiempos: Tiempos | undefined = props.tiempos;
  if (!tiempos) {
    try {
      const res = await fetch(staticFile(`voz/${props.id}/tiempos.json`));
      if (!res.ok) throw new Error(String(res.status));
      tiempos = (await res.json()) as Tiempos;
    } catch {
      tiempos = estimarTiempos(props);
    }
  }
  const plan = planificar(props, tiempos, FPS);
  return { durationInFrames: plan.duracionFrames, props: { ...props, tiempos, duracionFrames: plan.duracionFrames } };
};

const estiloDe = (tipo: string): EstiloRotulo => (tipo === 'mito' ? 'mito' : tipo === 'giro' ? 'giro' : 'clave');

/** Una escena: subtítulos, rótulo (en la palabra `dice`) y tarjeta de imagen opcional. */
const Escena: React.FC<{ bloque: Bloque; props: PropsFrontera }> = ({ bloque, props }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const escena = props.escenas[bloque.indice - 1];
  const imagen = props.imagenes?.[String(bloque.indice)];
  const rotuloDesde = bloque.rotuloEn === null ? null : Math.round(bloque.rotuloEn * fps);
  // Mito: el rótulo se tacha cuando la voz dice "verdad" ("La verdad es más rara.").
  const iVerdad = escena.tipo === 'mito' ? buscarPalabra(bloque.linea.palabras, 'verdad') : -1;
  const tacharEn = iVerdad >= 0 && rotuloDesde !== null ? Math.round(bloque.linea.palabras[iVerdad].inicio * fps) - rotuloDesde : undefined;
  return (
    <AbsoluteFill>
      {imagen && <TarjetaImagen imagen={imagen} frame={frame} frames={bloque.frames} variante={bloque.indice} />}
      {escena.rotulo && rotuloDesde !== null && (
        <Rotulo texto={escena.rotulo.texto} frame={frame - rotuloDesde} frames={bloque.frames - rotuloDesde} estilo={estiloDe(escena.tipo)}
          centroY={imagen ? ZONA.rotulo.centroYConImagen : ZONA.rotulo.centroY} tacharEn={tacharEn} />
      )}
      <Subtitulos linea={bloque.linea} frameLocal={frame} resaltar={bloque.palabraRotulo >= 0 ? [bloque.palabraRotulo] : []} />
    </AbsoluteFill>
  );
};

const Gancho: React.FC<{ bloque: Bloque; props: PropsFrontera }> = ({ bloque, props }) => {
  const frame = useCurrentFrame();
  const imagen = props.imagenes?.['0'];
  return (
    <AbsoluteFill>
      {imagen && <TarjetaImagen imagen={imagen} frame={frame} frames={bloque.frames} variante={0} />}
      <Rotulo texto={props.gancho.rotulo} frame={frame} frames={bloque.frames} inmediato centroY={imagen ? ZONA.rotulo.centroYConImagen : ZONA.rotulo.centroY} />
      <Subtitulos linea={bloque.linea} frameLocal={frame} />
    </AbsoluteFill>
  );
};

const BloqueRemate: React.FC<{ bloque: Bloque; texto: string }> = ({ bloque, texto }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // La segunda mitad entra cuando la voz llega a su primera palabra.
  const [a] = mitadesRemate(texto);
  const nA = a.split(/\s+/).filter(Boolean).length;
  const p = bloque.linea.palabras[nA];
  const segundaEn = p ? Math.round(p.inicio * fps) : Math.round(bloque.frames * 0.45);
  return <Remate texto={texto} frame={frame} segundaEn={segundaEn} />;
};

export const Frontera: React.FC<PropsFrontera> = (props) => {
  cargarFuentes();
  const frame = useCurrentFrame();
  const tiempos: Tiempos = props.tiempos ?? estimarTiempos(props);
  const plan: Plan = useMemo(() => planificar(props, tiempos, FPS), [props, tiempos]);
  const hayVoz = !!props.tiempos;
  return (
    <AbsoluteFill style={{ background: PALETA.fondo }}>
      <Mapa mapa={props.mapa} fondo={props.fondoMapa} plan={plan} frame={frame} />
      {hayVoz && <Audio src={staticFile(`audio/generado/${props.id}.wav`)} volume={1} />}
      {hayVoz && tiempos.lineas.map((l) => (
        <Sequence key={l.indice} from={Math.round(l.inicio * FPS)} durationInFrames={Math.ceil(l.duracionAudio * FPS) + 2}>
          <Audio src={staticFile(l.archivo)} volume={1} />
        </Sequence>
      ))}
      {props.fondoMapa && (
        <div style={{
          position: 'absolute', left: FORMATO.seguro.lados, bottom: ZONA.creditoMapa.bottom, fontFamily: TIPO.texto, fontWeight: 500,
          fontSize: 19, color: PALETA.tintaSuave, opacity: 0.8, textShadow: '0 1px 4px rgba(0,0,0,0.9)',
        }}>{props.fondoMapa.credito}</div>
      )}
      <Cabecera texto={props.cabecera} />
      <Sequence from={plan.gancho.desde} durationInFrames={plan.gancho.frames}>
        <Gancho bloque={plan.gancho} props={props} />
      </Sequence>
      {plan.escenas.map((b) => (
        <Sequence key={b.indice} from={b.desde} durationInFrames={b.frames}>
          <Escena bloque={b} props={props} />
        </Sequence>
      ))}
      <Sequence from={plan.remate.desde} durationInFrames={plan.remate.frames + FRAMES_CIERRE}>
        <BloqueRemate bloque={plan.remate} texto={props.remate} />
      </Sequence>
      <MarcaDeAgua />
      <Sequence from={plan.cierreDesde} durationInFrames={FRAMES_CIERRE}>
        <Cierre />
      </Sequence>
    </AbsoluteFill>
  );
};
