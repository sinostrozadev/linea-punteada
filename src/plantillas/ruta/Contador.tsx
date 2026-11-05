import React from 'react';
import { FORMATO, PALETA, TIPO, fondoAlfa } from '../../marca/tokens';

/** "12.430" (separador de miles con punto, como se lee en español). */
export const formatoKm = (km: number) => {
  const n = Math.round(km);
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

/** Tiempo transcurrido legible: "8 meses", "1 año", "7 años y 4 meses". */
export const formatoTiempo = (anios: number) => {
  const meses = Math.max(0, Math.floor(anios * 12 + 1e-6));
  const a = Math.floor(meses / 12);
  const m = meses % 12;
  if (a === 0) return `${m} ${m === 1 ? 'mes' : 'meses'}`;
  const ta = `${a} ${a === 1 ? 'año' : 'años'}`;
  return m === 0 ? ta : `${ta} y ${m} ${m === 1 ? 'mes' : 'meses'}`;
};

/** Alto que ocupa el contador (para dejarle espacio a la tarjeta de foto). */
export const ALTO_CONTADOR = 108;
export const TOP_CONTADOR = FORMATO.alto - FORMATO.seguro.abajo - ALTO_CONTADOR - 6;

/**
 * Contador discreto abajo a la izquierda, sobre la zona segura: km acumulados (grandes círculos) y tiempo
 * desde el primer hito con el año en curso. Cifras tabulares: los dígitos no bailan mientras avanzan.
 */
export const Contador: React.FC<{ km: number; anio: number | null; anio0: number | null; opacidad: number; acento?: string }> = ({ km, anio, anio0, opacidad, acento = PALETA.amarillo }) => {
  if (opacidad <= 0.01) return null;
  const hayTiempo = anio !== null && anio0 !== null;
  return (
    <div style={{
      position: 'absolute', left: FORMATO.seguro.lados, top: TOP_CONTADOR, height: ALTO_CONTADOR, opacity: opacidad,
      display: 'flex', alignItems: 'center', gap: 22, padding: '10px 26px 10px 22px', borderRadius: 26, background: fondoAlfa(0.8),
      boxShadow: '0 10px 30px rgba(0,0,0,0.45)', borderLeft: `6px solid ${acento}`,
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <div style={{ fontFamily: TIPO.texto, fontWeight: 800, fontSize: 54, color: acento, fontVariantNumeric: 'tabular-nums', letterSpacing: -1 }}>
          {formatoKm(km)}<span style={{ fontSize: 30, color: PALETA.tinta, marginLeft: 8, letterSpacing: 0 }}>km</span>
        </div>
        <div style={{ fontFamily: TIPO.texto, fontWeight: 600, fontSize: 21, color: PALETA.tintaSuave, letterSpacing: 2.5, marginTop: 8 }}>DISTANCIA</div>
      </div>
      {hayTiempo && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1, borderLeft: `2px solid ${PALETA.borde}`, paddingLeft: 22 }}>
          <div style={{ fontFamily: TIPO.texto, fontWeight: 800, fontSize: 40, color: PALETA.tinta, fontVariantNumeric: 'tabular-nums' }}>{Math.floor(anio!)}</div>
          <div style={{ fontFamily: TIPO.texto, fontWeight: 600, fontSize: 23, color: PALETA.tintaSuave, marginTop: 8, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
            {formatoTiempo(anio! - anio0!)}
          </div>
        </div>
      )}
    </div>
  );
};
