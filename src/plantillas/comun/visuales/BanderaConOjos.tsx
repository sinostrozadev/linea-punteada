/**
 * Personaje "bandera con ojos" dibujado por código (sin imágenes generadas ni con marca): la bandera del país ondea,
 * tiene ojos que parpadean y miran hacia la acción, cejas, boca y bracitos. Determinista (todo depende de `t`).
 * Diagnóstico 2026-11-18 §3.4: el referente que despega (Más Allá del Mapa) pone una bandera con ojos sobre el país en
 * el frame 0 y en cada giro. Se usa en A/B (la mitad de un lote), ver docs/DECISIONES.md.
 */
import React from 'react';

export type CodigoBandera = 'CL' | 'AR' | 'BO' | 'PE' | 'UY' | 'PY' | 'BR' | 'EC' | 'CO' | 'VE' | 'MX' | 'GB' | 'ES' | 'FR' | 'PT' | 'US';
export type Expresion = 'normal' | 'sorpresa' | 'enojo' | 'triste';

const W = 300, H = 200; // caja de dibujo de la tela (3:2)

const franjasH = (colores: string[], pesos?: number[]) => {
  const p = pesos ?? colores.map(() => 1);
  const tot = p.reduce((a, b) => a + b, 0);
  let y = 0;
  return colores.map((c, i) => { const h = (H * p[i]) / tot; const r = <rect key={i} x={0} y={y} width={W} height={h + 0.5} fill={c} />; y += h; return r; });
};
const franjasV = (colores: string[]) => colores.map((c, i) => <rect key={i} x={(W / colores.length) * i} y={0} width={W / colores.length + 0.5} height={H} fill={c} />);
const estrella = (cx: number, cy: number, r: number, fill = '#fff') => {
  const pts = Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + (i * Math.PI) / 5; const rr = i % 2 ? r * 0.4 : r; return `${cx + rr * Math.cos(a)},${cy + rr * Math.sin(a)}`; }).join(' ');
  return <polygon points={pts} fill={fill} />;
};
const sol = (cx: number, cy: number, r: number) => (
  <g>
    {Array.from({ length: 16 }, (_, i) => { const a = (i * Math.PI) / 8; return <line key={i} x1={cx + r * Math.cos(a)} y1={cy + r * Math.sin(a)} x2={cx + r * 1.6 * Math.cos(a)} y2={cy + r * 1.6 * Math.sin(a)} stroke="#F6B40E" strokeWidth={r * 0.28} strokeLinecap="round" />; })}
    <circle cx={cx} cy={cy} r={r} fill="#F6B40E" stroke="#85340A" strokeWidth={r * 0.08} />
  </g>
);

/** Tela de cada bandera (simplificada y legible a 200 px; sin escudos detallados). */
const tela = (c: CodigoBandera): React.ReactNode => {
  switch (c) {
    case 'CL': return (<g><rect width={W} height={H / 2} fill="#fff" /><rect y={H / 2} width={W} height={H / 2} fill="#D52B1E" /><rect width={H / 2} height={H / 2} fill="#0039A6" />{estrella(H / 4, H / 4, H / 7)}</g>);
    case 'AR': return (<g>{franjasH(['#74ACDF', '#fff', '#74ACDF'])}{sol(W / 2, H / 2, H / 11)}</g>);
    case 'BO': return <g>{franjasH(['#D52B1E', '#F9E300', '#007934'])}</g>;
    case 'PE': return <g>{franjasV(['#D91023', '#fff', '#D91023'])}</g>;
    case 'UY': return (<g>{franjasH(['#fff', '#0038A8', '#fff', '#0038A8', '#fff', '#0038A8', '#fff', '#0038A8', '#fff'])}<rect width={W * 0.4} height={(H * 5) / 9} fill="#fff" />{sol(W * 0.2, (H * 5) / 18, H / 10)}</g>);
    case 'PY': return (<g>{franjasH(['#D52B1E', '#fff', '#0038A8'])}<circle cx={W / 2} cy={H / 2} r={H / 9} fill="none" stroke="#0038A8" strokeWidth={4} />{estrella(W / 2, H / 2, H / 16, '#F9E300')}</g>);
    case 'BR': return (<g><rect width={W} height={H} fill="#009C3B" /><polygon points={`${W / 2},${H * 0.1} ${W * 0.92},${H / 2} ${W / 2},${H * 0.9} ${W * 0.08},${H / 2}`} fill="#FFDF00" /><circle cx={W / 2} cy={H / 2} r={H * 0.24} fill="#002776" /><path d={`M${W / 2 - H * 0.24} ${H / 2 - 4} Q ${W / 2} ${H / 2 - 22} ${W / 2 + H * 0.24} ${H / 2 + 6}`} stroke="#fff" strokeWidth={6} fill="none" /></g>);
    case 'EC': return (<g>{franjasH(['#FFD100', '#0072CE', '#EF3340'], [2, 1, 1])}<ellipse cx={W / 2} cy={H / 2} rx={H / 9} ry={H / 7} fill="#8B5A2B" opacity={0.8} /></g>);
    case 'CO': return <g>{franjasH(['#FCD116', '#003893', '#CE1126'], [2, 1, 1])}</g>;
    case 'VE': return (<g>{franjasH(['#FFCC00', '#00247D', '#CF142B'])}{Array.from({ length: 8 }, (_, i) => { const a = Math.PI * (1.15 + (i * 0.7) / 7); return <React.Fragment key={i}>{estrella(W / 2 + H * 0.28 * Math.cos(a), H * 0.62 + H * 0.28 * Math.sin(a), 7)}</React.Fragment>; })}</g>);
    case 'MX': return (<g>{franjasV(['#006847', '#fff', '#CE1126'])}<circle cx={W / 2} cy={H / 2} r={H / 9} fill="#8B5A2B" opacity={0.85} /></g>);
    case 'GB': return (<g><rect width={W} height={H} fill="#012169" /><path d={`M0 0 L${W} ${H} M${W} 0 L0 ${H}`} stroke="#fff" strokeWidth={H * 0.2} /><path d={`M0 0 L${W} ${H} M${W} 0 L0 ${H}`} stroke="#C8102E" strokeWidth={H * 0.07} /><path d={`M${W / 2} 0 V${H} M0 ${H / 2} H${W}`} stroke="#fff" strokeWidth={H * 0.33} /><path d={`M${W / 2} 0 V${H} M0 ${H / 2} H${W}`} stroke="#C8102E" strokeWidth={H * 0.2} /></g>);
    case 'ES': return <g>{franjasH(['#AA151B', '#F1BF00', '#AA151B'], [1, 2, 1])}</g>;
    case 'FR': return <g>{franjasV(['#0055A4', '#fff', '#EF4135'])}</g>;
    case 'PT': return (<g><rect width={W} height={H} fill="#DA291C" /><rect width={W * 0.4} height={H} fill="#046A38" /><circle cx={W * 0.4} cy={H / 2} r={H * 0.2} fill="#FFE900" /></g>);
    case 'US': return (<g>{franjasH(Array.from({ length: 13 }, (_, i) => (i % 2 ? '#fff' : '#B22234')))}<rect width={W * 0.4} height={(H * 7) / 13} fill="#3C3B6E" />{Array.from({ length: 12 }, (_, i) => <circle key={i} cx={14 + (i % 4) * 28} cy={14 + Math.floor(i / 4) * 30} r={4} fill="#fff" />)}</g>);
  }
};

/** Parpadeo determinista: cierra 0,14 s cada ~3,1 s (desfasado por `semilla` para que dos banderas no parpadeen juntas). */
const apertura = (t: number, semilla: number) => {
  const ciclo = 3.1 + (semilla % 3) * 0.37;
  const u = (t + semilla * 0.9) % ciclo; // segundos dentro del ciclo
  const d = u - (ciclo - 0.16);
  if (d < 0) return 1;
  return Math.abs(d - 0.08) / 0.08 * 0.9 + 0.1;
};

export const BanderaConOjos: React.FC<{
  pais: CodigoBandera;
  /** Tiempo desde que apareció (s). */
  t: number;
  /** Ancho en px (alto = 2/3). */
  ancho: number;
  /** Dirección de la mirada normalizada (−1..1 en x e y); 0,0 = a cámara. */
  mirada?: [number, number];
  expresion?: Expresion;
  semilla?: number;
}> = ({ pais, t, ancho, mirada = [0, 0], expresion = 'normal', semilla = 0 }) => {
  const id = `ban-${pais}-${semilla}`;
  // Ondeo: la tela se deforma con una onda suave (clipPath con borde ondulado).
  const fase = t * 4.2 + semilla;
  const onda = (x: number) => Math.sin(fase + x / 55) * 6;
  const borde = [`M0 ${onda(0)}`, ...Array.from({ length: 13 }, (_, i) => { const x = (W / 12) * i; return `L${x} ${onda(x)}`; }), ...Array.from({ length: 13 }, (_, i) => { const x = W - (W / 12) * i; return `L${x} ${H + onda(x)}`; }), 'Z'].join(' ');
  const ab = apertura(t, semilla);
  const [mx, my] = [Math.max(-1, Math.min(1, mirada[0])), Math.max(-1, Math.min(1, mirada[1]))];
  const ojoY = H * 0.47, sep = W * 0.14, rx = 30, ry = 36;
  const pupila = (cx: number) => (
    <g>
      <ellipse cx={cx} cy={ojoY} rx={rx} ry={ry * ab} fill="#fff" stroke="#111" strokeWidth={5} />
      {ab > 0.4 && <circle cx={cx + mx * rx * 0.45} cy={ojoY + my * ry * 0.45 * ab} r={expresion === 'sorpresa' ? 11 : 15} fill="#111" />}
      {ab > 0.4 && <circle cx={cx + mx * rx * 0.45 - 5} cy={ojoY + my * ry * 0.45 * ab - 6} r={4.5} fill="#fff" />}
    </g>
  );
  const ceja = (cx: number, lado: 1 | -1) => {
    const y = ojoY - ry - 14 - (expresion === 'sorpresa' ? 10 : 0);
    const inclin = expresion === 'enojo' ? 12 * lado : expresion === 'triste' ? -10 * lado : 0;
    return <path d={`M${cx - 26} ${y - inclin} L${cx + 26} ${y + inclin}`} stroke="#111" strokeWidth={8} strokeLinecap="round" />;
  };
  const bocaY = H * 0.78;
  const boca = expresion === 'sorpresa' ? <ellipse cx={W / 2} cy={bocaY} rx={11} ry={15} fill="#3a0d0d" stroke="#111" strokeWidth={4} />
    : expresion === 'triste' ? <path d={`M${W / 2 - 22} ${bocaY + 8} Q ${W / 2} ${bocaY - 12} ${W / 2 + 22} ${bocaY + 8}`} stroke="#111" strokeWidth={6} fill="none" strokeLinecap="round" />
    : expresion === 'enojo' ? <path d={`M${W / 2 - 20} ${bocaY} L${W / 2 + 20} ${bocaY}`} stroke="#111" strokeWidth={6} strokeLinecap="round" />
    : <path d={`M${W / 2 - 24} ${bocaY - 6} Q ${W / 2} ${bocaY + 16} ${W / 2 + 24} ${bocaY - 6}`} stroke="#111" strokeWidth={6} fill="none" strokeLinecap="round" />;
  // Bracitos: palitos negros a los lados que se mueven un poco (saludo suave).
  const brazo = Math.sin(t * 3 + semilla) * 10;
  return (
    <svg width={ancho} height={(ancho * (H + 60)) / (W + 80)} viewBox={`-40 -20 ${W + 80} ${H + 60}`} style={{ overflow: 'visible', filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.55))' }}>
      <defs><clipPath id={id}><path d={borde} /></clipPath></defs>
      <path d={`M2 ${H * 0.55} L-30 ${H * 0.75 + brazo}`} stroke="#111" strokeWidth={7} strokeLinecap="round" />
      <path d={`M${W - 2} ${H * 0.55} L${W + 30} ${H * 0.75 - brazo}`} stroke="#111" strokeWidth={7} strokeLinecap="round" />
      <g clipPath={`url(#${id})`}>{tela(pais)}</g>
      <path d={borde} fill="none" stroke="#111" strokeWidth={6} strokeLinejoin="round" />
      {pupila(W / 2 - sep)}
      {pupila(W / 2 + sep)}
      {ceja(W / 2 - sep, 1)}
      {ceja(W / 2 + sep, -1)}
      {boca}
    </svg>
  );
};
