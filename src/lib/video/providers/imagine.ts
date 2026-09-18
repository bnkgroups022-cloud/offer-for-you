import type { VideoProviderAdapter } from "@/lib/video/types";

/**
 * Placeholder, as specced ("Keep RunPod and Imagine as placeholders" —
 * Phase 4.1). No "Imagine" API credentials/integration exist yet.
 * Registered in the provider registry so the /dashboard/generate
 * selector can list and disable it like any other provider, rather than
 * special-casing its name in the UI. Mirrors kling.ts.
 */
export const imagineProvider: VideoProviderAdapter = {
  id: "imagine",
  label: "Imagine",

  isConfigured() {
    return false;
  },

  async submit() {
    throw new Error("Imagine isn't connected yet — coming soon.");
  },

  async checkStatus() {
    throw new Error("Imagine isn't connected yet — coming soon.");
  },
};
