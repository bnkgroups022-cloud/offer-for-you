import type { VideoProviderId } from "@/types/video";
import type { VideoJobStatus } from "@/lib/providers/provider";

/**
 * The contract every video provider adapter implements. This is the whole
 * point of the abstraction: /api/video/generate and /api/video/status only
 * ever talk to this interface, never to a specific provider's SDK/HTTP
 * shape — so adding a new provider (or swapping Hailuo/PixVerse for a
 * different vendor later) means writing one new file, not touching the
 * routes or the UI.
 */
export interface VideoSubmitInput {
  prompt: string;
  /** Reference product image (image-to-video), when the provider supports it. */
  imageUrl?: string;
}

export interface VideoSubmitResult {
  /** Provider-side job/task id, used to poll checkStatus(). */
  jobId: string;
}

export interface VideoStatusResult {
  status: "processing" | "completed" | "failed";
  videoUrl?: string;
  error?: string;
}

export interface VideoProviderAdapter {
  id: VideoProviderId;
  label: string;
  /** True once this provider's required env vars are present. */
  isConfigured(): boolean;
  submit(input: VideoSubmitInput): Promise<VideoSubmitResult>;
  checkStatus(jobId: string): Promise<VideoStatusResult>;
}

/**
 * Converts a VideoGenerationProvider's status (src/lib/providers/provider.ts
 * — used by GPU-backed providers like Wan/RunPod and Hugging Face ZeroGPU,
 * whose jobs can be "queued") into this app's VideoStatusResult (which has
 * no "queued" state). "queued" and "processing" both mean "not done yet"
 * to the frontend, so they collapse to "processing" here.
 *
 * Reconstructing the object (rather than narrowing `jobStatus` in place)
 * is required, not stylistic: TypeScript only narrows a *plain property
 * read* like `jobStatus.status` after an equality check, not the type of
 * the whole `jobStatus` variable — so returning `jobStatus` itself here
 * would still type as VideoJobStatus (queued included) and fail to
 * satisfy VideoStatusResult.
 */
export function toVideoStatusResult(jobStatus: VideoJobStatus): VideoStatusResult {
  if (jobStatus.status === "queued") return { status: "processing" };
  return { status: jobStatus.status, videoUrl: jobStatus.videoUrl, error: jobStatus.error };
}
