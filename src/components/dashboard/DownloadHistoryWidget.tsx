import Link from "next/link";
import { Card, CardHeader } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Button } from "@/components/ui/Button";

export type DownloadRecord = {
  id: string;
  name: string;
  downloadedAt: string;
};

/**
 * Download Assets (Phase 5) is live — you can export a project's
 * Caption, WhatsApp Copy, Hashtags, AI Prompt, or full kit from
 * /dashboard/downloads. This widget still shows an honest empty state
 * rather than a fake log, though: nothing persists a record of *when*
 * you downloaded something yet (no downloads table exists), so there's
 * no real history to show here. That's a real gap, not a hidden one —
 * an upcoming phase can log each export server-side if per-user
 * download history turns out to matter.
 */
export function DownloadHistoryWidget({
  downloads = [],
  className,
}: {
  downloads?: DownloadRecord[];
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <div>
          <p className="text-sm font-semibold text-white">Download History</p>
          <p className="text-xs text-slate-500">Exported ad kits</p>
        </div>
      </CardHeader>

      {downloads.length === 0 ? (
        <EmptyState
          icon={<Icon name="download" className="h-5 w-5" />}
          title="No download history yet"
          description="Exporting is live on Download Assets — this widget will start listing what you've exported once download logging ships."
          action={
            <Link href="/dashboard/downloads">
              <Button size="sm" variant="secondary">
                Go to Download Assets
              </Button>
            </Link>
          }
        />
      ) : (
        <ul className="flex flex-col divide-y divide-white/5">
          {downloads.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 py-3">
              <span className="truncate text-sm text-white">{item.name}</span>
              <span className="shrink-0 text-xs text-slate-500">{item.downloadedAt}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
