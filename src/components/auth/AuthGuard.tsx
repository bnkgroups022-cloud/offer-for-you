"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

/**
 * Wraps any route that requires a signed-in user. Client-side only for
 * Phase 1 — good enough for V1.0. If server-side session protection is
 * needed later, add a Next.js middleware.ts that checks a Firebase
 * session cookie minted via the Admin SDK.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, isFirebaseConfigured } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user && isFirebaseConfigured) {
      router.replace("/login");
    }
  }, [loading, user, isFirebaseConfigured, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-dark">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-brand-accent" />
      </div>
    );
  }

  // Firebase isn't configured yet (fresh clone, no .env.local) — let
  // developers see the dashboard shell without being bounced to /login.
  if (!isFirebaseConfigured) {
    return <>{children}</>;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
