"""
RunPod Serverless handler: ComfyUI + Wan 2.2 image-to-video.

Contract (must match src/lib/providers/wan.ts in the Next.js app):
  input:  { image_url, prompt, aspect_ratio, duration, style, fps, width, height }
  output: { video_url, public_id }   (RunPod wraps this as the job's `output`
                                       once status becomes COMPLETED)

Flow: download the product image -> patch the bundled ComfyUI workflow
template with the image/prompt/size/frame-count -> submit it to the local
ComfyUI instance (already running, see scripts/start.sh) -> poll until
done -> read the rendered .mp4 off disk -> upload it to Cloudinary ->
return the Cloudinary URL. Matches the architecture: RunPod GPU -> Cloudinary.
"""

import json
import os
import time
import uuid
from pathlib import Path
from urllib.parse import urlparse

import cloudinary
import cloudinary.uploader
import requests
import runpod

COMFYUI_PORT = os.environ.get("COMFYUI_PORT", "8188")
COMFYUI_URL = f"http://127.0.0.1:{COMFYUI_PORT}"
COMFYUI_DIR = Path(os.environ.get("COMFYUI_DIR", "/workspace/ComfyUI"))

WORKFLOW_PATH = Path(
    os.environ.get("WORKFLOW_PATH", "/workspace/workflow/wan22_i2v_template.json")
)

# Node IDs in the bundled workflow template — override via env if you swap
# in your own exported workflow with different IDs.
IMAGE_NODE_ID = os.environ.get("WORKFLOW_IMAGE_NODE_ID", "3")
POSITIVE_PROMPT_NODE_ID = os.environ.get("WORKFLOW_PROMPT_NODE_ID", "6")
SIZE_NODE_ID = os.environ.get("WORKFLOW_SIZE_NODE_ID", "27")
VIDEO_OUTPUT_NODE_ID = os.environ.get("WORKFLOW_VIDEO_NODE_ID", "41")

POLL_INTERVAL_SECONDS = float(os.environ.get("COMFYUI_POLL_INTERVAL", "3"))
POLL_TIMEOUT_SECONDS = float(os.environ.get("COMFYUI_POLL_TIMEOUT", "900"))

cloudinary.config(
    cloud_name=os.environ.get("CLOUDINARY_CLOUD_NAME") or os.environ.get("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME"),
    api_key=os.environ.get("CLOUDINARY_API_KEY"),
    api_secret=os.environ.get("CLOUDINARY_API_SECRET"),
    secure=True,
)


def _download_input_image(image_url: str) -> str:
    """Downloads the product photo into ComfyUI's input/ folder and
    returns the filename ComfyUI's LoadImage node should reference."""
    input_dir = COMFYUI_DIR / "input"
    input_dir.mkdir(parents=True, exist_ok=True)

    ext = Path(urlparse(image_url).path).suffix or ".png"
    filename = f"wan22_input_{uuid.uuid4().hex}{ext}"
    dest = input_dir / filename

    response = requests.get(image_url, timeout=60)
    response.raise_for_status()
    dest.write_bytes(response.content)

    return filename


def _build_workflow(image_filename: str, prompt: str, width: int, height: int, frame_count: int) -> dict:
    with open(WORKFLOW_PATH, "r", encoding="utf-8") as f:
        workflow = json.load(f)

    workflow.pop("_comment", None)

    if IMAGE_NODE_ID in workflow:
        workflow[IMAGE_NODE_ID]["inputs"]["image"] = image_filename
    if POSITIVE_PROMPT_NODE_ID in workflow:
        workflow[POSITIVE_PROMPT_NODE_ID]["inputs"]["text"] = prompt
    if SIZE_NODE_ID in workflow:
        workflow[SIZE_NODE_ID]["inputs"]["width"] = width
        workflow[SIZE_NODE_ID]["inputs"]["height"] = height
        workflow[SIZE_NODE_ID]["inputs"]["length"] = frame_count

    return workflow


def _submit_workflow(workflow: dict, client_id: str) -> str:
    response = requests.post(
        f"{COMFYUI_URL}/prompt",
        json={"prompt": workflow, "client_id": client_id},
        timeout=30,
    )
    response.raise_for_status()
    body = response.json()

    prompt_id = body.get("prompt_id")
    node_errors = body.get("node_errors") or {}
    if not prompt_id:
        raise RuntimeError(f"ComfyUI rejected the workflow: {node_errors or body}")
    if node_errors:
        raise RuntimeError(f"ComfyUI reported node errors: {node_errors}")

    return prompt_id


def _wait_for_completion(prompt_id: str) -> dict:
    deadline = time.time() + POLL_TIMEOUT_SECONDS

    while time.time() < deadline:
        response = requests.get(f"{COMFYUI_URL}/history/{prompt_id}", timeout=30)
        response.raise_for_status()
        history = response.json()

        entry = history.get(prompt_id)
        if entry and entry.get("outputs"):
            status = (entry.get("status") or {}).get("status_str")
            if status == "error":
                raise RuntimeError(f"ComfyUI job {prompt_id} failed: {entry.get('status')}")
            return entry

        time.sleep(POLL_INTERVAL_SECONDS)

    raise TimeoutError(f"ComfyUI job {prompt_id} did not finish within {POLL_TIMEOUT_SECONDS}s")


def _extract_video_path(history_entry: dict) -> Path:
    outputs = history_entry.get("outputs", {})
    node_output = outputs.get(VIDEO_OUTPUT_NODE_ID, {})

    # VHS_VideoCombine historically reports its file(s) under "gifs" even
    # for mp4 output; some ComfyUI versions/nodes use "videos" instead.
    files = node_output.get("gifs") or node_output.get("videos") or []
    if not files:
        raise RuntimeError(f"No video output found on node {VIDEO_OUTPUT_NODE_ID}: {outputs}")

    file_info = files[0]
    subfolder = file_info.get("subfolder", "")
    filename = file_info["filename"]

    return COMFYUI_DIR / "output" / subfolder / filename


def _upload_to_cloudinary(video_path: Path) -> dict:
    result = cloudinary.uploader.upload(
        str(video_path),
        resource_type="video",
        folder="offer-for-you/wan-video",
    )
    return {"video_url": result["secure_url"], "public_id": result["public_id"]}


def handler(event: dict) -> dict:
    job_input = event.get("input") or {}

    # Lightweight readiness probe — {"input": {"ping": true}} returns
    # immediately without touching the GPU, useful for manual testing via
    # RunPod's /runsync.
    if job_input.get("ping"):
        return {"status": "ok"}

    image_url = job_input.get("image_url") or job_input.get("imageUrl")
    prompt = job_input.get("prompt")
    if not image_url or not prompt:
        raise ValueError("Both 'image_url' and 'prompt' are required.")

    width = int(job_input.get("width") or 1080)
    height = int(job_input.get("height") or 1920)
    fps = int(job_input.get("fps") or 30)
    duration = float(job_input.get("duration") or 15)
    frame_count = max(1, round(duration * fps))

    image_filename = _download_input_image(image_url)
    workflow = _build_workflow(image_filename, prompt, width, height, frame_count)

    client_id = uuid.uuid4().hex
    prompt_id = _submit_workflow(workflow, client_id)
    history_entry = _wait_for_completion(prompt_id)
    video_path = _extract_video_path(history_entry)

    if not video_path.exists():
        raise RuntimeError(f"Expected output file not found on disk: {video_path}")

    return _upload_to_cloudinary(video_path)


runpod.serverless.start({"handler": handler})
