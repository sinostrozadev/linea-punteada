/**
 * Capas de dirección visual que van ENCIMA del mapa o de la foto (frontera v2; reutilizables por lugar/ruta):
 * tarjeta de cifra, foto a pantalla completa, polaroid, índice de enumeración, etiqueta de contexto, tarjeta de
 * fuente y cierre de 0,8 s. Todas reciben el segundo absoluto `t` y su ventana [desde, hasta): deterministas.
 */
import React from 'react';
import { Img, interpolate, spring, staticFile } from 'remotion';
import { FORMATO, MARCA, PALETA, TIPO, fondoAlfa } from '../../marca/tokens';
import type { ItemIndice, Tarjeta } from './direccion';
import type { ImagenResuelta } from './guion';
import { Icono } from './Icono';

const FPS = FORMATO.fps;
const resorte = (t: number, desde: number, config = { damping: 14, stiffness: 170 }) => spring({ frame: Math.round((t - desde) * FPS), fps: FPS, config });
const salida = (t: number, hasta: number, dur = 0.22) => Math.max(0, Math.min(1, (hasta - t) / dur));
const sombraTexto = '0 0 3px rgba(0,0,0,0.95), 0 4px 14px rgba(0,0,0,0.8)';
/** Contorno oscuro bajo el relleno: el texto en acento se lee igual sobre desierto claro que sobre océano. */
export const trazoOscuro = { WebkitTextStroke: '6px rgba(6,16,28,0.78)', paintOrder: 'stroke fill' } as React.CSSProperties;
const POSICION = { arriba: 'center 22%', centro: 'center center', abajo: 'center 78%' } as const;
const autorCorto = (a: string, n = 34) => (a.length > n ? `${a.slice(0, n - 2).trim()}…` : a);

/** Texto con su primera cifra contando de 0 al valor (respeta coma decimal y punto de miles). */
const contar = (texto: string, p: number) => {
  const m = /(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d+))?/.exec(texto);
  if (!m) return texto;
  // Un año no cuenta (1905 → 1929 se lee como otro año): entra fijo.
  if (!m[2] && /^\d{4}$/.test(m[1]) && Number(m[1]) >= 1000 && Number(m[1]) <= 2100) return texto;
  const entero = Number(m[1].replace(/\./g, ''));
  const dec = m[2]?.length ?? 0;
  const valor = (entero + (dec ? Number(m[2]) / Math.pow(10, dec) : 0)) * p;
  let s = valor.toFixed(dec).replace('.', ',');
  if (/\./.test(m[1])) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return texto.slice(0, m.index) + s + texto.slice(m.index + m[0].length);
};

// ---------------------------------------------------------------- tarjeta de cifra

export const ARRIBA_TARJETA = 292;

/** `top`: borde superior (por defecto ARRIBA_TARJETA; más abajo cuando el índice ocupa la franja de arriba). */
export const TarjetaCifra: React.FC<{ tarjeta: Tarjeta; t: number; desde: number; hasta: number; acento: string; top?: number }> = ({ tarjeta, t, desde, hasta, acento, top = ARRIBA_TARJETA }) => {
  if (t < desde || t >= hasta) return null;
  const e = resorte(t, desde);
  const o = Math.min(1, e * 1.4) * salida(t, hasta);
  const p = interpolate(t - desde, [0, 0.7], [0, 1], { extrapolateRight: 'clamp', easing: (x) => 1 - Math.pow(1 - x, 3) });
  const tipo = tarjeta.tipo ?? 'cifra';
  const max = Math.max(...(tarjeta.barras ?? []).map((b) => b.valor), 1);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: o, transform: `scale(${0.86 + 0.14 * e})`, transformOrigin: '50% 0%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
        {tarjeta.icono && <Icono nombre={tarjeta.icono} tamano={118} acento={acento} />}
        <div style={{ fontFamily: TIPO.condensadaPeso, fontWeight: 700, fontSize: 150, lineHeight: 0.95, color: PALETA.tinta, textShadow: sombraTexto, letterSpacing: 1, textTransform: 'uppercase' }}>
          {tipo === 'ranking' ? tarjeta.texto : contar(tarjeta.texto, p)}
        </div>
      </div>
      <div style={{ width: 420 * p, height: 8, borderRadius: 4, background: acento, marginTop: 10, boxShadow: `0 0 16px ${acento}88` }} />
      {tarjeta.sub && (
        <div style={{
          marginTop: 14, padding: '7px 18px 5px', borderRadius: 10, background: fondoAlfa(0.78), color: PALETA.tinta,
          fontFamily: TIPO.condensada, fontSize: 40, letterSpacing: 3, textTransform: 'uppercase',
        }}>{tarjeta.sub}</div>
      )}
      {tipo === 'barras' && tarjeta.barras && (
        <div style={{ marginTop: 22, width: 700, display: 'flex', flexDirection: 'column', gap: 14, padding: '18px 24px', borderRadius: 18, background: fondoAlfa(0.72) }}>
          {tarjeta.barras.map((b, i) => {
            const pb = interpolate(t - desde, [0.25 + i * 0.25, 0.95 + i * 0.25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (x) => 1 - Math.pow(1 - x, 3) });
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, fontFamily: TIPO.condensada, fontSize: 38, color: PALETA.tinta, letterSpacing: 2 }}>
                <div style={{ width: 170, textAlign: 'right' }}>{b.etiqueta}</div>
                <div style={{ height: 40, width: 380 * (b.valor / max) * pb, borderRadius: 8, background: i === 0 ? acento : PALETA.tintaSuave }} />
                <div style={{ opacity: pb }}>{contar(String(b.valor), pb)}</div>
              </div>
            );
          })}
        </div>
      )}
      {tipo === 'linea-tiempo' && (
        <div style={{ marginTop: 22, width: 640, display: 'flex', alignItems: 'center', gap: 18, fontFamily: TIPO.condensada, fontSize: 44, color: PALETA.tinta, letterSpacing: 2, textShadow: sombraTexto }}>
          <div>{tarjeta.desde}</div>
          <div style={{ flex: 1, height: 14, borderRadius: 7, background: fondoAlfa(0.8), border: `2px solid ${PALETA.tintaSuave}`, overflow: 'hidden' }}>
            <div style={{ width: `${100 * p}%`, height: '100%', background: acento }} />
          </div>
          <div>{tarjeta.hasta}</div>
        </div>
      )}
      {tarjeta.pictos && (
        <div style={{ marginTop: 18, display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 900 }}>
          {Array.from({ length: tarjeta.pictos.n }, (_, i) => {
            const ei = resorte(t, desde + 0.35 + i * 0.11, { damping: 11, stiffness: 220 });
            return <div key={i} style={{ transform: `scale(${ei})` }}><Icono nombre={tarjeta.pictos!.icono} tamano={tarjeta.pictos!.n > 8 ? 70 : 92} acento={acento} /></div>;
          })}
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------- fotos

/** Foto a pantalla completa 2–3 s con zoom leve y pastilla "● LUGAR · QUÉ ES" arriba a la izquierda. */
export const FotoCompleta: React.FC<{ imagen: ImagenResuelta; pie: string; t: number; desde: number; hasta: number; variante?: number }> = ({ imagen, pie, t, desde, hasta, variante = 0 }) => {
  if (t < desde || t >= hasta) return null;
  const p = (t - desde) / Math.max(0.5, hasta - desde);
  const sentido = variante % 2 ? -1 : 1;
  const ep = resorte(t, desde + 0.12);
  const posicion = POSICION[imagen.encuadre ?? 'centro'];
  return (
    <div style={{ position: 'absolute', inset: 0, background: PALETA.fondo, overflow: 'hidden' }}>
      <Img src={staticFile(imagen.src)} style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: posicion,
        transform: `scale(${1.06 + 0.1 * p}) translateX(${sentido * 1.6 * p}%)`, filter: 'saturate(1.08) contrast(1.06)',
      }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0) 26%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.38) 100%)' }} />
      <div style={{
        position: 'absolute', top: 252, left: FORMATO.seguro.lados, display: 'flex', alignItems: 'center', gap: 14, padding: '9px 20px 7px 16px',
        borderRadius: 8, background: fondoAlfa(0.86), transform: `translateX(${(1 - ep) * -60}px)`, opacity: Math.min(1, ep * 1.5),
        fontFamily: TIPO.condensada, fontSize: 42, letterSpacing: 2, color: PALETA.tinta, textTransform: 'uppercase', whiteSpace: 'nowrap',
      }}>
        <span style={{ width: 14, height: 14, borderRadius: 7, background: PALETA.coral, boxShadow: `0 0 10px ${PALETA.coral}` }} />{pie}
      </div>
      <div style={{ position: 'absolute', left: FORMATO.seguro.lados, right: 200, top: FORMATO.alto - FORMATO.seguro.abajo - 30, fontFamily: TIPO.texto, fontWeight: 500, fontSize: 19, color: '#E6EEF5', opacity: 0.8, textShadow: '0 1px 4px #000', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        Foto: {autorCorto(imagen.autor)} · {imagen.licencia} · Wikimedia Commons
      </div>
    </div>
  );
};

/** Polaroid sobre el mapa (marco blanco, leve giro, crédito) o foto circular incrustada. Año gigante opcional. */
export const PolaroidMapa: React.FC<{ imagen: ImagenResuelta; pie?: string; anio?: string; forma?: 'marco' | 'circulo'; lado?: 'izquierda' | 'derecha'; t: number; desde: number; hasta: number; acento: string; bajar?: number }> =
  ({ imagen, pie, anio, forma = 'marco', lado = 'derecha', t, desde, hasta, acento, bajar = 0 }) => {
    if (t < desde || t >= hasta) return null;
    const e = resorte(t, desde, { damping: 13, stiffness: 140 });
    const o = Math.min(1, e * 1.6) * salida(t, hasta);
    const giro = (lado === 'derecha' ? 4 : -4) * (0.6 + 0.4 * e);
    const deriva = (t - desde) * 0.012;
    const credito = `${pie ? `${pie} · ` : ''}${autorCorto(imagen.autor, 28)} · ${imagen.licencia}`;
    const posicion = POSICION[imagen.encuadre ?? (imagen.alto > imagen.ancho * 1.1 ? 'arriba' : 'centro')];
    const anioEl = anio && (
      <div style={{ fontFamily: TIPO.condensadaPeso, fontWeight: 700, fontSize: 130, color: acento, textShadow: sombraTexto, lineHeight: 1, marginBottom: 10, textAlign: 'center' }}>{anio}</div>
    );
    if (forma === 'circulo') {
      const D = 380;
      return (
        <div style={{ position: 'absolute', top: 470 + bajar, [lado === 'derecha' ? 'right' : 'left']: 70, width: D, opacity: o, transform: `scale(${0.6 + 0.4 * e})` } as React.CSSProperties}>
          {anioEl}
          <div style={{ width: D, height: D, borderRadius: '50%', overflow: 'hidden', border: `10px solid ${PALETA.tinta}`, boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}>
            <Img src={staticFile(imagen.src)} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: posicion, transform: `scale(${1.08 + deriva})` }} />
          </div>
          <div style={{ marginTop: 10, fontFamily: TIPO.texto, fontWeight: 600, fontSize: 18, color: PALETA.tinta, textAlign: 'center', textShadow: '0 1px 4px #000' }}>{credito}</div>
        </div>
      );
    }
    const W = 440;
    const H = Math.round(Math.max(300, Math.min(520, (W * imagen.alto) / imagen.ancho)));
    return (
      <div style={{
        position: 'absolute', top: (anio ? 380 : 470) + bajar, [lado === 'derecha' ? 'right' : 'left']: 66, width: W + 32, opacity: o,
        transform: `translateY(${(1 - e) * -120}px) rotate(${giro}deg)`,
      } as React.CSSProperties}>
        {anioEl}
        <div style={{ background: '#FBFAF6', padding: '16px 16px 0', borderRadius: 4, boxShadow: '0 24px 60px rgba(0,0,0,0.65)' }}>
          <div style={{ width: W, height: H, overflow: 'hidden', background: '#ccc' }}>
            <Img src={staticFile(imagen.src)} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: posicion, transform: `scale(${1.04 + deriva})`, filter: 'contrast(1.05)' }} />
          </div>
          <div style={{ padding: '12px 4px 16px', fontFamily: TIPO.texto, fontWeight: 600, fontSize: 18, lineHeight: 1.25, color: '#2A2F36' }}>{credito}</div>
        </div>
      </div>
    );
  };

// ---------------------------------------------------------------- índice de enumeración

export const ARRIBA_INDICE = 236;
/** Alto que ocupa el índice en fila (ícono + texto): lo de arriba (tarjeta, contexto, polaroid) baja esto. */
export const ALTO_INDICE = 230;

/**
 * Índice "⚖️ 1 · CONCORDIA  📍 2 · HITO  🌊 3 · EL MAR": cada ítem entra cuando la voz lo nombra y se queda;
 * durante los actos el ítem activo se ilumina y los demás se apagan. `ancla` (px) = apilado vertical sobre el mapa.
 */
export const IndiceEnumeracion: React.FC<{ items: (ItemIndice & { desde: number })[]; activo: number | null; t: number; hasta: number; acento: string; ancla?: [number, number] | null }> =
  ({ items, activo, t, hasta, acento, ancla }) => {
    if (!items.length || t < items[0].desde || t >= hasta) return null;
    const vertical = !!ancla;
    return (
      <div style={{
        position: 'absolute', display: 'flex', flexDirection: vertical ? 'column' : 'row', gap: vertical ? 10 : 14,
        ...(vertical ? { left: ancla![0] - 120, top: ancla![1] - 200 } : { left: FORMATO.seguro.lados - 10, top: ARRIBA_INDICE }),
        opacity: salida(t, hasta, 0.3),
      }}>
        {items.map((it, i) => {
          if (t < it.desde) return null;
          const e = resorte(t, it.desde, { damping: 11, stiffness: 200 });
          const esActivo = activo === i;
          const apagado = activo !== null && !esActivo;
          return (
            <div key={i} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', width: 250, transform: `scale(${(0.5 + 0.5 * e) * (esActivo ? 1.14 : apagado ? 0.9 : 1)})`,
              opacity: apagado ? 0.62 : 1, transformOrigin: '50% 30%',
            }}>
              <div style={{ filter: esActivo ? `drop-shadow(0 0 16px ${acento})` : undefined }}><Icono nombre={it.icono} tamano={136} acento={acento} /></div>
              <div style={{
                marginTop: 2, fontFamily: TIPO.condensada, fontSize: 52, letterSpacing: 2.5, whiteSpace: 'nowrap', textShadow: sombraTexto, ...trazoOscuro,
                color: esActivo ? acento : PALETA.tinta,
              }}>{i + 1} · {it.texto}</div>
            </div>
          );
        })}
      </div>
    );
  };

// ---------------------------------------------------------------- contexto y fuente

/** Etiqueta de contexto en acento, arriba, 1–4 palabras ("EL GIRO"). Se corre hacia abajo si hay tarjeta. */
export const EtiquetaContexto: React.FC<{ texto: string; t: number; desde: number; hasta: number; acento: string; top?: number }> = ({ texto, t, desde, hasta, acento, top = 330 }) => {
  if (t < desde || t >= hasta) return null;
  const e = resorte(t, desde, { damping: 12, stiffness: 210 });
  return (
    <div style={{ position: 'absolute', left: 40, right: 40, top, textAlign: 'center', opacity: Math.min(1, e * 1.5) * salida(t, hasta), transform: `scale(${0.8 + 0.2 * e})` }}>
      <span style={{ fontFamily: TIPO.condensada, fontSize: 96, letterSpacing: 3 + 3 * (1 - e), color: acento, textShadow: sombraTexto, textTransform: 'uppercase', ...trazoOscuro }}>{texto}</span>
    </div>
  );
};

/** Fuente dicha en voz, citada en pantalla: tarjeta discreta abajo a la izquierda ("SEGÚN · Corte Internacional…"). */
export const TarjetaFuente: React.FC<{ texto: string; t: number; desde: number; hasta: number; acento: string }> = ({ texto, t, desde, hasta, acento }) => {
  if (t < desde || t >= hasta) return null;
  const e = resorte(t, desde, { damping: 16, stiffness: 160 });
  return (
    <div style={{
      position: 'absolute', left: FORMATO.seguro.lados, top: 1372, maxWidth: 920, display: 'flex', alignItems: 'center', gap: 14,
      padding: '10px 20px 10px 14px', borderRadius: 12, background: fondoAlfa(0.82), borderLeft: `6px solid ${acento}`,
      transform: `translateX(${(1 - e) * -80}px)`, opacity: Math.min(1, e * 1.5) * salida(t, hasta),
    }}>
      <Icono nombre="tratado" tamano={54} acento={acento} sombra={false} />
      <span style={{ fontFamily: TIPO.condensada, fontSize: 42, letterSpacing: 2.5, color: acento }}>SEGÚN</span>
      <span style={{ fontFamily: TIPO.texto, fontWeight: 700, fontSize: 33, lineHeight: 1.15, color: PALETA.tinta }}>{texto}</span>
    </div>
  );
};

// ---------------------------------------------------------------- cierre

/** Cierre de 0,8 s: línea punteada que se dibuja sobre el mapa y el handle. Lo único de marca en todo el video. */
export const CierreLinea: React.FC<{ frame: number; acento: string }> = ({ frame, acento }) => {
  const avance = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp', easing: (x) => 1 - Math.pow(1 - x, 2) });
  const velo = interpolate(frame, [0, 12], [0, 0.55], { extrapolateRight: 'clamp' });
  const e = spring({ frame: frame - 6, fps: FPS, config: { damping: 14, stiffness: 180 } });
  const x0 = 120, x1 = FORMATO.ancho - 120, y = 1010;
  const xf = x0 + (x1 - x0) * avance;
  return (
    <div style={{ position: 'absolute', inset: 0, background: fondoAlfa(velo) }}>
      <svg width={FORMATO.ancho} height={FORMATO.alto} style={{ position: 'absolute', inset: 0 }}>
        <line x1={x0} y1={y} x2={xf} y2={y} stroke={acento} strokeWidth={14} strokeLinecap="round" strokeDasharray="0.1 34" />
        <circle cx={xf} cy={y} r={avance > 0.95 ? 20 : 12} fill={PALETA.coral} stroke={PALETA.fondo} strokeWidth={5} />
      </svg>
      <div style={{ position: 'absolute', left: 0, right: 0, top: y - 130, textAlign: 'center', fontFamily: TIPO.condensada, fontSize: 76, letterSpacing: 4, color: PALETA.tinta, opacity: Math.min(1, e * 1.4), transform: `translateY(${(1 - e) * 20}px)`, textShadow: sombraTexto }}>
        {MARCA.handle.toUpperCase()}
      </div>
    </div>
  );
};
