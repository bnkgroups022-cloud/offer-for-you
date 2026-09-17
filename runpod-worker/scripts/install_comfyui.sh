#!/usr/bin/env bash
# Installs (or updates) ComfyUI itself. Idempotent — safe to re-run.
set -euo pipefail

COMFYUI_DIR="${COMFYUI_DIR:-/workspace/ComfyUI}"
COMFYUI_REPO="${COMFYUI_REPO:-https://github.com/comfyanonymous/ComfyUI.git}"
COMFYUI_REF="${COMFYUI_REF:-master}"

echo "[install_comfyui] Target: ${COMFYUI_DIR} (${COMFYUI_REPO}@${COMFYUI_REF})"

if [ -d "${COMFYUI_DIR}/.git" ]; then
  echo "[install_comfyui] Already cloned — pulling latest ${COMFYUI_REF}."
  git -C "${COMFYUI_DIR}" fetch --depth 1 origin "${COMFYUI_REF}"
  git -C "${COMFYUI_DIR}" checkout "${COMFYUI_REF}"
  git -C "${COMFYUI_DIR}" pull --ff-only origin "${COMFYUI_REF}"
else
  git clone --depth 1 --branch "${COMFYUI_REF}" "${COMFYUI_REPO}" "${COMFYUI_DIR}"
fi

pip install --no-cache-dir -r "${COMFYUI_DIR}/requirements.txt"

mkdir -p "${COMFYUI_DIR}/custom_nodes" "${COMFYUI_DIR}/input" "${COMFYUI_DIR}/output" "${COMFYUI_DIR}/models"

echo "[install_comfyui] Done."
