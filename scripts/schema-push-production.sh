#!/usr/bin/env bash
# Push prisma/schema.prisma to PRODUCTION, the documented way, in one command:
#
#   bash scripts/schema-push-production.sh
#
# unlock every table, db push, relock, then prove there is no drift left. The
# push runs twice because CockroachDB creates new tables schema_locked, so a
# change that adds a table fails on the index step the first time; the relock
# picks the new table up and the second pass finishes (docs/branch-flow.md).
# For changes that only add columns the second pass is a no-op.
#
# Push to staging FIRST (same steps with the local .env and no --production),
# or the next main build fails. The URL is read from the gitignored production
# env file; nothing secret lives here.
set -euo pipefail
cd "$(dirname "$0")/.."
URL="$(sed -nE 's/^DATABASE_URL="?([^"]+)"?$/\1/p' .env.production-backup-2026-09-04 | head -1)"
if [ -z "$URL" ]; then
  echo "no DATABASE_URL in .env.production-backup-2026-09-04" >&2
  exit 1
fi
export DATABASE_URL="$URL"
for pass in 1 2; do
  echo "== pass $pass"
  node scripts/schema-lock.mjs unlock --production
  npx prisma db push --skip-generate || echo "(pass $pass push failed; expected on pass 1 when a table is new)"
  node scripts/schema-lock.mjs lock --production
done
echo "== drift check (must say: No difference detected.)"
npx prisma migrate diff --from-url "$URL" --to-schema-datamodel prisma/schema.prisma
