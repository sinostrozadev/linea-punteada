// Declaraciones mínimas para librerías sin tipos publicados.
declare module 'versor' {
  type Rotacion = [number, number, number];
  type Cuaternion = [number, number, number, number];
  interface Versor {
    (rotacion: Rotacion): Cuaternion;
    rotation(q: Cuaternion): Rotacion;
    multiply(a: Cuaternion, b: Cuaternion): Cuaternion;
    interpolate(a: Rotacion, b: Rotacion): (t: number) => Rotacion;
    cartesian(lonLat: [number, number]): [number, number, number];
    delta(a: [number, number, number], b: [number, number, number], alpha?: number): Cuaternion;
  }
  const versor: Versor;
  export default versor;
}
declare module 'd3-geo-projection';
