"use client";

import { OutputSection } from "@/components/generator/OutputSection";
import { CopyButton } from "@/components/generator/CopyButton";
import { Button } from "@/components/ui/Button";
import type { GeneratedAdKit } from "@/types/generator";
import type { GeneratorStatus } from "@/hooks/useAdGenerator";

export function GeneratorResults({
  status,
  result,
  error,
  onReset,
}: {
  status: GeneratorStatus;
  result: GeneratedAdKit | null;
  error: string | null;
  onReset: () => void;
}) {
  if (status === "idle") {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 p-10 text-center">
        <p className="text-sm font-medium text-white">Your ad kit will appear here</p>
        <p className="mt-1 max-w-xs text-xs text-slate-500">
          Fill in the form and hit Generate — analysis, hooks, script, a
          Kling prompt, WhatsApp message, caption and hashtags all come
          back together.
        </p>
      </div>
    );
  }

  if (status === "generating") {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-brand-accent" />
        <p className="text-sm text-slate-300">Generating your ad kit…</p>
        <p className="text-xs text-slate-500">This usually takes 10-30 seconds.</p>
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

      <OutputSection title="Kling Prompt" action={<CopyButton text={result.klingPrompt} />}>
        <p className="text-sm leading-relaxed text-slate-300">{result.klingPrompt}</p>
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
