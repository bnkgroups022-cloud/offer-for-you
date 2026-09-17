# RunPod Serverless worker: ComfyUI + Wan 2.2 (image-to-video).
#
# Matches the contract src/lib/providers/wan.ts already calls from the
# Next.js app: POST /run -> {id}, GET /status/:id -> {status, output}.
# RunPod's platform provides /run, /status/:id and /health automatically
# once this image is deployed as a Serverless endpoint — this Dockerfile
# only has to produce a container that starts ComfyUI and a handler.py
# loop that RunPod invokes per job.
#
# Build-time model baking (default) keeps the image self-contained and
# matches "Complete RunPod setup" as a single build. For faster cold
# starts on repeat deploys, set --build-arg BAKE_MODELS=false and mount a
# RunPod Network Volume at MODEL_DIR instead — start.sh downloads the
# weights once onto that volume on first boot and reuses them after.
FROM runpod/pytorch:2.4.0-py3.11-cuda12.4.1-devel-ubuntu22.04

ARG BAKE_MODELS=true
ENV BAKE_MODELS=${BAKE_MODELS} \
    DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1 \
    COMFYUI_DIR=/workspace/ComfyUI \
    MODEL_DIR=/workspace/ComfyUI/models \
    COMFYUI_PORT=8188

WORKDIR /workspace

COPY scripts/ /workspace/scripts/
RUN chmod +x /workspace/scripts/*.sh

# System deps + ComfyUI + (conditionally) Wan 2.2 weights.
RUN /workspace/scripts/install.sh

COPY requirements.txt /workspace/requirements.txt
RUN pip install --no-cache-dir -r /workspace/requirements.txt

COPY handler.py /workspace/handler.py
COPY workflow/ /workspace/workflow/

# Health check hits ComfyUI's own /system_stats endpoint locally inside
# the container — see scripts/health_check.sh.
HEALTHCHECK --interval=30s --timeout=10s --start-period=300s --retries=5 \
  CMD /workspace/scripts/health_check.sh || exit 1

# Auto start: boots ComfyUI, waits until healthy, then hands off to the
# RunPod serverless handler loop. No manual steps after `docker run`.
CMD ["/workspace/scripts/start.sh"]
