/**
 * Sistema de marca de LÍNEA PUNTEADA.
 * Única fuente de verdad para colores, tipografía, formato y ritmo.
 * Toda plantilla importa de aquí; nadie inventa colores sueltos.
 */
export const FORMATO = {
  ancho: 1080,
  alto: 1920,
  fps: 60,
  /** Zona segura vertical para Shorts: la UI de YouTube tapa ~200 px arriba y ~330 px abajo (y la columna de botones a la derecha). */
  seguro: { arriba: 220, abajo: 340, lados: 60 },
} as const;

export const PALETA = {
  /** Azul noche: fondo y océano en el mapa oscuro. */
  fondo: '#0B1D2E',
  /** Tierra en el mapa oscuro y cajas de texto. */
  fondo2: '#14304A',
  /** Bordes suaves de país en el mapa oscuro. */
  borde: '#2C5272',
  tinta: '#FFFFFF',
  tintaSuave: '#B9CCDD',
  /** La línea / el rótulo clave. */
  amarillo: '#FFD23F',
  /** Agua y rutas. */
  celeste: '#4FC3F7',
  /** Acento "aquí" (marcadores, giro). */
  coral: '#FF5E5B',
} as const;

/** Colores con nombre que pueden pedir los guiones (líneas del mapa, marcadores). */
export const COLORES_GUION = { amarillo: PALETA.amarillo, celeste: PALETA.celeste, coral: PALETA.coral } as const;

/** Fondo con transparencia (para velos sobre el mapa). */
export const fondoAlfa = (a: number) => `rgba(11,29,46,${a})`;

export const TIPO = {
  /** Títulos y rótulos enormes. */
  display: 'Bricolage Grotesque',
  /** Subtítulos, créditos y cifras pequeñas. */
  texto: 'Inter',
  /** Bricolage Grotesque llega hasta 800 en Google Fonts (900 no existe): el rótulo usa 800 + borde grueso. */
  pesoRotulo: 800,
  pesoDisplay: 800,
} as const;

/** Duraciones en segundos: Shorts narrados de 2–3 min (historia completa). */
export const RITMO = {
  shortMin: 110,
  shortMax: 175,
  /** Cierre de marca al final. */
  cierre: 1.5,
} as const;

export const MARCA = {
  nombre: 'Línea Punteada',
  handle: '@lineapunteada',
  lema: 'Cada línea del mapa esconde una historia.',
  /** Marca de agua discreta esquina superior derecha, dentro de la zona segura. */
  marcaDeAgua: { tamano: 30, opacidad: 0.7 },
} as const;
