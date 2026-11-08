import React, { useMemo } from 'react';
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, type CalculateMetadataFunction } from 'remotion';
import { z } from 'zod';
import { geoDistance } from 'd3-geo';
import { ACENTOS, PALETA, TIPO } from '../../marca/tokens';
import { cargarFuentes } from '../../marca/fuentes';
import { ImagenesResueltas } from '../comun/guion';
import type { Tiempos } from '../comun/plan';
import type { Caja } from '../comun/colisiones';
import { ARRIBA_TARJETA, EtiquetaContexto, FotoCompleta, IndiceEnumeracion, PolaroidMapa, TarjetaCifra, TarjetaFuente, altoTarjeta } from '../comun/Superposiciones';
import { FondoCapa, FondoResuelto } from '../frontera/guion';
import { fotoEn } from '../frontera/visual';
import { CapasMapa } from '../lugar/compartido/CapasMapa';
import { MapaRuta } from '../ruta/MapaRuta';
import { ALTO_CONTADOR, Contador, TOP_CONTADOR } from '../ruta/Contador';
import { camaraAsentadaV2, camaraV2, proyeccionDe } from '../ruta/camara';
import { cabezaEn, type Trazado } from '../ruta/trazado';
import { CamposLargo, type GuionLargo } from './guion';
import { LARGO, TITULO_SEG, capitulosEn, modeloLargo, planLargo, tiemposEstimadosLargo, trazadoLargo } from './modelo';
import { BarraCapitulo, Cierre16x9, CreditoFoto, Mover, Subtitulos16x9, TarjetaCapitulo, TarjetaTituloLargo } from './Capas16x9';

/** Props de la composición: el guion + lo que agrega scripts/preparar-largo.mts. */
export const PropsLargo = CamposLargo.extend({
  duracionFrames: z.number().optional(),
  /** Tiempos con las pausas de título y capítulos ya insertadas (ajustarTiempos). */
  tiempos: z.any().optional(),
  trazado: z.any().optional(),
  fotos: ImagenesResueltas.optional(),
  polaroids: ImagenesResueltas.optional(),
  fondoMapa: FondoResuelto.optional(),
  texturasGlobo: z.array(FondoCapa).optional(),
  creditos: z.string().optional(),
});
export type PropsLargo = z.infer<typeof PropsLargo>;

export const calcularMetadataLargo: CalculateMetadataFunction<PropsLargo> = async ({ props }) => {
  const tiempos: Tiempos = props.tiempos ?? tiemposEstimadosLargo(props as GuionLargo);
  const plan = planLargo(props as GuionLargo, tiempos);
  return { durationInFrames: plan.duracionFrames, props: { ...props, tiempos, duracionFrames: plan.duracionFrames } };
};

const bloqueEn = (bloques: { desde: number }[], frame: number) => {
  let k = 0;
  for (let i = 0; i < bloques.length; i++) if (bloques[i].desde <= frame) k = i;
  return k;
};

/** Contador (km + tiempo) arriba a la derecha. */
const DX_CONTADOR = LARGO.ancho - 60 - 560, DY_CONTADOR = 30 - TOP_CONTADOR;
/** Fuente en pantalla: arriba a la izquierda, bajo la barra de capítulo. */
const DY_FUENTE = 112 - 1372;

export const Largo: React.FC<PropsLargo> = (props) => {
  cargarFuentes();
  const g = props as GuionLargo;
  const frame = useCurrentFrame();
  const fps = LARGO.fps;
  const t = frame / fps;
  const W = LARGO.ancho, H = LARGO.alto;
  const tiempos: Tiempos = props.tiempos ?? tiemposEstimadosLargo(g);
  const plan = useMemo(() => planLargo(g, tiempos), [g, tiempos]);
  const tr: Trazado = useMemo(() => (props.trazado as Trazado | undefined) ?? trazadoLargo(g), [props.trazado, g]);
  const m = useMemo(() => modeloLargo(g, plan, tr), [g, plan, tr]);
  const caps = useMemo(() => capitulosEn(g, plan), [g, plan]);
  const { vis } = m;
  // En el cierre las capas del mapa (etiquetas del remate…) se funden en 0,5 s: no se cruzan con el nombre de la serie.
  const acento = ACENTOS[props.acento ?? 'amarillo'];
  const fin = plan.cierreDesde / fps;
  const finVideo = plan.duracionFrames / fps;
  const finApertura = caps[1].desde;

  // 16:9: el globo de los planos abiertos llena ~90 % del alto (radio ≥ 0,45·1080); en el cierre crece y se va a la mitad derecha.
  const globo = props.mapa.proyeccion === 'globo';
  const enCierre = interpolate(t, [fin, fin + 1.6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (x) => 1 - Math.pow(1 - x, 3) });
  const kPiso = LARGO.alto * (0.45 + 0.03 * enCierre);
  const conPiso = <C extends { k: number; y: number }>(c: C): C => (globo ? { ...c, k: Math.max(c.k, kPiso), y: c.y + (LARGO.alto / 2 - c.y) * enCierre } : c);
  const cam = conPiso(camaraV2(m.v2, t));
  const corrimientoCierre = 430 * enCierre;
  const cabeza = cabezaEn(tr, m.rec, t);
  const finGancho = m.ctx.finGancho;
  const fantasma = interpolate(t, [finGancho - 0.3, finGancho + 1.2], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const verContador = (props.mapa.mostrarContador ?? true) && t < fin ? interpolate(t, [finGancho, finGancho + 0.6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 0;
  const hayVoz = !!props.tiempos && !!props.duracionFrames && !!props.trazado;
  const texturas = props.mapa.proyeccion === 'globo' ? props.texturasGlobo ?? [] : [];

  // Anticolisión de etiquetas del mapa: cámara asentada + cajas de lo que va encima.
  const camRef = conPiso(camaraAsentadaV2(m.v2, t));
  const proyRef = proyeccionDe(props.mapa, camRef, W);
  const xyRef = (p: [number, number]) =>
    props.mapa.proyeccion === 'globo' && geoDistance(p, camRef.centro) > Math.PI / 2 - 0.1 ? null : ((proyRef(p) as [number, number] | null) ?? null);
  const foto = fotoEn(vis, t);
  const tarjetaActiva = vis.tarjetas.find((x) => t >= x.desde && t < x.hasta);
  const topContexto = tarjetaActiva ? ARRIBA_TARJETA - 140 + altoTarjeta(tarjetaActiva.d) + 20 : 150;
  const reservas: Caja[] = [
    { x0: 0, y0: LARGO.franjaSub[0], x1: W, y1: LARGO.franjaSub[1] },
    { x0: 40, y0: 20, x1: 900, y1: 100 },
    ...(verContador > 0 ? [{ x0: DX_CONTADOR + 40, y0: 20, x1: W - 40, y1: 30 + ALTO_CONTADOR + 10 }] : []),
    ...(tarjetaActiva && !foto ? [{ x0: 300, y0: ARRIBA_TARJETA - 140, x1: W - 300, y1: ARRIBA_TARJETA - 140 + altoTarjeta(tarjetaActiva.d) }] : []),
    ...vis.polaroids.filter((p) => t >= p.desde && t < p.hasta).map((p) => ((p.d.lado ?? 'derecha') === 'derecha' ? { x0: W - 560, y0: 60, x1: W - 40, y1: 800 } : { x0: 40, y0: 60, x1: 560, y1: 800 })),
  ];

  const k = bloqueEn(plan.bloques, frame);
  const b = plan.bloques[k];
  const enCarton = (t >= finApertura && t < finApertura + TITULO_SEG) || caps.some((c) => c.n >= 2 && t >= c.desde && t < c.voz);
  const ind = vis.indice;
  const activo = ind?.activo.find((a) => t >= a.desde && t < a.hasta)?.item ?? null;

  return (
    <AbsoluteFill style={{ background: PALETA.fondo }}>
      <div style={{ position: 'absolute', inset: 0, transform: `translateX(${corrimientoCierre}px)` }}>
      <MapaRuta mapa={props.mapa} tr={tr} rec={m.rec} cam={cam} cabeza={cabeza} frame={frame} fondo={props.fondoMapa}
        fantasma={fantasma} franjaRotulo={null} texturas={texturas} anchoRef={LARGO.ref} zonaEtiquetas={[120, H - LARGO.abajo - 140]} franjaSub={LARGO.franjaSub}
        v2={{ acento, capas: (xy, camino, pxKm, cajasHitos) => (
          <div style={{ position: 'absolute', inset: 0, opacity: interpolate(t, [fin, fin + 0.5], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
            <CapasMapa vis={vis} t={t} xy={xy} camino={camino} acento={acento} ancho={W} alto={H} pxKm={pxKm} xyRef={xyRef} reservas={reservas} cajasExtra={[...cajasHitos.map((c) => ({ x0: c.x0 - 24, y0: c.y0 - 24, x1: c.x1 + 24, y1: c.y1 + 24 })), ...reservas]} />
          </div>
        ) }} />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 75% at 50% 46%, rgba(0,0,0,0) 55%, rgba(4,12,22,0.5) 100%)' }} />

      {hayVoz && <Audio src={staticFile(`audio/generado/${props.id}.wav`)} volume={1} />}
      {hayVoz && plan.tiempos.lineas.map((l) => (
        <Sequence key={l.indice} from={Math.round(l.inicio * fps)} durationInFrames={Math.ceil(l.duracionAudio * fps) + 2}>
          <Audio src={staticFile(l.archivo)} volume={1} />
        </Sequence>
      ))}

      {(texturas.length > 0 || props.fondoMapa) && t < fin && (
        <div style={{ position: 'absolute', left: LARGO.lados, bottom: LARGO.abajo + 8, fontFamily: TIPO.texto, fontWeight: 500, fontSize: 15, color: PALETA.tintaSuave, opacity: 0.55, textShadow: '0 1px 3px #000' }}>
          {texturas.length ? 'NASA Blue Marble · Natural Earth' : props.fondoMapa?.credito}
        </div>
      )}
      <Mover dx={DX_CONTADOR} dy={DY_CONTADOR}>
        <Contador km={cabeza.km * (props.mapa.kmReales ? props.mapa.kmReales / tr.totalKm : 1)} anio={cabeza.anio} anio0={tr.anioPunto[0]} opacidad={verContador * (enCarton ? 0 : 1)} acento={acento} />
      </Mover>

      {/* Capas v2 de pantalla (las del Short, ubicadas para 16:9). */}
      {vis.polaroids.map((p) => {
        const img = props.polaroids?.[String(p.k)];
        return img ? <PolaroidMapa key={p.id} imagen={img} pie={p.d.pie} anio={p.d.anio} forma={p.d.forma} lado={p.d.lado} t={t} desde={p.desde} hasta={p.hasta} acento={acento} bajar={p.d.anio ? -300 : -360} /> : null;
      })}
      {!foto && vis.tarjetas.map((x) => <TarjetaCifra key={x.id} tarjeta={x.d} t={t} desde={x.desde} hasta={x.hasta} acento={acento} top={ARRIBA_TARJETA - 140} />)}
      {!foto && vis.contextos.map((c) => <EtiquetaContexto key={c.id} texto={c.d.texto} t={t} desde={c.desde} hasta={c.hasta} acento={acento} top={topContexto} />)}
      {!foto && ind && <IndiceEnumeracion items={ind.items} activo={activo} t={t} hasta={ind.hasta} acento={acento} ancla={null} />}
      {vis.fotos.map((f) => {
        const img = props.fotos?.[String(f.k)];
        return img ? (
          <React.Fragment key={f.id}>
            <FotoCompleta imagen={img} pie={f.d.pie} t={t} desde={f.desde} hasta={f.hasta} variante={f.k} />
            <CreditoFoto imagen={img} t={t} desde={f.desde} hasta={f.hasta} />
          </React.Fragment>
        ) : null;
      })}
      <Mover dx={0} dy={DY_FUENTE}>
        {vis.fuentes.map((f) => <TarjetaFuente key={f.id} texto={f.d.texto} t={t} desde={f.desde} hasta={f.hasta} acento={acento} />)}
      </Mover>

      <TarjetaTituloLargo texto={g.tarjetaTitulo.texto} clave={g.tarjetaTitulo.clave} acento={acento} t={t} desde={finApertura} hasta={finApertura + TITULO_SEG} />
      {caps.map((c) => <TarjetaCapitulo key={c.n} cap={c} total={g.capitulos.length} acento={acento} t={t} />)}
      <BarraCapitulo caps={caps} acento={acento} t={t} desde={finApertura + TITULO_SEG} hasta={fin} />
      {!enCarton && t < fin && <Subtitulos16x9 linea={b.linea} frameLocal={frame - b.desde} claves={vis.claves[b.indice] ?? []} acento={acento} />}
      <Cierre16x9 t={t} desde={fin} hasta={finVideo} acento={acento} serie={g.cierre.serie} pie={g.cierre.pie} />
    </AbsoluteFill>
  );
};
