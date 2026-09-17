import type { VideoProviderAdapter } from "@/lib/video/types";

const BASE_URL = process.env.HAILUO_API_BASE_URL || "https://api.minimax.chat/v1";

function getApiKey(): string {
  const key = process.env.HAILUO_API_KEY;
  if (!key) throw new Error("HAILUO_API_KEY isn't set.");
  return key;
}

/**
 * Hailuo (MiniMax) video generation adapter.
 *
 * IMPORTANT: the endpoint paths and request/response field names below
 * follow MiniMax's publicly documented video_generation API as of this
 * writing, but this has NOT been tested against a live account (no API
 * key was available while building this). Verify against your provider
 * dashboard's current docs once you have real credentials, and adjust the
 * field names in submit()/checkStatus() if they've changed — the rest of
 * the app (routes, DB, UI) only depends on the VideoProviderAdapter shape
 * in ../types.ts, so fixes stay contained to this one file.
 */
export const hailuoProvider: VideoProviderAdapter = {
  id: "hailuo",
  label: "Hailuo (MiniMax)",

  isConfigured() {
    return Boolean(process.env.HAILUO_API_KEY);
  },

  async submit({ prompt, imageUrl }) {
    const response = await fetch(`${BASE_URL}/video_generation`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getApiKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "video-01",
        prompt,
        ...(imageUrl ? { first_frame_image: imageUrl } : {}),
      }),
    });

    const body = await response.json().catch(() => null);
    const jobId = body?.task_id;

    if (!response.ok || !jobId) {
      throw new Error(body?.base_resp?.status_msg ?? "Hailuo rejected the request.");
    }

    return { jobId: String(jobId) };
  },

  async checkStatus(jobId) {
    const statusResponse = await fetch(
      `${BASE_URL}/query/video_generation?task_id=${encodeURIComponent(jobId)}`,
      { headers: { Authorization: `Bearer ${getApiKey()}` } }
    );
    const statusBody = await statusResponse.json().catch(() => null);

    if (!statusResponse.ok) {
      return { status: "failed", error: statusBody?.base_resp?.status_msg ?? "Status check failed." };
    }
    if (statusBody?.status === "Fail") {
      return { status: "failed", error: "Hailuo reported the generation failed." };
    }
    if (statusBody?.status !== "Success" || !statusBody?.file_id) {
      return { status: "processing" };
    }

    const fileResponse = await fetch(
      `${BASE_URL}/files/retrieve?file_id=${encodeURIComponent(statusBody.file_id)}`,
      { headers: { Authorization: `Bearer ${getApiKey()}` } }
    );
    const fileBody = await fileResponse.json().catch(() => null);
    const videoUrl = fileBody?.file?.download_url;

    if (!fileResponse.ok || !videoUrl) {
      return { status: "failed", error: "Hailuo finished but returned no download URL." };
    }

    return { status: "completed", videoUrl };
  },
};
