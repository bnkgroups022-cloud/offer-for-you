"use client";

import { useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { downloadProjectAsText } from "@/lib/projects/download";
import type { Project } from "@/types/project";

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M12 3v12m0 0-4-4m4 4 4-4M4 17v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

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

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

export function ProjectCard({
  project,
  isDeleting,
  onDelete,
}: {
  project: Project;
  isDeleting: boolean;
  onDelete: (id: string) => void;
}) {
  const [imgError, setImgError] = useState(false);

  function handleDelete() {
    const confirmed = window.confirm(
      `Delete "${project.productName}"? This removes its saved ad kit and its photo from Cloudinary. This can't be undone.`
    );
    if (confirmed) onDelete(project.id);
  }

  return (
    <Card className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-xl bg-white/5 sm:h-16 sm:w-16">
        {!imgError ? (
          <Image
            src={project.imageUrl}
            alt={project.productName}
            fill
            sizes="(max-width: 640px) 100vw, 64px"
            className="object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">
            No preview
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white">{project.productName}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
          <span>{project.category}</span>
          <span aria-hidden="true">·</span>
          <span>{project.language}</span>
          <span aria-hidden="true">·</span>
          <span>Created {formatDate(project.createdAt)}</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 self-stretch sm:self-auto">
        <button
          onClick={() => downloadProjectAsText(project)}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-white/10 sm:flex-none"
        >
          <DownloadIcon />
          Download
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-xs font-medium text-red-300 transition-colors hover:bg-red-400/20 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
        >
          <TrashIcon />
          {isDeleting ? "Deleting…" : "Delete"}
        </button>
      </div>
    </Card>
  );
}
