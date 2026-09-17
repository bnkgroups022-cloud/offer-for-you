import type {
  VideoGenerationProvider,
  GenerateVideoParams,
  GenerateVideoResult,
  VideoJobStatus,
} from "@/lib/providers/provider";

const RUNPOD_BASE_URL = "https://api.runpod.ai/v2";

/**
 * RUNPOD_ENDPOINT is accepted in either form:
 *  - just the endpoint ID (e.g. "abc123xyz") — the common case, resolved
 *    against RunPod's standard base URL.
 *  - a full URL (e.g. "https://api.runpod.ai/v2/abc123xyz") — used as-is,
 *    trailing slash stripped.
 */
function getEndpointUrl(path: string): string {
  const endpoint = process.env.RUNPOD_ENDPOINT;
  if (!endpoint) throw new Error("RUNPOD_ENDPOINT isn't set.");

  const base = endpoint.startsWith("http") ? endpoint.replace(/\/+$/, "") : `${RUNPOD_BASE_URL}/${endpoint}`;
  return `${base}${path}`;
}

function getApiKey(): string {
  const key = process.env.RUNPOD_API_KEY;
  if (!key) throw new Error("RUNPOD_API_KEY isn't set.");
  return key;
}

function mapRunpodStatus(status: unknown): VideoJobStatus["status"] {
  switch (status) {
    case "IN_QUEUE":
      return "queued";
    case "IN_PROGRESS":
      return "processing";
    case "COMPLETED":
      return "completed";
    case "FAILED":
    case "CANCELLED":
    case "TIMED_OUT":
      return "failed";
    default:
      return "processing";
  }
}

/**
 * Wan 2.2 video generation, run on a self-hosted RunPod serverless
 * endpoint (ComfyUI + Wan 2.2 custom worker) — not a vendor-hosted API.
 *
 * RunPod's outer job envelope (POST /run, GET /status/:id, statuses
 * IN_QUEUE / IN_PROGRESS / COMPLETED / FAILED, an `output` object on
 * completion) is RunPod's standard, documented serverless API and is
 * used as-is here.
 *
 * IMPORTANT — the `input` payload sent to /run is defined by YOUR
 * specific ComfyUI worker/workflow; there is no universal schema across
 * custom Wan 2.2 RunPod deployments. The shape below (image_url, prompt,
 * aspect_ratio, duration, style, fps, width, height) is a reasonable
 * default matching common ComfyUI-worker conventions. Similarly,
 * getJobStatus() reads the finished video URL from
 * output.video_url / output.url / output.videoUrl — adjust that list to
 * match whatever key your workflow's output node actually produces
 * (e.g. if your workflow uploads to Cloudinary itself and returns a
 * different field name). Nothing outside this file needs to change if
 * you adjust either shape — see the VideoGenerationProvider contract in
 * ./provider.ts.
 */
export const wanProvider: VideoGenerationProvider = {
  id: "wan",

  isConfigured() {
    return Boolean(process.env.RUNPOD_ENDPOINT && process.env.RUNPOD_API_KEY);
  },

  async generateVideo({
    imageUrl,
    prompt,
    aspectRatio,
    duration,
    style,
  }: GenerateVideoParams): Promise<GenerateVideoResult> {
    const response = await fetch(getEndpointUrl("/run"), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getApiKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: {
          image_url: imageUrl,
          prompt,
          aspect_ratio: aspectRatio ?? "9:16",
          duration: duration ?? 15,
          style: style ?? "ugc",
          fps: 30,
          width: 1080,
          height: 1920,
        },
      }),
    });

    const body = await response.json().catch(() => null);
    const jobId = body?.id;

    if (!response.ok || !jobId) {
      throw new Error(body?.error ?? "RunPod rejected the video generation request.");
    }

    return { jobId: String(jobId) };
  },

  async getJobStatus(jobId: string): Promise<VideoJobStatus> {
    const response = await fetch(getEndpointUrl(`/status/${encodeURIComponent(jobId)}`), {
      headers: { Authorization: `Bearer ${getApiKey()}` },
    });
    const body = await response.json().catch(() => null);

    if (!response.ok || !body) {
      return { status: "failed", error: "Could not reach RunPod for job status." };
    }

    const status = mapRunpodStatus(body.status);

    if (status === "failed") {
      return { status: "failed", error: body.error ?? "RunPod reported the job failed." };
    }
    if (status !== "completed") {
      return { status };
    }

    const videoUrl = body.output?.video_url ?? body.output?.url ?? body.output?.videoUrl;
    if (!videoUrl) {
      return { status: "failed", error: "RunPod completed the job but returned no video URL." };
    }

    return { status: "completed", videoUrl };
  },
};
