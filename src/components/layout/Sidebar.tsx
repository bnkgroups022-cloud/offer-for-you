"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { BRAND, NAV_ITEMS } from "@/config/brand";
import { Icon } from "@/components/ui/Icon";

/** Desktop-only sidebar (hidden below the lg breakpoint — see MobileNav). */
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-white/10 bg-black/20 px-4 py-6 lg:flex">
      <Link href="/dashboard" className="mb-8 flex items-center gap-2 px-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gradient text-sm font-bold text-white">
          O4Y
        </span>
        <span className="text-sm font-semibold leading-tight text-white">
          {BRAND.name}
          <span className="block text-[11px] font-normal text-slate-400">
            {BRAND.shortName}
          </span>
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.comingSoon ? "#" : item.href}
              aria-disabled={item.comingSoon}
              onClick={(e) => item.comingSoon && e.preventDefault()}
              className={clsx(
                "group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-brand-primary/20 text-white"
                  : "text-slate-300 hover:bg-white/5 hover:text-white",
                item.comingSoon && "cursor-not-allowed opacity-50 hover:bg-transparent"
              )}
            >
              <span className="flex items-center gap-3">
                <Icon name={item.icon} className="h-5 w-5" />
                {item.label}
              </span>
              {item.comingSoon && (
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  Soon
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-slate-400">
        V1.0 · Phase 5: Export System
      </div>
    </aside>
  );
}
