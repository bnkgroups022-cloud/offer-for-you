#!/usr/bin/env bash
# Auto-start entrypoint (Dockerfile CMD). Boots ComfyUI, blocks until it
# reports healthy, then starts the RunPod serverless handler loop — the
# container needs zero manual steps after `docker run` / RunPod deploy.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMFYUI_DIR="${COMFYUI_DIR:-/workspace/ComfyUI}"
COMFYUI_PORT="${COMFYUI_PORT:-8188}"

if [ "${BAKE_MODELS:-true}" != "true" ]; then
  echo "[start] BAKE_MODELS=false — ensuring Wan 2.2 weights are present before boot..."
  "${SCRIPT_DIR}/install_wan22.sh"
fi

echo "[start] Launching ComfyUI on 127.0.0.1:${COMFYUI_PORT}..."
python3 "${COMFYUI_DIR}/main.py" \
  --listen 127.0.0.1 \
  --port "${COMFYUI_PORT}" \
  --disable-auto-launch \
  > /workspace/comfyui.log 2>&1 &

COMFYUI_PID=$!
echo "[start] ComfyUI started (pid ${COMFYUI_PID}). Waiting for health..."

READY=0
for _ in $(seq 1 90); do
  if "${SCRIPT_DIR}/health_check.sh" > /dev/null 2>&1; then
    READY=1
    break
  fi
  if ! kill -0 "${COMFYUI_PID}" 2>/dev/null; then
    echo "[start] ComfyUI process exited unexpectedly. Log tail:"
    tail -n 200 /workspace/comfyui.log || true
    exit 1
  fi
  sleep 5
done

if [ "${READY}" -ne 1 ]; then
  echo "[start] ComfyUI did not become healthy in time (450s). Log tail:"
  tail -n 200 /workspace/comfyui.log || true
  exit 1
fi

echo "[start] ComfyUI is healthy. Starting the RunPod serverless handler..."
exec python3 /workspace/handler.py
