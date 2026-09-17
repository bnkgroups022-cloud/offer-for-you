import type { ReactNode } from "react";

/**
 * Shared "nothing here yet" block for widgets whose backing feature
 * (projects, downloads, ...) hasn't shipped yet. Honest by design: it
 * never fabricates sample rows, it just explains what will appear here.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/10 px-4 py-10 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/5 text-slate-400">
        {icon}
      </span>
      <div>
        <p className="text-sm font-medium text-white">{title}</p>
        <p className="mx-auto mt-1 max-w-xs text-xs text-slate-500">{description}</p>
      </div>
      {action}
    </div>
  );
}
