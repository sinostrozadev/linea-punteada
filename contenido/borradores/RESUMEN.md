# Borradores `frontera` — 2026-11-06 (6 guiones)

Validados contra `EnvoltorioFrontera` (zod del repo) + lista de GUION.md §7: 0 errores. Palabras = gancho + escenas + remate (`palabrasDelGuion`).

| Archivo | Título | Palabras | Escenas | Rótulos | Fuente en voz | Riesgos |
|---|---|---|---|---|---|---|
| frontera-acre.json | Brasil compró un estado a Bolivia y pagó con un tren que llegó tarde | 342 | 7 | 7 | sí (Tratado de Petrópolis; IBGE) | Bajo. "Caucho se derrumba en 1912" y "semillas sacadas de Brasil" son historia económica establecida, sin fuente primaria citada. Trazado del tren aproximado (5 puntos). |
| frontera-campo-de-hielo.json | Chile y Argentina tienen un tramo de frontera que todavía no existe | 357 | 7 | 7 | sí (acuerdo 1998/ley 25.110; El Mercurio) | Disputa viva: sin opinión, cita a Ampuero textual. **`fronteraEntre` de Natural Earth probablemente dibuja una línea por el tramo pendiente**: revisar el render; si la dibuja, cambiarla por segmentos a mano al norte y al sur. Sección A trazada a mano (aprox.). |
| frontera-laguna-del-desierto.json | Chile y Argentina pelearon un lago por una frase escrita en 1902 | 354 | 7 | 7 | sí (laudo, Naciones Unidas) | Incidente de 1965 en una escena sobria, con las dos versiones ("cada país culpa al otro"). Polígono de la zona en disputa es esquemático (~480 km²). |
| frontera-triangulo-terrestre.json | La Haya repartió el mar entre Perú y Chile… menos 5 canchas de arena | 361 | 7 | 7 | sí (CIJ 2014) | Disputa viva: "Perú dice / Chile dice", cero opinión. Hitos 1–4 reales (OSM); punto Concordia y orilla son estimados (las fuentes dan 260–320 m), el triángulo es esquemático. |
| frontera-rivera-livramento.json | ¿Por qué en esta plaza cambias de país sin mostrar un solo papel? | 342 | 7 | 7 | sí (ley 17.659 del acuerdo de 2002; Ley 18.437) | Bajo. No se habla de monedas, contrabando ni seguridad. Frontera urbana tomada de OSM (admin_level 2). |
| frontera-martin-garcia.json | ¿Por qué hay una isla argentina a solo 3,5 km de Uruguay? | 327 | 7 | 7 | sí (art. 45 del tratado de 1973; Presidencia de Uruguay) | No se afirma "rodeada de aguas uruguayas" (no se confirmó). La línea de la frontera seca con Timoteo Domínguez es aproximada. |

## Hechos ajustados respecto a IDEAS-INICIALES
- **Acre:** el tamaño viene del IBGE (~164.000 km², no ~190.000). El plazo del tren son los 4 años del art. VII ("se esforzará por concluir"), y el giro sale de ahí: obras desde 1907, terminado en 1912. El "Canal de Panamá" quedó fuera por no tener fuente.
- **Martín García:** a 3,5 km de Uruguay y a 36,8 km de San Isidro (es.wikipedia). Se dice "costa continental" porque las islas argentinas de Oyarvide están a 1,5 km. Una fuente dice que está en aguas de uso común, así que "rodeada de aguas uruguayas" quedó fuera. Nuevo giro: la unión con Timoteo Domínguez, la única frontera seca (Presidencia UY 2019).
- **Laguna del Desierto:** coordenada real del lago -72.864, -49.036 (no -72.60). Se cita el área en disputa (~481 km²) en el mapa. La votación (4-1) no se confirmó y no se menciona.
- **Campo de Hielo:** sección A = Murallón–Daudet (delimitada), sección B = Fitz Roy–Murallón (sin delimitar), según Emol. El detalle de "carta 1:50.000" no se confirmó: se dice "carta a escala". Se agrega lo de la comisión inactiva de 1998 a 2006 y la cita de Ampuero de 2018.
- **Triángulo:** 3,7 ha confirmadas (37.610 m²); Hito 1 en -70.3763, -18.3501 (OSM).
- **Rivera:** el giro del portuñol se apoya en la Ley 18.437, art. 40 ("portugués del Uruguay" como lengua materna). Se agregó el acuerdo fronterizo de 2002 (ley 17.659).
