#!/usr/bin/env bash
# Production deployment: builds, tags and pushes the ComfyUI + Wan 2.2
# worker image, then prints the exact steps to finish the deploy on
# RunPod's Serverless console. The build/push steps below are fully
# automated and stable; RunPod's CLI/API surface for *creating* a
# Serverless endpoint changes fairly often, so this deliberately hands
# that one step to the (always-current) web console rather than risk a
# stale API call silently doing the wrong thing in production.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKER_DIR="$(dirname "${SCRIPT_DIR}")"

IMAGE="${DOCKER_IMAGE:?Set DOCKER_IMAGE, e.g. docker.io/youruser/offer-for-you-wan22}"
TAG="${IMAGE_TAG:-$(git -C "${WORKER_DIR}" rev-parse --short HEAD 2>/dev/null || date +%Y%m%d%H%M%S)}"
FULL_IMAGE="${IMAGE}:${TAG}"
BAKE_MODELS="${BAKE_MODELS:-true}"
MODEL_DIR="${MODEL_DIR:-/workspace/ComfyUI/models}"
RUNPOD_GPU_TYPE="${RUNPOD_GPU_TYPE:-NVIDIA RTX A5000}"
RUNPOD_ENDPOINT_NAME="${RUNPOD_ENDPOINT_NAME:-offer-for-you-wan22}"

echo "[deploy] Building ${FULL_IMAGE} (BAKE_MODELS=${BAKE_MODELS})..."
docker build \
  --build-arg BAKE_MODELS="${BAKE_MODELS}" \
  -t "${FULL_IMAGE}" \
  -t "${IMAGE}:latest" \
  "${WORKER_DIR}"

echo "[deploy] Pushing ${FULL_IMAGE} and ${IMAGE}:latest..."
docker push "${FULL_IMAGE}"
docker push "${IMAGE}:latest"

echo "[deploy] Image pushed: ${FULL_IMAGE}"

if command -v runpodctl > /dev/null 2>&1 && [ -n "${RUNPOD_API_KEY:-}" ]; then
  echo "[deploy] runpodctl detected — you can also try managing the endpoint"
  echo "[deploy] via 'runpodctl' directly; check 'runpodctl --help' for the"
  echo "[deploy] serverless subcommands on your installed version, since"
  echo "[deploy] RunPod's CLI surface for this changes fairly often. The"
  echo "[deploy] console steps below always work regardless of CLI version."
  runpodctl config --apiKey "${RUNPOD_API_KEY}" > /dev/null 2>&1 || true
fi

cat <<EOF

[deploy] Next step — create or update the Serverless endpoint:
  1. https://www.runpod.io/console/serverless -> New Endpoint (or select
     your existing "${RUNPOD_ENDPOINT_NAME}" endpoint -> Edit).
  2. Container Image: ${FULL_IMAGE}
  3. GPU: ${RUNPOD_GPU_TYPE} or larger — Wan 2.2 I2V needs real VRAM.
  4. Container Disk: >= 40GB if BAKE_MODELS=true (weights baked into the
     image). If BAKE_MODELS=false, attach a Network Volume at
     ${MODEL_DIR} instead and a smaller disk is fine.
  5. Environment Variables: copy every value from
     runpod-worker/.env.example (CLOUDINARY_* at minimum).
  6. Deploy. Once workers show "Ready", your endpoint URL is:
       https://api.runpod.ai/v2/<ENDPOINT_ID>
     Set that (or just <ENDPOINT_ID>) as RUNPOD_ENDPOINT in the Next.js
     app's .env.local, alongside RUNPOD_API_KEY.
  7. Sanity check without spending GPU time on a real generation:
       curl -X POST https://api.runpod.ai/v2/<ENDPOINT_ID>/runsync \\
         -H "Authorization: Bearer \$RUNPOD_API_KEY" \\
         -H "Content-Type: application/json" \\
         -d '{"input": {"ping": true}}'
     Expect {"output": {"status": "ok"}, ...} once a worker is warm.
  8. Platform-provided health check for the endpoint itself (worker pool
     status, not a single container):
       curl https://api.runpod.ai/v2/<ENDPOINT_ID>/health \\
         -H "Authorization: Bearer \$RUNPOD_API_KEY"

EOF
