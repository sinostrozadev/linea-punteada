/**
 * Capas de pantalla propias del `largo` 16:9 (lo que en el Short está posicionado para 1080×1920): tarjeta de título,
 * tarjeta de capítulo, barra de capítulo, subtítulos en bloques a tamaño 16:9, crédito de foto, cierre con pie de
 * serie y fundido. Todo depende del segundo `t`: determinista.
 */
import React from 'react';
import { interpolate, spring } from 'remotion';
import { MARCA, PALETA, TIPO, fondoAlfa } from '../../marca/tokens';
import type { ImagenResuelta } from '../comun/guion';
import type { LineaTiempo } from '../comun/plan';
import { SubtitulosBloque } from '../comun/SubtitulosBloque';
import { LARGO, type CapituloEnTiempo } from './modelo';

const FPS = LARGO.fps;
const sombra = '0 0 3px rgba(0,0,0,0.95), 0 4px 14px rgba(0,0,0,0.8)';
const resorte = (t: number, desde: number, config = { damping: 14, stiffness: 170 }) => spring({ frame: Math.round((t - desde) * FPS), fps: FPS, config });
const ventana = (t: number, desde: number, hasta: number, entra = 0.35, sale = 0.35) =>
  Math.min(interpolate(t, [desde, desde + entra], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }), interpolate(t, [hasta - sale, hasta], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));

/** Texto con las palabras de `clave` en acento. */
const ConClave: React.FC<{ texto: string; clave?: string; acento: string }> = ({ texto, clave, acento }) => {
  const limpia = (w: string) => w.replace(/[¿?¡!,.:;]/g, '').toUpperCase();
  const claves = new Set((clave ?? '').split(/\s+/).filter(Boolean).map(limpia));
  return <>{texto.toUpperCase().split(' ').map((w, k) => <span key={k} style={{ color: claves.has(limpia(w)) ? acento : PALETA.tinta }}>{k ? ' ' : ''}{w}</span>)}</>;
};

/** Tarjeta de título (sin voz, TITULO_SEG): el mapa sigue detrás, oscurecido; la pregunta grande al centro. */
export const TarjetaTituloLargo: React.FC<{ texto: string; clave?: string; acento: string; t: number; desde: number; hasta: number }> = ({ texto, clave, acento, t, desde, hasta }) => {
  if (t < desde || t >= hasta) return null;
  const o = ventana(t, desde, hasta, 0.3, 0.4);
  const e = resorte(t, desde);
  const largo = texto.length;
  const fs = largo <= 22 ? 132 : largo <= 36 ? 112 : 96;
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: o }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(11,29,46,0.55) 0%, rgba(11,29,46,0.88) 100%)' }} />
      <div style={{ position: 'absolute', left: 200, right: 200, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: TIPO.condensadaPeso, fontWeight: 700, fontSize: fs, lineHeight: 1.04, textAlign: 'center', letterSpacing: 0.5, textShadow: sombra, transform: `scale(${0.94 + 0.06 * e})`, textWrap: 'balance' } as React.CSSProperties}>
          <ConClave texto={texto} clave={clave} acento={acento} />
        </div>
        <div style={{ marginTop: 34, width: 520 * Math.min(1, e), height: 8, borderRadius: 4, background: acento, boxShadow: `0 0 18px ${acento}88` }} />
      </div>
    </div>
  );
};

/** Tarjeta de capítulo (PAUSA_CAPITULO, sin voz): "CAPÍTULO 2" + nombre, a la izquierda, sobre el mapa velado. */
export const TarjetaCapitulo: React.FC<{ cap: CapituloEnTiempo; total: number; acento: string; t: number }> = ({ cap, total, acento, t }) => {
  if (cap.n < 2 || t < cap.desde || t >= cap.voz + 0.25) return null;
  const o = ventana(t, cap.desde, cap.voz + 0.25, 0.3, 0.45);
  const e = resorte(t, cap.desde);
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: o }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(11,29,46,0.9) 0%, rgba(11,29,46,0.55) 55%, rgba(11,29,46,0.2) 100%)' }} />
      <div style={{ position: 'absolute', left: 160, top: 360, transform: `translateX(${(1 - e) * -60}px)` }}>
        <div style={{ fontFamily: TIPO.condensada, fontSize: 52, letterSpacing: 6, color: acento, textShadow: sombra }}>CAPÍTULO {cap.n} DE {total}</div>
        <div style={{ fontFamily: TIPO.condensadaPeso, fontWeight: 700, fontSize: 150, lineHeight: 1, color: PALETA.tinta, textShadow: sombra, textTransform: 'uppercase', marginTop: 6 }}>{cap.titulo}</div>
        <div style={{ marginTop: 26, width: 360 * Math.min(1, e), height: 8, borderRadius: 4, background: acento }} />
      </div>
    </div>
  );
};

/** Barra discreta arriba a la izquierda: segmentos por capítulo (el actual en acento) + "2/5 · NOMBRE". */
export const BarraCapitulo: React.FC<{ caps: CapituloEnTiempo[]; acento: string; t: number; desde: number; hasta: number }> = ({ caps, acento, t, desde, hasta }) => {
  if (t < desde || t >= hasta) return null;
  const reales = caps.filter((c) => c.n > 0);
  const actual = [...reales].reverse().find((c) => t >= c.desde) ?? reales[0];
  // Se esconde mientras está la tarjeta del capítulo (ya lo dice en grande).
  const enTarjeta = actual.n >= 2 && t < actual.voz + 0.25;
  const o = ventana(t, desde, hasta, 0.5, 0.5) * (enTarjeta ? interpolate(t, [actual.voz - 0.2, actual.voz + 0.25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 1);
  if (o <= 0.01) return null;
  return (
    <div style={{ position: 'absolute', left: LARGO.lados - 20, top: 36, opacity: o * 0.92, display: 'flex', alignItems: 'center', gap: 16, padding: '8px 18px 6px 14px', borderRadius: 10, background: fondoAlfa(0.62) }}>
      <div style={{ display: 'flex', gap: 5 }}>
        {reales.map((c) => {
          const p = c.n < actual.n ? 1 : c.n > actual.n ? 0 : Math.max(0, Math.min(1, (t - c.desde) / Math.max(1, c.hasta - c.desde)));
          return (
            <div key={c.n} style={{ width: 34, height: 6, borderRadius: 3, background: 'rgba(185,204,221,0.35)', overflow: 'hidden' }}>
              <div style={{ width: `${100 * p}%`, height: '100%', background: c.n === actual.n ? acento : PALETA.tintaSuave }} />
            </div>
          );
        })}
      </div>
      <div style={{ fontFamily: TIPO.condensada, fontSize: 30, letterSpacing: 2.5, color: PALETA.tinta, whiteSpace: 'nowrap' }}>
        <span style={{ color: acento }}>{actual.n}/{reales.length}</span> · {actual.titulo.toUpperCase()}
      </div>
    </div>
  );
};

/**
 * Subtítulos en bloques del Short (comun/SubtitulosBloque) a tamaño 16:9: se dibujan en un lienzo del doble y se
 * escalan a 0,5 (≈ 50 px), abajo y centrados entre x = 300 y x = 1620 (libre la esquina de las tarjetas finales).
 */
export const Subtitulos16x9: React.FC<{ linea: LineaTiempo; frameLocal: number; claves: string[]; acento: string }> = ({ linea, frameLocal, claves, acento }) => {
  const izq = 300, ancho = LARGO.ancho - 2 * izq;
  return (
    <div style={{ position: 'absolute', left: izq, top: 0, width: ancho * 2, height: LARGO.alto * 2, transform: 'scale(0.5)', transformOrigin: '0 0', pointerEvents: 'none' }}>
      <SubtitulosBloque linea={linea} frameLocal={frameLocal} claves={claves} acento={acento} centroY={LARGO.subY * 2} />
    </div>
  );
};

/** Desplaza un componente posicionado para 1080×1920 (Contador, TarjetaFuente) al lugar que le toca en 16:9. */
export const Mover: React.FC<{ dx: number; dy: number; children: React.ReactNode }> = ({ dx, dy, children }) => (
  <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transform: `translate(${dx}px, ${dy}px)`, pointerEvents: 'none' }}>{children}</div>
);

/** Crédito de la foto a pantalla completa (el de FotoCompleta queda fuera del cuadro 16:9). */
export const CreditoFoto: React.FC<{ imagen: ImagenResuelta; t: number; desde: number; hasta: number }> = ({ imagen, t, desde, hasta }) => {
  if (t < desde || t >= hasta) return null;
  const a = imagen.autor.length > 40 ? `${imagen.autor.slice(0, 38).trim()}…` : imagen.autor;
  return (
    <div style={{ position: 'absolute', left: LARGO.lados, bottom: LARGO.abajo + 8, fontFamily: TIPO.texto, fontWeight: 500, fontSize: 18, color: '#E6EEF5', opacity: 0.8, textShadow: '0 1px 4px #000' }}>
      Foto: {a} · {imagen.licencia} · Wikimedia Commons
    </div>
  );
};

/**
 * Cierre: tras el remate el mapa queda en calma `segundos` (tarjetas finales de YouTube); el globo crece y se va a la
 * mitad derecha (lo hace Largo.tsx). A la izquierda: la línea punteada que se dibuja, el nombre de la SERIE en grande y
 * debajo el teaser del próximo video (`pie`). La marca "Línea Punteada" va UNA vez, pequeña, abajo a la izquierda (sobre
 * la franja de 120 px). Libre la esquina 300×150 de abajo a la derecha. Fundido a negro en el último segundo.
 */
export const Cierre16x9: React.FC<{ t: number; desde: number; hasta: number; acento: string; serie?: string; pie?: string }> = ({ t, desde, hasta, acento, serie, pie }) => {
  if (t < desde) return null;
  const tt = t - desde;
  const velo = interpolate(tt, [0, 1.2], [0, 1], { extrapolateRight: 'clamp' });
  const avance = interpolate(tt, [0.2, 1.6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (x) => 1 - Math.pow(1 - x, 2) });
  const e = resorte(t, desde + 0.5);
  const e2 = resorte(t, desde + 0.9);
  const negro = interpolate(t, [hasta - 1, hasta - 0.05], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const titulo = (serie ?? pie ?? MARCA.lema).toUpperCase();
  const sub = serie ? pie : undefined;
  const x0 = 140, x1 = 820, y = 470;
  const xf = x0 + (x1 - x0) * avance;
  const fs = titulo.length <= 16 ? 112 : titulo.length <= 26 ? 92 : 76;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ position: 'absolute', inset: 0, opacity: velo, background: 'linear-gradient(90deg, rgba(11,29,46,0.94) 0%, rgba(11,29,46,0.78) 38%, rgba(11,29,46,0.12) 62%, rgba(11,29,46,0) 100%)' }} />
      <div style={{ position: 'absolute', left: x0, width: 720, bottom: LARGO.alto - y + 34, opacity: Math.min(1, e * 1.4), transform: `translateY(${(1 - e) * 16}px)`,
        fontFamily: TIPO.condensadaPeso, fontWeight: 700, fontSize: fs, lineHeight: 1.02, color: PALETA.tinta, textShadow: sombra, textWrap: 'balance' } as React.CSSProperties}>
        {titulo}
      </div>
      <svg width={LARGO.ancho} height={LARGO.alto} style={{ position: 'absolute', inset: 0 }}>
        <line x1={x0} y1={y} x2={xf} y2={y} stroke={acento} strokeWidth={10} strokeLinecap="round" strokeDasharray="0.1 26" />
        <circle cx={xf} cy={y} r={avance > 0.95 ? 15 : 9} fill={PALETA.coral} stroke={PALETA.fondo} strokeWidth={4} />
      </svg>
      {sub && (
        <div style={{ position: 'absolute', left: x0, top: y + 36, width: 700, opacity: Math.min(1, e2 * 1.4), transform: `translateY(${(1 - e2) * 12}px)`, fontFamily: TIPO.texto, fontWeight: 600, fontSize: 36, lineHeight: 1.25, color: PALETA.tintaSuave, textShadow: sombra }}>
          {sub}
        </div>
      )}
      <div style={{ position: 'absolute', left: LARGO.lados, bottom: LARGO.abajo + 12, opacity: 0.75 * Math.min(1, e2 * 1.4), fontFamily: TIPO.condensada, fontSize: 30, letterSpacing: 3, color: PALETA.tinta, textShadow: sombra }}>
        {MARCA.nombre.toUpperCase()}
      </div>
      <div style={{ position: 'absolute', inset: 0, background: '#000', opacity: negro }} />
    </div>
  );
};
