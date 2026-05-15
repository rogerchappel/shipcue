#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TMP="${TMPDIR:-/tmp}/shipcue-smoke-$$"
mkdir -p "$TMP"
cd "$TMP"
node "$ROOT/dist/cli.js" init
node "$ROOT/dist/cli.js" scan --fixture "$ROOT/fixtures/repos.json" --now 2026-05-15T00:00:00Z --out data/latest
node "$ROOT/dist/cli.js" build --data data/latest --out site
test -f site/index.html
test -f site/queue.md
test -f data/latest/summary.json
grep -q "rogerchappel/staledock" site/index.html
node "$ROOT/dist/cli.js" brief rogerchappel/staledock --data data/latest --out briefs/staledock.md
grep -q "Release brief" briefs/staledock.md
node "$ROOT/dist/cli.js" agent-prompt rogerchappel/staledock --data data/latest | grep -q "Prepare a safe"
node "$ROOT/dist/cli.js" scan --config missing.json --fixture "$ROOT/fixtures/repos.json" >/tmp/shipcue-missing.out 2>&1 && exit 1 || true
rm -rf "$TMP"
