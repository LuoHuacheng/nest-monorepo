#!/usr/bin/env bash
set -euo pipefail

INPUT="$(cat || true)"

if echo "$INPUT" | grep -E '\.env|PRIVATE KEY|AWS_SECRET|DATABASE_URL|JWT_SECRET|key\.properties|\.p12|\.p8|mobileprovision|keystore|jks|google-services\.json|GoogleService-Info\.plist' >/dev/null 2>&1; then
  cat <<'JSON'
{
  "decision": "block",
  "reason": "This operation appears to involve secrets, environment files, or mobile signing credentials. Ask the user before reading, printing, or modifying sensitive configuration."
}
JSON
  exit 0
fi

exit 0
