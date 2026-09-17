"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { ProductImagePicker } from "@/components/generator/ProductImagePicker";
import { CATEGORY_OPTIONS, LANGUAGE_OPTIONS } from "@/config/generator";
import { WAN_VIDEO_STYLE_OPTIONS } from "@/config/video";
import { useAuth } from "@/hooks/useAuth";
import { useSingleImageUpload } from "@/hooks/useSingleImageUpload";
import { generateVideo, fetchVideoStatus } from "@/lib/projects/client";
import type { ProjectVideo, WanVideoStyle } from "@/types/video";

const POLL_INTERVAL_MS = 5000;

const fieldLabel = "mb-1.5 block text-xs font-medium text-slate-400";
const fieldControl =
  "w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-brand-accent focus:outline-none";

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

const IDLE_VIDEO: ProjectVideo = {
  provider: null,
  prompt: null,
  status: "idle",
  jobId: null,
  url: null,
  error: null,
};

/**
 * Phase 1 — Wan 2.2 UGC video ad generator. Self-contained: its own
 * signed-upload image picker, its own fields, its own submit + poll
 * lifecycle. Deliberately not sharing state with GeneratorForm /
 * GeneratorResults above it on this page — those stay untouched.
 */
export function WanVideoGeneratorCard() {
  const { user } = useAuth();
  const image = useSingleImageUpload({ signed: true });

  const [productName, setProductName] = useState("");
  const [categoryValue, setCategoryValue] = useState<string>(CATEGORY_OPTIONS[0].value);
  const [customCategory, setCustomCategory] = useState("");
  const [language, setLanguage] = useState<string>(LANGUAGE_OPTIONS[0].value);
  const [style, setStyle] = useState<WanVideoStyle>(WAN_VIDEO_STYLE_OPTIONS[0].value);

  const [projectId, setProjectId] = useState<string | null>(null);
  const [video, setVideo] = useState<ProjectVideo>(IDLE_VIDEO);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const categoryLabel = useMemo(() => {
    if (categoryValue === "other") return customCategory.trim();
    return CATEGORY_OPTIONS.find((option) => option.value === categoryValue)?.label ?? "";
  }, [categoryValue, customCategory]);

  const languageLabel = useMemo(
    () => LANGUAGE_OPTIONS.find((option) => option.value === language)?.label ?? language,
    [language]
  );

  const isValid =
    image.status === "success" &&
    !!image.asset &&
    productName.trim().length > 0 &&
    categoryLabel.length > 0;
  const isBusy = isSubmitting || video.status === "processing";

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => stopPolling, [stopPolling]);

  // A different (or removed) image means a different generation — don't
  // let a retry silently reuse a project row created for the old photo.
  useEffect(() => {
    setProjectId(null);
    setVideo(IDLE_VIDEO);
    stopPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image.asset?.publicId]);

  function pollStatus(id: string, uid: string) {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const project = await fetchVideoStatus(id, uid);
        setVideo(project.video);
        if (project.video.status !== "processing") stopPolling();
      } catch {
        // Transient network hiccup — keep polling, the next tick may succeed.
      }
    }, POLL_INTERVAL_MS);
  }

  async function handleGenerate() {
    if (!isValid || !image.asset || !user) return;

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const { jobId, projectId: newProjectId } = await generateVideo({
        // Reuse the same project row on a retry for this image instead of
        // creating a duplicate one each time Generate Video is clicked.
        projectId: projectId ?? undefined,
        uid: user.uid,
        provider: "wan",
        imageUrl: image.asset.secureUrl,
        imagePublicId: image.asset.publicId,
        productName: productName.trim(),
        category: categoryLabel,
        language: languageLabel,
        style,
      });

      setProjectId(newProjectId);
      setVideo({ provider: "wan", prompt: null, status: "processing", jobId, url: null, error: null });
      pollStatus(newProjectId, user.uid);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Could not start video generation.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleShare() {
    if (!video.url) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: productName || "Product video", url: video.url });
      } catch {
        // User cancelled the share sheet — not an error.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(video.url);
    } catch {
      // Clipboard unavailable — fail silently, same as CopyButton.
    }
  }

  return (
    <Card className="flex flex-col gap-4">
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary/20 text-brand-accent">
            <VideoIcon />
          </span>
          <div>
            <p className="text-sm font-semibold text-white">Wan 2.2 Video Ad Generator</p>
            <p className="text-xs text-slate-500">
              One product photo in, a 15-second vertical UGC ad out — via RunPod + Wan 2.2.
            </p>
          </div>
        </div>
      </CardHeader>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div>
            <span className={fieldLabel}>Product Image</span>
            <ProductImagePicker image={image} />
          </div>

          <div>
            <label htmlFor="wanProductName" className={fieldLabel}>
              Product Name
            </label>
            <input
              id="wanProductName"
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. Wireless Neckband Earphones"
              maxLength={120}
              disabled={isBusy}
              className={`${fieldControl} disabled:opacity-60`}
            />
          </div>

          <div>
            <label htmlFor="wanCategory" className={fieldLabel}>
              Category
            </label>
            <select
              id="wanCategory"
              value={categoryValue}
              onChange={(e) => setCategoryValue(e.target.value)}
              disabled={isBusy}
              className={`${fieldControl} disabled:opacity-60`}
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {categoryValue === "other" && (
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Describe the category"
                maxLength={60}
                disabled={isBusy}
                className={`${fieldControl} mt-2 disabled:opacity-60`}
              />
            )}
          </div>

          <div>
            <label htmlFor="wanLanguage" className={fieldLabel}>
              Language
            </label>
            <select
              id="wanLanguage"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={isBusy}
              className={`${fieldControl} disabled:opacity-60`}
            >
              {LANGUAGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className={fieldLabel}>Video Style</span>
            <div className="flex flex-wrap gap-2">
              {WAN_VIDEO_STYLE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  disabled={isBusy}
                  onClick={() => setStyle(option.value)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                    style === option.value
                      ? "border-brand-accent/40 bg-brand-accent/15 text-brand-accent"
                      : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            disabled={!isValid || isBusy || !user}
            onClick={handleGenerate}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
              !isValid || isBusy || !user
                ? "cursor-not-allowed border border-white/10 bg-white/5 text-slate-500"
                : "bg-brand-primary text-white hover:bg-brand-secondary"
            }`}
          >
            {isBusy && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
            {video.status === "processing" ? "Generating…" : "Generate Video"}
          </button>

          {!isValid && !isBusy && (
            <p className="text-center text-xs text-slate-600">
              Upload a product photo and fill in the name and category to continue.
            </p>
          )}
          {submitError && <p className="text-xs text-red-400">{submitError}</p>}
        </div>

        <div className="flex flex-col justify-center gap-3">
          {video.status === "idle" && (
            <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/10 p-8 text-center">
              <p className="text-sm font-medium text-white">Your video will appear here</p>
              <p className="max-w-xs text-xs text-slate-500">
                Fill in the form and hit Generate Video — this can take a couple of minutes.
              </p>
            </div>
          )}

          {video.status === "processing" && (
            <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center">
              <span className="relative flex h-10 w-10 items-center justify-center">
                <span className="absolute h-10 w-10 animate-ping rounded-full bg-brand-accent/20" />
                <span className="relative h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-brand-accent" />
              </span>
              <div>
                <p className="text-sm text-slate-300">Wan 2.2 is generating your video…</p>
                <p className="mt-1 text-xs text-slate-500">This can take a couple of minutes.</p>
              </div>
            </div>
          )}

          {video.status === "failed" && (
            <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-2xl border border-red-400/20 bg-red-400/5 p-8 text-center">
              <p className="text-sm font-medium text-red-300">Video generation failed</p>
              <p className="max-w-xs text-xs text-red-400/80">{video.error ?? "Please try again."}</p>
            </div>
          )}

          {video.status === "completed" && video.url && (
            <div className="flex flex-col gap-3">
              <video controls src={video.url} className="w-full rounded-xl border border-white/10 bg-black" />
              <div className="flex gap-2">
                <a
                  href={video.url}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10"
                >
                  <DownloadIcon />
                  Download
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
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
