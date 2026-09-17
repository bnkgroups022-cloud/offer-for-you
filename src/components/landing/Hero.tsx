"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Hero() {
  const { user, loading } = useAuth();
  const primaryHref = user ? "/dashboard" : "/login";

  return (
    <section className="relative overflow-hidden">
      {/* Ambient gradient glows + dot grid — Stripe-style hero backdrop */}
      <div
        aria-hidden="true"
        className="bg-grid-dots bg-grid-fade pointer-events-none absolute inset-0"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-brand-primary/30 blur-[100px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-6rem] top-24 h-72 w-72 rounded-full bg-brand-accent/20 blur-[90px]"
      />

      <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="animate-fade-in-up mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/70">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" />
            AI Ad Studio · V1.0
          </span>

          <h1 className="animate-fade-in-up text-4xl font-semibold leading-[1.1] tracking-tight text-white [animation-delay:80ms] sm:text-6xl">
            Turn one product photo into a{" "}
            <span className="bg-gradient-to-r from-brand-accent via-brand-secondary to-white bg-clip-text text-transparent">
              complete ad kit
            </span>
          </h1>

          <p className="animate-fade-in-up mx-auto mt-6 max-w-xl text-base text-slate-400 [animation-delay:140ms] sm:text-lg">
            Upload a photo. Offer For You&apos;s AI writes your ad prompt, video
            script, caption, WhatsApp copy and hashtags — ready to post in
            minutes, not hours.
          </p>

          <div className="animate-fade-in-up mt-9 flex flex-col items-center justify-center gap-3 [animation-delay:200ms] sm:flex-row">
            {!loading && (
              <Link href={primaryHref} className="w-full sm:w-auto">
                <Button size="lg" fullWidth className="sm:w-auto">
                  Start Free
                  <ArrowIcon />
                </Button>
              </Link>
            )}
            <a href="#how-it-works" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" fullWidth className="sm:w-auto">
                See how it works
              </Button>
            </a>
          </div>

          <p className="animate-fade-in-up mt-5 text-xs text-slate-500 [animation-delay:240ms]">
            No credit card required · Ready in under 2 minutes
          </p>
        </div>

        {/* Product preview mockup — Apple-style floating device card */}
        <div className="animate-fade-in-up relative mx-auto mt-16 max-w-3xl [animation-delay:300ms]">
          <div className="animate-float rounded-2xl border border-white/10 bg-white/[0.04] p-3 shadow-2xl shadow-black/40 backdrop-blur sm:p-4">
            <div className="mb-3 flex items-center gap-1.5 px-1">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
            </div>
            <div className="grid grid-cols-1 gap-3 rounded-xl bg-brand-dark/60 p-4 sm:grid-cols-[auto_1fr] sm:p-5">
              <div className="flex h-28 w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 sm:h-full sm:w-28">
                <Icon name="upload" className="h-8 w-8 text-white/40" />
              </div>
              <div className="flex flex-col justify-center gap-2 text-left">
                <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs text-slate-300">
                  <Icon name="caption" className="h-3.5 w-3.5 shrink-0 text-brand-accent" />
                  &quot;Summer just got an upgrade. Meet your new everyday essential ☀️&quot;
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs text-slate-300">
                  <Icon name="whatsapp" className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                  &quot;Hey! Found something you&apos;ll love, check this out 👇&quot;
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs text-slate-300">
                  <Icon name="hashtag" className="h-3.5 w-3.5 shrink-0 text-brand-secondary" />
                  #musthave #affiliate #dealoftheday
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
