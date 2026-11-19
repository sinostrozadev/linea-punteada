/**
 * Valida un guion `frontera` (envoltorio) con el schema real (fórmula + gramática de cámara) e imprime palabras y
 * duración estimada. Uso: npx tsx scripts/validar-guion.mts <guion.json> [...]
 */
import fs from 'node:fs';
import { EnvoltorioFrontera } from '../src/plantillas/frontera/guion';
import { palabrasDelGuion } from '../src/plantillas/comun/guion';
import { estimarTiempos } from '../src/plantillas/comun/plan';

let malos = 0;
for (const ruta of process.argv.slice(2)) {
  const g = JSON.parse(fs.readFileSync(ruta, 'utf8'));
  const r = EnvoltorioFrontera.safeParse(g);
  const p = g.props;
  const t = estimarTiempos(p);
  console.log(`${ruta}\n  ${palabrasDelGuion(p)} palabras · ~${t.total.toFixed(1)} s estimados (sin cierre) · título ${[...g.titulo].length} chars`);
  if (r.success) console.log('  ✓ schema + fórmula + cámara OK');
  else { malos++; for (const i of r.error.issues) console.log(`  ✗ ${i.path.join('.')}: ${i.message}`); }
}
process.exit(malos ? 1 : 0);
