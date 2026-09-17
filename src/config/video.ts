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
];

/** Video style presets for the Wan 2.2 UGC ad generator on /dashboard/generate. */
export const WAN_VIDEO_STYLE_OPTIONS: { value: WanVideoStyle; label: string }[] = [
  { value: "ugc", label: "UGC" },
  { value: "cinematic", label: "Cinematic" },
  { value: "luxury", label: "Luxury" },
  { value: "tech", label: "Tech Product" },
];
