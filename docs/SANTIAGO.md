# Lo único que necesita Santiago (Línea Punteada) — actualizado 2026-11-05 00:30

## 1. Verificación de YouTube para crear el canal (bloqueante, 2 minutos)
Al pedir "Crear un canal" YouTube exige una verificación única de la cuenta ("Get advanced features"): **video de 6 s de
tu cara o documento de identidad**. Es tu identidad: lo haces tú.
- La pantalla está abierta en el piloto: **http://localhost:8777/ver** (YouTube Studio → "Get advanced features"). Si se
  cerró: https://studio.youtube.com/?d=ttw&ttf=al
- Elige "Take a 6-second video of yourself" (más rápido; aprobación "en unas horas") o "Use your ID". Sigue los pasos.
- Cuando llegue el correo de aprobación (a sinostrozadev@gmail.com), Claude crea el canal **Línea Punteada**
  (@lineapunteada), sube avatar y banner (`marca-canal/`), pega la descripción (`marca-canal/canal.md`) y programa los
  primeros Shorts. No hace falta que hagas nada más.
- Alternativa si no quieres verificar hoy: renombrar tu canal personal (@Santiago-k4b8b, sin videos) a Línea Punteada.
  No lo hice sin tu OK porque es tu canal personal.

## 2. Más adelante (no urgente)
- `crontab -e` con las líneas de `scripts/cron.txt` cuando exista (Claude te avisa).
- `.wslconfig memory=12GB` (pendiente desde Bolita Lab: menos OOM en renders).
- Secretos de GitHub cuando se encienda la nube (igual que Bolita Lab).
