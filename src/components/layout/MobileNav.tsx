"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { NAV_ITEMS } from "@/config/brand";
import { Icon } from "@/components/ui/Icon";

/**
 * Mobile-first navigation: a slide-over drawer triggered from the topbar's
 * hamburger button, plus a persistent bottom bar with the top 4 items for
 * fast thumb access. Hidden at lg and above (Sidebar takes over).
 */
export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const primaryItems = NAV_ITEMS.slice(0, 4);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <div
        className={clsx(
          "fixed inset-y-0 left-0 z-50 w-72 transform border-r border-white/10 bg-brand-dark p-4 transition-transform duration-200 lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="mb-6 flex items-center justify-between px-1">
          <span className="text-sm font-semibold text-white">Menu</span>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-lg p-2 text-slate-300 hover:bg-white/10"
          >
            ✕
          </button>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.comingSoon ? "#" : item.href}
                onClick={(e) => {
                  if (item.comingSoon) {
                    e.preventDefault();
                    return;
                  }
                  onClose();
                }}
                className={clsx(
                  "flex items-center justify-between rounded-xl px-3 py-3 text-sm",
                  active ? "bg-brand-primary/20 text-white" : "text-slate-300",
                  item.comingSoon && "opacity-50"
                )}
              >
                <span className="flex items-center gap-3">
                  <Icon name={item.icon} className="h-5 w-5" />
                  {item.label}
                </span>
                {item.comingSoon && (
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase text-slate-400">
                    Soon
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-white/10 bg-brand-dark/95 backdrop-blur lg:hidden">
        {primaryItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.comingSoon ? "#" : item.href}
              onClick={(e) => item.comingSoon && e.preventDefault()}
              className={clsx(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px]",
                active ? "text-brand-accent" : "text-slate-400",
                item.comingSoon && "opacity-50"
              )}
            >
              <Icon name={item.icon} className="h-5 w-5" />
              {item.label.split(" ")[0]}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
