import React, { useMemo } from 'react';
import { useVideoConfig } from 'remotion';
import { FORMATO, PALETA, TIPO } from '../../marca/tokens';
import { indicePalabraActual, normalizar, type LineaTiempo, type Palabra } from './plan';

/** Palabras que no conviene dejar colgando al final de un bloque. */
const DEBILES = new Set(['de', 'del', 'la', 'el', 'los', 'las', 'un', 'una', 'y', 'e', 'o', 'a', 'en', 'que', 'por', 'con', 'su', 'sus', 'al', 'lo', 'se', 'ni']);
const MAX_PALABRAS = 4;
const MAX_LETRAS = 21;

/** ¿La palabra i abre frase? (primera o la anterior termina en . ? ! :) */
const abreFrase = (p: Palabra[], i: number) => i === 0 || /[.?!:…]["»”)]*$/.test(p[i - 1].texto);
const esPropia = (p: Palabra[], i: number) => /^[¿¡"«]?[A-ZÁÉÍÓÚÑ]/.test(p[i].texto) && !abreFrase(p, i);

/**
 * Agrupa las palabras en unidades indivisibles (nombres propios de varias palabras: "El Paso", "Punto
 * Concordia", "Hito 1", "Corte Internacional de Justicia" se cortan como máximo en 4).
 */
const unidades = (p: Palabra[]): [number, number][] => {
  const out: [number, number][] = [];
  let i = 0;
  while (i < p.length) {
    let j = i + 1;
    const propia = /^[¿¡"«]?[A-ZÁÉÍÓÚÑ]/.test(p[i].texto);
    while (propia && j < p.length && j - i < 3 && !/[.,;:?!…]["»”)]*$/.test(p[j - 1].texto) &&
      (esPropia(p, j) || /^\d/.test(p[j].texto) || (['de', 'del'].includes(p[j].texto.toLowerCase()) && j + 1 < p.length && esPropia(p, j + 1)))) j++;
    out.push([i, j]);
    i = j;
  }
  return out;
};

/** Bloques de 2–4 palabras cortados por frase/ritmo, sin partir nombres propios ni dejar artículos colgando. */
export const bloquesDe = (p: Palabra[]): { desde: number; hasta: number }[] => {
  const us = unidades(p);
  const bloques: { desde: number; hasta: number }[] = [];
  let actual: [number, number][] = [];
  const letras = (u: [number, number][]) => u.reduce((s, [a, b]) => s + p.slice(a, b).reduce((x, w) => x + w.texto.length + 1, 0), 0);
  const cerrar = () => { if (actual.length) bloques.push({ desde: actual[0][0], hasta: actual[actual.length - 1][1] }); actual = []; };
  for (let k = 0; k < us.length; k++) {
    const u = us[k];
    const nPal = actual.reduce((s, [a, b]) => s + b - a, 0) + (u[1] - u[0]);
    if (actual.length && (nPal > MAX_PALABRAS || letras([...actual, u]) > MAX_LETRAS)) {
      // Si el bloque terminaría en palabra débil, se la pasa al siguiente.
      const ult = actual[actual.length - 1];
      if (actual.length > 1 && ult[1] - ult[0] === 1 && DEBILES.has(p[ult[0]].texto.toLowerCase())) { actual.pop(); cerrar(); actual.push(ult); }
      else cerrar();
    }
    actual.push(u);
    const fin = p[u[1] - 1].texto;
    const nAhora = actual.reduce((s, [a, b]) => s + b - a, 0);
    if (/[.;:?!…]["»”)]*$/.test(fin) || (/,$/.test(fin) && nAhora >= 2)) cerrar();
  }
  cerrar();
  return bloques;
};

type Props = {
  linea: LineaTiempo;
  frameLocal: number;
  /** Palabras (normalizadas) que van en color de acento cuando no son la actual. */
  claves?: string[];
  acento?: string;
  /** Centro vertical en px (por defecto 62 % de la altura). */
  centroY?: number;
  fuente?: 'bebas' | 'oswald';
};

/**
 * Subtítulos estilo Ñerd (frontera v2): 2–4 palabras por bloque, mayúsculas condensadas, blancas con sombra y
 * SIN pastilla, al ~62 % de la altura; la palabra que suena va en una caja de acento redondeada con texto
 * oscuro; las palabras clave (cifras, nombres) quedan en acento. Cambian cada 0,6–1 s con la voz.
 */
export const SubtitulosBloque: React.FC<Props> = ({ linea, frameLocal, claves = [], acento = PALETA.amarillo, centroY = Math.round(FORMATO.alto * 0.62), fuente = 'bebas' }) => {
  const { fps } = useVideoConfig();
  const t = frameLocal / fps;
  const bloques = useMemo(() => bloquesDe(linea.palabras), [linea]);
  const actual = indicePalabraActual(linea.palabras, t);
  if (actual < 0 || !bloques.length) return null;
  let idx = bloques.findIndex((b) => actual < b.hasta);
  if (idx < 0) idx = bloques.length - 1;
  const b = bloques[idx];
  const inicio = linea.palabras[b.desde].inicio;
  const pop = Math.min(1, Math.max(0, (t - inicio) / 0.1));
  const palabras = linea.palabras.slice(b.desde, b.hasta);
  const largo = palabras.reduce((s, w) => s + w.texto.length + 1, 0);
  const bebas = fuente === 'bebas';
  const fs = Math.min(bebas ? 100 : 82, (bebas ? 1900 : 1500) / Math.max(8, largo));
  const claveSet = new Set(claves);
  return (
    <div style={{ position: 'absolute', left: 40, right: 40, top: centroY - fs * 0.7, height: fs * 1.4, display: 'flex', justifyContent: 'center', alignItems: 'center', pointerEvents: 'none' }}>
      <div style={{
        display: 'flex', gap: `0 ${fs * 0.24}px`, alignItems: 'center', transform: `scale(${0.92 + 0.08 * pop})`,
        fontFamily: bebas ? TIPO.condensada : TIPO.condensadaPeso, fontWeight: bebas ? 400 : 700, fontSize: fs, lineHeight: 1, letterSpacing: bebas ? 1.5 : 0.5,
        textTransform: 'uppercase', whiteSpace: 'nowrap',
      }}>
        {palabras.map((w, k) => {
          const i = b.desde + k;
          const esActual = i === actual || (i > actual && k === 0 && actual < b.desde);
          const n = normalizar(w.texto);
          const texto = w.texto.replace(/[,;:]$/, '');
          if (esActual) {
            const golpe = Math.min(1, Math.max(0, (t - w.inicio) / 0.08));
            return (
              <span key={i} style={{
                background: acento, color: PALETA.fondo, borderRadius: fs * 0.16, padding: `${fs * 0.06}px ${fs * 0.14}px ${fs * 0.02}px`,
                transform: `scale(${1.08 - 0.08 * golpe})`, boxShadow: '0 6px 18px rgba(0,0,0,0.45)', display: 'inline-block',
              }}>{texto}</span>
            );
          }
          return (
            <span key={i} style={{
              color: claveSet.has(n) ? acento : PALETA.tinta, display: 'inline-block',
              textShadow: '0 0 3px rgba(0,0,0,0.95), 0 3px 10px rgba(0,0,0,0.85), 0 0 22px rgba(0,0,0,0.5)',
            }}>{texto}</span>
          );
        })}
      </div>
    </div>
  );
};
