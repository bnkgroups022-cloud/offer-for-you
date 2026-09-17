import type { NavIconKey } from "@/config/brand";

/**
 * All copy for the landing page lives here, separate from markup, so
 * wording can be tweaked without touching component/layout code.
 */

export const FEATURES: { icon: NavIconKey; title: string; description: string }[] = [
  {
    icon: "upload",
    title: "One-tap image upload",
    description:
      "Drop in a single product photo — no studio shoot, no editing skills required.",
  },
  {
    icon: "prompt",
    title: "AI prompt generator",
    description:
      "Get ready-to-use ad prompts tailored to your product, tone and platform.",
  },
  {
    icon: "script",
    title: "Script generator",
    description:
      "Turn your product into a short-form video script in seconds, not hours.",
  },
  {
    icon: "caption",
    title: "Caption generator",
    description:
      "On-brand captions for Instagram, Facebook and beyond — written for you.",
  },
  {
    icon: "whatsapp",
    title: "WhatsApp copy",
    description:
      "Broadcast-ready WhatsApp messages that read like a friend's recommendation.",
  },
  {
    icon: "hashtag",
    title: "Hashtag generator",
    description: "Relevant, high-reach hashtag sets generated for every post.",
  },
];

export const STEPS: { title: string; description: string }[] = [
  {
    title: "Upload your product photo",
    description: "Take one clear photo of the product you're promoting and upload it.",
  },
  {
    title: "AI generates your ad kit",
    description:
      "Our AI studies the image and writes prompts, scripts, captions, WhatsApp copy and hashtags.",
  },
  {
    title: "Review and customize",
    description: "Tweak the tone, edit any line, and make it sound exactly like you.",
  },
  {
    title: "Download and post",
    description: "Export everything in one click and publish across your channels.",
  },
];

export type PricingTier = {
  name: string;
  description: string;
  highlighted?: boolean;
  features: string[];
};

export const PRICING_TIERS: PricingTier[] = [
  {
    name: "Starter",
    description: "For creators just getting started with affiliate promotion.",
    features: ["5 ad kits / month", "Core generators", "Standard support"],
  },
  {
    name: "Pro",
    description: "For creators posting daily across multiple platforms.",
    highlighted: true,
    features: [
      "Unlimited ad kits",
      "All generators",
      "Priority support",
      "Early access to new features",
    ],
  },
  {
    name: "Business",
    description: "For teams and agencies managing many affiliate accounts.",
    features: ["Everything in Pro", "Team seats", "Dedicated onboarding"],
  },
];

export const FAQS: { question: string; answer: string }[] = [
  {
    question: "What exactly does Offer For You generate for me?",
    answer:
      "From a single product photo, you get an AI-written ad prompt, a short video script, a social caption, a WhatsApp-ready message, and a relevant hashtag set — everything you need to post an affiliate promotion.",
  },
  {
    question: "Do I need any design or copywriting experience?",
    answer:
      "No. Upload a photo and the AI does the writing. You can still edit any generated text before you post it.",
  },
  {
    question: "What image formats can I upload?",
    answer: "JPG, PNG and WebP are all supported, up to a few megabytes per photo.",
  },
  {
    question: "Is there a free plan?",
    answer:
      "Pricing is being finalized and will include a free tier for casual creators. Sign up now and you'll be notified the moment plans go live.",
  },
  {
    question: "Which platforms is the generated content built for?",
    answer:
      "Captions and hashtags are tuned for Instagram and Facebook, scripts for short-form video (Reels/TikTok/Shorts), and copy for WhatsApp broadcast lists — with more formats on the roadmap.",
  },
  {
    question: "Is my product data kept private?",
    answer:
      "Yes. Your uploads and generated content are tied to your account and are never shared with other users.",
  },
];
