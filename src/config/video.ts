import type { VideoProviderId, WanVideoStyle } from "@/types/video";

/**
 * Client-safe provider metadata for the selector UI. Deliberately doesn't
 * import src/lib/video/* (server-only — reads API keys), so this file is
 * safe to bundle into "use client" components.
 */
export const VIDEO_PROVIDER_OPTIONS: {
  id: VideoProviderId;
  label: string;
  placeholder: boolean;
}[] = [
  { id: "hailuo", label: "Hailuo (MiniMax)", placeholder: false },
  { id: "pixverse", label: "PixVerse", placeholder: false },
  { id: "kling", label: "Kling", placeholder: true },
  { id: "wan", label: "Wan 2.2 (RunPod)", placeholder: false },
  { id: "huggingface", label: "Free (Hugging Face ZeroGPU)", placeholder: false },
];

/**
 * Provider options for the video card on /dashboard/generate. Distinct
 * from VIDEO_PROVIDER_OPTIONS above (the Download Assets page's fuller
 * list, unchanged) — here, per Phase 4.1, only Free (ZeroGPU) is wired
 * up; RunPod and Imagine are shown as disabled "coming soon" options.
 */
export const GENERATE_PAGE_PROVIDER_OPTIONS: {
  id: VideoProviderId;
  label: string;
  placeholder: boolean;
}[] = [
  { id: "huggingface", label: "Free (ZeroGPU)", placeholder: false },
  { id: "wan", label: "RunPod (Wan 2.2)", placeholder: true },
  { id: "imagine", label: "Imagine", placeholder: true },
];

/** Video style presets for the UGC ad generator on /dashboard/generate. */
export const WAN_VIDEO_STYLE_OPTIONS: { value: WanVideoStyle; label: string }[] = [
  { value: "ugc", label: "UGC" },
  { value: "cinematic", label: "Cinematic" },
  { value: "luxury", label: "Luxury" },
  { value: "tech", label: "Tech Product" },
];
