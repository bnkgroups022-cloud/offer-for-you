import type { SVGProps } from "react";
import type { NavIconKey } from "@/config/brand";

/**
 * Tiny hand-rolled icon set (stroke-based, 24x24) so Phase 1 has zero
 * icon-library dependency. Swap for a proper icon set later if desired —
 * every call site only imports { Icon } from here.
 */
const paths: Record<NavIconKey, string> = {
  dashboard: "M4 4h7v7H4V4Zm9 0h7v4h-7V4Zm0 7h7v9h-7v-9ZM4 14h7v6H4v-6Z",
  upload: "M12 16V4m0 0-4 4m4-4 4 4M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3",
  prompt: "M12 3v3m0 12v3M3 12h3m12 0h3M6 6l2 2m8 8 2 2M6 18l2-2m8-8 2-2",
  script: "M6 3h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm9 0v4h4M8 12h8M8 16h5",
  caption: "M4 5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4 3v-3H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z",
  whatsapp:
    "M12 3a9 9 0 0 0-7.8 13.5L3 21l4.7-1.2A9 9 0 1 0 12 3Zm-3.2 5.1c.2-.5.5-.5.7-.5h.5c.2 0 .4 0 .6.4.2.5.7 1.6.7 1.8s0 .3-.1.5c-.2.2-.3.4-.5.6-.2.2-.3.3-.1.6.2.4.9 1.4 1.9 2.3 1.3 1.1 2.3 1.5 2.6 1.6.3.2.5.1.7-.1.2-.2.8-.9 1-1.2.2-.3.4-.2.7-.1.3.1 1.7.8 2 1 .3.1.5.2.5.4 0 .2 0 1-.4 1.5-.4.6-1.9 1.2-2.6 1.2-.7 0-1.7-.1-3.6-1-2.3-1-3.9-2.9-4.4-3.6-.4-.6-1.1-1.8-1.1-3.4 0-1.6.9-2.4 1.2-2.7Z",
  hashtag: "M9 3 7 21M17 3l-2 18M4 8h16M3 16h16",
  download: "M12 3v12m0 0-4-4m4 4 4-4M4 17v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3",
  projects: "M3 3h7v7H3V3Zm11 0h7v7h-7V3ZM3 14h7v7H3v-7Zm11 0h7v7h-7v-7Z",
};

interface IconProps extends SVGProps<SVGSVGElement> {
  name: NavIconKey;
}

export function Icon({ name, className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name]} />
    </svg>
  );
}
