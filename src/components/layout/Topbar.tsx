"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { MobileNav } from "@/components/layout/MobileNav";
import { UserAvatar } from "@/components/auth/UserAvatar";

export function Topbar() {
  const { user, signOutApp, actionLoading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-brand-dark/80 px-4 py-3 backdrop-blur lg:px-8">
        <button
          onClick={() => setDrawerOpen(true)}
          className="rounded-lg p-2 text-white lg:hidden"
          aria-label="Open menu"
        >
          <span className="block h-0.5 w-5 bg-current" />
          <span className="mt-1.5 block h-0.5 w-5 bg-current" />
          <span className="mt-1.5 block h-0.5 w-5 bg-current" />
        </button>

        <h1 className="text-sm font-medium text-slate-200 lg:text-base">Dashboard</h1>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1 pl-1 pr-3 text-sm text-white"
          >
            <UserAvatar user={user} size="sm" />
            <span className="hidden max-w-[10rem] truncate sm:inline">
              {user?.displayName ?? user?.email ?? "Guest"}
            </span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-white/10 bg-brand-dark shadow-2xl">
              <div className="border-b border-white/10 px-3 py-2 text-xs text-slate-400">
                Signed in as
                <div className="truncate text-sm text-white">
                  {user?.email ?? "not signed in"}
                </div>
              </div>
              <div className="p-2">
                <Button
                  variant="danger"
                  size="sm"
                  fullWidth
                  isLoading={actionLoading}
                  onClick={signOutApp}
                >
                  Sign out
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      <MobileNav open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
