import React, { useMemo } from 'react';
import { spring, useVideoConfig } from 'remotion';
import { FORMATO, PALETA, TIPO, fondoAlfa } from '../../marca/tokens';
import { indicePalabraActual, normalizar, type LineaTiempo, type Palabra } from './plan';
import { ZONA } from './disposicion';

/** Agrupa palabras en páginas cortas (≤ 5 palabras / ≤ 27 letras, corta en punto y en coma larga): casi siempre una sola línea. */
const paginar = (palabras: Palabra[]) => {
  const paginas: { desde: number; hasta: number }[] = [];
  let desde = 0;
  let letras = 0;
  for (let i = 0; i < palabras.length; i++) {
    const l = palabras[i].texto.length;
    const n = i - desde;
    const termino = /[.!?…;:]$/.test(palabras[i - 1]?.texto ?? '') || (n >= 3 && /,$/.test(palabras[i - 1]?.texto ?? ''));
    if (n > 0 && (n >= 5 || letras + l > 27 || termino)) { paginas.push({ desde, hasta: i }); desde = i; letras = 0; }
    letras += l + 1;
  }
  paginas.push({ desde, hasta: palabras.length });
  return paginas;
};

/**
 * Subtítulos palabra a palabra en el tercio superior: la palabra que suena va en amarillo (con un
 * golpe leve de escala), las dichas en blanco, las que vienen en blanco tenue. `resaltar` = índices
 * que quedan en amarillo después de dichas (la palabra del rótulo).
 */
export const Subtitulos: React.FC<{ linea: LineaTiempo; frameLocal: number; resaltar?: number[] }> = ({ linea, frameLocal, resaltar = [] }) => {
  const { fps } = useVideoConfig();
  const t = frameLocal / fps;
  const paginas = useMemo(() => paginar(linea.palabras), [linea]);
  const actual = indicePalabraActual(linea.palabras, t);
  // Después de la última palabra la página final se queda (no se vacía la caja).
  let idx = paginas.findIndex((p) => actual < p.hasta);
  if (idx < 0) idx = paginas.length - 1;
  const pagina = paginas[idx];
  const inicioPagina = Math.round(linea.palabras[pagina.desde].inicio * fps);
  const entrada = idx === 0 ? 1 : spring({ frame: frameLocal - inicioPagina, fps, config: { damping: 16, stiffness: 240 } });
  return (
    <div style={{
      position: 'absolute', left: FORMATO.seguro.lados, right: FORMATO.seguro.lados, top: ZONA.subtitulos.top, height: ZONA.subtitulos.alto,
      display: 'flex', justifyContent: 'center', alignItems: 'flex-start', pointerEvents: 'none',
    }}>
      <div style={{
        transform: `scale(${0.95 + 0.05 * entrada})`, opacity: Math.min(1, 0.35 + entrada),
        background: fondoAlfa(0.78), borderRadius: 22, padding: '16px 30px', maxWidth: 940,
        display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2px 16px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.45)',
        fontFamily: TIPO.texto, fontWeight: 800, fontSize: 54, lineHeight: 1.22, letterSpacing: -0.5,
      }}>
        {linea.palabras.slice(pagina.desde, pagina.hasta).map((p, k) => {
          const i = pagina.desde + k;
          const esActual = i === actual;
          const dicha = i < actual;
          const tau = t - p.inicio;
          const golpe = esActual && tau >= 0 && tau < 0.24 ? Math.sin((Math.PI * tau) / 0.24) : 0;
          const encendida = esActual || (dicha && resaltar.includes(i));
          return (
            <span key={`${i}-${normalizar(p.texto)}`} style={{
              display: 'inline-block', transform: `scale(${1 + Math.min(0.08, 20 / (p.texto.length * 30)) * golpe})`,
              color: encendida ? PALETA.amarillo : dicha ? PALETA.tinta : PALETA.tintaSuave,
              opacity: esActual || dicha ? 1 : 0.7,
            }}>{p.texto}</span>
          );
        })}
      </div>
    </div>
  );
};
