import { toVideoStatusResult, type VideoProviderAdapter } from "@/lib/video/types";
import { huggingfaceProvider } from "@/lib/providers/huggingface";

/**
 * Adapts the Hugging Face ZeroGPU provider (src/lib/providers/huggingface.ts,
 * implementing the same VideoGenerationProvider contract as Wan/RunPod) onto
 * this app's existing VideoProviderAdapter contract, so "Free" plugs into
 * the same registry as Hailuo/PixVerse/Kling/Wan with zero changes to
 * /api/video/generate or /api/video/status.
 */
export const huggingfaceVideoAdapter: VideoProviderAdapter = {
  id: "huggingface",
  label: "Free (Hugging Face ZeroGPU)",

  isConfigured() {
    return huggingfaceProvider.isConfigured();
  },

  async submit({ prompt, imageUrl }) {
    if (!imageUrl) throw new Error("This provider requires a product image.");
    const result = await huggingfaceProvider.generateVideo({
      imageUrl,
      prompt,
      aspectRatio: "9:16",
      duration: 15,
    });
    return { jobId: result.jobId };
  },

  async checkStatus(jobId) {
    const result = await huggingfaceProvider.getJobStatus(jobId);
    return toVideoStatusResult(result);
  },
};
