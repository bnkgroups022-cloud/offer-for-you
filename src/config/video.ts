import type { VideoProviderId } from "@/types/video";

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
];
