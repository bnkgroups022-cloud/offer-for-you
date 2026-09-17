import Image from "next/image";
import clsx from "clsx";
import type { AppUser } from "@/types/user";

const SIZE_CLASSES = {
  sm: "h-7 w-7 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
} as const;

interface UserAvatarProps {
  user: Pick<AppUser, "displayName" | "photoURL"> | null;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
}

function getInitials(name: string | null | undefined): string {
  if (!name) return "U";
  return (
    name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U"
  );
}

/**
 * Google profile photo when available, otherwise a colored initials
 * badge — shared by the Topbar and the dashboard welcome card so the
 * user's avatar always looks the same wherever it appears.
 */
export function UserAvatar({ user, size = "md", className }: UserAvatarProps) {
  const sizeClass = SIZE_CLASSES[size];
  const pixelSize = size === "lg" ? 56 : size === "md" ? 40 : 28;

  if (user?.photoURL) {
    return (
      <Image
        src={user.photoURL}
        alt={user.displayName ?? "Profile photo"}
        width={pixelSize}
        height={pixelSize}
        className={clsx("shrink-0 rounded-full object-cover", sizeClass, className)}
      />
    );
  }

  return (
    <span
      className={clsx(
        "flex shrink-0 items-center justify-center rounded-full bg-brand-primary font-semibold text-white",
        sizeClass,
        className
      )}
      aria-hidden="true"
    >
      {getInitials(user?.displayName)}
    </span>
  );
}
