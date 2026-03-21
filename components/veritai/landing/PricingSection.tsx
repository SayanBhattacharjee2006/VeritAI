'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

const plans = [
  {
    name: 'Free Tier',
    price: '$0',
    description: 'Perfect for trying it out',
    features: [
      '10 verifications/day',
      'Basic report',
      'No citation export',
    ],
    cta: 'Get Started Free',
    outlined: true,
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/mo',
    description: 'For professionals and researchers',
    badge: 'Most Popular',
    features: [
      'Unlimited verifications',
      'Full citations',
      'Confidence scores',
      'URL analysis',
      'PDF export',
    ],
    cta: 'Upgrade to Pro',
    outlined: false,
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For teams and enterprises',
    features: [
      'API access',
      'Team dashboard',
      'SLA',
      'Custom integrations',
    ],
    cta: 'Contact Us',
    outlined: true,
    highlighted: false,
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 relative overflow-hidden bg-[#000000]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-sans text-4xl lg:text-5xl font-bold text-white mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-[#A0A0A0] max-w-2xl mx-auto">
            Start free. Scale when you're ready.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className={cn(
                'relative flex flex-col rounded-[2rem] p-8 lg:p-10 backdrop-blur-md transition-all duration-300 hover:-translate-y-2',
                plan.highlighted
                  ? 'bg-[#1A1A1A] shadow-[0_0_50px_rgba(255,107,43,0.15)] border border-[#FF6B2B]/50 hover:shadow-[0_0_60px_rgba(255,107,43,0.25)]'
                  : 'bg-[#141414] border border-[#2A2A2A] hover:border-[#FF6B2B]/40 hover:shadow-[0_0_30px_rgba(255,107,43,0.1)]'
              )}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-5 py-1.5 rounded-full bg-gradient-to-r from-[#FF6B2B] to-[#FF9F1C] text-xs font-bold text-white shadow-[0_0_20px_rgba(255,107,43,0.4)] whitespace-nowrap tracking-wide">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-sm text-[#A0A0A0] mb-6 min-h-[40px]">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  {plan.price === 'Custom' ? (
                    <span className="text-4xl font-bold text-white tracking-tight">{plan.price}</span>
                  ) : (
                    <>
                      <span className="text-5xl font-bold text-white tracking-tight">{plan.price}</span>
                      {plan.period && <span className="text-lg text-[#A0A0A0] font-medium">{plan.period}</span>}
                    </>
                  )}
                </div>
              </div>

              <ul className="space-y-4 mb-10 flex-1">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-[#2A2A2A] flex items-center justify-center">
                      <Check className="w-3 h-3 text-[#FF9F1C]" />
                    </div>
                    <span className="text-[#E0E0E0]">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto">
                <Link
                  href="/login"
                  className={cn(
                    'flex items-center justify-center w-full py-4 rounded-xl text-sm font-bold transition-all',
                    plan.outlined
                      ? 'bg-transparent border border-[#3A3A3A] text-white hover:bg-[#2A2A2A] hover:border-[#4A4A4A]'
                      : 'bg-gradient-to-r from-[#FF6B2B] to-[#FF9F1C] text-white shadow-[0_0_20px_rgba(255,107,43,0.3)] hover:shadow-[0_0_30px_rgba(255,107,43,0.5)] border-none'
                  )}
                >
                  {plan.cta}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
