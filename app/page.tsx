'use client'

import { Navbar } from '@/components/veritai/landing/Navbar'
import { HeroSection } from '@/components/veritai/landing/HeroSection'
import { HowItWorksSection } from '@/components/veritai/landing/HowItWorksSection'
import { FeaturesSection } from '@/components/veritai/landing/FeaturesSection'
import { PricingSection } from '@/components/veritai/landing/PricingSection'
import { AIDetectionSection } from '@/components/veritai/landing/AIDetectionSection'
import { CTASection } from '@/components/veritai/landing/CTASection'
import { Footer } from '@/components/veritai/landing/Footer'

export default function LandingPage() {
  return (
    <div className="bg-[#0D0D0D] min-h-screen text-white font-sans selection:bg-[#FF6B2B]/30 selection:text-white">
      <Navbar />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <PricingSection />
        <AIDetectionSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
