import type { VideoProviderAdapter } from "@/lib/video/types";
import type { VideoProviderId } from "@/types/video";
import { hailuoProvider } from "@/lib/video/providers/hailuo";
import { pixverseProvider } from "@/lib/video/providers/pixverse";
import { klingProvider } from "@/lib/video/providers/kling";
import { wanVideoAdapter } from "@/lib/video/providers/wan";

/**
 * Single place that knows every provider that exists. To add a new video
 * provider: write an adapter file next to hailuo.ts/pixverse.ts matching
 * VideoProviderAdapter, then register it here — no other file needs to
 * change.
 */
const registry: Record<VideoProviderId, VideoProviderAdapter> = {
  hailuo: hailuoProvider,
  pixverse: pixverseProvider,
  kling: klingProvider,
  wan: wanVideoAdapter,
};

export function getVideoProvider(id: VideoProviderId): VideoProviderAdapter {
  return registry[id];
}

export function listVideoProviders(): VideoProviderAdapter[] {
  return Object.values(registry);
}
