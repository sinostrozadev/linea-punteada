/**
 * Textura satelital sobre el globo de `ruta` v2: reproyecta en un <canvas>, píxel a píxel, recortes Blue Marble en
 * EPSG:4326 (uno mundial + recortes regionales para los planos cercanos, los baja preparar-ruta) a la proyección
 * ortográfica de la cámara. SVG no puede deformar una imagen sobre una esfera; esto sí, y es determinista (solo
 * depende de la cámara). Encima: iluminación (luz arriba a la izquierda + oscurecido del limbo) y océano llevado al
 * azul marino del canal, como el satélite de frontera.
 *
 * Costo: ~0,7 MPx por cuadro a `resolucion` 0,6 (el canvas se estira con CSS; la textura mundial de 4096 px es lo
 * que limita la nitidez, no el canvas).
 */
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';
import type { Camara } from './camara';

export type Textura = { src: string; bbox: [number, number, number, number]; gradosPx?: number };
type Pixeles = { w: number; h: number; data: Uint8ClampedArray };

/** Borde difuminado de cada recorte regional, en fracción de su lado. */
const BORDE = 0.07;
/** Caché por pestaña: decodificar 4096×2048 en cada cuadro sería imposible. */
const cache = new Map<string, Pixeles>();
const pendientes = new Map<string, Promise<Pixeles | null>>();

const cargar = (src: string): Promise<Pixeles | null> => {
  const hecho = cache.get(src);
  if (hecho) return Promise.resolve(hecho);
  let p = pendientes.get(src);
  if (!p) {
    p = new Promise((ok) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = img.naturalWidth; c.height = img.naturalHeight;
        const ctx = c.getContext('2d', { willReadFrequently: true })!;
        ctx.drawImage(img, 0, 0);
        const px = { w: c.width, h: c.height, data: ctx.getImageData(0, 0, c.width, c.height).data };
        cache.set(src, px);
        ok(px);
      };
      img.onerror = () => ok(null);
      img.src = staticFile(src);
    });
    pendientes.set(src, p);
  }
  return p;
};

const RAD = Math.PI / 180;
// Océano del canal (MAPA.oceano #0A2A4A).
const OR = 10, OG = 42, OB = 74;

/**
 * `soloCubren` (opcional, lo usa `largo` 16:9): un recorte regional solo se usa si cubre TODO lo visible del globo en
 * este cuadro (si no, se veía su rectángulo de otro tono dentro de un plano más abierto). Por defecto false (Shorts igual).
 */
export const GloboTextura: React.FC<{ texturas: Textura[]; cam: Camara; ancho: number; alto: number; resolucion?: number; soloCubren?: boolean }> = ({ texturas, cam, ancho, alto, resolucion = 0.6, soloCubren = false }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [listas, setListas] = useState(() => texturas.every((t) => cache.has(t.src)));
  const [handle] = useState(() => (texturas.every((t) => cache.has(t.src)) ? null : delayRender('textura del globo')));

  useEffect(() => {
    if (listas) return;
    let vivo = true;
    Promise.all(texturas.map((t) => cargar(t.src))).then(() => {
      if (!vivo) return;
      setListas(true);
      if (handle !== null) continueRender(handle);
    });
    return () => { vivo = false; };
  }, [texturas, listas, handle]);

  useLayoutEffect(() => {
    const canvas = ref.current;
    if (!canvas || !listas) return;
    const W = Math.round(ancho * resolucion), H = Math.round(alto * resolucion);
    if (canvas.width !== W) canvas.width = W;
    if (canvas.height !== H) canvas.height = H;
    const ctx = canvas.getContext('2d')!;
    const salida = ctx.createImageData(W, H);
    const o = salida.data;
    // Texturas de la más fina a la más gruesa; solo las que existen en caché.
    const tex = texturas
      .map((t) => ({ t, px: cache.get(t.src) }))
      .filter((x): x is { t: Textura; px: Pixeles } => !!x.px)
      .sort((a, b) => (a.t.gradosPx ?? 1) - (b.t.gradosPx ?? 1));
    if (!tex.length) { ctx.clearRect(0, 0, W, H); return; }
    const l0 = cam.centro[0] * RAD, f0 = cam.centro[1] * RAD;
    const sf0 = Math.sin(f0), cf0 = Math.cos(f0);
    const k = cam.k * resolucion, cx = (ancho / 2) * resolucion, cy = cam.y * resolucion;
    if (soloCubren && tex.length > 1) {
      // Muestras de lo visible (rejilla 9×6 de la pantalla recortada al disco del globo) → lon/lat.
      const muestras: [number, number][] = [];
      for (let a = 0; a <= 8; a++) for (let c = 0; c <= 5; c++) {
        const x = ((a / 8) * W - cx) / k, y = (cy - (c / 5) * H) / k;
        const r2 = x * x + y * y;
        const [xx, yy] = r2 >= 1 ? [x / Math.sqrt(r2) * 0.999, y / Math.sqrt(r2) * 0.999] : [x, y];
        const z = Math.sqrt(Math.max(0, 1 - xx * xx - yy * yy));
        const la = Math.asin(Math.max(-1, Math.min(1, z * sf0 + yy * cf0))) / RAD;
        let lo = (l0 + Math.atan2(xx, z * cf0 - yy * sf0)) / RAD;
        lo = ((((lo + 180) % 360) + 360) % 360) - 180;
        muestras.push([lo, la]);
      }
      const cubre = (b: [number, number, number, number]) => muestras.every(([lo, la]) => lo >= b[0] && lo <= b[2] && la >= b[1] && la <= b[3]);
      const gruesa = tex[tex.length - 1];
      for (let n = tex.length - 2; n >= 0; n--) if (!cubre(tex[n].t.bbox)) tex.splice(n, 1);
      if (!tex.includes(gruesa)) tex.push(gruesa);
    }
    // Luz arriba a la izquierda, algo de frente.
    const Lx = -0.42, Ly = 0.5, Lz = 0.76;
    const y0 = Math.max(0, Math.floor(cy - k)), y1 = Math.min(H, Math.ceil(cy + k));
    const x0 = Math.max(0, Math.floor(cx - k)), x1 = Math.min(W, Math.ceil(cx + k));
    for (let j = y0; j < y1; j++) {
      const y = (cy - (j + 0.5)) / k;
      for (let i = x0; i < x1; i++) {
        const x = (i + 0.5 - cx) / k;
        const r2 = x * x + y * y;
        if (r2 >= 1) continue;
        const z = Math.sqrt(1 - r2);
        const lat = Math.asin(Math.max(-1, Math.min(1, z * sf0 + y * cf0))) / RAD;
        let lon = (l0 + Math.atan2(x, z * cf0 - y * sf0)) / RAD;
        lon = ((((lon + 180) % 360) + 360) % 360) - 180;
        // De la textura más fina a la más gruesa, compuestas de adelante hacia atrás: cada recorte regional se
        // difumina en el 7 % junto a su borde (si no, en mar oscuro se ve su rectángulo de otro tono).
        let r = 0, g = 0, b = 0, resto = 1;
        for (let n = 0; n < tex.length && resto > 0.002; n++) {
          const { t, px } = tex[n];
          const [w, s, e, nn] = t.bbox;
          if (lon < w || lon > e || lat < s || lat > nn) continue;
          // Bilineal.
          const fx = ((lon - w) / (e - w)) * (px.w - 1), fy = ((nn - lat) / (nn - s)) * (px.h - 1);
          const ix = Math.floor(fx), iy = Math.floor(fy), ax = fx - ix, ay = fy - iy;
          const ix1 = Math.min(px.w - 1, ix + 1), iy1 = Math.min(px.h - 1, iy + 1);
          const p00 = (iy * px.w + ix) * 4, p10 = (iy * px.w + ix1) * 4, p01 = (iy1 * px.w + ix) * 4, p11 = (iy1 * px.w + ix1) * 4;
          const d = px.data;
          const w00 = (1 - ax) * (1 - ay), w10 = ax * (1 - ay), w01 = (1 - ax) * ay, w11 = ax * ay;
          let peso = 1;
          if (n < tex.length - 1) {
            const u = Math.min(1, Math.min((lon - w) / (e - w), (e - lon) / (e - w), (lat - s) / (nn - s), (nn - lat) / (nn - s)) / BORDE);
            peso = u * u * (3 - 2 * u);
          }
          const m = peso * resto;
          r += (d[p00] * w00 + d[p10] * w10 + d[p01] * w01 + d[p11] * w11) * m;
          g += (d[p00 + 1] * w00 + d[p10 + 1] * w10 + d[p01 + 1] * w01 + d[p11 + 1] * w11) * m;
          b += (d[p00 + 2] * w00 + d[p10 + 2] * w10 + d[p01 + 2] * w01 + d[p11 + 2] * w11) * m;
          resto -= m;
        }
        if (resto > 0) { r += OR * resto; g += OG * resto; b += OB * resto; }
        // Océano (azul dominante) → azul marino del canal; la tierra y el hielo quedan.
        const azul = Math.min(1, Math.max(0, (b - r * 1.2 - 8) / 40)) * Math.min(1, Math.max(0, (b - g) / 20 + 0.5));
        if (azul > 0) {
          const m = 0.55 * azul;
          r = r * (1 - m) + OR * m; g = g * (1 - m) + OG * m; b = b * (1 - m) + OB * m;
        }
        const luz = Math.max(0, x * Lx + y * Ly + z * Lz);
        const f = (0.5 + 0.62 * luz) * (0.72 + 0.28 * z);
        const q = (j * W + i) * 4;
        o[q] = Math.min(255, r * f); o[q + 1] = Math.min(255, g * f); o[q + 2] = Math.min(255, b * f);
        // Borde suave (antialias del limbo).
        o[q + 3] = Math.round(255 * Math.min(1, (1 - Math.sqrt(r2)) * k * 1.5));
      }
    }
    ctx.putImageData(salida, 0, 0);
  }, [listas, texturas, cam.centro[0], cam.centro[1], cam.k, cam.y, ancho, alto, resolucion, soloCubren]);

  return (
    <canvas ref={ref} style={{ position: 'absolute', left: 0, top: 0, width: ancho, height: alto, filter: 'saturate(1.35) contrast(1.12) brightness(1.05)' }} />
  );
};
