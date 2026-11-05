/**
 * Pictogramas propios de Línea Punteada (dibujados para el canal, CC0): trazo redondo blanco con un acento,
 * en una caja de 100×100. Se usan en el índice de enumeración, en los iconos del mapa y en las tarjetas, para
 * que el canal no dependa solo de emoji (y no se vea igual a Ñerd).
 */
import React from 'react';

type P = { c: string; a: string };
const T = (c: string, w = 7) => ({ stroke: c, strokeWidth: w, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const });

export const PICTOGRAMAS: Record<string, React.FC<P>> = {
  guerra: ({ c, a }) => (<g>
    <path d="M22 18 L70 66" {...T(c, 8)} /><path d="M78 18 L30 66" {...T(c, 8)} />
    <path d="M60 72 L74 58 M26 58 L40 72" {...T(a, 8)} /><path d="M70 66 L82 82 M30 66 L18 82" {...T(a, 9)} />
  </g>),
  tren: ({ c, a }) => (<g>
    <rect x="22" y="16" width="56" height="54" rx="12" {...T(c)} /><path d="M22 44 H78" {...T(c)} />
    <rect x="32" y="24" width="36" height="12" rx="3" {...T(a, 5)} />
    <circle cx="36" cy="57" r="4" fill={a} /><circle cx="64" cy="57" r="4" fill={a} />
    <path d="M32 70 L22 86 M68 70 L78 86 M28 80 H72" {...T(c)} />
  </g>),
  rio: ({ c, a }) => (<g>
    <path d="M12 30 q12 -10 24 0 t24 0 t24 0 t12 -4" {...T(a)} />
    <path d="M12 52 q12 -10 24 0 t24 0 t24 0 t12 -4" {...T(c)} />
    <path d="M12 74 q12 -10 24 0 t24 0 t24 0 t12 -4" {...T(c)} />
  </g>),
  tratado: ({ c, a }) => (<g>
    <path d="M26 12 H66 L78 24 V88 H26 Z" {...T(c)} /><path d="M36 34 H66 M36 48 H66 M36 62 H54" {...T(c, 5)} />
    <circle cx="64" cy="74" r="10" {...T(a, 6)} /><path d="M58 84 L54 96 M70 84 L74 96" {...T(a, 5)} />
  </g>),
  dinero: ({ c, a }) => (<g>
    <ellipse cx="50" cy="26" rx="30" ry="10" {...T(a)} />
    <path d="M20 26 V44 M80 26 V44 M20 44 a30 10 0 0 0 60 0 M20 44 V62 M80 44 V62 M20 62 a30 10 0 0 0 60 0 M20 62 V78 M80 62 V78 M20 78 a30 10 0 0 0 60 0" {...T(c)} />
  </g>),
  tribunal: ({ c, a }) => (<g>
    <path d="M12 34 L50 12 L88 34 Z" {...T(a)} /><path d="M24 40 V74 M42 40 V74 M58 40 V74 M76 40 V74" {...T(c)} />
    <path d="M14 82 H86 M10 92 H90" {...T(c)} />
  </g>),
  hielo: ({ c, a }) => (<g>
    <path d="M50 10 V90 M15 30 L85 70 M15 70 L85 30" {...T(c)} />
    <path d="M40 18 L50 28 L60 18 M40 82 L50 72 L60 82" {...T(a, 6)} />
  </g>),
  isla: ({ c, a }) => (<g>
    <path d="M10 82 q20 -8 40 0 t40 0" {...T(c)} /><path d="M24 72 q26 -18 52 0" {...T(c)} />
    <path d="M50 66 q-2 -26 6 -42" {...T(c)} />
    <path d="M56 24 q-18 -8 -30 4 M56 24 q16 -10 30 2 M56 24 q-4 -14 -16 -16 M56 24 q10 -2 14 14" {...T(a, 6)} />
  </g>),
  barco: ({ c, a }) => (<g>
    <path d="M14 62 H86 L74 82 H26 Z" {...T(c)} /><path d="M50 62 V12" {...T(c)} />
    <path d="M54 16 L80 52 H54 Z" {...T(a, 6)} /><path d="M46 22 L26 52 H46 Z" {...T(a, 6)} />
    <path d="M8 92 q10 -6 20 0 t20 0 t20 0 t20 0" {...T(c, 5)} />
  </g>),
  montana: ({ c, a }) => (<g>
    <path d="M6 84 L38 26 L58 60 L70 42 L94 84 Z" {...T(c)} />
    <path d="M28 44 L38 26 L48 44 L42 40 L36 46 Z" {...T(a, 5)} />
  </g>),
  carretera: ({ c, a }) => (<g>
    <path d="M40 12 L14 90 M60 12 L86 90" {...T(c)} /><path d="M50 18 V30 M50 42 V56 M50 68 V88" {...T(a, 7)} />
  </g>),
  bandera: ({ c, a }) => (<g>
    <path d="M24 92 V10" {...T(c)} /><path d="M24 14 q14 -8 28 0 t28 0 V50 q-14 8 -28 0 t-28 0 Z" {...T(a, 6)} />
  </g>),
};

export const esPictograma = (nombre: string) => Object.prototype.hasOwnProperty.call(PICTOGRAMAS, nombre);
