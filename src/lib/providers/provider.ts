import type { WanVideoStyle } from "@/types/video";

/**
 * Generic video-generation provider contract for GPU-backed / self-hosted
 * generators (Wan 2.2 today, via RunPod). Distinct from
 * src/lib/video/types.ts's VideoProviderAdapter (used by the hosted
 * vendor APIs — Hailuo, PixVerse, Kling) because this one call,
 * generateVideo(), both submits the job AND carries the generation
 * parameters (aspectRatio/duration/style) that a self-hosted
 * ComfyUI/Wan workflow needs up front. A thin adapter
 * (src/lib/video/providers/wan.ts) bridges an implementation of this
 * interface into the existing VideoProviderAdapter registry, so adding
 * this provider didn't require changing /api/video/generate or
 * /api/video/status.
 *
 * Future providers (Hailuo, Kling, PixVerse) can implement this same
 * interface if they're ever moved to a self-hosted/GPU backend instead
 * of a vendor API — for now they stay on VideoProviderAdapter.
 */
export interface GenerateVideoParams {
  /** Cloudinary secure_url of the uploaded product photo. */
  imageUrl: string;
  /** Wan 2.2-optimized generation prompt (see wanPrompt.ts). */
  prompt: string;
  /** e.g. "9:16" for vertical UGC. */
  aspectRatio?: string;
  /** Seconds. */
  duration?: number;
  style?: WanVideoStyle;
}

export interface GenerateVideoResult {
  /** Provider-side job id, used to poll getJobStatus(). */
  jobId: string;
}

export interface VideoJobStatus {
  status: "queued" | "processing" | "completed" | "failed";
  videoUrl?: string;
  error?: string;
}

export interface VideoGenerationProvider {
  id: string;
  /** True once this provider's required env vars are present. */
  isConfigured(): boolean;
  generateVideo(params: GenerateVideoParams): Promise<GenerateVideoResult>;
  getJobStatus(jobId: string): Promise<VideoJobStatus>;
}
