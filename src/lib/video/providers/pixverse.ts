import type { VideoProviderAdapter } from "@/lib/video/types";

const BASE_URL = process.env.PIXVERSE_API_BASE_URL || "https://openapi.pixverseai.com/openapi/v2";

function getApiKey(): string {
  const key = process.env.PIXVERSE_API_KEY;
  if (!key) throw new Error("PIXVERSE_API_KEY isn't set.");
  return key;
}

/**
 * PixVerse video generation adapter.
 *
 * IMPORTANT: same caveat as hailuo.ts — the endpoint paths and field
 * names follow PixVerse's publicly documented Open Platform API as of
 * this writing, but this has NOT been tested against a live account.
 * Verify against your provider dashboard's current docs once you have
 * real credentials and adjust submit()/checkStatus() as needed; nothing
 * else in the app depends on these details.
 */
export const pixverseProvider: VideoProviderAdapter = {
  id: "pixverse",
  label: "PixVerse",

  isConfigured() {
    return Boolean(process.env.PIXVERSE_API_KEY);
  },

  async submit({ prompt, imageUrl }) {
    const endpoint = imageUrl ? "/video/img/generate" : "/video/text/generate";
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "API-KEY": getApiKey(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        ...(imageUrl ? { img_url: imageUrl } : {}),
      }),
    });

    const body = await response.json().catch(() => null);
    const jobId = body?.Resp?.video_id ?? body?.video_id;

    if (!response.ok || !jobId) {
      throw new Error(body?.ErrMsg ?? body?.message ?? "PixVerse rejected the request.");
    }

    return { jobId: String(jobId) };
  },

  async checkStatus(jobId) {
    const response = await fetch(`${BASE_URL}/video/result/${encodeURIComponent(jobId)}`, {
      headers: { "API-KEY": getApiKey() },
    });
    const body = await response.json().catch(() => null);

    if (!response.ok) {
      return { status: "failed", error: body?.ErrMsg ?? "Status check failed." };
    }

    const status = body?.Resp?.status ?? body?.status;

    // PixVerse status codes per public docs at time of writing:
    // 1 = generating, 2 = success, 3 = failed. Adjust if your account
    // reports different values.
    if (status === 2) {
      const videoUrl = body?.Resp?.url ?? body?.url;
      if (!videoUrl) return { status: "failed", error: "PixVerse finished but returned no video URL." };
      return { status: "completed", videoUrl };
    }
    if (status === 3) {
      return { status: "failed", error: "PixVerse reported the generation failed." };
    }
    return { status: "processing" };
  },
};
