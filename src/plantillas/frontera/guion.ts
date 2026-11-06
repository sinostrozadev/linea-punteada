/**
 * Guion de la plantilla `frontera`: una frontera rara contada sobre un mapa (satélite NASA o vectores
 * Natural Earth) con líneas que se dibujan, marcadores y un zoom lento continuo (como Ñerd).
 * = GuionBase (src/plantillas/comun/guion.ts) + `mapa`.
 *
 * Índices de escena en `mapa`: 0 = primera escena de `escenas`, -1 = el gancho.
 * Coordenadas siempre [longitud, latitud] en grados decimales (oeste y sur negativos).
 */
import { z } from 'zod';
import { CamposBase, Escena, envoltorioDe, validarFormula } from '../comun/guion';
import { AcentoVideo, DireccionComun, IconoNombre, ItemIndice, Momento, Quedarse } from '../comun/direccion';
import { validarCamara } from '../comun/camara';

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
  /** v2: palabra exacta (o segundos) de esa escena en la que empieza a dibujarse (por defecto 0,3 s). */
  dice: z.union([z.string().min(1), z.number().min(0)]).optional(),
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
  /** Líneas que se dibujan (máx. 8). La frontera protagonista: color amarillo (se dibuja con brillo). */
  lineas: z.array(LineaMapa).max(8),
  /**
   * v2: mes (1–12) del Blue Marble mensual de NASA (nieve en enero en el hemisferio norte, etc.). Elígelo
   * por el tema ("el frío" → invierno). Sin `mes` se usa el Blue Marble con relieve sombreado.
   */
  mes: z.number().int().min(1).max(12).optional(),
  /** Puntos con etiqueta ("EL PASO"), aparecen en la escena `aparecerEn` (-1 = gancho). */
  marcadores: z.array(z.object({
    lon: z.number().min(-180).max(180),
    lat: z.number().min(-90).max(90),
    etiqueta: z.string().min(1).max(24),
    aparecerEn: z.number().int().min(-1),
  })).max(8).optional(),
  /**
   * v2: polígonos ([lon, lat], ≥ 3 vértices) donde NO se dibujan los bordes blancos de Natural Earth ni el contorno
   * de las áreas de país. Para cuando el borde de NE contradice la historia (ej. el tramo "sin trazar" de Campo de
   * Hielo Sur, que NE dibuja igual). Vale todo el video; para ocultarlos solo mientras se ve un área, `areas[].ocultarBordes`.
   */
  ocultarBordesEn: z.array(z.array(LonLat).min(3)).max(6).optional(),
  /** Saltos de cámara opcionales al empezar una escena (con spring); el zoom lento sigue sumándose encima. */
  zooms: z.array(z.object({ escena: z.number().int().min(0), centro: LonLat, zoom: z.number().min(1).max(16) })).optional(),
});
export type MapaFrontera = z.infer<typeof MapaFrontera>;

// ------------------------------------------------------------------------------------------------
// DIRECCIÓN VISUAL v2 (docs/DIRECCION-VISUAL.md). Todo es opcional salvo `planos` en el gancho cuando se usa.
// ------------------------------------------------------------------------------------------------

/**
 * Un plano de cámara. Dentro del plano la cámara hace un zoom lento continuo (`deriva`); entre planos hay un
 * corte seco o un movimiento con easing largo. Una escena sin `planos` hereda el último plano (sigue el zoom lento).
 * Regla de ritmo: un evento visual cada ~2 s; un plano nuevo cada 3–6 s; los cortes caen en límite de frase.
 */
export const Plano = z.object({
  /** Centro [lon, lat]. */
  centro: LonLat,
  /** Zoom tipo mapa web: 4 continente, 6 país, 8 región, 10 provincia, 12 ciudad, 14 barrio, 15–16 una playa. */
  zoom: z.number().min(1).max(17),
  /** corte = salto seco (lo normal); zoom = acercarse/alejarse volando; paneo = deslizarse al lado. */
  entrada: z.enum(['corte', 'zoom', 'paneo']),
  /** Cuándo empieza (palabra exacta o segundos desde la escena). El 1.º plano de una escena empieza con ella. */
  en: Momento.optional(),
  /** Alternativa a `en`: cuánto dura este plano (s); el siguiente empieza después. */
  duracionSeg: z.number().min(0.8).max(20).optional(),
  /** Zoom lento DENTRO del plano, en niveles (por defecto +0,3; negativo = se aleja). */
  deriva: z.number().min(-1.5).max(1.5).optional(),
});
export type Plano = z.infer<typeof Plano>;

export const COLORES_AREA = ['verde', 'rojo', 'violeta', 'amarillo', 'azul'] as const;

/**
 * Máscara de territorio: color translúcido con rayas diagonales y borde. Aparece cuando la voz la nombra.
 * - `pais`: país de Natural Earth (nombre en inglés: "Peru", "Chile") — el polígono sale del mapa 1:10 M.
 * - `poligono`: [lon, lat][] a mano (≥ 3 puntos) para un triángulo, una franja cedida, una provincia.
 * - `tipo: "franja"` + `linea` + `anchoKm`: banda rayada a lo largo de una línea (ej. 160 km junto a la frontera).
 */
export const Area = z.object({
  pais: z.string().optional(),
  poligono: z.array(LonLat).min(3).optional(),
  tipo: z.enum(['zona', 'franja']).optional(),
  /** Para franja: id de una línea de `mapa.lineas` o puntos propios. */
  linea: z.union([z.string(), z.array(LonLat).min(2)]).optional(),
  anchoKm: z.number().min(0.01).max(800).optional(),
  color: z.enum(COLORES_AREA),
  trama: z.enum(['rayas', 'solida']).optional(),
  /** Texto dentro del área ("PERÚ", "EL TRIÁNGULO"); va en el centro o en `etiquetaEn`. */
  etiqueta: z.string().max(26).optional(),
  etiquetaEn: LonLat.optional(),
  aparecerEn: Momento.optional(),
  desaparecerEn: Momento.optional(),
  quedarse: Quedarse.optional(),
  /** Con `poligono`: mientras el área se ve, no se dibujan dentro de ella los bordes de Natural Earth (ver `mapa.ocultarBordesEn`). */
  ocultarBordes: z.boolean().optional(),
}).refine((a) => !!a.pais || !!a.poligono || (a.tipo === 'franja' && !!a.linea), { message: 'cada área necesita `pais`, `poligono` o (franja) `linea`' })
  .refine((a) => !a.ocultarBordes || !!a.poligono, { message: '`ocultarBordes` necesita `poligono`' });
export type Area = z.infer<typeof Area>;

/**
 * Etiqueta de mapa: mayúsculas condensadas blancas con tracking y sombra.
 * pais (grande) · region · rio (rotada con `rotacion`, en grados) · mar (cursiva espaciada) · pin (marcador
 * rojo + nombre) · contexto (amarilla, arriba de la pantalla; lon/lat no hacen falta).
 */
export const EtiquetaMapa = z.object({
  lon: z.number().min(-180).max(180).optional(),
  lat: z.number().min(-90).max(90).optional(),
  texto: z.string().min(1).max(28),
  tipo: z.enum(['pais', 'region', 'rio', 'mar', 'pin', 'contexto']),
  rotacion: z.number().min(-90).max(90).optional(),
  aparecerEn: Momento.optional(),
  desaparecerEn: Momento.optional(),
  quedarse: Quedarse.optional(),
});
export type EtiquetaMapa = z.infer<typeof EtiquetaMapa>;

/** Cota: línea con flechas/marcas en los extremos y el texto rotado sobre ella ("260 M", "80 MILLAS"). Hasta 4 a la vez. */
export const Cota = z.object({
  desde: LonLat,
  hasta: LonLat,
  texto: z.string().min(1).max(16),
  aparecerEn: Momento.optional(),
  desaparecerEn: Momento.optional(),
  quedarse: Quedarse.optional(),
});
export type Cota = z.infer<typeof Cota>;

/** Icono sobre el mapa (emoji o pictograma). Con `ruta` se desplaza por ella en `duracionSeg` (tren que avanza). */
export const IconoMapa = z.object({
  lon: z.number().min(-180).max(180),
  lat: z.number().min(-90).max(90),
  icono: IconoNombre,
  ruta: z.array(LonLat).min(2).optional(),
  duracionSeg: z.number().min(0.5).max(20).optional(),
  /** 1 = 96 px. */
  escala: z.number().min(0.4).max(3).optional(),
  /** Tachar con un círculo rojo (lo que NO pasó). */
  tachado: z.boolean().optional(),
  aparecerEn: Momento.optional(),
  desaparecerEn: Momento.optional(),
  quedarse: Quedarse.optional(),
});
export type IconoMapa = z.infer<typeof IconoMapa>;

/** Círculo amarillo que marca un detalle ~1,5 s ("el escalón", "el hito"). */
export const Resalte = z.object({
  lon: z.number().min(-180).max(180),
  lat: z.number().min(-90).max(90),
  /** Radio en px de pantalla (por defecto 90). */
  radio: z.number().min(20).max(400).optional(),
  aparecerEn: Momento.optional(),
  duracionSeg: z.number().min(0.6).max(6).optional(),
});

/** Campos cartográficos + comunes que puede llevar el gancho o cualquier escena. */
const DireccionMapa = {
  ...DireccionComun,
  planos: z.array(Plano).max(6).optional(),
  areas: z.array(Area).max(6).optional(),
  etiquetas: z.array(EtiquetaMapa).max(10).optional(),
  cotas: z.array(Cota).max(4).optional(),
  iconos: z.array(IconoMapa).max(6).optional(),
  resaltes: z.array(Resalte).max(3).optional(),
  /**
   * Solo en `mapa-de-ruta`: el índice ("⚖️ 1 · CONCORDIA", "📍 2 · HITO", "🌊 3 · EL MAR"). `indicePosicion`:
   * fila (arriba a la izquierda, por defecto) o vertical-mapa (apilado sobre el mapa en `indiceAncla`).
   */
  indice: z.array(ItemIndice).min(2).max(4).optional(),
  indicePosicion: z.enum(['fila', 'vertical-mapa']).optional(),
  indiceAncla: LonLat.optional(),
};

export const EscenaFrontera = Escena.extend(DireccionMapa);
export type EscenaFrontera = z.infer<typeof EscenaFrontera>;

/** Tarjeta de título del frame 0 (0,9 s): mapa chico con el contorno, pines, regla de acento y la pregunta. */
export const TarjetaTitulo = z.object({
  /** La pregunta del título en 2–3 líneas cortas (≤ 52 caracteres): "¿DE QUIÉN ES ESTA PLAYA?". */
  texto: z.string().min(3).max(52),
  /** Palabra(s) del texto que van en el color de acento ("PLAYA"). */
  clave: z.string().max(20).optional(),
  /** Cámara del mapa chico (por defecto el primer plano del gancho, 1,5 niveles más lejos). */
  centro: LonLat.optional(),
  zoom: z.number().min(1).max(17).optional(),
  /** Países cuyo contorno se resalta ("Peru", "Chile"). */
  paises: z.array(z.string()).max(4).optional(),
  pines: z.array(z.object({ lon: z.number(), lat: z.number(), texto: z.string().max(20) })).max(3).optional(),
  /** Emoji o pictograma grande sobre el mapa chico ("🔍"). */
  icono: IconoNombre.optional(),
});

export const CamposFrontera = CamposBase.extend({
  mapa: MapaFrontera,
  gancho: CamposBase.shape.gancho.extend(DireccionMapa),
  escenas: z.array(EscenaFrontera).min(5).max(9),
  /** v2: acento del video (amarillo por defecto; cian o coral para variar entre videos). */
  acento: AcentoVideo.optional(),
  tarjetaTitulo: TarjetaTitulo.optional(),
  /** v2: las dos etiquetas del remate sobre el mapa (1.ª al empezar el remate, 2.ª en su segunda mitad). */
  remateEtiquetas: z.array(z.object({ lon: z.number(), lat: z.number(), texto: z.string().max(28) })).max(2).optional(),
  /** v2: plano(s) del remate (si faltan, hereda el último). */
  rematePlanos: z.array(Plano).max(3).optional(),
});

/** Props de la plantilla `frontera` (lo que viaja en `props` del envoltorio). */
export const GuionFrontera = CamposFrontera.superRefine((g, ctx) => {
  validarFormula(g, ctx);
  // Gramática de cámara (docs/DIRECCION-VISUAL.md §1b): en frontera la cámara es continua (una línea sin planos hereda el último).
  validarCamara(g, ctx, { continua: true });
  const n = g.escenas.length;
  g.mapa.lineas.forEach((l, i) => {
    if (l.dibujarEn >= n) ctx.addIssue({ code: 'custom', path: ['mapa', 'lineas', i, 'dibujarEn'], message: `escena ${l.dibujarEn} no existe (hay ${n})` });
  });
  (g.mapa.marcadores ?? []).forEach((m, i) => {
    if (m.aparecerEn >= n) ctx.addIssue({ code: 'custom', path: ['mapa', 'marcadores', i, 'aparecerEn'], message: `escena ${m.aparecerEn} no existe (hay ${n})` });
  });
  // v2: si alguna escena dirige la cámara, el gancho también (el video empieza con un plano declarado).
  const usaPlanos = g.escenas.some((e) => (e.planos ?? []).length) || (g.rematePlanos ?? []).length;
  if (usaPlanos && !(g.gancho.planos ?? []).length) ctx.addIssue({ code: 'custom', path: ['gancho', 'planos'], message: 'con dirección visual v2, el gancho debe declarar ≥ 1 plano' });
  const lineasIds = new Set(g.mapa.lineas.map((l) => l.id));
  [g.gancho, ...g.escenas].forEach((e, k) => {
    const base = k === 0 ? ['gancho'] : ['escenas', k - 1];
    (e.areas ?? []).forEach((a, i) => {
      if (typeof a.linea === 'string' && !lineasIds.has(a.linea)) ctx.addIssue({ code: 'custom', path: [...base, 'areas', i, 'linea'], message: `no hay línea "${a.linea}"` });
    });
    if (e.indice && k > 0 && g.escenas[k - 1].tipo !== 'mapa-de-ruta') ctx.addIssue({ code: 'custom', path: [...base, 'indice'], message: 'el índice solo va en la escena mapa-de-ruta' });
    const sinMapa = [e.etiquetas ?? [], e.iconos ?? []].flat().filter((x) => (x as { tipo?: string }).tipo !== 'contexto' && ((x as { lon?: number }).lon === undefined || (x as { lat?: number }).lat === undefined));
    if (sinMapa.length) ctx.addIssue({ code: 'custom', path: [...base, 'etiquetas'], message: 'las etiquetas (salvo contexto) necesitan lon y lat' });
    const texto = k === 0 ? g.gancho.texto : g.escenas[k - 1].texto;
    const palabras = [
      e.contexto?.dice, e.fuente?.dice, e.foto?.aparecerEn, e.polaroid?.aparecerEn,
      ...(e.planos ?? []).map((p) => p.en), ...(e.areas ?? []).flatMap((a) => [a.aparecerEn, a.desaparecerEn]),
      ...(e.etiquetas ?? []).flatMap((a) => [a.aparecerEn, a.desaparecerEn]), ...(e.cotas ?? []).flatMap((a) => [a.aparecerEn, a.desaparecerEn]),
      ...(e.iconos ?? []).flatMap((a) => [a.aparecerEn, a.desaparecerEn]), ...(e.tarjetas ?? []).map((t) => t.aparecerEn),
      ...(e.indice ?? []).map((t) => t.dice), ...(e.resaltes ?? []).map((t) => t.aparecerEn),
    ].filter((p): p is string => typeof p === 'string');
    const norm = (w: string) => w.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9ñ]/g, '');
    const tokens = texto.split(/\s+/).map(norm);
    // Coincidencia por palabra COMPLETA normalizada (sin tildes ni puntuación): "Según" no calza con "Segundo".
    // `#n` pide la n-ésima aparición y también se valida.
    palabras.forEach((p) => {
      const m = /^(.*?)#(\d+)$/.exec(p.trim());
      const w = norm(m ? m[1] : p);
      const n = m ? Number(m[2]) : 1;
      if (!w) return;
      const veces = tokens.filter((t) => t === w).length;
      if (veces >= n) return;
      const parecida = tokens.find((t) => t.startsWith(w) || (w.startsWith(t) && t.length >= 4));
      const motivo = veces ? `aparece ${veces} vez/veces, no ${n}` : parecida ? `no está literal (¿"${parecida}"?)` : 'no está en el texto de esta línea';
      ctx.addIssue({ code: 'custom', path: base, message: `la palabra "${p}" ${motivo}` });
    });
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

/** v2: una capa raster del mapa (preparar-frontera baja varias: relieve regional + Sentinel-2 en los planos cercanos). */
export const FondoCapa = FondoResuelto.extend({
  /** Zoom para el que se pidió (se funde al acercarse la cámara a ese zoom). */
  zoom: z.number(),
  /** Grados por píxel del recorte (más chico = más detalle; se dibuja encima). */
  gradosPx: z.number(),
});
export type FondoCapa = z.infer<typeof FondoCapa>;

/** Anillos [lon, lat] de polígonos; cada polígono = [exterior, ...huecos]. */
export type Poligonos = [number, number][][][];
/** v2: geometría de Natural Earth 1:10 M recortada a lo que muestra el video (la escribe preparar-frontera). */
export type GeoRecortado = {
  caja: [number, number, number, number];
  tierra: Poligonos;
  bordes: [number, number][][];
  paises: Record<string, Poligonos>;
};
