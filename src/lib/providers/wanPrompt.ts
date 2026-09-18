import type { WanVideoStyle } from "@/types/video";

const STYLE_DIRECTION: Record<WanVideoStyle, string> = {
  ugc: "Warm indoor lighting. Cinematic handheld camera. Natural, candid facial expressions, like a real customer filming on their phone.",
  cinematic: "Dramatic cinematic lighting with soft shadows. Smooth, deliberate camera movement — slow push-ins and subtle pans. Polished, editorial mood.",
  luxury: "Soft premium studio lighting with elegant reflections. Slow, graceful camera movement. Minimal, high-end set design. Refined, confident expressions.",
  tech: "Clean, bright studio lighting with sharp highlights. Precise, controlled camera movement. Sleek modern setting. Focused, professional demeanor.",
};

/**
 * Builds a Wan 2.2-optimized prompt for a 15-second vertical UGC-style
 * product advertisement: short, concrete, visually descriptive sentences
 * (Wan 2.2 responds better to this than one long paragraph), always
 * ending with the technical spec line so every generation stays
 * consistent regardless of style.
 */
export function buildWanPrompt({
  productName,
  category,
  style,
}: {
  productName: string;
  category?: string;
  style: WanVideoStyle;
}): string {
  const lines = [
    "Create a realistic 15-second vertical UGC advertisement.",
    `A person naturally uses the uploaded product: ${productName}${category ? ` (${category})` : ""}.`,
    STYLE_DIRECTION[style],
    "Close-up product shots mixed with natural, everyday moments.",
    "Premium commercial quality, shot on a modern smartphone camera.",
    "1080x1920, 30fps.",
  ];

  return lines.join(" ");
}

const CAPTION_STYLE_LINE: Record<WanVideoStyle, string> = {
  ugc: "loving how natural this feels in everyday life",
  cinematic: "obsessed with how premium this looks on camera",
  luxury: "this is what quiet luxury looks like",
  tech: "the tech upgrade you didn't know you needed",
};

/** A short, ready-to-post Instagram-style caption for the Result screen's
 *  Copy Caption button — templated, not AI-generated (this flow doesn't
 *  go through the AI Generator's ad kit). */
export function buildWanCaption({
  productName,
  style,
}: {
  productName: string;
  style: WanVideoStyle;
}): string {
  return `${productName} ✨ ${CAPTION_STYLE_LINE[style]}. Tap to see it in action 👇`;
}

function slugWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);
}

/** A handful of relevant hashtags for the Result screen's Copy Hashtags
 *  button, derived from the product name/category — templated, same
 *  caveat as buildWanCaption. */
export function buildWanHashtags({
  productName,
  category,
}: {
  productName: string;
  category?: string;
}): string[] {
  const fromProduct = slugWords(productName).map((word) => `#${word}`);
  const fromCategory = category ? slugWords(category).map((word) => `#${word}`) : [];
  const base = ["#ad", "#musthave", "#shopnow", "#newdrop"];

  return Array.from(new Set([...fromProduct, ...fromCategory, ...base])).slice(0, 10);
}
