"use client";

import clsx from "clsx";
import { ProgressBar } from "@/components/upload/ProgressBar";
import type { UploadItem } from "@/types/upload";

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path
        d="M4 7h16M9 7V4h6v3m-8 0 1 13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-13"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const STATUS_LABEL: Record<UploadItem["status"], string> = {
  queued: "Queued",
  uploading: "Uploading",
  success: "Uploaded",
  error: "Failed",
  deleting: "Deleting",
};

export function UploadItemCard({
  item,
  onRemove,
}: {
  item: UploadItem;
  onRemove: (id: string) => void;
}) {
  const showProgress = item.status === "queued" || item.status === "uploading";

  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white/5">
        {/* Local blob: preview — next/image can't optimize blob URLs. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.previewUrl} alt={item.file.name} className="h-full w-full object-cover" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm text-white">{item.file.name}</p>
          <span
            className={clsx(
              "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
              item.status === "success" && "bg-emerald-400/10 text-emerald-300",
              item.status === "error" && "bg-red-400/10 text-red-300",
              (item.status === "uploading" || item.status === "queued" || item.status === "deleting") &&
                "bg-white/10 text-slate-400"
            )}
          >
            {STATUS_LABEL[item.status]}
          </span>
        </div>

        <p className="mt-0.5 text-xs text-slate-500">{formatBytes(item.file.size)}</p>

        {showProgress && (
          <div className="mt-2">
            <ProgressBar percent={item.progress} />
          </div>
        )}

        {item.status === "error" && item.error && (
          <p className="mt-1 text-xs text-red-400">{item.error}</p>
        )}

        {item.status === "success" && item.asset && (
          <a
            href={item.asset.secureUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-block text-xs text-brand-accent hover:underline"
          >
            View on Cloudinary ↗
          </a>
        )}
      </div>

      <button
        onClick={() => onRemove(item.id)}
        disabled={item.status === "deleting"}
        aria-label={`Remove ${item.file.name}`}
        className="shrink-0 rounded-lg p-2 text-slate-500 transition-colors hover:bg-white/5 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <TrashIcon />
      </button>
    </div>
  );
}
