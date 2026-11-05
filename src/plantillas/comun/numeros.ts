/**
 * Lectura en español de las cifras de un guion (módulo puro): sirve para saber CUÁNTAS palabras habladas
 * ocupa un token como "437" o "3,5" y repartir bien el tiempo de la voz entre los tokens visibles.
 */
const UNIDADES = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte', 'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve'];
const DECENAS = ['', '', '', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
const CENTENAS = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

const menorQueMil = (n: number): string => {
  if (n < 30) return UNIDADES[n];
  if (n < 100) return DECENAS[Math.floor(n / 10)] + (n % 10 ? ' y ' + UNIDADES[n % 10] : '');
  if (n === 100) return 'cien';
  return CENTENAS[Math.floor(n / 100)] + (n % 100 ? ' ' + menorQueMil(n % 100) : '');
};

/** Entero 0–999.999.999 en palabras ("un millón", "dos mil", "cuatrocientos treinta y siete"). */
export const enteroAPalabras = (n: number): string => {
  if (!Number.isInteger(n) || n < 0 || n > 999_999_999) return String(n);
  if (n === 0) return 'cero';
  const partes: string[] = [];
  const millones = Math.floor(n / 1_000_000);
  const miles = Math.floor((n % 1_000_000) / 1000);
  const resto = n % 1000;
  if (millones) partes.push(millones === 1 ? 'un millón' : `${millones % 1000 === 1 ? 'un' : menorQueMilApocopado(millones)} millones`);
  if (miles) partes.push(miles === 1 ? 'mil' : `${menorQueMilApocopado(miles)} mil`);
  if (resto) partes.push(menorQueMil(resto));
  return partes.join(' ');
};

/** "uno" → "un" delante de mil/millones ("veintiún mil", "treinta y un mil"). */
const menorQueMilApocopado = (n: number): string => menorQueMil(n).replace(/veintiuno$/, 'veintiún').replace(/\buno$/, 'un');

const UNIDADES_MEDIDA: Record<string, string> = { km: 'kilómetros', m: 'metros', cm: 'centímetros', mm: 'milímetros', kg: 'kilos', g: 'gramos', ha: 'hectáreas', s: 'segundos', h: 'horas', min: 'minutos', mi: 'millas', 'km2': 'kilómetros cuadrados', 'km²': 'kilómetros cuadrados', 'm²': 'metros cuadrados', 'm2': 'metros cuadrados' };

/** ¿El token lleva alguna cifra? */
export const esNumerico = (token: string) => /\d/.test(token);

const decimalesAPalabras = (d: string) => {
  const ceros = d.match(/^0*/)![0].length;
  const resto = d.slice(ceros);
  return [...Array(ceros).fill('cero'), ...(resto ? [enteroAPalabras(Number(resto))] : [])].join(' ');
};

/** Una sola cifra: "17.000" (miles con punto), "3,5" (decimal con coma), "1864". */
const cifraAPalabras = (c: string): string => {
  if (/^\d{1,3}(\.\d{3})+$/.test(c)) return enteroAPalabras(Number(c.replace(/\./g, '')));
  const m = c.match(/^(\d+)[,.](\d+)$/);
  if (m) return `${enteroAPalabras(Number(m[1]))} coma ${decimalesAPalabras(m[2])}`;
  if (/^\d+$/.test(c)) return enteroAPalabras(Number(c));
  return c;
};

/**
 * Cómo lee la voz un token con cifras. Cubre enteros, miles con punto, decimales con coma, porcentajes,
 * unidades pegadas ("80km"), rangos ("1914-1918") y horas ("8:20"). Sin cifras devuelve el token tal cual.
 */
export const numeroAPalabras = (token: string): string => {
  const limpio = token.replace(/^[^\d\p{L}%]+|[^\d\p{L}%²]+$/gu, '');
  if (!esNumerico(limpio)) return token;
  const partes = limpio.split(/[-–—:/]/).filter(Boolean);
  if (partes.length > 1) return partes.map(numeroAPalabras).join(' ');
  const m = limpio.match(/^(\d[\d.,]*)\s*(%|[\p{L}²0-9]*)$/u);
  if (!m) return limpio;
  let texto = cifraAPalabras(m[1].replace(/[.,]$/, ''));
  const u = m[2].toLowerCase();
  if (u === '%') texto += ' por ciento';
  else if (u) texto += ' ' + (UNIDADES_MEDIDA[u] ?? u);
  return texto;
};

/** Palabras habladas que se espera que ocupe un token (1 para una palabra común). */
export const palabrasDeLectura = (token: string) => (esNumerico(token) ? numeroAPalabras(token).split(/\s+/).filter(Boolean).length : 1);

/** Peso de duración de un token: caracteres de lo que realmente se dice (cifras leídas, no escritas). */
export const pesoDeLectura = (token: string) => (esNumerico(token) ? numeroAPalabras(token) : token).replace(/[^\p{L}\d]/gu, '').length;
