/**
 * DIRECCIÓN VISUAL v2 para `lugar` y `ruta` (contrato). Reutiliza tal cual los esquemas de frontera v2
 * (Plano, Area, EtiquetaMapa, Cota, IconoMapa, TarjetaTitulo en src/plantillas/frontera/guion.ts) y los campos
 * no cartográficos de src/plantillas/comun/direccion.ts. Guía para guionistas: docs/DIRECCION-VISUAL.md.
 *
 * Vive aquí (y no en comun/) porque comun/ y frontera/ los pule otro agente: candidato a mudarse a
 * comun/direccionMapa.ts junto con el `DireccionMapa` de frontera (hoy privado en su guion.ts).
 */
import { z } from 'zod';
import { AcentoVideo, DireccionComun, ItemIndice } from '../../comun/direccion';
import { Area, Cota, EtiquetaMapa, IconoMapa, Plano, TarjetaTitulo } from '../../frontera/guion';

const LonLat = z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]);

/** Círculo de acento que marca un detalle ~1,6 s (igual que frontera). */
export const Resalte = z.object({
  lon: z.number().min(-180).max(180),
  lat: z.number().min(-90).max(90),
  radio: z.number().min(20).max(400).optional(),
  aparecerEn: z.union([z.string().min(1), z.number().min(0)]).optional(),
  duracionSeg: z.number().min(0.6).max(6).optional(),
});

/** Campos de dirección visual que puede llevar el gancho o cualquier escena de `lugar` / `ruta`. */
export const DireccionMapaV2 = {
  ...DireccionComun,
  planos: z.array(Plano).max(6).optional(),
  /** Máscaras: `pais` (Natural Earth 1:50 M, nombre en inglés) o `poligono` (franja solo con `linea` de puntos). */
  areas: z.array(Area).max(6).optional(),
  etiquetas: z.array(EtiquetaMapa).max(10).optional(),
  cotas: z.array(Cota).max(4).optional(),
  iconos: z.array(IconoMapa).max(6).optional(),
  resaltes: z.array(Resalte).max(3).optional(),
  /** Solo en `mapa-de-ruta`: índice de enumeración (ver frontera). */
  indice: z.array(ItemIndice).min(2).max(4).optional(),
  indicePosicion: z.enum(['fila', 'vertical-mapa']).optional(),
  indiceAncla: LonLat.optional(),
};

/** Campos v2 a nivel guion (todos opcionales: un guion v1 sigue validando). */
export const CamposV2 = {
  /** Acento del video (amarillo por defecto; cian o coral para variar). */
  acento: AcentoVideo.optional(),
  /** Tarjeta de título del frame 0 (0,9 s). Sin ella se usa `gancho.rotulo`. */
  tarjetaTitulo: TarjetaTitulo.optional(),
  /** Dos etiquetas sobre el mapa en el remate (1.ª al empezar, 2.ª en su segunda frase). */
  remateEtiquetas: z.array(z.object({ lon: z.number(), lat: z.number(), texto: z.string().max(28) })).max(2).optional(),
  /** Plano(s) del remate (si faltan, hereda el último). */
  rematePlanos: z.array(Plano).max(3).optional(),
};

type LineaV2 = { texto: string } & Partial<{ [K in keyof typeof DireccionMapaV2]: z.infer<(typeof DireccionMapaV2)[K]> }>;
type GuionV2 = { gancho: LineaV2; escenas: (LineaV2 & { tipo: string })[]; rematePlanos?: unknown[] };

const norm = (w: string) => w.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ñ]/g, '');

/** Reglas cruzadas v2 (las mismas que frontera): palabras que existen, índice solo en mapa-de-ruta, planos en el gancho. */
export const validarDireccionV2 = (g: GuionV2, ctx: z.RefinementCtx) => {
  const usaPlanos = g.escenas.some((e) => (e.planos ?? []).length) || (g.rematePlanos ?? []).length;
  if (usaPlanos && !(g.gancho.planos ?? []).length) ctx.addIssue({ code: 'custom', path: ['gancho', 'planos'], message: 'con dirección visual v2, el gancho debe declarar ≥ 1 plano' });
  [g.gancho, ...g.escenas].forEach((e, k) => {
    const base = k === 0 ? ['gancho'] : ['escenas', k - 1];
    (e.areas ?? []).forEach((a, i) => {
      if (typeof a.linea === 'string') ctx.addIssue({ code: 'custom', path: [...base, 'areas', i, 'linea'], message: 'en lugar/ruta la franja necesita `linea` como lista de puntos' });
    });
    if (e.indice && k > 0 && g.escenas[k - 1].tipo !== 'mapa-de-ruta') ctx.addIssue({ code: 'custom', path: [...base, 'indice'], message: 'el índice solo va en la escena mapa-de-ruta' });
    const sinLugar = (e.etiquetas ?? []).filter((x) => x.tipo !== 'contexto' && (x.lon === undefined || x.lat === undefined));
    if (sinLugar.length) ctx.addIssue({ code: 'custom', path: [...base, 'etiquetas'], message: 'las etiquetas (salvo contexto) necesitan lon y lat' });
    const palabras = [
      e.contexto?.dice, e.fuente?.dice, e.foto?.aparecerEn, e.polaroid?.aparecerEn,
      ...(e.planos ?? []).map((p) => p.en), ...(e.areas ?? []).flatMap((a) => [a.aparecerEn, a.desaparecerEn]),
      ...(e.etiquetas ?? []).flatMap((a) => [a.aparecerEn, a.desaparecerEn]), ...(e.cotas ?? []).flatMap((a) => [a.aparecerEn, a.desaparecerEn]),
      ...(e.iconos ?? []).flatMap((a) => [a.aparecerEn, a.desaparecerEn]), ...(e.tarjetas ?? []).map((t) => t.aparecerEn),
      ...(e.indice ?? []).map((t) => t.dice), ...(e.resaltes ?? []).map((t) => t.aparecerEn),
    ].filter((p): p is string => typeof p === 'string');
    const tokens = e.texto.split(/\s+/).map(norm);
    palabras.forEach((p) => {
      const w = norm(p.replace(/#\d+$/, ''));
      if (w && !tokens.some((t) => t === w || (w.length >= 4 && t.startsWith(w)))) ctx.addIssue({ code: 'custom', path: base, message: `la palabra "${p}" no está en el texto de esta línea` });
    });
  });
};
