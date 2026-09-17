import Link from "next/link";
import { Card, CardHeader } from "@/components/ui/Card";

function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * The AI Generator (Phase 3) now runs real OpenAI calls, but there's
 * still no database to record usage against a user, so this can't yet
 * show a real count. Rather than invent a fake number, it stays at `0`
 * and says plainly that persistent tracking is still pending.
 */
export function AICreditsWidget({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary/20 text-brand-accent">
            <BoltIcon />
          </span>
          <div>
            <p className="text-sm font-semibold text-white">AI Credits</p>
            <p className="text-xs text-slate-500">Usage this month</p>
          </div>
        </div>
        <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">
          Preview
        </span>
      </CardHeader>

      <div className="flex items-end gap-2">
        <span className="text-3xl font-semibold text-white">0</span>
        <span className="pb-1 text-sm text-slate-500">credits used</span>
      </div>

      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div className="h-full w-0 rounded-full bg-gradient-to-r from-brand-accent to-brand-secondary" />
      </div>

      <p className="mt-3 text-xs text-slate-500">
        Every generated ad kit is now saved to your{" "}
        <Link href="/dashboard/projects" className="text-brand-accent hover:underline">
          Projects
        </Link>{" "}
        — a running usage count per user is coming in an upcoming phase.
      </p>
    </Card>
  );
}
