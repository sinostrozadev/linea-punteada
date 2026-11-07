#!/usr/bin/env bash
# Commit del bot de producción de Línea Punteada: solo las rutas que se le pasan, mensaje fijo, rebase y push.
#   .github/scripts/commit-bot.sh "bot: producción 2026-11-07" contenido/backlog salida/bandeja ...
# El push se hace con GITHUB_TOKEN: no dispara otros workflows (no hay bucle con producir.yml).
# Si el `git pull --rebase` choca (CONFLICTO, p. ej. en salida/bandeja porque una sesión local
# commiteó el mismo guion), el job FALLA explícitamente: nunca se fuerza ni se pisa el estado ajeno.
# Si solo fue una carrera de push (sin conflicto), reintenta hasta 3 veces.
set -euo pipefail
mensaje="$1"; shift

git config user.name "linea-bot"
git config user.email "linea-bot@users.noreply.github.com"

rutas=()
for r in "$@"; do
  # Solo rutas que existen o que git ya conoce (las borradas del backlog también cuentan).
  if [ -e "$r" ] || git ls-files --error-unmatch "$r" >/dev/null 2>&1; then rutas+=("$r"); fi
done
if [ ${#rutas[@]} -eq 0 ]; then echo "Nada que commitear (ninguna ruta existe)."; exit 0; fi

# -A respeta .gitignore: los mp4/wav/logs de salida/ nunca entran.
git add -A -- "${rutas[@]}"
if git diff --cached --quiet; then echo "Nada que commitear."; exit 0; fi
git diff --cached --stat
git commit -q -m "$mensaje"

for intento in 1 2 3; do
  if ! git pull --rebase origin main; then
    conflictos=$(git diff --name-only --diff-filter=U || true)
    git rebase --abort 2>/dev/null || true
    if [ -n "$conflictos" ]; then
      echo "::error::Conflicto al rebasar el estado del bot sobre main (¿la sesión local o el cron tomaron el mismo guion?). No se fuerza nada. Archivos: $(echo $conflictos)"
      exit 1
    fi
    echo "⚠ pull falló sin conflicto (intento $intento de 3); reintento en $((intento * 15)) s"
    sleep $((intento * 15)); continue
  fi
  if git push origin HEAD:main; then
    echo "✓ push hecho (intento $intento)"
    exit 0
  fi
  echo "⚠ push falló (intento $intento de 3); reintento en $((intento * 15)) s"
  sleep $((intento * 15))
done
echo "::error::No se pudo pushear el estado tras 3 intentos" >&2
exit 1
