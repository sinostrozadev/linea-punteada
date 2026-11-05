import { loadFont as cargarBricolage } from '@remotion/google-fonts/BricolageGrotesque';
import { loadFont as cargarInter } from '@remotion/google-fonts/Inter';
import { loadFont as cargarBebas } from '@remotion/google-fonts/BebasNeue';
import { loadFont as cargarOswald } from '@remotion/google-fonts/Oswald';

let cargadas = false;
/** Carga las fuentes de marca una sola vez. Llamar al inicio de cada composición. */
export const cargarFuentes = () => {
  if (cargadas) return;
  cargadas = true;
  cargarBricolage('normal', { weights: ['700', '800'], subsets: ['latin', 'latin-ext'] });
  cargarInter('normal', { weights: ['500', '700', '800'], subsets: ['latin', 'latin-ext'] });
  // Condensadas (frontera v2: subtítulos en bloques, etiquetas de mapa, tarjetas de cifra).
  cargarBebas('normal', { weights: ['400'], subsets: ['latin', 'latin-ext'] });
  cargarOswald('normal', { weights: ['500', '600', '700'], subsets: ['latin', 'latin-ext'] });
};
