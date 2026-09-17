"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { BRAND } from "@/config/brand";

export default function LoginPage() {
  const { user, loading, error, isFirebaseConfigured } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [loading, user, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-gradient px-5">
      <div className="w-full max-w-sm animate-fade-in rounded-2xl border border-white/10 bg-brand-dark/60 p-8 text-center shadow-2xl backdrop-blur-lg">
        <span className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-sm font-bold text-white">
          O4Y
        </span>
        <h1 className="text-xl font-semibold text-white">Welcome to {BRAND.name}</h1>
        <p className="mt-2 text-sm text-slate-400">
          Sign in to start generating affiliate ad assets.
        </p>

        <div className="mt-6">
          <GoogleSignInButton />
        </div>

        {!isFirebaseConfigured && (
          <p className="mt-4 rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-left text-xs text-amber-200">
            Firebase isn&apos;t configured yet. Copy{" "}
            <code className="rounded bg-black/30 px-1">.env.local.example</code> to{" "}
            <code className="rounded bg-black/30 px-1">.env.local</code>, add your
            Firebase web app config, and enable the Google sign-in provider in the
            Firebase console.
          </p>
        )}

        {error && (
          <p className="mt-4 rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-200">
            {error}
          </p>
        )}
      </div>
    </main>
  );
}
