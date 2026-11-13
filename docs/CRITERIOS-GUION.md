# Criterios de guion — Línea Punteada (borrador para aprobación de Santiago, 2026-11-13)
> Base: `docs/GUION.md` §2–§7, `docs/DIRECCION-VISUAL.md` y la skill `videos-largos`. Formato común: `yt/_propuestas/plantilla-criterios-guion.md`.

## 1. Bloqueantes
| # | Criterio | ¿Lo comprueba una máquina? |
|---|---|---|
| B1 | Schema zod (fórmula, 300–480 palabras, 5–9 escenas, `dice` literal, ≥ 4 rótulos) | sí: `scripts/generar-guiones.mts` |
| B2 | Gramática de cámara sin errores (R2, R5, plano < 1 s) | sí: `npx tsx scripts/camara.mts <guion> --solo-resumen` |
| B3 | Cada hecho, cifra y fecha verificado con fuente primaria; informe en `contenido/verificaciones/` | no: revisor con web (el `claude -p` del generador no tiene web) |
| B4 | ≥ 1 escena con `fuenteEnVoz` y la institución dicha | parcial: zod |
| B5 | Promesa ("Y al final…") antes del segundo 28 (≈ 77 palabras) | no todavía (pendiente en el generador) |
| B6 | Disputas con las dos versiones, sin opinión; sin persona viva en imagen | no: revisor |
| B7 | Título ≤ 70 con contradicción, no repetido ni de Ñerd (REFERENTES §6) | parcial |

### Bloqueantes extra del largo (`largo` 16:9)
| B8 | Duración real ≥ 8:00 y 1.100–1.400 palabras; 4–6 capítulos de 90–150 s, cada uno con su giro | parcial: zod de `src/plantillas/largo/guion.ts` + ffprobe |
|---|---|---|
| B9 | Re-enganche 10–15 s antes de cada mid-roll; el primer corte no antes de ~2:30 | no: revisor |
| B10 | Validador del largo sin errores: nada estático > 8 s, ≥ 1 s cada 3 palabras, R1–R5 | sí: `preparar-largo.mts` (modelo.ts) |
| B11 | Texto 100 % nuevo (no compilación, orden de Santiago 11-08) | no: revisor |

## 2. Rúbrica 1–5
| Criterio | 1 | 3 | 5 |
|---|---|---|---|
| Gancho | "¿Sabías que…?" | rareza sin lugar | lugar señalado en el cuadro 0 + contradicción + pregunta en ≤ 30 palabras |
| Claridad | saltos de lugar sin explicar | se sigue con esfuerzo | alguien que no sabe nada sigue la historia |
| Ritmo / cámara | cortes secos que desorientan | 0 errores, muchos avisos | ≥ 8 cambios de imagen/min, 0 errores, ≤ 3 avisos |
| Giro | no hay inversión | consecuencia previsible | inversión real con cifra |
| Variedad | mismo andamiaje palabra por palabra que la tanda | variación leve | actos con nombre de la pieza en 1 de cada 3 guiones, conectores propios |
| Cierre | pide suscripción | remate flojo | huella `hoy` visible + remate espejo ≤ 100 caracteres |
| Parecido a Ñerd (Beagle) | lejos | similar | iguala o supera su arranque |

## 3. Umbral
Todos los bloqueantes, promedio ≥ 4 y ninguno < 3. Una reescritura; si vuelve a fallar, el guion va a `contenido/reserva/`.

## 4. Veredicto
Mismo JSON que la plantilla común (`/home/santiago/projects/yt/_propuestas/plantilla-criterios-guion.md` §4), con `"canal":"linea-punteada"`.

## 5. Ejemplos
- **Aprobaría:** `contenido/guiones/2026-11-09-frontera-por-que-chile-y-peru-prometieron-votar.json`: 351 palabras, 28 planos, 0 errores y 0 avisos de cámara, verificación con 3 correcciones aplicadas, dos versiones de la disputa.
- **No aprobaría:** `contenido/guiones/2026-11-05-frontera-laguna-del-desierto.json` (versión original): `camara.mts` da 43 planos, 5 errores y 17 avisos → B2 falla. Es justo el video donde Santiago marcó los cambios de cámara bruscos.

## 6. Preferencias de Santiago
- "el zoom orienta, el corte a otro lugar desorienta" (11-05); los cambios de cámara bruscos lo dejaron perdido.
- Quedar MEJOR que Ñerd: trazados, líneas divisorias, nivel de detalle, fluidez, imágenes sin marca (11-05).
- No subir compilaciones (11-08).
- Decisión abierta: GUION.md exige "La verdad es más rara" y "Y aquí está el giro", pero Bolita Lab las prohibió por repetitivas.
