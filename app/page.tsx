import { LandingHeader } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Comparison } from "@/components/landing/Comparison";
import { Teamwork } from "@/components/landing/Teamwork";
import { Mockups } from "@/components/landing/Mockups";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";
import { Preloader } from "@/components/landing/Preloader";

export default function Home() {
  return (
    <main className="bg-lowfi-cream">
      <Preloader />
      <LandingHeader />
      <Hero />
      <Features />
      <Comparison />
      <Teamwork />
      <Mockups />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
