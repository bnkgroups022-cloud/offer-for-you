import { slugify } from "@/lib/slugify";

/**
 * Phase 5 — Export System. Lets a single piece of a saved ad kit
 * (rather than the whole thing, see lib/projects/download.ts for that)
 * be downloaded on its own as a ready-to-paste .txt file.
 */
export type ExportableAssetKind = "caption" | "whatsapp" | "hashtags" | "prompt";

export const EXPORTABLE_ASSET_LABELS: Record<ExportableAssetKind, string> = {
  caption: "Instagram Caption",
  whatsapp: "WhatsApp Copy",
  hashtags: "Hashtags",
  prompt: "AI Prompt",
};

const FILENAME_SUFFIX: Record<ExportableAssetKind, string> = {
  caption: "instagram-caption",
  whatsapp: "whatsapp-copy",
  hashtags: "hashtags",
  prompt: "ai-prompt",
};

/** Joins a hashtag array into one paste-ready line, adding "#" where missing. */
export function formatHashtags(hashtags: string[]): string {
  return hashtags.map((tag) => (tag.startsWith("#") ? tag : `#${tag}`)).join(" ");
}

/** Triggers a real client-side download of one ad-kit asset as .txt. */
export function downloadTextAsset(kind: ExportableAssetKind, content: string, productName: string): void {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${slugify(productName)}-${FILENAME_SUFFIX[kind]}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
