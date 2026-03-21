'use client'

import { cn } from '@/lib/utils'
import { ScrollReveal } from '@/components/veritai/ScrollReveal'

const features = [
  'Real-time Evidence',
  'Multi-Query Search',
  'Source Credibility Scoring',
  'Self-Reflection Agent',
  'Temporal Detection',
  'Vision Claim Generator',
  'Judge Agent Architecture',
  'PDF Export',
  'Conflict Handling',
]

interface MarqueeRowProps {
  reverse?: boolean
}

function MarqueeRow({ reverse = false }: MarqueeRowProps) {
  return (
    <div className="relative flex overflow-hidden py-3">
      {/* Gradient masks */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-bg to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-bg to-transparent z-10" />
      
      <div className={cn('flex gap-6 whitespace-nowrap', reverse ? 'marquee-reverse' : 'marquee')}>
        {[...features, ...features].map((feature, index) => (
          <div
            key={index}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-surface border border-border-v"
          >
            <span className="w-2 h-2 rounded-full bg-gradient-to-r from-orange to-amber" />
            <span className="text-sm font-medium text-text">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function MarqueeSection() {
  return (
    <ScrollReveal direction="none" delay={0.1}>
      <section className="py-12 overflow-hidden">
        <MarqueeRow />
        <MarqueeRow reverse />
      </section>
    </ScrollReveal>
  )
}
