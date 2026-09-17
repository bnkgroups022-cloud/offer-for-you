"use client";

import { useState, type FormEvent } from "react";
import clsx from "clsx";
import { Button } from "@/components/ui/Button";
import { PRICING_TIERS } from "@/components/landing/content";

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Pricing() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Phase 1: UI only. Wire this to Supabase (or an email service) once
  // the waitlist backend exists — no code here should need to change,
  // just what handleNotify does with the address.
  function handleNotify(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  }

  return (
    <section id="pricing" className="relative border-t border-white/5 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-brand-accent">
            Pricing
          </span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Simple pricing. Coming soon.
          </h2>
          <p className="mt-4 text-base text-slate-400">
            We&apos;re finalizing plans so every creator — solo or agency — gets a
            fair fit. Leave your email and we&apos;ll let you know the moment
            pricing goes live.
          </p>

          {submitted ? (
            <p className="mx-auto mt-6 w-fit rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
              You&apos;re on the list — we&apos;ll email {email} at launch.
            </p>
          ) : (
            <form
              onSubmit={handleNotify}
              className="mx-auto mt-6 flex max-w-md flex-col gap-2 sm:flex-row"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-brand-accent focus:outline-none"
              />
              <Button type="submit" size="md" className="sm:w-auto">
                Notify me
              </Button>
            </form>
          )}
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {PRICING_TIERS.map((tier) => (
            <div
              key={tier.name}
              className={clsx(
                "relative flex flex-col rounded-2xl border p-6",
                tier.highlighted
                  ? "border-brand-accent/40 bg-brand-primary/10 shadow-xl shadow-brand-primary/10"
                  : "border-white/10 bg-white/[0.03]"
              )}
            >
              <span className="absolute right-5 top-5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-slate-300">
                Coming soon
              </span>

              <h3 className="text-lg font-semibold text-white">{tier.name}</h3>
              <p className="mt-1.5 text-sm text-slate-400">{tier.description}</p>

              <div className="mt-6 flex items-end gap-1">
                <span className="h-8 w-20 animate-pulse rounded-lg bg-white/10" aria-hidden="true" />
                <span className="pb-1 text-sm text-slate-500">/ month</span>
              </div>

              <ul className="mt-6 flex flex-1 flex-col gap-2.5">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-slate-300">
                    <span className="text-brand-accent">
                      <CheckIcon />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                variant={tier.highlighted ? "primary" : "secondary"}
                size="md"
                fullWidth
                disabled
                className="mt-8"
              >
                Coming soon
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
