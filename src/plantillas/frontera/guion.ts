/**
 * Guion de la plantilla `frontera`: una frontera rara contada sobre un mapa (satélite NASA o vectores
 * Natural Earth) con líneas que se dibujan, marcadores y un zoom lento continuo (como Ñerd).
 * = GuionBase (src/plantillas/comun/guion.ts) + `mapa`.
 *
 * Índices de escena en `mapa`: 0 = primera escena de `escenas`, -1 = el gancho.
 * Coordenadas siempre [longitud, latitud] en grados decimales (oeste y sur negativos).
 */
import { z } from 'zod';
import { CamposBase, envoltorioDe, validarFormula } from '../comun/guion';

const LonLat = z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]);

export const LineaMapa = z.object({
  /** Nombre corto único ("rio-1852", "canal-1968"). */
  id: z.string().min(1),
  /** Trazado a mano, [lon, lat] en orden (≥ 2 puntos). Úsalo para ríos, cauces viejos, rutas, líneas de tratado. */
  puntos: z.array(LonLat).min(2).optional(),
  /**
   * Frontera actual tomada de Natural Earth entre dos países (nombre en inglés de NE, ej. "Mexico",
   * "United States of America", "Chile", o código ISO numérico "484"). Solo sirve a escala regional (zoom ≤ 9):
   * a escala de ciudad NE es grueso; ahí usa `puntos`.
   */
  fronteraEntre: z.tuple([z.string(), z.string()]).optional(),
  /** amarillo = la línea clave / el tratado; celeste = agua y rutas; coral = el "aquí" / lo que cambió. */
  color: z.enum(['amarillo', 'celeste', 'coral']),
  /** solida = lo que existe hoy; punteada = lo que fue, lo que se discute o lo aproximado. */
  estilo: z.enum(['solida', 'punteada']),
  /** Escena en la que se dibuja (1,2–2 s desde el inicio de esa escena). -1 = durante el gancho. */
  dibujarEn: z.number().int().min(-1),
  /** Texto pequeño junto a la línea ("RÍO EN 1852"), opcional, 1–3 palabras. */
  etiqueta: z.string().max(22).optional(),
}).refine((l) => !!l.puntos || !!l.fronteraEntre, { message: 'cada línea necesita `puntos` o `fronteraEntre`' });
export type LineaMapa = z.infer<typeof LineaMapa>;

export const MapaFrontera = z.object({
  /**
   * satelite = recorte NASA GIBS (Landsat WELD a escala de ciudad, Blue Marble a escala de país) que descarga
   * preparar-frontera; relieve = Blue Marble con relieve sombreado; oscuro = solo vectores Natural Earth en la
   * paleta del canal. Si la descarga falla, cae a `oscuro` sin romper.
   */
  fondo: z.enum(['satelite', 'relieve', 'oscuro']),
  /** Centro de la cámara al empezar, [lon, lat]. */
  centro: LonLat,
  /**
   * Nivel de zoom tipo mapa web (teselas de 256 px): 3 ≈ un continente, 6 ≈ un país chico, 9 ≈ una región,
   * 12 ≈ una ciudad, 14 ≈ un barrio. El zoom va de `zoomInicial` a `zoomFinal` despacio durante TODO el video.
   */
  zoomInicial: z.number().min(1).max(16),
  zoomFinal: z.number().min(1).max(16),
  /** Países a resaltar con relleno tenue (nombre NE en inglés o ISO numérico). */
  paises: z.array(z.string()).optional(),
  /** Líneas que se dibujan (máx. 6). */
  lineas: z.array(LineaMapa).min(1).max(6),
  /** Puntos con etiqueta ("EL PASO"), aparecen en la escena `aparecerEn` (-1 = gancho). */
  marcadores: z.array(z.object({
    lon: z.number().min(-180).max(180),
    lat: z.number().min(-90).max(90),
    etiqueta: z.string().min(1).max(24),
    aparecerEn: z.number().int().min(-1),
  })).max(8).optional(),
  /** Saltos de cámara opcionales al empezar una escena (con spring); el zoom lento sigue sumándose encima. */
  zooms: z.array(z.object({ escena: z.number().int().min(0), centro: LonLat, zoom: z.number().min(1).max(16) })).optional(),
});
export type MapaFrontera = z.infer<typeof MapaFrontera>;

export const CamposFrontera = CamposBase.extend({ mapa: MapaFrontera });

/** Props de la plantilla `frontera` (lo que viaja en `props` del envoltorio). */
export const GuionFrontera = CamposFrontera.superRefine((g, ctx) => {
  validarFormula(g, ctx);
  const n = g.escenas.length;
  g.mapa.lineas.forEach((l, i) => {
    if (l.dibujarEn >= n) ctx.addIssue({ code: 'custom', path: ['mapa', 'lineas', i, 'dibujarEn'], message: `escena ${l.dibujarEn} no existe (hay ${n})` });
  });
  (g.mapa.marcadores ?? []).forEach((m, i) => {
    if (m.aparecerEn >= n) ctx.addIssue({ code: 'custom', path: ['mapa', 'marcadores', i, 'aparecerEn'], message: `escena ${m.aparecerEn} no existe (hay ${n})` });
  });
  (g.mapa.zooms ?? []).forEach((z, i) => {
    if (z.escena >= n) ctx.addIssue({ code: 'custom', path: ['mapa', 'zooms', i, 'escena'], message: `escena ${z.escena} no existe (hay ${n})` });
  });
});
export type GuionFrontera = z.infer<typeof CamposFrontera>;

/** Envoltorio completo de un guion `frontera`. */
export const EnvoltorioFrontera = envoltorioDe('frontera', GuionFrontera);
export type EnvoltorioFrontera = z.infer<typeof EnvoltorioFrontera>;

/** Fondo ya resuelto por preparar-frontera (NO va en los guiones). */
export const FondoResuelto = z.object({
  /** Relativa a public/, ej. mapas/<id>.jpg */
  src: z.string(),
  /** [oeste, sur, este, norte] en grados (EPSG:4326). */
  bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]),
  capa: z.string(),
  credito: z.string(),
});
export type FondoResuelto = z.infer<typeof FondoResuelto>;
