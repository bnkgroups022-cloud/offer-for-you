"use client";

import { CopyButton } from "@/components/generator/CopyButton";
import { buildWanCaption, buildWanHashtags } from "@/lib/providers/wanPrompt";
import type { WanVideoStyle } from "@/types/video";

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path
        d="M12 3v12m0 0-4-4m4 4 4-4M4 17v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path
        d="M8.5 10.5 15.5 7m-7 6.5 7 3.5M8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm12-6a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm0 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Result screen shown once a video finishes generating: preview, Download
 * MP4, and (templated, since this flow doesn't go through the AI
 * Generator's ad kit) Copy Caption / Copy Hashtags — see buildWanCaption/
 * buildWanHashtags in src/lib/providers/wanPrompt.ts.
 */
export function VideoResultScreen({
  videoUrl,
  productName,
  category,
  style,
}: {
  videoUrl: string;
  productName: string;
  category?: string;
  style: WanVideoStyle;
}) {
  const caption = buildWanCaption({ productName, style });
  const hashtags = buildWanHashtags({ productName, category });
  const hashtagsText = hashtags.join(" ");

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: productName || "Product video", url: videoUrl });
      } catch {
        // User cancelled the share sheet — not an error.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(videoUrl);
    } catch {
      // Clipboard unavailable — fail silently, same as CopyButton.
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <video controls src={videoUrl} className="w-full rounded-xl border border-white/10 bg-black" />

      <div className="flex gap-2">
        <a
          href={videoUrl}
          download
          target="_blank"
          rel="noreferrer"
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10"
        >
          <DownloadIcon />
          Download MP4
        </a>
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10"
        >
          <ShareIcon />
          Share
        </button>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
        <p className="flex-1 truncate text-xs text-slate-300">{caption}</p>
        <CopyButton text={caption} label="Copy Caption" />
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
        <p className="flex-1 truncate text-xs text-slate-300">{hashtagsText}</p>
        <CopyButton text={hashtagsText} label="Copy Hashtags" />
      </div>
    </div>
  );
}
