/**
 * Central brand + navigation configuration.
 * Keeping these in one place means every phase (dashboard, generators,
 * downloads, etc.) stays visually and structurally consistent.
 */

export const BRAND = {
  name: "Offer For You",
  shortName: "BNK Ad Studio",
  tagline: "AI Ad Studio for affiliate creators",
  colors: {
    primary: "#344CB7",
    secondary: "#577BC1",
    accent: "#0EA5E9",
    dark: "#000957",
  },
} as const;

export type NavItem = {
  label: string;
  href: string;
  icon: NavIconKey;
  /** Feature not built yet — shown disabled with a "Coming soon" badge. */
  comingSoon?: boolean;
};

export type NavIconKey =
  | "dashboard"
  | "upload"
  | "prompt"
  | "script"
  | "caption"
  | "whatsapp"
  | "hashtag"
  | "download"
  | "projects";

/**
 * V1.0 nav map. "Upload Product" isn't a separate route — it lives as a
 * widget on the Dashboard itself (Phase 2). The five separate generator
 * placeholders from Phase 1 (Prompt/Script/Caption/WhatsApp/Hashtag) have
 * been consolidated into one "AI Generator" page (Phase 3), since the
 * product always generates the full ad kit in a single pass rather than
 * as five separate tools. "My Projects" (Phase 4) lists every saved ad
 * kit, backed by Supabase. "Download Assets" (Phase 5) is the Export
 * System — pick a saved project and download its Caption, WhatsApp
 * Copy, Hashtags or AI Prompt individually (or the full kit at once).
 */
export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
  { label: "AI Generator", href: "/dashboard/generate", icon: "prompt" },
  { label: "My Projects", href: "/dashboard/projects", icon: "projects" },
  { label: "Download Assets", href: "/dashboard/downloads", icon: "download" },
];
