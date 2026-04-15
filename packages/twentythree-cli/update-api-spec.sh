#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SPEC_FILE="$SCRIPT_DIR/specs/twentythree-api-swagger.json"
SPEC_URL="https://video.twentythree.com/apidocs/swagger.json"

mkdir -p "$SCRIPT_DIR/specs"

echo "Downloading TwentyThree API spec..."
curl -sSf "$SPEC_URL" -o "$SPEC_FILE"

echo ""
echo "=== Changes ==="
if git -C "$SCRIPT_DIR" ls-files --error-unmatch "specs/twentythree-api-swagger.json" 2>/dev/null; then
  git -C "$SCRIPT_DIR" diff specs/twentythree-api-swagger.json || true
else
  echo "New spec file — no previous version to diff"
fi

echo ""
echo "Regenerating types..."
cd "$(git -C "$SCRIPT_DIR" rev-parse --show-toplevel)"
pnpm generate-types

echo ""
echo "Done. If the diff shows API changes:"
echo "  1. Run: pnpm --filter twentythree-cli exec tsc --noEmit"
echo "  2. Paste the diff + any TypeScript errors into Claude Code"
echo "  3. Follow CLAUDE.md § 'API Change Workflow'"
