import React, { useMemo } from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, type CalculateMetadataFunction } from 'remotion';
import { z } from 'zod';
import { ACENTOS, FORMATO, MAPA, PALETA, TIPO } from '../../marca/tokens';
import { cargarFuentes } from '../../marca/fuentes';
import { ImagenesResueltas } from '../comun/guion';
import { estimarTiempos, planificar, type Plan, type Tiempos } from '../comun/plan';
import { SubtitulosBloque } from '../comun/SubtitulosBloque';
import { ALTO_INDICE, ARRIBA_INDICE, ARRIBA_TARJETA, CierreLinea, EtiquetaContexto, FotoCompleta, IndiceEnumeracion, PolaroidMapa, TarjetaCifra, TarjetaFuente, altoTarjeta } from '../comun/Superposiciones';
import type { Caja } from './colisiones';
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
  // El contexto va bajo la tarjeta (según su alto real: con pictos o barras es más alta) y nunca bajo el índice.
  const topTarjeta = ARRIBA_TARJETA + bajar;
  const topContexto = tarjetaActiva ? topTarjeta + altoTarjeta(tarjetaActiva.d) + 24 : 330 + bajar;
  const contextoActivo = vis.contextos.find((c) => t >= c.desde && t < c.hasta);
  const fuenteActiva = vis.fuentes.find((f) => t >= f.desde && t < f.hasta);

  // Crédito del satélite: legible (22 px) pero discreto; fuera durante fotos, el remate final y el cierre.
  const remateDesde = vis.remateEtiquetas.length ? vis.remateEtiquetas[0].desde : Infinity;
  const oCredito = fondos.length > 0 && !enTitulo && !foto ? Math.max(0, Math.min(1, (remateDesde - t) / 0.4)) : 0;
  const credito = fondos.length ? creditoVisible(fondos, cam.zoom) : '';
  const ANCHO_CREDITO = credito.length * 11.5 + 20, ARRIBA_CREDITO = H - FORMATO.seguro.abajo + 8;

  // Lo que ocupan las capas de encima: las etiquetas del mapa lo esquivan (frontera/colisiones.ts).
  const reservas: Caja[] = [];
  if (indiceArriba && ind && !foto) reservas.push({ x0: FORMATO.seguro.lados - 10, y0: ARRIBA_INDICE, x1: FORMATO.seguro.lados - 10 + ind.items.length * 264, y1: ARRIBA_INDICE + ALTO_INDICE - 10 });
  if (tarjetaActiva && !foto) reservas.push({ x0: 90, y0: topTarjeta, x1: W - 90, y1: topTarjeta + altoTarjeta(tarjetaActiva.d) });
  if (contextoActivo && !foto) reservas.push({ x0: 60, y0: topContexto, x1: W - 60, y1: topContexto + 118 });
  if (fuenteActiva) reservas.push({ x0: FORMATO.seguro.lados, y0: 1372, x1: FORMATO.seguro.lados + 920, y1: 1372 + 84 });
  if (oCredito > 0) reservas.push({ x0: W - 30 - ANCHO_CREDITO, y0: ARRIBA_CREDITO - 4, x1: W - 20, y1: ARRIBA_CREDITO + 32 });

  return (
    <AbsoluteFill style={{ background: MAPA.oceano }}>
      <Mapa mapa={props.mapa} fondos={fondos} geo={geo} vis={vis} t={t} cam={cam} acento={acento} ancho={W} alto={H} reservas={reservas} />
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
      {!foto && vis.tarjetas.map((x) => <TarjetaCifra key={x.id} tarjeta={x.d} t={t} desde={x.desde} hasta={x.hasta} acento={acento} top={topTarjeta} />)}
      {!foto && vis.contextos.map((c) => <EtiquetaContexto key={c.id} texto={c.d.texto} t={t} desde={c.desde} hasta={c.hasta} acento={acento} top={topContexto} />)}
      {!foto && ind && <IndiceEnumeracion items={ind.items} activo={activo} t={t} hasta={ind.hasta} acento={acento} ancla={ancla} />}
      {vis.fotos.map((f) => {
        const img = props.fotos?.[String(f.k)];
        return img ? <FotoCompleta key={f.id} imagen={img} pie={f.d.pie} t={t} desde={f.desde} hasta={f.hasta} variante={f.k} /> : null;
      })}
      {vis.fuentes.map((f) => <TarjetaFuente key={f.id} texto={f.d.texto} t={t} desde={f.desde} hasta={f.hasta} acento={acento} />)}

      {!enTitulo && !enCierre && (
        <SubtitulosBloque linea={b.linea} frameLocal={frame - b.desde} claves={vis.claves[b.indice]} acento={acento} />
      )}
      {oCredito > 0 && !enCierre && (
        <div style={{ position: 'absolute', right: 30, top: ARRIBA_CREDITO, fontFamily: TIPO.texto, fontWeight: 600, fontSize: 22, letterSpacing: 0.3, color: PALETA.tinta, opacity: 0.62 * oCredito, textShadow: '0 0 3px rgba(0,0,0,0.9), 0 1px 4px #000', whiteSpace: 'nowrap' }}>
          {credito}
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
