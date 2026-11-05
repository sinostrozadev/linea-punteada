/**
 * Tarjeta de título del frame 0 (0,9 s) para `lugar` y `ruta`, con el mismo diseño que la de frontera
 * (frontera/TarjetaTitulo.tsx, que está atada a su Mapa): arriba un mapa chico (lo dibuja la plantilla como
 * `children`, en una caja de 1080×ALTO_MAPA_TITULO), regla de acento y la pregunta en 2–3 líneas condensadas con la
 * palabra clave en acento. Entera desde el primer cuadro. Candidato a comun/ (con el mapa como children).
 */
import React from 'react';
import { FORMATO, PALETA, TIPO } from '../../../marca/tokens';
import { Icono } from '../../comun/Icono';

export const ALTO_MAPA_TITULO = 1180;

/** Parte la pregunta en 1–3 líneas parejas (≤ ~18 letras por línea). */
const partir = (texto: string): string[] => {
  const palabras = texto.split(/\s+/);
  const total = texto.length;
  const n = total <= 18 ? 1 : total <= 34 ? 2 : 3;
  const objetivo = total / n;
  const out: string[] = [];
  let actual = '';
  for (const w of palabras) {
    if (actual && actual.length + w.length + 1 > objetivo + 4 && out.length < n - 1) { out.push(actual); actual = w; }
    else actual = actual ? `${actual} ${w}` : w;
  }
  if (actual) out.push(actual);
  return out;
};

export const TarjetaTituloBase: React.FC<{ texto: string; clave?: string; acento: string; t: number; icono?: string; children: React.ReactNode }> = ({ texto, clave, acento, t, icono, children }) => {
  const claves = new Set((clave ?? '').toUpperCase().split(/\s+/).filter(Boolean).map((w) => w.replace(/[¿?¡!,.]/g, '')));
  const lineas = partir(texto.toUpperCase());
  const fs = Math.min(118, 1500 / Math.max(...lineas.map((l) => l.length), 8));
  return (
    <div style={{ position: 'absolute', inset: 0, background: PALETA.fondo }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: FORMATO.ancho, height: ALTO_MAPA_TITULO, overflow: 'hidden' }}>
        {children}
        {icono && (
          <div style={{ position: 'absolute', right: 120, top: 330, transform: `rotate(-10deg) scale(${1 + 0.04 * Math.sin(t * 6)})` }}>
            <Icono nombre={icono} tamano={170} acento={acento} />
          </div>
        )}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: ALTO_MAPA_TITULO - 260, height: 262, background: `linear-gradient(180deg, rgba(11,29,46,0) 0%, ${PALETA.fondo} 92%)` }} />
      <div style={{ position: 'absolute', left: 90, right: 90, top: ALTO_MAPA_TITULO - 20, height: 8, borderRadius: 4, background: acento, boxShadow: `0 0 18px ${acento}88` }} />
      <div style={{ position: 'absolute', left: 50, right: 50, top: ALTO_MAPA_TITULO + 34, textAlign: 'center', fontFamily: TIPO.condensadaPeso, fontWeight: 700, fontSize: fs, lineHeight: 1.04, color: PALETA.tinta, letterSpacing: 0.5 }}>
        {lineas.map((l, i) => (
          <div key={i}>{l.split(' ').map((w, k) => (
            <span key={k} style={{ color: claves.has(w.replace(/[¿?¡!,.]/g, '')) ? acento : PALETA.tinta }}>{k ? ' ' : ''}{w}</span>
          ))}</div>
        ))}
      </div>
    </div>
  );
};
