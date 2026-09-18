import type {
  VideoGenerationProvider,
  GenerateVideoParams,
  GenerateVideoResult,
  VideoJobStatus,
} from "@/lib/providers/provider";

// Default target Space, verified live against its own /config endpoint:
// https://huggingface.co/spaces/Saravutw/WAN2.2_I2V_LIGHTNING_4-8step_custom
// — a public, ZeroGPU-hosted Wan 2.2 image-to-video Space (310+ likes,
// actively running at the time this was wired up). Its real api_name is
// "generate_video", not Gradio's generic "predict" default. Like any
// community Space, it has no uptime guarantee — point HUGGINGFACE_SPACE /
// HUGGINGFACE_API_NAME at your own Space if this one goes down or changes
// its function signature (re-check via GET <space>.hf.space/config and
// update the `data` array in generateVideo() below to match).
const API_NAME = process.env.HUGGINGFACE_API_NAME || "generate_video";
const DEFAULT_NEGATIVE_PROMPT =
  "blurry, low quality, chaotic, deformed, watermark, bad anatomy, shaky camera view point";
// How long a single status poll blocks reading the Space's SSE stream
// before giving up and reporting "processing" — see getJobStatus() below.
// Kept under /api/video/status's own maxDuration (30s) with headroom.
const SSE_READ_TIMEOUT_MS = 8000;

function getSpaceBaseUrl(): string {
  const space = process.env.HUGGINGFACE_SPACE;
  if (!space) throw new Error("HUGGINGFACE_SPACE isn't set.");

  if (space.startsWith("http")) return space.replace(/\/+$/, "");

  // Public HF Spaces are served at https://<owner>-<space>.hf.space —
  // the whole "owner/space" name is lowercased and every run of
  // non-alphanumeric characters (slash, dots, underscores, ...) becomes
  // a single hyphen. Verified against the default Space above, whose
  // name contains both dots and underscores (a plain slash->hyphen swap,
  // the previous version of this function, resolves to the wrong host
  // for names like that).
  const slug = space
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `https://${slug}.hf.space`;
}

/** Clamps to the default Space's "Duration (seconds)" slider range. */
function clampDuration(seconds: number): number {
  return Math.min(10, Math.max(0.5, seconds));
}

function getCallUrl(): string {
  return `${getSpaceBaseUrl()}/gradio_api/call/${API_NAME}`;
}

function buildHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { ...extra };
  const token = process.env.HUGGINGFACE_API_KEY;
  // Optional — a token raises your ZeroGPU quota and is required for
  // private Spaces, but public Spaces work anonymously too.
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

/**
 * Reads a Gradio SSE response (from GET .../call/{api_name}/{event_id})
 * until a terminal "complete" or "error" event arrives, or `timeoutMs`
 * elapses — whichever comes first. Returns null on timeout (caller should
 * treat that as "still processing" and poll again later), matching the
 * fact that ZeroGPU generation can take minutes, far longer than any
 * single HTTP round trip should block for.
 */
async function readSseUntilTerminal(
  response: Response,
  timeoutMs: number
): Promise<{ event: string; data: string } | null> {
  if (!response.body) return null;

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  const deadline = Date.now() + timeoutMs;

  try {
    while (Date.now() < deadline) {
      const remaining = deadline - Date.now();
      const result = await Promise.race([
        reader.read(),
        new Promise<{ done: true; value: undefined }>((resolve) =>
          setTimeout(() => resolve({ done: true, value: undefined }), remaining)
        ),
      ]);

      if (result.done) break;

      buffer += decoder.decode(result.value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop() ?? "";

      for (const part of parts) {
        let event = "message";
        let data = "";
        for (const line of part.split("\n")) {
          if (line.startsWith("event:")) event = line.slice(6).trim();
          else if (line.startsWith("data:")) data += line.slice(5).trim();
        }
        if (event === "complete" || event === "error") {
          return { event, data };
        }
      }
    }
  } finally {
    reader.cancel().catch(() => {});
  }

  return null;
}

/** Pulls a video URL out of a Gradio outputs array, whatever shape the
 *  Space's video output component reports it in. */
function extractVideoUrl(outputs: unknown): string | undefined {
  if (!Array.isArray(outputs)) return undefined;

  for (const item of outputs) {
    if (typeof item === "string" && item.startsWith("http")) return item;

    if (item && typeof item === "object") {
      const obj = item as Record<string, unknown>;
      if (typeof obj.url === "string") return obj.url;

      const nestedVideo = obj.video;
      if (nestedVideo && typeof nestedVideo === "object") {
        const nestedUrl = (nestedVideo as Record<string, unknown>).url;
        if (typeof nestedUrl === "string") return nestedUrl;
      }

      if (typeof obj.path === "string") {
        return `${getSpaceBaseUrl()}/file=${obj.path}`;
      }
    }
  }

  return undefined;
}

/**
 * "Free" provider — a Wan 2.2 image-to-video Gradio Space running on
 * Hugging Face's ZeroGPU (shared, free GPU quota), called through
 * Gradio's REST API rather than a paid vendor API. Defaults to, and is
 * verified against, the live Space named at the top of this file.
 *
 * If you point HUGGINGFACE_SPACE at a different Space: check its real
 * api_name and parameter order (GET <space>.hf.space/config, or its "Use
 * via API" page) and update the `data` array in generateVideo() below to
 * match — Gradio calls functions positionally, and both the function
 * name and parameter list are specific to each Space.
 *
 * Gradio's REST flow is submit-once-then-stream (SSE), not a RunPod-style
 * submit+poll-by-id job API. getJobStatus() re-opens the SSE connection
 * for the same event_id on every poll and reads with a bounded timeout —
 * Gradio does support reconnecting to an in-flight event_id's stream, so
 * this correctly surfaces "processing" until a terminal event shows up,
 * without needing to hold one connection open for the whole generation.
 */
export const huggingfaceProvider: VideoGenerationProvider = {
  id: "huggingface",

  isConfigured() {
    return Boolean(process.env.HUGGINGFACE_SPACE);
  },

  async generateVideo({
    imageUrl,
    prompt,
    duration,
    style,
  }: GenerateVideoParams): Promise<GenerateVideoResult> {
    // The default target Space has no separate "style"/"aspect ratio"
    // controls (aspect ratio follows the input image), so style is
    // folded into the prompt text itself instead of a dedicated field.
    const promptText = style ? `${style} style. ${prompt}` : prompt;

    // Positional args for api_name "generate_video", in the exact order
    // its /config reports — Gradio calls functions positionally, so this
    // order matters. Everything after promptText is a generation knob
    // the Space exposes that this app has no equivalent field for; the
    // values below are that Space's own defaults.
    const response = await fetch(getCallUrl(), {
      method: "POST",
      headers: buildHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({
        data: [
          { url: imageUrl }, // Input Image
          null, // Last Image (Optional)
          promptText, // Prompt
          4, // Inference Steps
          DEFAULT_NEGATIVE_PROMPT, // Negative Prompt
          clampDuration(duration ?? 10), // Duration (seconds) — Space max is 10
          1, // Guidance Scale - high noise stage
          1, // Guidance Scale 2 - low noise stage
          0, // Seed (ignored — Randomize seed is true below)
          true, // Randomize seed
          5, // Video Quality
          "UniPCMultistep", // Scheduler
          3.0, // Flow Shift
          16, // Video Fluidity (frames per second)
          false, // Safe Mode
          true, // Display result — must stay true so a video is returned
        ],
      }),
    });

    const body = await response.json().catch(() => null);
    const eventId = body?.event_id;

    if (!response.ok || !eventId) {
      throw new Error(body?.error ?? "The Hugging Face Space rejected the request.");
    }

    return { jobId: String(eventId) };
  },

  async getJobStatus(jobId: string): Promise<VideoJobStatus> {
    const response = await fetch(`${getCallUrl()}/${encodeURIComponent(jobId)}`, {
      headers: buildHeaders({ Accept: "text/event-stream" }),
    });

    if (!response.ok) {
      return { status: "failed", error: `The Space returned HTTP ${response.status}.` };
    }

    const terminal = await readSseUntilTerminal(response, SSE_READ_TIMEOUT_MS);
    if (!terminal) {
      return { status: "processing" };
    }

    if (terminal.event === "error") {
      return { status: "failed", error: terminal.data || "Generation failed on the Space." };
    }

    let outputs: unknown;
    try {
      outputs = JSON.parse(terminal.data);
    } catch {
      return { status: "failed", error: "Could not parse the Space's response." };
    }

    const videoUrl = extractVideoUrl(outputs);
    if (!videoUrl) {
      return { status: "failed", error: "The Space completed but returned no video output." };
    }

    return { status: "completed", videoUrl };
  },
};
