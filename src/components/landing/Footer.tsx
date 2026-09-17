"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { BRAND } from "@/config/brand";

const FOOTER_LINKS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How it works", href: "#how-it-works" },
      { label: "Pricing", href: "#pricing" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
    ],
  },
];

export function Footer() {
  const { user, loading } = useAuth();
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-white/5">
      {/* Closing CTA band */}
      <div className="mx-auto max-w-6xl px-5 pt-20 sm:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-brand-gradient px-6 py-14 text-center shadow-2xl sm:px-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-white/10 blur-3xl"
          />
          <h2 className="relative text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Ready to launch your first ad kit?
          </h2>
          <p className="relative mx-auto mt-3 max-w-md text-sm text-white/70 sm:text-base">
            Upload a photo and see your full affiliate ad kit in minutes.
          </p>
          {!loading && (
            <Link href={user ? "/dashboard" : "/login"} className="relative mt-7 inline-block">
              <Button size="lg" variant="secondary">
                Start Free
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient text-xs font-bold text-white">
                O4Y
              </span>
              <span className="text-sm font-semibold text-white">{BRAND.name}</span>
            </div>
            <p className="mt-3 max-w-[16rem] text-sm text-slate-500">{BRAND.tagline}</p>
          </div>

          {FOOTER_LINKS.map((col) => (
            <div key={col.heading}>
              <h4 className="text-sm font-medium text-white">{col.heading}</h4>
              <ul className="mt-3 flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-slate-500 transition-colors hover:text-white"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row">
          <p>
            © {year} {BRAND.name}. All rights reserved.
          </p>
          <p>{BRAND.shortName}</p>
        </div>
      </div>
    </footer>
  );
}
