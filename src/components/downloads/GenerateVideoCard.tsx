import { Card, CardHeader } from "@/components/ui/Card";

function VideoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="5" width="13" height="14" rx="2" />
      <path d="m21 8-5 3 5 3V8Z" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Future placeholder, not a real feature yet. The AI Prompt above is
 * already written to be Kling-ready (see Phase 3's README note); this
 * card is here so the eventual "send this prompt straight to Kling and
 * get a video back" flow has an obvious home, without promising it works
 * today. Intentionally disabled — no fake progress bar, no fake output.
 */
export function GenerateVideoCard({ className }: { className?: string }) {
  return (
    <Card className={`border-dashed ${className ?? ""}`}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary/20 text-brand-accent">
            <VideoIcon />
          </span>
          <div>
            <p className="text-sm font-semibold text-white">Generate Video</p>
            <p className="text-xs text-slate-500">Turns the AI Prompt above into a short video via Kling</p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">
          Coming soon
        </span>
      </CardHeader>

      <button
        type="button"
        disabled
        title="Kling API integration isn't wired up yet"
        className="w-full cursor-not-allowed rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-center text-sm font-medium text-slate-500"
      >
        Generate Video — not available yet
      </button>
    </Card>
  );
}
