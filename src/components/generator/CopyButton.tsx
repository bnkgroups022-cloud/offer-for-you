"use client";

import { useState } from "react";
import clsx from "clsx";

export function CopyButton({
  text,
  label = "Copy",
  className,
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API can be unavailable (permissions/insecure context) —
      // fail silently rather than showing a scary error for a copy button.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={clsx(
        "shrink-0 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-300 transition-colors hover:bg-white/10",
        copied && "border-emerald-400/30 text-emerald-300",
        className
      )}
    >
      {copied ? "Copied ✓" : label}
    </button>
  );
}
