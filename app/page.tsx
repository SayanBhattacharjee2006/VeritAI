'use client'

import { Navbar } from '@/components/veritai/landing/Navbar'
import { SpotlightCursor } from '@/components/veritai/landing/SpotlightCursor'
import { GlitterBackground } from '@/components/veritai/landing/GlitterBackground'
import { HeroSection } from '@/components/veritai/landing/HeroSection'
import { StatsSection } from '@/components/veritai/landing/StatsSection'
import { MarqueeSection } from '@/components/veritai/landing/MarqueeSection'
import { FeaturesSection } from '@/components/veritai/landing/FeaturesSection'
import { HowItWorksSection } from '@/components/veritai/landing/HowItWorksSection'
import { ProcessingDemoSection } from '@/components/veritai/landing/ProcessingDemoSection'
import { PricingSection } from '@/components/veritai/landing/PricingSection'
import { FAQSection } from '@/components/veritai/landing/FAQSection'
import { Footer } from '@/components/veritai/landing/Footer'
import { ToastContainer } from '@/components/veritai/Toast'

export default function LandingPage() {
  return (
    <>
      <SpotlightCursor />
      <GlitterBackground />
      <Navbar />
      <main>
        <HeroSection />
        <StatsSection />
        <MarqueeSection />
        <FeaturesSection />
        <HowItWorksSection />
        <ProcessingDemoSection />
        <PricingSection />
        <FAQSection />
      </main>
      <Footer />
      <ToastContainer />
    </>
  )
}
