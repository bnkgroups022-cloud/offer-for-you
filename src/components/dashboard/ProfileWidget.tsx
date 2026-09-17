"use client";

import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { UserAvatar } from "@/components/auth/UserAvatar";

function formatJoinDate(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function ProfileWidget({ className }: { className?: string }) {
  const { user, signOutApp, actionLoading } = useAuth();
  const joinDate = formatJoinDate(user?.createdAt ?? null);

  return (
    <Card className={className}>
      <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <UserAvatar user={user} size="lg" />
          <div>
            <p className="text-sm font-semibold text-white sm:text-base">
              {user?.displayName ?? "Signed in"}
            </p>
            <p className="text-sm text-slate-400">{user?.email ?? "Not signed in"}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] text-slate-400">
                Google account
              </span>
              {joinDate && (
                <span className="text-[11px] text-slate-500">Member since {joinDate}</span>
              )}
            </div>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          isLoading={actionLoading}
          onClick={signOutApp}
          className="w-full sm:w-auto"
        >
          Sign out
        </Button>
      </div>
    </Card>
  );
}
