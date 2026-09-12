#!/usr/bin/env bash
# Run a curator script against PRODUCTION.
#
#   bash scripts/prod.sh scripts/review-2026-09-12.ts
#   bash scripts/prod.sh scripts/review-2026-09-12.ts --apply
#
# Exists because the one-line form - DATABASE_URL="$(sed ... )" npx tsx ... -
# is long enough that the terminal wraps it when pasted, and the wrapped
# second line then runs the .ts file as a shell script. The URL is read from
# the production env file, which is gitignored; nothing secret lives here.
set -euo pipefail
cd "$(dirname "$0")/.."
URL="$(sed -nE 's/^DATABASE_URL="?([^"]+)"?$/\1/p' .env.production-backup-2026-09-04 | head -1)"
if [ -z "$URL" ]; then
  echo "no DATABASE_URL in .env.production-backup-2026-09-04" >&2
  exit 1
fi
DATABASE_URL="$URL" exec npx tsx "$@"
