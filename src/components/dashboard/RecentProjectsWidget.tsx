import Link from "next/link";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/dashboard/EmptyState";
import type { Project } from "@/types/project";

function ProjectsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

/**
 * Now backed by real Supabase data (Phase 4) via useProjects() in
 * app/dashboard/page.tsx, which passes in the 4 most recent projects.
 * Still shows an honest empty state — no fabricated rows — when a user
 * hasn't generated anything yet or Supabase isn't configured.
 */
export function RecentProjectsWidget({
  projects = [],
  isLoading = false,
  className,
}: {
  projects?: Project[];
  isLoading?: boolean;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <div>
          <p className="text-sm font-semibold text-white">Recent Projects</p>
          <p className="text-xs text-slate-500">Your last generated ad kits</p>
        </div>
        <Link href="/dashboard/projects" className="text-xs font-medium text-brand-accent hover:underline">
          View all
        </Link>
      </CardHeader>

      {isLoading && projects.length === 0 ? (
        <div className="flex flex-col gap-2">
          {[0, 1].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-white/[0.03]" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={<ProjectsIcon />}
          title="No projects yet"
          description="Upload a product photo to generate your first ad kit — it'll show up here."
        />
      ) : (
        <ul className="flex flex-col divide-y divide-white/5">
          {projects.map((project) => (
            <li key={project.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm text-white">{project.productName}</p>
                <p className="text-xs text-slate-500">{project.category}</p>
              </div>
              <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                {formatDate(project.createdAt)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
