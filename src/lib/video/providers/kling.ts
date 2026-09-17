import type { VideoProviderAdapter } from "@/lib/video/types";

/**
 * Placeholder, as specced ("Kling — placeholder"). The AI Generator's
 * output is already Kling-ready (see src/lib/openai/prompt.ts), but no
 * Kling API credentials/integration exist yet. Registered in the provider
 * registry so the selector can list and disable it like any other
 * provider, rather than special-casing "Kling" in the UI.
 */
export const klingProvider: VideoProviderAdapter = {
  id: "kling",
  label: "Kling",

  isConfigured() {
    return false;
  },

  async submit() {
    throw new Error("Kling isn't connected yet — coming soon.");
  },

  async checkStatus() {
    throw new Error("Kling isn't connected yet — coming soon.");
  },
};
