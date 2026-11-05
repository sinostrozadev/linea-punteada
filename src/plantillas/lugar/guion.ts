/**
 * Guion de la plantilla `lugar`: la historia es un PUNTO (una ciudad que no debería existir, una isla perdida,
 * "el lugar más X del mundo"). Protagonista visual: una foto grande de Wikimedia Commons con movimiento Ken Burns
 * y, encima, un mapa inset redondo con el punto parpadeando en coral y un zoom lento del continente al punto.
 * Cada escena puede cambiar a `vista: 'mapa'` (mapa a pantalla completa con el punto y los marcadores).
 * = GuionBase (src/plantillas/comun/guion.ts) + `mapa` + `imagenPrincipal` + `vista`/`kenBurns` por escena.
 *
 * Índices de escena en `mapa.marcadores[].aparecerEn`: 0 = primera escena de `escenas`, -1 = el gancho.
 * Coordenadas siempre [longitud, latitud] en grados decimales (oeste y sur negativos).
 */
import { z } from 'zod';
import { CamposBase, Escena, ImagenEscena, ImagenResuelta, envoltorioDe, validarFormula } from '../comun/guion';

const LonLat = z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]);

export const MODOS_KEN_BURNS = ['acercar', 'alejar', 'izquierda', 'derecha'] as const;
export type ModoKenBurns = (typeof MODOS_KEN_BURNS)[number];

export const EscenaLugar = Escena.extend({
  /**
   * Qué se ve de fondo en esta escena:
   *  - foto (por defecto): foto grande con Ken Burns + mapa inset redondo abajo. Usa la `imagen` de la escena si
   *    Commons devolvió una válida; si no, la `imagenPrincipal`.
   *  - mapa: mapa a pantalla completa (satélite o vectores) con el punto, la etiqueta y los marcadores. Úsala cuando
   *    la voz habla de distancias, rutas o vecinos ("a 1.080 km de la costa", "frente a Acapulco").
   * Alterna: 2–4 escenas `mapa` por guion, nunca todas iguales.
   */
  vista: z.enum(['foto', 'mapa']).optional(),
  /** Movimiento de la foto: acercar | alejar | izquierda | derecha. Si falta, la plantilla alterna sola. */
  kenBurns: z.enum(MODOS_KEN_BURNS).optional(),
});
export type EscenaLugar = z.infer<typeof EscenaLugar>;

export const MapaLugar = z.object({
  /**
   * satelite = recortes NASA GIBS (Blue Marble a escala de país; Landsat WELD a escala de ciudad si hay datos) que
   * descarga preparar-lugar; relieve = Blue Marble con relieve y batimetría; oscuro = vectores Natural Earth en la
   * paleta del canal. Ojo: un islote o un pueblo chico no se distingue en satélite a zoom ≤ 9 (es un píxel): el punto
   * coral es lo que se ve. Si la descarga falla, cae a `oscuro` sin romper.
   */
  fondo: z.enum(['satelite', 'relieve', 'oscuro']),
  /** El lugar de la historia, [lon, lat]. El mapa siempre está centrado en él. */
  punto: LonLat,
  /**
   * Zoom tipo mapa web del mapa INSET (círculo de 500 px): 3 ≈ un continente, 5 ≈ un país, 7 ≈ una región,
   * 9 ≈ una ciudad. Va de `zoomInicial` (lejos: que se vea el continente o el país vecino) a `zoomFinal` (cerca)
   * despacio durante TODO el video. El mapa a pantalla completa usa el mismo encuadre (≈ +1 de zoom).
   */
  zoomInicial: z.number().min(1).max(14),
  zoomFinal: z.number().min(1).max(14),
  /** Nombre del lugar junto al punto, en mayúsculas, 1–3 palabras ("CLIPPERTON", "LA RINCONADA"). */
  etiqueta: z.string().min(1).max(24),
  /**
   * Otros lugares de referencia (la costa más cercana, la capital lejana). Aparecen en la escena `aparecerEn`
   * (-1 = gancho) con una línea punteada fina hasta el punto. Máx. 4.
   */
  marcadores: z.array(z.object({
    lon: z.number().min(-180).max(180),
    lat: z.number().min(-90).max(90),
    etiqueta: z.string().min(1).max(24),
    aparecerEn: z.number().int().min(-1),
  })).max(4).optional(),
});
export type MapaLugar = z.infer<typeof MapaLugar>;

export const CamposLugar = CamposBase.extend({
  /** 5–9 escenas en orden de locución (con `vista` y `kenBurns` opcionales). */
  escenas: z.array(EscenaLugar).min(5).max(9),
  mapa: MapaLugar,
  /**
   * Foto PROTAGONISTA (Commons, obligatoria): el lugar visto entero, idealmente desde el aire o de lejos. Se ve en el
   * gancho y en toda escena `vista: 'foto'` sin `imagen` propia. Si Commons no devuelve una válida, el video entero
   * pasa a `vista: 'mapa'` (salvo escenas con foto propia) sin romper.
   */
  imagenPrincipal: ImagenEscena,
});

/** Props de la plantilla `lugar` (lo que viaja en `props` del envoltorio). */
export const GuionLugar = CamposLugar.superRefine((g, ctx) => {
  validarFormula(g, ctx);
  const n = g.escenas.length;
  (g.mapa.marcadores ?? []).forEach((m, i) => {
    if (m.aparecerEn >= n) ctx.addIssue({ code: 'custom', path: ['mapa', 'marcadores', i, 'aparecerEn'], message: `escena ${m.aparecerEn} no existe (hay ${n})` });
  });
  if (g.escenas.every((e) => (e.vista ?? 'foto') === 'foto') && !g.escenas.some((e) => e.vista === 'mapa')) {
    ctx.addIssue({ code: 'custom', path: ['escenas'], message: 'al menos una escena debe ser vista "mapa" (el lugar se entiende en el mapa)' });
  }
});
export type GuionLugar = z.infer<typeof CamposLugar>;

/** Envoltorio completo de un guion `lugar`. */
export const EnvoltorioLugar = envoltorioDe('lugar', GuionLugar);
export type EnvoltorioLugar = z.infer<typeof EnvoltorioLugar>;

/** Un recorte satelital ya resuelto por preparar-lugar, con el zoom (pantalla completa) para el que se pidió. NO va en los guiones. */
export const FondoNivel = z.object({
  /** Relativa a public/, ej. mapas/<id>-n0.jpg */
  src: z.string(),
  /** [oeste, sur, este, norte] en grados (EPSG:4326). */
  bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]),
  capa: z.string(),
  credito: z.string(),
  zoom: z.number(),
});
export type FondoNivel = z.infer<typeof FondoNivel>;

export { ImagenResuelta };
