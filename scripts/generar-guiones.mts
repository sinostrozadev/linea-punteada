/**
 * Genera guiones nuevos para el backlog usando `claude -p` (Claude Code con la suscripción de Santiago;
 * nunca la API de Anthropic).
 *
 *   npx tsx scripts/generar-guiones.mts [--plantilla frontera|lugar|ruta] [--n 5] [--modelo X]
 *                                        [--schema <archivo>] [--dry-run] [--mostrar-prompt]
 *
 * System prompt = docs/GUION.md (la fórmula y el estilo del canal, lo escribe Fable; si falta, se usa un
 * resumen mínimo y se avisa). Mensaje = el schema zod COMPARTIDO (src/plantillas/comun/guion.ts) + el de
 * la plantilla (src/plantillas/<p>/guion.ts) tal cual, la forma del envoltorio, 2 guiones de ejemplo, los
 * títulos ya usados y las reglas duras. Se pide SOLO un array JSON; se parsea con tolerancia, se valida con
 * el schema zod real (Guion<P> y Envoltorio<P>: fórmula, 300–480 palabras, índices del mapa) y cada guion
 * queda en contenido/backlog/<plantilla>-<slug>.json con id `pendiente-<plantilla>-<slug>` (el diario lo
 * renombra a `<fecha>-<plantilla>-<slug>` al promoverlo). Si faltan guiones válidos, se reintenta una vez
 * contándole a Claude por qué se descartaron.
 */
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';
import { z } from 'zod';
import {
  DIR_BACKLOG, RAIZ, PLANTILLAS, GuionSchema, asegurarDirectorios, capitalizar, cargarCalendario,
  correr, escribirJson, leerBacklog, leerBandeja, leerGuiones, slugificar, type Guion, type Plantilla,
} from './lib/operacion.mjs';

const { values: opc } = parseArgs({
  args: process.argv.slice(2),
  options: {
    plantilla: { type: 'string' },
    n: { type: 'string', default: '5' },
    modelo: { type: 'string' },
    schema: { type: 'string' },
    'dry-run': { type: 'boolean', default: false },
    'mostrar-prompt': { type: 'boolean', default: false },
  },
});

const rel = (p: string) => path.relative(RAIZ, p);

// ---------------------------------------------------------------- schema
/** Texto del schema zod de la plantilla, leído tal cual del código fuente. */
export const textoSchema = (plantilla: Plantilla): { ruta: string; texto: string } | null => {
  const ruta = path.join(RAIZ, 'src', 'plantillas', plantilla, 'guion.ts');
  if (!fs.existsSync(ruta)) return null;
  const propio = fs.readFileSync(ruta, 'utf8');
  if (!new RegExp(`Guion${capitalizar(plantilla)}`).test(propio)) return null;
  // El contrato común (gancho, escenas, remate, fuentes, reglas de la fórmula) va primero.
  const comun = fs.readFileSync(path.join(RAIZ, 'src', 'plantillas', 'comun', 'guion.ts'), 'utf8');
  return { ruta, texto: `// ===== src/plantillas/comun/guion.ts =====\n${comun}\n\n// ===== src/plantillas/${plantilla}/guion.ts =====\n${propio}` };
};

interface Validadores { props: z.ZodTypeAny | null; envoltorio: z.ZodTypeAny | null }

/**
 * Importa (con tsx) el schema zod REAL de src/plantillas/<p>/guion.ts: `Guion<P>` valida los props y,
 * si la plantilla lo exporta, `Envoltorio<P>` valida el guion completo. Nunca lanza.
 */
const cargarValidadores = async (plantilla: Plantilla, ruta: string): Promise<Validadores> => {
  const esZod = (x: unknown): x is z.ZodTypeAny => !!x && typeof (x as z.ZodTypeAny).safeParse === 'function';
  try {
    const mod = (await import(pathToFileURL(ruta).href)) as Record<string, unknown>;
    const props = mod[`Guion${capitalizar(plantilla)}`];
    const envoltorio = mod[`Envoltorio${capitalizar(plantilla)}`];
    return { props: esZod(props) ? props : null, envoltorio: esZod(envoltorio) ? envoltorio : null };
  } catch (e) {
    console.error(`  (no pude importar el schema para validar props: ${(e as Error).message.split('\n')[0]})`);
    return { props: null, envoltorio: null };
  }
};

const problemas = (r: z.SafeParseReturnType<unknown, unknown>) =>
  r.success ? '' : r.error.issues.slice(0, 5).map((i) => `${i.path.join('.') || '(raíz)'}: ${i.message}`).join('; ');

// ---------------------------------------------------------------- prompt
const ARCHIVO_GUION = path.join(RAIZ, 'docs', 'GUION.md');

/** Respaldo si docs/GUION.md aún no existe (lo escribe Fable): la fórmula en una línea por paso. */
const GUION_MINIMO = `Eres el guionista de "Línea Punteada" (@lineapunteada), Shorts de geografía narrada en español de 2–3 minutos:
una historia completa sobre un mapa, contada desde el sur del mundo. Fórmula obligatoria: gancho visual imperativo
("Mira la frontera entre…") + lo raro + la pregunta → mito ("Dicen que…") → "La verdad es más rara." → mapa de ruta
("Todo se explica con dos cosas: X e Y.") → actos con la fuente nombrada en la voz ("según…") → "Y aquí está el giro: …"
→ hoy → remate simétrico de dos mitades espejo. Solo hechos verificables con fuente; cifras redondeadas en la voz.`;

const leerGuionMd = (): string => {
  if (fs.existsSync(ARCHIVO_GUION)) return fs.readFileSync(ARCHIVO_GUION, 'utf8');
  console.error('  ⚠ falta docs/GUION.md: uso el resumen mínimo de la fórmula como system prompt.');
  return GUION_MINIMO;
};

const REGLAS = `REGLAS DURAS (si no se cumplen, el guion se descarta):
- Valida contra el schema: 5–9 escenas, ≥ 1 "mito", exactamente 1 "giro" que empieza por "Y aquí está el giro", la última es "hoy",
  ≥ 1 escena con fuenteEnVoz: true (y la fuente dicha en el texto), 300–480 palabras habladas (gancho + escenas + remate).
- rotulo.dice es una palabra EXACTA del texto de esa escena. Rótulos de 1–3 palabras.
- Título ≤ 70 caracteres con contradicción explícita, casi siempre "¿Por qué…?". Nada de rankings ("Los 10…") ni "Descubren…".
- Mapa: coordenadas [lon, lat] reales y verificables; índices de escena 0-based (-1 = gancho); ninguna escena inexistente.
  A escala de ciudad (zoom ≥ 10) las líneas van con "puntos"; "fronteraEntre" solo a escala regional.
- imagen.buscar EN INGLÉS como los títulos de Wikimedia Commons; nunca personas vivas en primer plano ni logos.
- Temas sensibles (disputas activas): solo hechos con fuente, las dos versiones, cero opinión.
- descripcion SIN hashtags; hashtags 4–8 en minúsculas, siempre "#shorts". Nada "para niños".
- No repitas temas ni títulos de la lista de usados, ni los temas de Ñerd (Arizona, capital de Canadá, Chile largo y angosto, Hispaniola, Mongolia).`;

const construirPrompt = (plantilla: Plantilla, n: number, schema: string, rutaSchema: string, ejemplos: Guion[], usados: string[]) => `Genera ${n} guion(es) NUEVOS para la plantilla "${plantilla}" de Línea Punteada.

=== SCHEMA ZOD (${rutaSchema} + contrato común, tal cual) ===
Los "props" de cada guion deben validar contra Guion${capitalizar(plantilla)}; el envoltorio contra Envoltorio${capitalizar(plantilla)}:
\`\`\`ts
${schema}
\`\`\`

=== FORMA DEL GUION (envoltorio) ===
{ "plantilla": "${plantilla}", "id": "pendiente-${plantilla}-<slug>", "titulo": "...", "descripcion": "...", "hashtags": ["#shorts", ...], "props": { ...según el schema... } }
props.id lleva el mismo valor que el id del envoltorio. No incluyas campos que calcula el pipeline (duracionFrames, tiempos, imagenes, fondoMapa, creditos).

=== EJEMPLOS DE GUIONES EXISTENTES (${ejemplos.length}) ===
${ejemplos.length ? ejemplos.map((g) => JSON.stringify(g, null, 2)).join('\n\n') : '(aún no hay ejemplos: guíate por el schema)'}

=== TÍTULOS YA USADOS (no repetir ni parafrasear) ===
${usados.length ? usados.map((t) => `- ${t}`).join('\n') : '(ninguno)'}

${REGLAS}

RESPONDE SOLO con un array JSON válido de ${n} objeto(s) con la forma del envoltorio. Sin texto antes ni después, sin comentarios, sin bloque de código markdown.`;

// ---------------------------------------------------------------- claude
const llamarClaude = async (prompt: string): Promise<string> => {
  // docs/GUION.md va como system prompt (reemplaza el de Claude Code: aquí solo se escriben guiones).
  const args = ['-p', '--output-format', 'text', '--system-prompt', leerGuionMd()];
  if (opc.modelo) args.push('--model', opc.modelo);
  // El prompt va por stdin (puede ser largo); el argumento corto le dice qué hacer con él.
  args.push('Sigue las instrucciones del texto que recibes por stdin y responde exactamente lo que piden.');
  const r = await correr('claude', args, { silencioso: true, entrada: prompt, env: { CLAUDECODE: '' }, timeoutMs: 10 * 60_000 });
  if (r.codigo !== 0) throw new Error(`claude -p terminó con código ${r.codigo}: ${r.salida.slice(-500)}`);
  return r.salida;
};

/** Extrae el primer array JSON de un texto (tolera texto alrededor y cercos de código). */
export const extraerArray = (texto: string): unknown[] => {
  const sinCercos = texto.replace(/```(?:json)?/g, '');
  const ini = sinCercos.indexOf('[');
  const fin = sinCercos.lastIndexOf(']');
  if (ini < 0 || fin <= ini) throw new Error(`La respuesta no contiene un array JSON:\n${texto.slice(0, 400)}`);
  const candidato = sinCercos.slice(ini, fin + 1);
  try {
    let v: unknown;
    try {
      v = JSON.parse(candidato);
    } catch {
      // Tolerancia: comas colgantes antes de ] o } (error típico de los LLM).
      v = JSON.parse(candidato.replace(/,\s*([\]}])/g, '$1'));
    }
    if (!Array.isArray(v)) throw new Error('no es array');
    return v;
  } catch (e) {
    throw new Error(`No pude parsear el JSON (${(e as Error).message}):\n${candidato.slice(0, 400)}`);
  }
};

// ---------------------------------------------------------------- main
const elegirPlantilla = (): Plantilla => {
  if (opc.plantilla) {
    if (!(PLANTILLAS as readonly string[]).includes(opc.plantilla)) throw new Error(`Plantilla desconocida: ${opc.plantilla} (usa ${PLANTILLAS.join('|')})`);
    return opc.plantilla as Plantilla;
  }
  const backlog = leerBacklog();
  const conSchema = cargarCalendario().rotacion.filter((p) => textoSchema(p) !== null);
  if (conSchema.length === 0) throw new Error('Ninguna plantilla tiene schema zod todavía (src/plantillas/<p>/). Usa --plantilla X --schema <archivo> para probar.');
  return conSchema.map((p) => ({ p, n: backlog.filter((g) => g.plantilla === p).length })).sort((a, b) => a.n - b.n)[0].p;
};

const main = async () => {
  asegurarDirectorios();
  const n = Math.max(1, parseInt(opc.n ?? '5', 10) || 5);
  const plantilla = elegirPlantilla();

  let schema = opc.schema ? { ruta: path.resolve(opc.schema), texto: fs.readFileSync(path.resolve(opc.schema), 'utf8') } : textoSchema(plantilla);
  if (!schema) {
    throw new Error(`La plantilla "${plantilla}" aún no tiene schema zod (Guion${capitalizar(plantilla)}) en src/plantillas/${plantilla}/. Espera a que exista o pasa --schema <archivo>.`);
  }

  const existentes = [...leerGuiones(), ...leerBacklog()];
  // Ejemplos: preferir los guiones curados (contenido/guiones), que ya renderizaron, y luego el backlog.
  const ejemplos = [...leerGuiones(), ...leerBacklog()].filter((g) => g.plantilla === plantilla).slice(0, 2).map(({ ruta: _r, ...g }) => g);
  const usados = [...new Set([...existentes.map((g) => g.titulo), ...leerBandeja(true).map((e) => e.titulo)])];

  const prompt = construirPrompt(plantilla, n, schema.texto, rel(schema.ruta), ejemplos, usados);
  if (opc['mostrar-prompt']) console.log(prompt);
  console.log(`Generando ${n} guion(es) de "${plantilla}" con claude -p (${opc.modelo ?? 'modelo por defecto'}; prompt ${prompt.length} chars, ${ejemplos.length} ejemplos, ${usados.length} títulos usados)…`);
  if (opc['dry-run']) return console.log('[dry-run] no se llama a claude.');

  const validadores = opc.schema ? { props: null, envoltorio: null } : await cargarValidadores(plantilla, schema.ruta);
  if (!validadores.props) console.error('  ⚠ sin schema importable: solo se valida la forma del envoltorio.');

  let escritos = 0;
  const yaUsados = new Set(usados.map((t) => t.toLowerCase()));
  const rechazos: string[] = [];
  // Hasta 2 intentos: el segundo pide solo los que faltan y le cuenta a Claude qué falló.
  for (let intento = 1; intento <= 2 && escritos < n; intento++) {
    const faltan = n - escritos;
    const texto = intento === 1 ? prompt : construirPrompt(plantilla, faltan, schema.texto, rel(schema.ruta), ejemplos, [...yaUsados]) +
      `\n\nEn el intento anterior se descartaron guiones por: ${rechazos.slice(-6).join(' || ')}. Corrígelo.`;
    let crudos: unknown[];
    try {
      crudos = extraerArray(await llamarClaude(texto));
    } catch (e) {
      console.error(`  ✗ intento ${intento}: ${(e as Error).message.split('\n')[0]}`);
      rechazos.push((e as Error).message.split('\n')[0]);
      continue;
    }
    for (const crudo of crudos.slice(0, faltan)) {
      const r = GuionSchema.safeParse({ ...(crudo as object), plantilla });
      if (!r.success) { rechazos.push(`envoltorio: ${problemas(r)}`); console.error(`  ✗ descartado: ${problemas(r)}`); continue; }
      const g = r.data;
      g.titulo = g.titulo.trim();
      if (g.titulo.length > 70) { rechazos.push(`título de ${g.titulo.length} caracteres (>70): "${g.titulo}"`); console.error(`  ✗ título de ${g.titulo.length} chars (>70): "${g.titulo}"`); continue; }
      if (yaUsados.has(g.titulo.toLowerCase())) { rechazos.push(`título repetido: ${g.titulo}`); console.error(`  ✗ título repetido: ${g.titulo}`); continue; }
      g.hashtags = [...new Set(g.hashtags.map((h) => '#' + h.replace(/^#+/, '').replace(/\s+/g, '').toLowerCase()))].filter((h) => h.length > 1);
      if (!g.hashtags.includes('#shorts')) g.hashtags.unshift('#shorts');

      const slug = slugificar(g.titulo);
      let nombre = `${plantilla}-${slug}`;
      for (let k = 2; fs.existsSync(path.join(DIR_BACKLOG, `${nombre}.json`)); k++) nombre = `${plantilla}-${slug}-${k}`;
      g.id = `pendiente-${nombre}`;
      g.props = { ...g.props, id: g.id };

      if (validadores.props) {
        const v = validadores.props.safeParse(g.props);
        if (!v.success) { rechazos.push(`props: ${problemas(v)}`); console.error(`  ✗ props inválidos ("${g.titulo}"): ${problemas(v)}`); continue; }
      }
      if (validadores.envoltorio) {
        const v = validadores.envoltorio.safeParse(g);
        if (!v.success) { rechazos.push(`guion: ${problemas(v)}`); console.error(`  ✗ guion inválido ("${g.titulo}"): ${problemas(v)}`); continue; }
      }
      const destino = path.join(DIR_BACKLOG, `${nombre}.json`);
      escribirJson(destino, g);
      yaUsados.add(g.titulo.toLowerCase());
      escritos++;
      console.log(`  ✓ ${rel(destino)}  — ${g.titulo} (${g.titulo.length} chars)`);
    }
  }
  console.log(`${escritos}/${n} guion(es) escritos en ${rel(DIR_BACKLOG)}.`);
  if (escritos === 0) process.exitCode = 1;
};

main().catch((e) => {
  console.error(`✗ ${(e as Error).message}`);
  process.exit(1);
});
