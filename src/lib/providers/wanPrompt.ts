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
