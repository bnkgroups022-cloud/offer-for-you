export type VideoProviderId = "hailuo" | "pixverse" | "kling";

export type VideoStatus = "idle" | "processing" | "completed" | "failed";

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
