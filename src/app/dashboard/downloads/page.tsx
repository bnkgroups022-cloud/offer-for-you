"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { AssetExportCard } from "@/components/downloads/AssetExportCard";
import { GenerateVideoCard } from "@/components/downloads/GenerateVideoCard";
import { useProjects } from "@/hooks/useProjects";
import { downloadProjectAsText } from "@/lib/projects/download";
import { formatHashtags } from "@/lib/export/assetExport";

export default function DownloadsPage() {
  const { projects, status } = useProjects();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Default to the most recent project once the list loads. If the
  // selected project gets deleted elsewhere, fall back to the new first
  // one rather than pointing at nothing.
  useEffect(() => {
    if (projects.length === 0) return;
    if (!selectedId || !projects.some((p) => p.id === selectedId)) {
      setSelectedId(projects[0].id);
    }
  }, [projects, selectedId]);

  const project = projects.find((p) => p.id === selectedId) ?? null;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white sm:text-2xl">Download Assets</h2>
          <p className="mt-1 text-sm text-slate-400">
            Export individual pieces of a saved ad kit — ready to paste straight into Instagram, WhatsApp, or your video tool.
          </p>
        </div>
        <Link href="/dashboard/generate" className="shrink-0">
          <Button size="md" variant="secondary">
            New Ad Kit
          </Button>
        </Link>
      </div>

      {status === "loading" && projects.length === 0 ? (
        <div className="flex flex-col gap-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/[0.03]" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={<Icon name="download" className="h-5 w-5" />}
          title="Nothing to export yet"
          description="Generate an ad kit first — every result is saved automatically, and you'll be able to export its pieces here."
          action={
            <Link href="/dashboard/generate">
              <Button size="sm" variant="secondary">
                Open AI Generator
              </Button>
            </Link>
          }
        />
      ) : project ? (
        <div className="flex flex-col gap-5">
          <div>
            <label htmlFor="project" className="mb-1.5 block text-xs font-medium text-slate-400">
              Project
            </label>
            <select
              id="project"
              value={project.id}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white focus:border-brand-accent focus:outline-none sm:max-w-sm"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.productName} · {new Date(p.createdAt).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AssetExportCard
              kind="caption"
              title="Instagram Caption"
              content={project.adKit.instagramCaption}
              productName={project.productName}
            />
            <AssetExportCard
              kind="whatsapp"
              title="WhatsApp Copy"
              content={project.adKit.whatsappMessage}
              productName={project.productName}
            />
            <AssetExportCard
              kind="hashtags"
              title="Hashtags"
              content={formatHashtags(project.adKit.hashtags)}
              productName={project.productName}
            />
            <AssetExportCard
              kind="prompt"
              title="AI Prompt"
              content={project.adKit.klingPrompt}
              productName={project.productName}
            />
          </div>

          <GenerateVideoCard />

          <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm text-white">Need everything at once?</p>
              <p className="text-xs text-slate-500">
                Download the full ad kit — analysis, hooks, script and all — as one text file.
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => downloadProjectAsText(project)}>
              Download full kit
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
