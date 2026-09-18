export type VideoProviderId = "hailuo" | "pixverse" | "kling" | "wan" | "huggingface" | "imagine";

export type VideoStatus = "idle" | "processing" | "completed" | "failed";

/** Video style presets for the Wan 2.2 UGC ad generator (Phase 1). */
export type WanVideoStyle = "ugc" | "cinematic" | "luxury" | "tech";

/** A project's current (single-slot) video generation attempt. Re-running
 *  Generate Video overwrites this — it's the latest attempt, not a history. */
export interface ProjectVideo {
  provider: VideoProviderId | null;
  prompt: string | null;
  status: VideoStatus;
  jobId: string | null;
  url: string | null;
  error: string | null;
}

export const IDLE_VIDEO: ProjectVideo = {
  provider: null,
  prompt: null,
  status: "idle",
  jobId: null,
  url: null,
  error: null,
};
