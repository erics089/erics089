#!/usr/bin/env bash
# Startet das imondu Sales-Dashboard lokal.
set -e
cd "$(dirname "$0")"

# venv anlegen/aktivieren
if [ ! -d ".venv" ]; then
  echo "→ Erstelle virtuelle Umgebung…"
  python3 -m venv .venv
fi
# shellcheck disable=SC1091
source .venv/bin/activate

echo "→ Installiere Abhängigkeiten…"
pip install -q -r requirements.txt

# DB seeden, falls noch leer
python - <<'PY'
from app import db
db.init_db()
if db.stats()["total"] == 0:
    import seed; seed.main()
PY

PORT="${PORT:-8000}"
echo ""
echo "════════════════════════════════════════════════"
echo "  imondu Sales-Dashboard läuft:  http://localhost:${PORT}"
echo "════════════════════════════════════════════════"
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT}"
