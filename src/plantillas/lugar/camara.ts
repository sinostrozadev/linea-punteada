/**
 * Geometría y línea de tiempo de `lugar` (módulo puro: lo usan la composición y preparar-lugar).
 * - El mapa inset es un círculo de DIAMETRO_INSET px; el mapa a pantalla completa usa el MISMO encuadre
 *   geográfico (zoom + OFFSET_COMPLETO), así el corte foto ↔ mapa no cambia de escala.
 * - A pantalla completa el punto va abajo del centro (PUNTO_Y_COMPLETO), para que el rótulo no lo tape.
 * - Zoom tipo mapa web: escala d3 = 256·2^z / 2π (igual que frontera).
 */
import { geoEquirectangular, geoMercator, type GeoProjection } from 'd3-geo';
import { escalaDeZoom, gradosPorPx } from '../frontera/mapa';
import type { Plan } from '../comun/plan';
import type { EscenaLugar, MapaLugar, ModoKenBurns } from './guion';

export type LonLat = [number, number];

export const DIAMETRO_INSET = 500;
/** Borde superior del inset (deja el rótulo arriba y el crédito debajo, dentro de la zona segura). */
export const INSET_TOP = 1030;
export const OFFSET_COMPLETO = Math.log2(1080 / DIAMETRO_INSET);
/** Fracción del alto donde queda el punto en el mapa a pantalla completa. */
export const PUNTO_Y_COMPLETO = 0.68;
/** Frames de fundido entre fotos y entre foto y mapa. */
export const SOLAPE = 14;

/** Zoom del inset en un frame: lineal de zoomInicial a zoomFinal durante todo el video. */
export const zoomInsetEn = (mapa: Pick<MapaLugar, 'zoomInicial' | 'zoomFinal'>, frame: number, total: number) =>
  mapa.zoomInicial + (mapa.zoomFinal - mapa.zoomInicial) * Math.min(1, Math.max(0, frame / Math.max(1, total)));

/** Equirectangular con raster (el recorte EPSG:4326 encaja exacto), Mercator con vectores solos. */
export const proyeccionLugar = (punto: LonLat, zoom: number, ancho: number, alto: number, fy: number, hayRaster: boolean): GeoProjection =>
  (hayRaster ? geoEquirectangular() : geoMercator())
    .scale(escalaDeZoom(zoom)).center(punto).translate([ancho / 2, alto * fy])
    .clipExtent([[-80, -80], [ancho + 80, alto + 80]]);

/**
 * Zooms (de pantalla completa) para los que preparar-lugar pide un recorte: desde el zoom del inset al empezar
 * hasta el de pantalla completa al terminar, cada 1,5 niveles. Cada recorte cubre la pantalla completa a su zoom.
 */
export const nivelesRaster = (mapa: Pick<MapaLugar, 'zoomInicial' | 'zoomFinal'>): number[] => {
  const a = Math.min(mapa.zoomInicial, mapa.zoomFinal);
  const b = Math.max(mapa.zoomInicial, mapa.zoomFinal) + OFFSET_COMPLETO;
  const niveles: number[] = [];
  for (let z = a; z < b - 0.4; z += 1.5) niveles.push(Math.round(z * 100) / 100);
  niveles.push(Math.round(b * 100) / 100);
  return niveles;
};

/**
 * Centro "falso" para pedir el recorte de un nivel (acotado a ±59°: sobre 60° scripts/mapas.mts no pide raster): cajaVisible centra la caja en el centro de la
 * pantalla, y en `lugar` el punto va abajo; se corre la caja al norte lo que el punto baja.
 */
export const centroParaRecorte = (punto: LonLat, zoom: number, alto: number): LonLat =>
  [punto[0], Math.max(-59, Math.min(59, punto[1] + (PUNTO_Y_COMPLETO - 0.5) * alto * gradosPorPx(zoom)))];

export type Vista = 'foto' | 'mapa';

/** Vista efectiva de cada bloque del plan (0 = gancho, 1..n = escenas, n+1 = remate). */
export const vistasDelPlan = (plan: Plan, escenas: EscenaLugar[], hayPrincipal: boolean, conFotoPropia: (indice: number) => boolean): Vista[] =>
  plan.bloques.map((b) => {
    if (b.tipo === 'remate') return 'mapa';
    if (b.tipo === 'gancho') return hayPrincipal ? 'foto' : 'mapa';
    const pedida = escenas[b.indice - 1]?.vista ?? 'foto';
    if (pedida === 'mapa') return 'mapa';
    return hayPrincipal || conFotoPropia(b.indice) ? 'foto' : 'mapa';
  });

const ALTERNANCIA: ModoKenBurns[] = ['acercar', 'izquierda', 'alejar', 'derecha'];

/** Ken Burns de cada bloque: el pedido por la escena o la alternancia por orden de foto (gancho: acercar). */
export const kenBurnsDelPlan = (plan: Plan, escenas: EscenaLugar[], vistas: Vista[]): ModoKenBurns[] => {
  let k = 0;
  return plan.bloques.map((b, i) => {
    if (vistas[i] !== 'foto') return 'acercar';
    if (b.tipo === 'gancho') { k = 1; return 'acercar'; }
    const pedido = escenas[b.indice - 1]?.kenBurns;
    const modo = pedido ?? ALTERNANCIA[k % ALTERNANCIA.length];
    k++;
    return modo;
  });
};

/** Índice del bloque que contiene el frame. */
export const bloqueEn = (plan: Plan, frame: number) => {
  let k = 0;
  for (let i = 0; i < plan.bloques.length; i++) if (plan.bloques[i].desde <= frame) k = i;
  return k;
};

/** Opacidad del mapa inset (0–1): entra con la primera foto tras un mapa y se va al pasar a mapa completo. */
export const alfaInset = (plan: Plan, vistas: Vista[], frame: number) => {
  const i = bloqueEn(plan, frame);
  const f = frame - plan.bloques[i].desde;
  const previa = i > 0 ? vistas[i - 1] : 'mapa';
  if (vistas[i] === 'foto') return i === 0 || previa === 'foto' ? 1 : Math.min(1, f / SOLAPE);
  return previa === 'foto' ? Math.max(0, 1 - f / SOLAPE) : 0;
};

/** ¿La foto tapa por completo el mapa de fondo en este frame? (para no dibujar el mapa grande en vano). */
export const fotoTapaMapa = (plan: Plan, vistas: Vista[], frame: number) => {
  const i = bloqueEn(plan, frame);
  return vistas[i] === 'foto' && (i === 0 || vistas[i - 1] === 'foto' || frame - plan.bloques[i].desde >= SOLAPE);
};

/** Deriva mínima del mapa grande cuando el encuadre de los marcadores lo frena (nada queda quieto). */
const DERIVA_COMPLETO = 0.25;

/**
 * Zoom del mapa a pantalla completa: el del inset + OFFSET_COMPLETO, pero sin pasarse del zoom que deja ver los
 * marcadores ya aparecidos (cada uno entra con un fundido de 1,6 s alrededor de su aparición) + una deriva lenta.
 * Así, cuando la voz nombra "Acapulco", el mapa no se lo deja fuera del cuadro.
 */
export const zoomCompletoEn = (mapa: MapaLugar, frame: number, total: number, fps: number, apariciones: number[], alto: number) => {
  const natural = zoomInsetEn(mapa, frame, total) + OFFSET_COMPLETO;
  const t = frame / fps;
  const yPunto = alto * PUNTO_Y_COMPLETO;
  let z = natural;
  (mapa.marcadores ?? []).forEach((m, i) => {
    const w = Math.min(1, Math.max(0, (t - apariciones[i] + 1) / 1.6));
    if (w <= 0) return;
    const dx = Math.abs(m.lon - mapa.punto[0]);
    const dy = m.lat - mapa.punto[1];
    // px por grado = 256·2^z/360 → z = log2(límite·360 / (256·grados)). Límites: 400 px a los lados, hasta la caja
    // de subtítulos arriba (y ≈ 600) y hasta la zona segura abajo.
    const limites = [dx > 1e-6 ? Math.log2((400 * 360) / (256 * dx)) : 99,
      dy > 1e-6 ? Math.log2(((yPunto - 600) * 360) / (256 * dy)) : dy < -1e-6 ? Math.log2(((alto - 400 - yPunto) * 360) / (256 * -dy)) : 99];
    const cap = Math.min(...limites);
    z -= Math.max(0, z - cap) * w;
  });
  return z + DERIVA_COMPLETO * Math.min(1, Math.max(0, frame / Math.max(1, total)));
};
