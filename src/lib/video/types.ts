import type { VideoProviderId } from "@/types/video";

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
