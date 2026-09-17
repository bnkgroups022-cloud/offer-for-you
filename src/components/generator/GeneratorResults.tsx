"use client";

import { OutputSection } from "@/components/generator/OutputSection";
import { CopyButton } from "@/components/generator/CopyButton";
import { Button } from "@/components/ui/Button";
import type { GeneratedAdKit } from "@/types/generator";
import type { GeneratorStatus } from "@/hooks/useAdGenerator";

/** Kling/Hailuo/PixVerse all accept the same free-text cinematic prompt
 *  style — the API only generates one (klingPrompt), so each card frames
 *  it with the user's chosen video style rather than calling the AI three
 *  separate times. */
function buildVideoToolPrompt(klingPrompt: string, videoStyle?: string): string {
  return videoStyle ? `${videoStyle} style.\n\n${klingPrompt}` : klingPrompt;
}

function EmptyStateIllustration() {
  return (
    <svg viewBox="0 0 160 120" className="h-28 w-36" aria-hidden="true">
      <rect
        x="20"
        y="16"
        width="90"
        height="66"
        rx="10"
        className="fill-white/[0.04] stroke-white/10"
        strokeWidth="1.5"
      />
      <path
        d="M32 68 L54 44 L70 60 L82 48 L98 68 Z"
        className="fill-brand-accent/20"
      />
      <circle cx="42" cy="34" r="6" className="fill-brand-accent/40" />
      <g className="animate-float">
        <rect
          x="86"
          y="40"
          width="54"
          height="54"
          rx="14"
          className="fill-brand-primary/20 stroke-brand-accent/40"
          strokeWidth="1.5"
        />
        <path
          d="M113 58v20m0 0 8-8m-8 8-8-8"
          className="stroke-brand-accent"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>
    </svg>
  );
}

function GeneratingLoader() {
  return (
    <div className="relative flex h-16 w-16 items-center justify-center">
      <span className="absolute h-16 w-16 animate-ping rounded-full bg-brand-accent/20" />
      <span className="absolute h-11 w-11 animate-pulse rounded-full bg-brand-accent/20" />
      <span className="relative h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-brand-accent" />
    </div>
  );
}

export function GeneratorResults({
  status,
  result,
  error,
  videoStyle,
  onReset,
}: {
  status: GeneratorStatus;
  result: GeneratedAdKit | null;
  error: string | null;
  videoStyle?: string;
  onReset: () => void;
}) {
  if (status === "idle") {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 p-10 text-center">
        <EmptyStateIllustration />
        <p className="mt-4 text-sm font-medium text-white">Your ad kit will appear here</p>
        <p className="mt-1 max-w-xs text-xs text-slate-500">
          Fill in the form and hit Generate — analysis, hooks, script,
          Kling/Hailuo/PixVerse prompts, WhatsApp message, caption and
          hashtags all come back together.
        </p>
      </div>
    );
  }

  if (status === "generating") {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center">
        <GeneratingLoader />
        <div>
          <p className="text-sm text-slate-300">Generating your ad kit…</p>
          <p className="mt-1 text-xs text-slate-500">This usually takes 10-30 seconds.</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-2xl border border-red-400/20 bg-red-400/5 p-10 text-center">
        <p className="text-sm font-medium text-red-300">Generation failed</p>
        <p className="max-w-sm text-xs text-red-400/80">{error}</p>
        <Button variant="secondary" size="sm" onClick={onReset}>
          Try again
        </Button>
      </div>
    );
  }

  if (!result) return null;

  const allHashtags = result.hashtags.join(" ");
  const klingPrompt = buildVideoToolPrompt(result.klingPrompt, videoStyle);
  const hailuoPrompt = buildVideoToolPrompt(result.klingPrompt, videoStyle);
  const pixversePrompt = buildVideoToolPrompt(result.klingPrompt, videoStyle);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
          Ad kit ready
        </span>
        <Button variant="ghost" size="sm" onClick={onReset}>
          Start over
        </Button>
      </div>

      <OutputSection title="Product Analysis" action={<CopyButton text={result.analysis} />}>
        <p className="text-sm leading-relaxed text-slate-300">{result.analysis}</p>
      </OutputSection>

      <OutputSection
        title="3 Hooks"
        action={
          <CopyButton
            text={result.hooks.map((hook, i) => `${i + 1}. ${hook}`).join("\n")}
            label="Copy all"
          />
        }
      >
        <ol className="flex flex-col gap-2">
          {result.hooks.map((hook, i) => (
            <li
              key={i}
              className="flex items-start justify-between gap-3 rounded-lg bg-white/5 px-3 py-2 text-sm text-slate-200"
            >
              <span>
                {i + 1}. {hook}
              </span>
              <CopyButton text={hook} />
            </li>
          ))}
        </ol>
      </OutputSection>

      <OutputSection title="15-Second Script" action={<CopyButton text={result.script} />}>
        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-300">
          {result.script}
        </pre>
      </OutputSection>

      <OutputSection title="Kling Prompt" action={<CopyButton text={klingPrompt} />}>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">{klingPrompt}</p>
      </OutputSection>

      <OutputSection title="Hailuo Prompt" action={<CopyButton text={hailuoPrompt} />}>
        <p className="mb-2 text-xs text-slate-500">
          Same cinematic prompt, ready to paste into Hailuo (MiniMax).
        </p>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">{hailuoPrompt}</p>
      </OutputSection>

      <OutputSection title="PixVerse Prompt" action={<CopyButton text={pixversePrompt} />}>
        <p className="mb-2 text-xs text-slate-500">
          Same cinematic prompt, ready to paste into PixVerse.
        </p>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">{pixversePrompt}</p>
      </OutputSection>

      <OutputSection title="WhatsApp Message" action={<CopyButton text={result.whatsappMessage} />}>
        <div className="whitespace-pre-wrap rounded-2xl rounded-tl-sm bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          {result.whatsappMessage}
        </div>
      </OutputSection>

      <OutputSection
        title="Instagram Caption"
        action={<CopyButton text={result.instagramCaption} />}
      >
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
          {result.instagramCaption}
        </p>
      </OutputSection>

      <OutputSection title="10 Hashtags" action={<CopyButton text={allHashtags} label="Copy all" />}>
        <div className="flex flex-wrap gap-2">
          {result.hashtags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-brand-primary/15 px-3 py-1 text-xs text-brand-accent"
            >
              {tag}
            </span>
          ))}
        </div>
      </OutputSection>
    </div>
  );
}
