/**
 * Capas v2 de PANTALLA (no pegadas al mapa) para `lugar` y `ruta`, armadas con los componentes de
 * comun/Superposiciones y comun/SubtitulosBloque exactamente como las arma frontera/Frontera.tsx: polaroids,
 * tarjeta de cifra, contexto, índice de enumeración, foto a pantalla completa, fuente, subtítulos en bloques y el
 * cierre de 0,8 s con línea punteada. Candidato a comun/ (frontera repite este bloque dentro de su composición).
 */
import React from 'react';
import { Sequence } from 'remotion';
import { FORMATO } from '../../../marca/tokens';
import type { ImagenesResueltas } from '../../comun/guion';
import type { Plan } from '../../comun/plan';
import { SubtitulosBloque } from '../../comun/SubtitulosBloque';
import type { Caja } from '../../comun/colisiones';
import { ALTO_INDICE, ARRIBA_INDICE, ARRIBA_TARJETA, CierreLinea, EtiquetaContexto, FotoCompleta, IndiceEnumeracion, PolaroidMapa, TarjetaCifra, TarjetaFuente, altoTarjeta } from '../../comun/Superposiciones';
import { FRAMES_CIERRE_V2, T_TITULO, fotoEn, type Visual } from '../../frontera/visual';

const bloqueEn = (plan: Plan, frame: number) => {
  let k = 0;
  for (let i = 0; i < plan.bloques.length; i++) if (plan.bloques[i].desde <= frame) k = i;
  return plan.bloques[k];
};

type Props = {
  vis: Visual;
  plan: Plan;
  frame: number;
  fps: number;
  acento: string;
  /** v2 `foto` y `polaroid` por línea de voz (0 = gancho); `imagenes` = `imagen` v1 mostrada como polaroid (solo ruta). */
  fotos?: ImagenesResueltas;
  polaroids?: ImagenesResueltas;
  imagenes?: ImagenesResueltas;
  /** Ancla en px del índice vertical (si `indicePosicion: vertical-mapa`). */
  anclaIndice?: [number, number] | null;
};

/**
 * Cajas de pantalla que ocupan las capas de encima en `t` (mismo cálculo que frontera/Frontera.tsx): las etiquetas
 * del mapa (CapasMapa) las esquivan. `credito` = caja del crédito del satélite, si se ve.
 */
export const reservasPantalla = (vis: Visual, t: number, ancho: number, credito?: Caja | null): Caja[] => {
  const W = ancho;
  const foto = fotoEn(vis, t);
  const ind = vis.indice;
  const indiceArriba = !!ind && ind.posicion === 'fila' && t >= (ind.items[0]?.desde ?? Infinity) && t < ind.hasta;
  const bajar = indiceArriba ? ALTO_INDICE : 0;
  const tarjetaActiva = vis.tarjetas.find((x) => t >= x.desde && t < x.hasta);
  const topTarjeta = ARRIBA_TARJETA + bajar;
  const topContexto = tarjetaActiva ? 640 + bajar : 330 + bajar;
  const contextoActivo = vis.contextos.find((c) => t >= c.desde && t < c.hasta);
  const fuenteActiva = vis.fuentes.find((f) => t >= f.desde && t < f.hasta);
  const r: Caja[] = [];
  if (indiceArriba && ind && !foto) r.push({ x0: FORMATO.seguro.lados - 10, y0: ARRIBA_INDICE, x1: FORMATO.seguro.lados - 10 + ind.items.length * 264, y1: ARRIBA_INDICE + ALTO_INDICE - 10 });
  if (tarjetaActiva && !foto) r.push({ x0: 90, y0: topTarjeta, x1: W - 90, y1: topTarjeta + altoTarjeta(tarjetaActiva.d) });
  if (contextoActivo && !foto) r.push({ x0: 60, y0: topContexto, x1: W - 60, y1: topContexto + 118 });
  for (const pol of vis.polaroids) {
    if (t < pol.desde || t >= pol.hasta || foto) continue;
    const top = (pol.d.anio ? 380 : 470) + bajar, der = (pol.d.lado ?? 'derecha') === 'derecha';
    r.push({ x0: der ? W - 66 - 500 : 40, y0: top, x1: der ? W - 40 : 66 + 500, y1: top + (pol.d.anio ? 140 : 0) + 560 });
  }
  if (fuenteActiva) r.push({ x0: FORMATO.seguro.lados, y0: 1372, x1: FORMATO.seguro.lados + 920, y1: 1372 + 84 });
  if (credito) r.push(credito);
  return r;
};

export const CapasPantalla: React.FC<Props> = ({ vis, plan, frame, fps, acento, fotos, polaroids, imagenes, anclaIndice }) => {
  const t = frame / fps;
  const foto = fotoEn(vis, t);
  const tarjetaActiva = vis.tarjetas.find((x) => t >= x.desde && t < x.hasta);
  const b = bloqueEn(plan, frame);
  const enTitulo = t < T_TITULO;
  const enCierre = frame >= plan.cierreDesde;
  const ind = vis.indice;
  const activo = ind?.activo.find((a) => t >= a.desde && t < a.hasta)?.item ?? null;
  const indiceArriba = !!ind && ind.posicion === 'fila' && t >= (ind.items[0]?.desde ?? Infinity) && t < ind.hasta;
  const bajar = indiceArriba ? ALTO_INDICE : 0;
  return (
    <>
      {vis.polaroids.map((p) => {
        const img = p.d.v1 ? imagenes?.[String(p.k)] : polaroids?.[String(p.k)];
        return img ? <PolaroidMapa key={p.id} imagen={img} pie={p.d.pie} anio={p.d.anio} forma={p.d.forma} lado={p.d.lado} t={t} desde={p.desde} hasta={p.hasta} acento={acento} bajar={bajar} /> : null;
      })}
      {!foto && vis.tarjetas.map((x) => <TarjetaCifra key={x.id} tarjeta={x.d} t={t} desde={x.desde} hasta={x.hasta} acento={acento} top={ARRIBA_TARJETA + bajar} />)}
      {!foto && vis.contextos.map((c) => <EtiquetaContexto key={c.id} texto={c.d.texto} t={t} desde={c.desde} hasta={c.hasta} acento={acento} top={(tarjetaActiva ? 640 : 330) + bajar} />)}
      {!foto && ind && <IndiceEnumeracion items={ind.items} activo={activo} t={t} hasta={ind.hasta} acento={acento} ancla={ind.posicion === 'vertical-mapa' ? anclaIndice ?? null : null} />}
      {vis.fotos.map((f) => {
        const img = fotos?.[String(f.k)];
        return img ? <FotoCompleta key={f.id} imagen={img} pie={f.d.pie} t={t} desde={f.desde} hasta={f.hasta} variante={f.k} /> : null;
      })}
      {vis.fuentes.map((f) => <TarjetaFuente key={f.id} texto={f.d.texto} t={t} desde={f.desde} hasta={f.hasta} acento={acento} />)}
      {!enTitulo && !enCierre && <SubtitulosBloque linea={b.linea} frameLocal={frame - b.desde} claves={vis.claves[b.indice]} acento={acento} />}
    </>
  );
};

/** Cierre de 0,8 s (línea punteada + handle): lo único de marca en el video. */
export const CierreV2: React.FC<{ plan: Plan; frame: number; acento: string }> = ({ plan, frame, acento }) => (
  <Sequence from={plan.cierreDesde} durationInFrames={FRAMES_CIERRE_V2}>
    <CierreLinea frame={frame - plan.cierreDesde} acento={acento} />
  </Sequence>
);
