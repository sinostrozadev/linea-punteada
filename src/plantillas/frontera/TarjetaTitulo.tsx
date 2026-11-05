import React from 'react';
import { FORMATO, PALETA, TIPO } from '../../marca/tokens';
import { Icono } from '../comun/Icono';
import { Mapa, Pin, type Fondo } from './Mapa';
import type { GeoRecortado, MapaFrontera } from './guion';
import type { EstadoCamara, Visual } from './visual';

const ALTO_MAPA = 1180;

/**
 * Tarjeta de título del frame 0 (0,9 s, como Ñerd): arriba un mapa chico con el contorno de los países y los
 * pines del guion; una regla de acento y la pregunta en 2–3 líneas condensadas con la palabra clave en acento.
 * Se ve ENTERA desde el primer cuadro (sin fundido); el mapa se acerca apenas para que nada quede quieto.
 */
export const TarjetaTitulo: React.FC<{
  texto: string; clave?: string; cam: EstadoCamara; t: number; mapa: MapaFrontera; fondos: Fondo[]; geo?: GeoRecortado; vis: Visual; acento: string;
  paises?: string[]; pines?: { lon: number; lat: number; texto: string }[]; icono?: string;
}> = ({ texto, clave, cam, t, mapa, fondos, geo, vis, acento, paises, pines = [], icono }) => {
  const camT = { ...cam, zoom: cam.zoom + 0.12 * (t / 0.9) };
  const claves = new Set((clave ?? '').toUpperCase().split(/\s+/).filter(Boolean).map((w) => w.replace(/[¿?¡!,.]/g, '')));
  const lineas = partir(texto.toUpperCase());
  const fs = Math.min(118, 1500 / Math.max(...lineas.map((l) => l.length), 8));
  return (
    <div style={{ position: 'absolute', inset: 0, background: PALETA.fondo }}>
      <Mapa mapa={mapa} fondos={fondos} geo={geo} vis={vis} t={t} cam={camT} acento={acento} ancho={FORMATO.ancho} alto={ALTO_MAPA} soloBase paisesContorno={paises}>
        <PinesTitulo pines={pines} cam={camT} />
        {icono && (
          <div style={{ position: 'absolute', right: 120, top: 330, transform: `rotate(-10deg) scale(${1 + 0.04 * Math.sin(t * 6)})` }}>
            <Icono nombre={icono} tamano={170} acento={acento} />
          </div>
        )}
      </Mapa>
      <div style={{ position: 'absolute', left: 0, right: 0, top: ALTO_MAPA - 260, height: 262, background: `linear-gradient(180deg, rgba(11,29,46,0) 0%, ${PALETA.fondo} 92%)` }} />
      <div style={{ position: 'absolute', left: 90, right: 90, top: ALTO_MAPA - 20, height: 8, borderRadius: 4, background: acento, boxShadow: `0 0 18px ${acento}88` }} />
      <div style={{ position: 'absolute', left: 50, right: 50, top: ALTO_MAPA + 34, textAlign: 'center', fontFamily: TIPO.condensadaPeso, fontWeight: 700, fontSize: fs, lineHeight: 1.04, color: PALETA.tinta, letterSpacing: 0.5 }}>
        {lineas.map((l, i) => (
          <div key={i}>{l.split(' ').map((w, k) => (
            <span key={k} style={{ color: claves.has(w.replace(/[¿?¡!,.]/g, '')) ? acento : PALETA.tinta }}>{k ? ' ' : ''}{w}</span>
          ))}</div>
        ))}
      </div>
    </div>
  );
};

/** Parte la pregunta en 2–3 líneas parejas (≤ 18 letras por línea). */
const partir = (texto: string): string[] => {
  const palabras = texto.split(/\s+/);
  const total = texto.length;
  const n = total <= 18 ? 1 : total <= 34 ? 2 : 3;
  const objetivo = total / n;
  const out: string[] = [];
  let actual = '';
  for (const w of palabras) {
    if (actual && (actual.length + w.length + 1 > objetivo + 4) && out.length < n - 1) { out.push(actual); actual = w; }
    else actual = actual ? `${actual} ${w}` : w;
  }
  if (actual) out.push(actual);
  return out;
};

/** Pines sobre el mapa chico (proyección equirectangular igual a la del Mapa). */
const PinesTitulo: React.FC<{ pines: { lon: number; lat: number; texto: string }[]; cam: EstadoCamara }> = ({ pines, cam }) => {
  const k = (256 * Math.pow(2, cam.zoom)) / 360; // px por grado (equirectangular)
  return (
    <>
      {pines.map((p, i) => {
        const x = FORMATO.ancho / 2 + (p.lon - cam.centro[0]) * k;
        const y = ALTO_MAPA / 2 - (p.lat - cam.centro[1]) * k;
        return <Pin key={i} x={x} y={y} texto={p.texto} e={1} o={1} escala={0.9} />;
      })}
    </>
  );
};
