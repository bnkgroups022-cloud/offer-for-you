#!/usr/bin/env bash
# Health endpoint for this worker. ComfyUI exposes /system_stats natively
# once it's up and its model-loading init has finished — used here both
# as the Dockerfile's HEALTHCHECK and as the readiness gate start.sh
# blocks on before handing off to the RunPod handler loop.
set -euo pipefail

PORT="${COMFYUI_PORT:-8188}"
URL="http://127.0.0.1:${PORT}/system_stats"

if curl -sf --max-time 5 "${URL}" > /dev/null; then
  echo "[health_check] OK — ComfyUI responding on port ${PORT}."
  exit 0
else
  echo "[health_check] FAIL — ComfyUI not responding on port ${PORT}."
  exit 1
fi
