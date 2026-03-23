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
    color: 'text-white',
    bgColor: 'bg-[#1C1040]',
  },
  {
    icon: Search,
    title: '3x Multi-Query Search',
    description: '3 parallel Tavily queries per claim for comprehensive evidence gathering.',
    color: 'text-white',
    bgColor: 'bg-[#1C1040]',
  },
  {
    icon: Scale,
    title: 'Separated Judge Agent',
    description: 'Evidence gathering and verdict determination are fully decoupled for accuracy.',
    color: 'text-white',
    bgColor: 'bg-[#1C1040]',
  },
  {
    icon: Award,
    title: 'Source Credibility Tiers',
    description: 'Sources scored as Tier 1/2/3 based on authority and reliability.',
    color: 'text-white',
    bgColor: 'bg-[#1C1040]',
  },
  {
    icon: RefreshCw,
    title: 'Self-Reflection Loop',
    description: 'Second LLM verification pass ensures consistent and accurate verdicts.',
    color: 'text-white',
    bgColor: 'bg-[#1C1040]',
  },
  {
    icon: Clock,
    title: 'Temporal Detection',
    description: 'Time-sensitive claims are flagged for appropriate context and re-verification.',
    color: 'text-white',
    bgColor: 'bg-[#1C1040]',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-950/10 to-transparent pointer-events-none" aria-hidden="true" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#1C1040] text-violet-400 text-xs font-mono uppercase tracking-wider border border-violet-900/40 mb-4">
            Core Capabilities
          </span>
          <h2 className="font-display text-5xl lg:text-6xl font-bold text-violet-400 mb-4">
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
                <div className="relative overflow-hidden p-8 rounded-2xl bg-[#0D1021] border border-[#1E2340] h-full flex flex-col">
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-6', feature.bgColor)}>
                    <feature.icon className={cn('w-6 h-6', feature.color)} />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-sm text-neutral-400 leading-relaxed flex-1">{feature.description}</p>
                  <div className="mt-6">
                    <span className="text-sm text-neutral-500 flex items-center gap-1 group-hover:text-violet-400 transition-colors cursor-default">
                      Learn more <span className="ml-1">→</span>
                    </span>
                  </div>
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
