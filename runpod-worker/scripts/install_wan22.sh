#!/usr/bin/env bash
# Installs the Wan 2.2 ComfyUI custom node + downloads the Wan 2.2 model
# weights. Idempotent — re-running skips the download if weights already
# exist at MODEL_DIR (so this is safe to call again from start.sh when
# BAKE_MODELS=false, e.g. targeting a persistent Network Volume).
#
# IMPORTANT: the custom-node repo, the HF model repo id, and the exact
# folder layout ComfyUI expects for Wan 2.2 weights are all things that
# change as the ecosystem moves — verify WAN22_NODE_REPO / WAN22_MODEL_REPO
# below against current docs before a production deploy, and override
# them via env vars if they've changed rather than editing this file.
set -euo pipefail

COMFYUI_DIR="${COMFYUI_DIR:-/workspace/ComfyUI}"
MODEL_DIR="${MODEL_DIR:-${COMFYUI_DIR}/models}"
WAN22_NODE_REPO="${WAN22_NODE_REPO:-https://github.com/kijai/ComfyUI-WanVideoWrapper.git}"
WAN22_MODEL_REPO="${WAN22_MODEL_REPO:-Wan-AI/Wan2.2-I2V-A14B}"
HF_TOKEN="${HF_TOKEN:-}"

echo "[install_wan22] Installing Wan 2.2 custom node from ${WAN22_NODE_REPO}"
NODE_DIR="${COMFYUI_DIR}/custom_nodes/ComfyUI-WanVideoWrapper"
if [ -d "${NODE_DIR}/.git" ]; then
  git -C "${NODE_DIR}" pull --ff-only
else
  git clone --depth 1 "${WAN22_NODE_REPO}" "${NODE_DIR}"
fi
if [ -f "${NODE_DIR}/requirements.txt" ]; then
  pip install --no-cache-dir -r "${NODE_DIR}/requirements.txt"
fi

# ComfyUI-VideoHelperSuite provides the VHS_VideoCombine node used by the
# bundled workflow template (workflow/wan22_i2v_template.json) to export
# the final result as an .mp4 rather than a frame sequence.
VHS_DIR="${COMFYUI_DIR}/custom_nodes/ComfyUI-VideoHelperSuite"
if [ -d "${VHS_DIR}/.git" ]; then
  git -C "${VHS_DIR}" pull --ff-only
else
  git clone --depth 1 https://github.com/Kosinkadink/ComfyUI-VideoHelperSuite.git "${VHS_DIR}"
fi
if [ -f "${VHS_DIR}/requirements.txt" ]; then
  pip install --no-cache-dir -r "${VHS_DIR}/requirements.txt"
fi

echo "[install_wan22] Downloading Wan 2.2 weights (${WAN22_MODEL_REPO}) into ${MODEL_DIR}/wan2.2"
mkdir -p "${MODEL_DIR}/wan2.2"

MARKER="${MODEL_DIR}/wan2.2/.installed"
if [ -f "${MARKER}" ]; then
  echo "[install_wan22] ${MARKER} exists — weights already present, skipping download."
else
  pip install --no-cache-dir -U "huggingface_hub[cli]"
  if [ -n "${HF_TOKEN}" ]; then
    huggingface-cli login --token "${HF_TOKEN}" --add-to-git-credential
  fi
  huggingface-cli download "${WAN22_MODEL_REPO}" --local-dir "${MODEL_DIR}/wan2.2"
  touch "${MARKER}"
fi

echo "[install_wan22] Done. If ComfyUI-WanVideoWrapper's loader nodes expect"
echo "  weights under a specific subfolder (diffusion_models/, vae/,"
echo "  text_encoders/, etc.) rather than the flat ${MODEL_DIR}/wan2.2 layout"
echo "  above, symlink or move the downloaded files to match its README."
