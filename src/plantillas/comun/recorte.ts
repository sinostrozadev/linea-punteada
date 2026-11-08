/**
 * Recortes satelitales regionales pintados encima de una base (frontera, lugar): que nunca se noten como rectángulo.
 * 1) Solo se dibujan si cubren el cuadro entero: la opacidad sale de cuánto sobresalen por el lado más justo, en
 *    anchos de su borde difuminado (si cualquier parte del borde difuminado entra a la pantalla → invisible; ≥ SOBRA_OPACO anchos → opaco). Al alejarse o
 *    panear más allá de lo que cubren, se funden con la capa de debajo en vez de dejar un marco de otro tono.
 * 2) Borde difuminado (máscara de alfa lineal de BORDE_RECORTE del lado) para la transición restante.
 * preparar-* los pide con margen ×2 sobre el encuadre (scripts/lib/satelite.mts). Caso: Diómedes, 2026-11-08.
 */
import type React from 'react';

/** Ancho del borde difuminado de cada recorte, en fracción de su lado. */
export const BORDE_RECORTE = 0.07;
/** Cuántos anchos de borde tienen que sobrar fuera del cuadro para dibujar el recorte opaco. */
const SOBRA_OPACO = 2;

/** Opacidad de un recorte según cuánto sobresale del cuadro (a = esquina NO, b = esquina SE, en px). Suave. */
export const opacidadPorCobertura = (a: [number, number], b: [number, number], ancho: number, alto: number) => {
  const fx = Math.max(1, (b[0] - a[0]) * BORDE_RECORTE), fy = Math.max(1, (b[1] - a[1]) * BORDE_RECORTE);
  // En anchos de borde: < 1 = parte del difuminado entra a la pantalla → invisible; de 1 a SOBRA_OPACO se funde.
  const anchos = Math.min(Math.min(-a[0], b[0] - ancho) / fx, Math.min(-a[1], b[1] - alto) / fy);
  const sobra = (anchos - 1) / (SOBRA_OPACO - 1);
  const u = Math.max(0, Math.min(1, sobra));
  return u * u * (3 - 2 * u);
};

const P = `${BORDE_RECORTE * 100}%`, Q = `${100 - BORDE_RECORTE * 100}%`;
const H = `linear-gradient(to right, transparent 0, #000 ${P}, #000 ${Q}, transparent 100%)`;
const V = `linear-gradient(to bottom, transparent 0, #000 ${P}, #000 ${Q}, transparent 100%)`;
/** Estilo CSS de máscara: difumina los cuatro bordes del recorte. */
export const mascaraRecorte = {
  WebkitMaskImage: `${H}, ${V}`, WebkitMaskComposite: 'source-in', maskImage: `${H}, ${V}`, maskComposite: 'intersect',
} as React.CSSProperties;
