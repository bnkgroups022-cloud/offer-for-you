import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";

/**
 * Full marketing landing page: Hero, Features, How It Works,
 * Pricing (coming soon), FAQ, Footer. Composed here so app/page.tsx
 * stays a thin server-component entry point.
 */
export function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-brand-dark text-white">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
