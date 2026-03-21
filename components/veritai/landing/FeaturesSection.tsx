'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Layers, Search, Scale, Award, RefreshCw, Clock } from 'lucide-react'
import { ScrollReveal } from '@/components/veritai/ScrollReveal'

const features = [
  {
    icon: Layers,
    title: 'Multi-Modal Input',
    description: 'Process text, URLs, and images seamlessly. Extract claims from any source format.',
    color: 'text-cyan',
    bgColor: 'bg-cyan/10',
  },
  {
    icon: Search,
    title: '3x Multi-Query Search',
    description: '3 parallel Tavily queries per claim for comprehensive evidence gathering.',
    color: 'text-primary-v',
    bgColor: 'bg-primary-v/10',
  },
  {
    icon: Scale,
    title: 'Separated Judge Agent',
    description: 'Evidence gathering and verdict determination are fully decoupled for accuracy.',
    color: 'text-green-v',
    bgColor: 'bg-green-v/10',
  },
  {
    icon: Award,
    title: 'Source Credibility Tiers',
    description: 'Sources scored as Tier 1/2/3 based on authority and reliability.',
    color: 'text-amber',
    bgColor: 'bg-amber/10',
  },
  {
    icon: RefreshCw,
    title: 'Self-Reflection Loop',
    description: 'Second LLM verification pass ensures consistent and accurate verdicts.',
    color: 'text-red-v',
    bgColor: 'bg-red-v/10',
  },
  {
    icon: Clock,
    title: 'Temporal Detection',
    description: 'Time-sensitive claims are flagged for appropriate context and re-verification.',
    color: 'text-cyan',
    bgColor: 'bg-cyan/10',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange/2 to-transparent pointer-events-none" aria-hidden="true" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-cyan/10 text-cyan text-xs font-mono uppercase tracking-wider mb-4">
            Core Capabilities
          </span>
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-text mb-4">
            Every claim. Every source. Zero assumptions.
          </h2>
          <p className="text-lg text-muted-v max-w-2xl mx-auto">
            Our multi-agent architecture ensures thorough verification with transparent reasoning.
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <ScrollReveal key={feature.title} delay={index * 0.1} scale={true}>
              <motion.div whileHover={{ y: -6, transition: { type: 'spring', stiffness: 300 } }} className="group relative">
                <div className="relative overflow-hidden p-6 pt-8 rounded-2xl bg-card-v border border-border-v border-t-0 h-full">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-5', feature.bgColor)}>
                    <feature.icon className={cn('w-7 h-7', feature.color)} />
                  </div>
                  <h3 className="text-lg font-semibold text-text mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-v leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
