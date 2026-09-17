import { STEPS } from "@/components/landing/content";

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative border-t border-white/5 bg-white/[0.02] py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-brand-accent">
            How it works
          </span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            From product photo to posted ad in four steps
          </h2>
        </div>

        <div className="relative mt-16">
          {/* Connecting line: vertical on mobile, horizontal on desktop */}
          <div
            aria-hidden="true"
            className="absolute bottom-6 left-6 top-6 w-px bg-gradient-to-b from-white/20 via-white/10 to-transparent lg:bottom-auto lg:left-0 lg:right-0 lg:top-6 lg:h-px lg:w-auto lg:bg-gradient-to-r"
          />

          <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-4 lg:gap-6">
            {STEPS.map((step, index) => (
              <div key={step.title} className="relative flex gap-4 lg:flex-col lg:gap-5">
                <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/15 bg-brand-dark text-sm font-semibold text-white shadow-lg shadow-black/30">
                  {index + 1}
                </div>
                <div className="pt-1.5 lg:pt-0">
                  <h3 className="text-base font-semibold text-white">{step.title}</h3>
                  <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-slate-400">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
