import React, { useMemo } from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, type CalculateMetadataFunction } from 'remotion';
import { z } from 'zod';
import { ACENTOS, FORMATO, MAPA, PALETA, TIPO } from '../../marca/tokens';
import { cargarFuentes } from '../../marca/fuentes';
import { ImagenesResueltas } from '../comun/guion';
import { estimarTiempos, planificar, type Plan, type Tiempos } from '../comun/plan';
import { SubtitulosBloque } from '../comun/SubtitulosBloque';
import { ALTO_INDICE, ARRIBA_TARJETA, CierreLinea, EtiquetaContexto, FotoCompleta, IndiceEnumeracion, PolaroidMapa, TarjetaCifra, TarjetaFuente } from '../comun/Superposiciones';
import { CamposFrontera, FondoCapa, FondoResuelto, type GeoRecortado } from './guion';
import { Mapa, type Fondo } from './Mapa';
import { TarjetaTitulo } from './TarjetaTitulo';
import { proyeccion } from './mapa';
import { FRAMES_CIERRE_V2, T_TITULO, camaraEn, fotoEn, resolverVisual, type Visual } from './visual';

/** Props de la composición: el guion + lo que agrega preparar-frontera. */
export const PropsFrontera = CamposFrontera.extend({
  duracionFrames: z.number().optional(),
  tiempos: z.any().optional(),
  /** v1: fotos de Commons por línea (`imagen` de escena; en v2 se muestran como polaroid). */
  imagenes: ImagenesResueltas.optional(),
  /** v2: foto a pantalla completa y polaroid por línea de voz (0 = gancho). */
  fotos: ImagenesResueltas.optional(),
  polaroids: ImagenesResueltas.optional(),
  /** v1: un solo recorte satelital. */
  fondoMapa: FondoResuelto.optional(),
  /** v2: varias capas (relieve regional + Sentinel-2 en los planos cercanos). */
  fondos: z.array(FondoCapa).optional(),
  /** v2: Natural Earth 1:10 M recortado (z.any: no se valida campo a campo por tamaño). */
  geo: z.any().optional(),
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
  const plan = planificar(props, tiempos, FPS, FRAMES_CIERRE_V2);
  return { durationInFrames: plan.duracionFrames, props: { ...props, tiempos, duracionFrames: plan.duracionFrames } };
};

/** Bloque de voz vigente en el frame (para los subtítulos). */
const bloqueEn = (plan: Plan, frame: number) => {
  let k = 0;
  for (let i = 0; i < plan.bloques.length; i++) if (plan.bloques[i].desde <= frame) k = i;
  return plan.bloques[k];
};

export const Frontera: React.FC<PropsFrontera> = (props) => {
  cargarFuentes();
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const tiempos: Tiempos = props.tiempos ?? estimarTiempos(props);
  const plan: Plan = useMemo(() => planificar(props, tiempos, FPS, FRAMES_CIERRE_V2), [props, tiempos]);
  const vis: Visual = useMemo(() => resolverVisual(props, plan), [props, plan]);
  const acento = ACENTOS[props.acento ?? 'amarillo'];
  const fondos: Fondo[] = props.fondos?.length ? props.fondos : props.fondoMapa ? [props.fondoMapa] : [];
  const geo = props.geo as GeoRecortado | undefined;
  const hayVoz = !!props.tiempos;
  const cam = camaraEn(vis.planos, t);
  const W = FORMATO.ancho, H = FORMATO.alto;

  // Tarjeta de título (frame 0): por defecto la cámara del primer plano, 1,6 niveles más lejos.
  const tt = props.tarjetaTitulo;
  const p0 = vis.planos[0];
  const camTitulo = { centro: tt?.centro ?? p0.centro, zoom: tt?.zoom ?? p0.zoom - 1.6 };

  const foto = fotoEn(vis, t);
  const tarjetaActiva = vis.tarjetas.find((x) => t >= x.desde && t < x.hasta);
  const b = bloqueEn(plan, frame);
  const enTitulo = t < T_TITULO;
  const enCierre = frame >= plan.cierreDesde;

  // Índice: ítem activo durante los actos; ancla vertical proyectada si se pidió.
  const ind = vis.indice;
  const activo = ind?.activo.find((a) => t >= a.desde && t < a.hasta)?.item ?? null;
  let ancla: [number, number] | null = null;
  if (ind?.posicion === 'vertical-mapa' && ind.ancla) {
    const pr = proyeccion(fondos.length ? 'equirectangular' : 'mercator', cam, W, H).clipExtent(null);
    ancla = (pr(ind.ancla) as [number, number]) ?? null;
  }

  // Con el índice en fila arriba, tarjeta, contexto y polaroid bajan para no pisarlo.
  const indiceArriba = !!ind && ind.posicion === 'fila' && t >= (ind.items[0]?.desde ?? Infinity) && t < ind.hasta;
  const bajar = indiceArriba ? ALTO_INDICE : 0;

  return (
    <AbsoluteFill style={{ background: MAPA.oceano }}>
      <Mapa mapa={props.mapa} fondos={fondos} geo={geo} vis={vis} t={t} cam={cam} acento={acento} ancho={W} alto={H} />
      {hayVoz && <Audio src={staticFile(`audio/generado/${props.id}.wav`)} volume={1} />}
      {hayVoz && tiempos.lineas.map((l) => (
        <Sequence key={l.indice} from={Math.round(l.inicio * FPS)} durationInFrames={Math.ceil(l.duracionAudio * FPS) + 2}>
          <Audio src={staticFile(l.archivo)} volume={1} />
        </Sequence>
      ))}

      {/* Sobre el mapa: polaroids, tarjetas, contexto, índice, fuente. */}
      {vis.polaroids.map((p) => {
        const img = p.d.v1 ? props.imagenes?.[String(p.k)] : props.polaroids?.[String(p.k)];
        return img ? <PolaroidMapa key={p.id} imagen={img} pie={p.d.pie} anio={p.d.anio} forma={p.d.forma} lado={p.d.lado} t={t} desde={p.desde} hasta={p.hasta} acento={acento} bajar={bajar} /> : null;
      })}
      {!foto && vis.tarjetas.map((x) => <TarjetaCifra key={x.id} tarjeta={x.d} t={t} desde={x.desde} hasta={x.hasta} acento={acento} top={ARRIBA_TARJETA + bajar} />)}
      {!foto && vis.contextos.map((c) => <EtiquetaContexto key={c.id} texto={c.d.texto} t={t} desde={c.desde} hasta={c.hasta} acento={acento} top={(tarjetaActiva ? 640 : 330) + bajar} />)}
      {!foto && ind && <IndiceEnumeracion items={ind.items} activo={activo} t={t} hasta={ind.hasta} acento={acento} ancla={ancla} />}
      {vis.fotos.map((f) => {
        const img = props.fotos?.[String(f.k)];
        return img ? <FotoCompleta key={f.id} imagen={img} pie={f.d.pie} t={t} desde={f.desde} hasta={f.hasta} variante={f.k} /> : null;
      })}
      {vis.fuentes.map((f) => <TarjetaFuente key={f.id} texto={f.d.texto} t={t} desde={f.desde} hasta={f.hasta} acento={acento} />)}

      {!enTitulo && !enCierre && (
        <SubtitulosBloque linea={b.linea} frameLocal={frame - b.desde} claves={vis.claves[b.indice]} acento={acento} />
      )}
      {fondos.length > 0 && !enTitulo && (
        <div style={{ position: 'absolute', right: 30, bottom: FORMATO.seguro.abajo - 30, fontFamily: TIPO.texto, fontWeight: 500, fontSize: 15, color: PALETA.tintaSuave, opacity: 0.55, textShadow: '0 1px 3px #000' }}>
          {creditoVisible(fondos, cam.zoom)}
        </div>
      )}
      {enTitulo && (
        <TarjetaTitulo texto={tt?.texto ?? props.gancho.rotulo} clave={tt?.clave} cam={camTitulo} t={t} mapa={props.mapa} fondos={fondos} geo={geo} vis={vis}
          acento={acento} paises={tt?.paises ?? props.mapa.paises} pines={tt?.pines} icono={tt?.icono} />
      )}
      <Sequence from={plan.cierreDesde} durationInFrames={FRAMES_CIERRE_V2}>
        <CierreLinea frame={frame - plan.cierreDesde} acento={acento} />
      </Sequence>
    </AbsoluteFill>
  );
};

/** Crédito corto de la capa que domina el cuadro (el completo va en la descripción). */
const creditoVisible = (fondos: Fondo[], zoom: number) => {
  const f = [...fondos].reverse().find((x) => x.zoom === undefined || zoom >= x.zoom - 0.6) ?? fondos[0];
  return /s2cloudless/.test(f.capa) ? 'Sentinel-2 cloudless 2016 · EOX · CC BY 4.0' : /Landsat/.test(f.capa) ? 'NASA · Landsat WELD' : 'NASA Blue Marble';
};
