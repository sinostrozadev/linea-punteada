/**
 * Disposición vertical común (1080×1920), todo dentro de FORMATO.seguro (arriba 220, abajo 340):
 *   220–262  marca de agua (derecha)
 *   280–322  cabecera (izquierda)
 *   350–560  subtítulos (tercio superior)
 *   ~760–1100 rótulo enorme (centro; sube si hay tarjeta de imagen)
 *   1150–1540 tarjeta de imagen (tercio inferior) · 1548 crédito del mapa
 */
import { FORMATO } from '../../marca/tokens';

export const ZONA = {
  cabecera: { top: 282 },
  subtitulos: { top: 352, alto: 210 },
  rotulo: { centroY: 1010, centroYConImagen: 880 },
  tarjeta: { top: 1150, alto: 390, lados: FORMATO.seguro.lados },
  creditoMapa: { bottom: FORMATO.seguro.abajo + 4 },
  remate: { centroY: 900 },
} as const;
