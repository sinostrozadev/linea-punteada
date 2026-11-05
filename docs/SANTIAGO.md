# Lo único que necesita Santiago (Línea Punteada) — actualizado 2026-11-05 01:20

## ✅ Hecho esta noche
- Verificación de identidad aprobada (correo "Congrats, Bolita Lab! You can use advanced YouTube features", 00:39).
  Era por cuenta, no por canal: por eso el correo nombra a Bolita Lab. No se creó ninguna cuenta de Google nueva.
- **Canal creado: https://www.youtube.com/@lineapunteada** (id `UCp05AZK18-TL8pp74ntbdUw`), canal de marca de la
  cuenta sinostrozadev, con avatar, banner, marca de agua y descripción publicados.

## ✅ 1. Audiencia del canal: "not made for kids" (Santiago lo marcó 2026-11-05 ~01:00; verificado por Claude)
El script de subida por Studio hereda la audiencia del canal y se niega a subir si no está en "Not made for kids".
Es una declaración legal (COPPA) y la marcas tú:
- Studio → Settings → Channel → **Advanced settings** → "Audience" → **"No, set this channel as not made for kids"** → Save.
- URL directa: https://studio.youtube.com/channel/UCp05AZK18-TL8pp74ntbdUw?d=sd&sds=channel&sdst=advanced
- Claude te deja esa pantalla abierta en http://localhost:8777/ver cuando termine la noche. Sin esto no se programan Shorts.

## 2. Más adelante (no urgente)
- `crontab -e` con las líneas de `scripts/cron.txt` cuando exista (Claude te avisa).
- `.wslconfig memory=12GB` (pendiente desde Bolita Lab: menos OOM en renders).
- Secretos de GitHub cuando se encienda la nube (igual que Bolita Lab).
