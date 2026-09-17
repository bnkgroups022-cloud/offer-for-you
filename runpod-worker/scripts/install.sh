#!/usr/bin/env bash
# Master install script — run once at Docker build time. Installs system
# packages, ComfyUI, and (if BAKE_MODELS=true, the default) the Wan 2.2
# weights into the image itself.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "[install] Installing system packages..."
apt-get update -y
apt-get install -y --no-install-recommends git wget curl ffmpeg libgl1 libglib2.0-0
rm -rf /var/lib/apt/lists/*

"${SCRIPT_DIR}/install_comfyui.sh"

if [ "${BAKE_MODELS:-true}" = "true" ]; then
  echo "[install] BAKE_MODELS=true — downloading Wan 2.2 weights into the image now."
  "${SCRIPT_DIR}/install_wan22.sh"
else
  echo "[install] BAKE_MODELS=false — skipping model download at build time."
  echo "[install]   start.sh will fetch them at container boot instead, so point"
  echo "[install]   MODEL_DIR at a mounted RunPod Network Volume for that to"
  echo "[install]   actually persist weights across cold starts."
fi

echo "[install] Done."
