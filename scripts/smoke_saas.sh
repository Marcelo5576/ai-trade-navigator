#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"

check_status() {
  local path="$1"
  local expected="$2"
  local code
  code="$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}${path}")"
  if [[ "${code}" != "${expected}" ]]; then
    echo "FAIL ${path} expected ${expected} got ${code}"
    exit 1
  fi
  echo "OK   ${path} -> ${code}"
}

check_status "/" "200"
check_status "/health" "200"
check_status "/api/health" "200"
check_status "/login" "200"
check_status "/dashboard" "200"
check_status "/scanner" "200"
check_status "/sinais" "200"
check_status "/noticias" "200"
check_status "/backtest" "200"
check_status "/estrategias" "200"
check_status "/api/plans" "200"
check_status "/api/billing/status" "200"
check_status "/api/quant/health" "200"
check_status "/api/quant/status" "200"
check_status "/api/quant/operation" "200"

admin_code="$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/api/admin/system-status")"
if [[ "${admin_code}" != "401" && "${admin_code}" != "403" ]]; then
  echo "FAIL /api/admin/system-status expected 401 or 403 got ${admin_code}"
  exit 1
fi
echo "OK   /api/admin/system-status -> ${admin_code}"

echo "Smoke test completed successfully for ${BASE_URL}"
