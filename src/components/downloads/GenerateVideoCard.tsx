"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { Card, CardHeader } from "@/components/ui/Card";
import { CopyButton } from "@/components/generator/CopyButton";
import { VIDEO_PROVIDER_OPTIONS } from "@/config/video";
import { useVideoGenerator } from "@/hooks/useVideoGenerator";
import type { Project } from "@/types/project";
import type { ProjectVideo, VideoProviderId } from "@/types/video";

function VideoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="5" width="13" height="14" rx="2" />
      <path d="m21 8-5 3 5 3V8Z" strokeLinejoin="round" />
    </svg>
  );
}

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

const fieldControl =
  "w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-brand-accent focus:outline-none";

function firstConfigurableProvider(): VideoProviderId {
  return VIDEO_PROVIDER_OPTIONS.find((p) => !p.placeholder)?.id ?? VIDEO_PROVIDER_OPTIONS[0].id;
}

export function GenerateVideoCard({
  project,
  uid,
  onVideoChange,
  className,
}: {
  project: Project;
  uid: string | undefined;
  onVideoChange: (projectId: string, video: ProjectVideo) => void;
  className?: string;
}) {
  const [video, setVideo] = useState<ProjectVideo>(project.video);
  const [provider, setProvider] = useState<VideoProviderId>(
    project.video.provider ?? firstConfigurableProvider()
  );
  const [prompt, setPrompt] = useState(project.video.prompt ?? project.adKit.klingPrompt);

  // Reset local state whenever the selected project changes.
  useEffect(() => {
    setVideo(project.video);
    setProvider(project.video.provider ?? firstConfigurableProvider());
    setPrompt(project.video.prompt ?? project.adKit.klingPrompt);
  }, [project.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const { generate, isSubmitting, submitError } = useVideoGenerator({
    projectId: project.id,
    uid,
    imageUrl: project.imageUrl,
    initialVideo: project.video,
    onVideoChange: (next) => {
      setVideo(next);
      onVideoChange(project.id, next);
    },
  });

  const isProcessing = video.status === "processing" || isSubmitting;
  const selectedOption = VIDEO_PROVIDER_OPTIONS.find((p) => p.id === provider);

  return (
    <Card className={clsx("flex flex-col gap-4", className)}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary/20 text-brand-accent">
            <VideoIcon />
          </span>
          <div>
            <p className="text-sm font-semibold text-white">Generate Video</p>
            <p className="text-xs text-slate-500">Turns the AI Prompt into a short video via your chosen provider</p>
          </div>
        </div>
      </CardHeader>

      <div>
        <span className="mb-1.5 block text-xs font-medium text-slate-400">Video Provider</span>
        <div className="flex flex-wrap gap-2">
          {VIDEO_PROVIDER_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              disabled={option.placeholder || isProcessing}
              onClick={() => setProvider(option.id)}
              title={option.placeholder ? `${option.label} isn't connected yet — coming soon.` : undefined}
              className={clsx(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                option.placeholder
                  ? "cursor-not-allowed border-white/10 bg-white/[0.03] text-slate-600"
                  : provider === option.id
                    ? "border-brand-accent/40 bg-brand-accent/15 text-brand-accent"
                    : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
              )}
            >
              {option.label}
              {option.placeholder && (
                <span className="ml-1.5 rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] uppercase tracking-wide">
                  Soon
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="videoPrompt" className="text-xs font-medium text-slate-400">
            Video Prompt
          </label>
          <CopyButton text={prompt} />
        </div>
        <textarea
          id="videoPrompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isProcessing}
          rows={4}
          className={clsx(fieldControl, "resize-none disabled:opacity-60")}
        />
      </div>

      <button
        type="button"
        disabled={isProcessing || !selectedOption || selectedOption.placeholder || prompt.trim().length === 0}
        onClick={() => generate(provider, prompt.trim())}
        className={clsx(
          "inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
          isProcessing || !selectedOption || selectedOption.placeholder || prompt.trim().length === 0
            ? "cursor-not-allowed border border-white/10 bg-white/5 text-slate-500"
            : "bg-brand-primary text-white hover:bg-brand-secondary"
        )}
      >
        {isProcessing && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        )}
        {isProcessing ? "Generating…" : "Generate Video"}
      </button>

      {submitError && <p className="text-xs text-red-400">{submitError}</p>}

      {/* Processing status */}
      {video.status === "processing" && (
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
          <span className="relative flex h-3 w-3">
            <span className="absolute h-3 w-3 animate-ping rounded-full bg-brand-accent/60" />
            <span className="relative h-3 w-3 rounded-full bg-brand-accent" />
          </span>
          <div>
            <p className="text-sm text-slate-200">
              {selectedOption?.label ?? "Provider"} is generating your video…
            </p>
            <p className="text-xs text-slate-500">This can take a couple of minutes. Feel free to leave this page.</p>
          </div>
        </div>
      )}

      {/* Failed status */}
      {video.status === "failed" && (
        <div className="rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3">
          <p className="text-sm font-medium text-red-300">Video generation failed</p>
          <p className="mt-1 text-xs text-red-400/80">{video.error ?? "Please try again."}</p>
        </div>
      )}

      {/* Completed status */}
      {video.status === "completed" && video.url && (
        <div className="flex flex-col gap-3">
          <video
            controls
            src={video.url}
            className="w-full rounded-xl border border-white/10 bg-black"
          />
          <a
            href={video.url}
            download
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10"
          >
            <DownloadIcon />
            Download Video
          </a>
        </div>
      )}
    </Card>
  );
}
