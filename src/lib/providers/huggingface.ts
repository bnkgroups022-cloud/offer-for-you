import type {
  VideoGenerationProvider,
  GenerateVideoParams,
  GenerateVideoResult,
  VideoJobStatus,
} from "@/lib/providers/provider";

const API_NAME = process.env.HUGGINGFACE_API_NAME || "predict";
// How long a single status poll blocks reading the Space's SSE stream
// before giving up and reporting "processing" — see getJobStatus() below.
// Kept under /api/video/status's own maxDuration (30s) with headroom.
const SSE_READ_TIMEOUT_MS = 8000;

function getSpaceBaseUrl(): string {
  const space = process.env.HUGGINGFACE_SPACE;
  if (!space) throw new Error("HUGGINGFACE_SPACE isn't set.");

  // Accepts either a full URL or the "username/space-name" shorthand —
  // public HF Spaces are served at https://<user>-<space>.hf.space
  // (slash replaced with a hyphen, lowercased). This mapping is a stable,
  // documented Hugging Face convention.
  if (space.startsWith("http")) return space.replace(/\/+$/, "");
  return `https://${space.replace("/", "-").toLowerCase()}.hf.space`;
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
 * "Free" provider — a Wan 2.2 (or compatible) image-to-video Gradio Space
 * running on Hugging Face's ZeroGPU (shared, free GPU quota), called
 * through Gradio's REST API rather than a paid vendor API.
 *
 * IMPORTANT — two things you must point at your actual Space:
 *  1. HUGGINGFACE_SPACE must name a real Space exposing an image+prompt
 *     -> video function. HUGGINGFACE_API_NAME (default "predict") must
 *     match that function's api_name, visible on the Space's "Use via
 *     API" page — Gradio auto-generates this from the function name
 *     unless the Space author set it explicitly, so it varies per Space.
 *  2. The `data` array order below (image, prompt, aspect ratio,
 *     duration, style) must match that function's parameter order
 *     exactly — Gradio calls positionally. Check the same "Use via API"
 *     page and reorder if needed.
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
    aspectRatio,
    duration,
    style,
  }: GenerateVideoParams): Promise<GenerateVideoResult> {
    const response = await fetch(getCallUrl(), {
      method: "POST",
      headers: buildHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({
        data: [imageUrl, prompt, aspectRatio ?? "9:16", duration ?? 15, style ?? "ugc"],
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
