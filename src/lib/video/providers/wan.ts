import type { VideoProviderAdapter } from "@/lib/video/types";
import { wanProvider } from "@/lib/providers/wan";

/**
 * Adapts the Wan 2.2 / RunPod provider (src/lib/providers/wan.ts,
 * following the VideoGenerationProvider contract specced for this
 * feature) onto this app's existing VideoProviderAdapter contract, so it
 * plugs into the same registry as Hailuo/PixVerse/Kling with zero
 * changes to /api/video/generate or /api/video/status.
 */
export const wanVideoAdapter: VideoProviderAdapter = {
  id: "wan",
  label: "Wan 2.2 (RunPod)",

  isConfigured() {
    return wanProvider.isConfigured();
  },

  async submit({ prompt, imageUrl }) {
    if (!imageUrl) throw new Error("Wan 2.2 requires a product image.");
    const result = await wanProvider.generateVideo({
      imageUrl,
      prompt,
      aspectRatio: "9:16",
      duration: 15,
    });
    return { jobId: result.jobId };
  },

  async checkStatus(jobId) {
    const result = await wanProvider.getJobStatus(jobId);
    if (result.status === "queued") return { status: "processing" };
    return result;
  },
};
