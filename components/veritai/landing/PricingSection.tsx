'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Check, X } from 'lucide-react'
import { ScrollReveal } from '@/components/veritai/ScrollReveal'
import { MagneticButton } from '../MagneticButton'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for trying out VeritAI',
    features: [
      { label: '5 verifications/day', included: true },
      { label: 'Text input only', included: true },
      { label: 'Basic report', included: true },
      { label: 'PDF export', included: false },
      { label: 'API access', included: false },
      { label: 'Priority processing', included: false },
    ],
    cta: 'Get Started',
    featured: false,
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/month',
    description: 'For professionals and researchers',
    badge: 'Most Popular',
    features: [
      { label: '50 verifications/day', included: true },
      { label: 'Text, URL & Image input', included: true },
      { label: 'Full detailed reports', included: true },
      { label: 'PDF export', included: true },
      { label: 'API access', included: false },
      { label: 'Priority processing', included: true },
    ],
    cta: 'Start Free Trial',
    featured: true,
  },
  {
    name: 'Premium',
    price: '$49',
    period: '/month',
    description: 'For teams and enterprises',
    features: [
      { label: '500 verifications/day', included: true },
      { label: 'All input types', included: true },
      { label: 'Full detailed reports', included: true },
      { label: 'PDF export', included: true },
      { label: 'Full API access', included: true },
      { label: 'Priority processing', included: true },
    ],
    cta: 'Contact Sales',
    featured: false,
  },
]

function PricingCard({ plan }: { plan: (typeof plans)[number] }) {
  return (
    <motion.div
      whileHover={{ y: -6, transition: { type: 'spring', stiffness: 300 } }}
      className={cn(
        'relative rounded-2xl border p-8',
        plan.featured
          ? 'bg-[#0D1021] border-violet-500/40 scale-105 shadow-[0_0_60px_rgba(139,92,246,0.15)]'
          : 'bg-[#0D1021] border-[#1E2340]'
      )}
    >
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-4 py-1 rounded-full bg-violet-600 text-white text-xs font-semibold border border-violet-500/40">
            {plan.badge}
          </span>
        </div>
      )}

      <div className="mb-6">
        <span className="font-mono text-xs text-violet-400 uppercase tracking-wider">{plan.name}</span>
        <div className="flex items-baseline gap-1 mt-2">
          <span className="font-display text-5xl font-black text-white">{plan.price}</span>
          <span className="text-muted-v">{plan.period}</span>
        </div>
        <p className="text-sm text-muted-v mt-2">{plan.description}</p>
      </div>

      <ul className="space-y-3 mb-8">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-center gap-3">
            {feature.included ? (
              <Check className="w-5 h-5 text-green-v shrink-0" />
            ) : (
              <X className="w-5 h-5 text-red-v/50 shrink-0" />
            )}
            <span className={cn('text-sm', feature.included ? 'text-text' : 'text-muted-v/50')}>{feature.label}</span>
          </li>
        ))}
      </ul>

      <MagneticButton>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link
            href="/login"
            className={cn(
              'block w-full py-3 rounded-xl text-center font-semibold transition-colors',
              plan.featured ? 'btn-primary' : 'btn-ghost'
            )}
          >
            {plan.cta}
          </Link>
        </motion.div>
      </MagneticButton>
    </motion.div>
  )
}

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-transparent relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-violet-950/20 rounded-full blur-[150px] pointer-events-none" aria-hidden="true" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#1C1040] text-violet-400 text-xs font-mono uppercase tracking-wider border border-violet-900/40 mb-4">
            Pricing
          </span>
          <h2 className="font-display text-5xl lg:text-6xl font-bold text-violet-400 mb-4">Start free. Scale when ready.</h2>
          <p className="text-lg text-muted-v max-w-2xl mx-auto">
            Choose the plan that fits your verification needs. Upgrade or downgrade anytime.
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) =>
            <ScrollReveal key={plan.name} delay={index * 0.12} scale={true}>
              <PricingCard plan={plan} />
            </ScrollReveal>
          )}
        </div>
      </div>
    </section>
  )
}
