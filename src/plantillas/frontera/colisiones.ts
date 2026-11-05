/**
 * Resolución de colisiones de las etiquetas del mapa (módulo puro, determinista). Cada etiqueta es una caja de
 * texto medida (ancho ≈ caracteres · (0,45·fontSize + espaciado): Bebas Neue es angosta; 0,62·fontSize medido en
 * los cuadros sobrestimaba ~40 % y escondía etiquetas que sí cabían); se colocan en orden de
 * prioridad (remate > pin > región/área > país > mar > río > etiqueta de línea; a igual prioridad, la que apareció
 * antes) y la de menor prioridad se empuja a la posición libre más cercana entre 8 candidatas alrededor de su
 * anclaje (luego un segundo anillo más lejos). Si no cabe en ninguna, se oculta. Lo fijo (marcadores de pin, cotas,
 * franja del subtítulo, índice, tarjeta, contexto, crédito) son obstáculos que nunca se mueven.
 *
 * Para que nada salte de un cuadro a otro durante un vuelo de cámara, Mapa.tsx resuelve primero con la cámara
 * ASENTADA del plano vigente y pasa esas decisiones como `preferidas` a la resolución con la cámara real: se
 * mantienen mientras sigan libres, y si en pleno vuelo chocan, la real manda (nunca se pisan).
 */

export type Caja = { x0: number; y0: number; x1: number; y1: number };

export type EtiquetaColision = {
  id: string;
  /** Menor = más importante. */
  prioridad: number;
  /** Desempate estable: la que apareció antes se queda en su lugar. */
  desde: number;
  /** Caja del anclaje (punto, o el marcador del pin): las candidatas se pegan a sus bordes. */
  ancla: Caja;
  /** Centro preferido (donde iría sin colisiones). */
  natural: [number, number];
  w: number;
  h: number;
  /** No se mueve (texto rotado de río): o cabe donde está o se oculta. */
  fija?: boolean;
};

export type Colocacion = { dx: number; dy: number; guia: boolean };

/** Prioridad por tipo (pin > contexto > región > país > mar > río; el contexto vive fuera del mapa y es obstáculo). */
export const PRIORIDAD: Record<string, number> = { remate: 0, pin: 1, region: 3, area: 3, pais: 4, mar: 5, rio: 6, linea: 7 };

/** Ancho estimado de un texto en la condensada de la marca. */
export const anchoTexto = (texto: string, fontSize: number, espaciado = 0) =>
  [...texto].length * (0.45 * fontSize + espaciado);

const MARGEN = 10; // aire entre cajas
const GUIA_PX = 40;

const choca = (a: Caja, b: Caja) => a.x0 < b.x1 + MARGEN && a.x1 + MARGEN > b.x0 && a.y0 < b.y1 + MARGEN && a.y1 + MARGEN > b.y0;
const cajaEn = (cx: number, cy: number, w: number, h: number): Caja => ({ x0: cx - w / 2, y0: cy - h / 2, x1: cx + w / 2, y1: cy + h / 2 });

/** 8 direcciones, de la más natural para un rótulo (arriba/abajo) a las diagonales. */
const DIRECCIONES: [number, number][] = [[0, -1], [0, 1], [1, 0], [-1, 0], [1, -1], [-1, -1], [1, 1], [-1, 1]];

/**
 * Coloca las etiquetas. `zona` = rectángulo donde pueden vivir (fuera quedan los bordes y la franja inferior).
 * Devuelve, por id, el desplazamiento del centro respecto del natural, o `null` si se oculta.
 */
export const resolverColisiones = (etiquetas: EtiquetaColision[], obstaculos: Caja[], zona: Caja, preferidas?: Map<string, Colocacion | null>): Map<string, Colocacion | null> => {
  const out = new Map<string, Colocacion | null>();
  const puestas: Caja[] = [...obstaculos];
  const dentro = (c: Caja) => c.x0 >= zona.x0 && c.x1 <= zona.x1 && c.y0 >= zona.y0 && c.y1 <= zona.y1;
  // El propio marcador de un pin no estorba a su nombre (las candidatas ya se pegan a sus bordes).
  const libre = (c: Caja, propia: Caja) => dentro(c) && !puestas.some((o) => o !== propia && choca(c, o));
  const orden = [...etiquetas].sort((a, b) => a.prioridad - b.prioridad || a.desde - b.desde || (a.id < b.id ? -1 : 1));
  for (const e of orden) {
    const [nx, ny] = e.natural;
    const candidatas: [number, number][] = [[nx, ny]];
    if (!e.fija) {
      const acx = (e.ancla.x0 + e.ancla.x1) / 2, acy = (e.ancla.y0 + e.ancla.y1) / 2;
      const aw = (e.ancla.x1 - e.ancla.x0) / 2, ah = (e.ancla.y1 - e.ancla.y0) / 2;
      for (const anillo of [1, 2.2]) {
        const g = 12 * anillo + (anillo > 1 ? e.h : 0);
        const ring = DIRECCIONES.map(([dx, dy]) => [acx + dx * (aw + e.w / 2 + g), acy + dy * (ah + e.h / 2 + g)] as [number, number]);
        // La libre más cercana al lugar natural primero (desempate: el orden de DIRECCIONES).
        ring.sort((p, q) => Math.hypot(p[0] - nx, p[1] - ny) - Math.hypot(q[0] - nx, q[1] - ny));
        candidatas.push(...ring);
      }
      // Correr en horizontal dentro del cuadro (texto ancho cerca del borde).
      const cx = Math.max(zona.x0 + e.w / 2, Math.min(zona.x1 - e.w / 2, nx));
      if (cx !== nx) candidatas.splice(1, 0, [cx, ny]);
      // Estabilidad: lo que se decidió con la cámara asentada va primero (si sigue libre, no salta).
      const pref = preferidas?.get(e.id);
      if (pref) candidatas.unshift([nx + pref.dx, ny + pref.dy]);
    }
    const elegida = candidatas.find(([cx, cy]) => libre(cajaEn(cx, cy, e.w, e.h), e.ancla));
    if (!elegida) { out.set(e.id, null); continue; }
    puestas.push(cajaEn(elegida[0], elegida[1], e.w, e.h));
    const dx = elegida[0] - nx, dy = elegida[1] - ny;
    out.set(e.id, { dx, dy, guia: Math.hypot(dx, dy) > GUIA_PX });
  }
  return out;
};

/** Punto del borde de la caja (centro c, w×h) más cercano a `p`: donde termina la línea guía. */
export const bordeMasCercano = (c: [number, number], w: number, h: number, p: [number, number]): [number, number] => [
  Math.max(c[0] - w / 2, Math.min(c[0] + w / 2, p[0])),
  Math.max(c[1] - h / 2, Math.min(c[1] + h / 2, p[1])),
];
