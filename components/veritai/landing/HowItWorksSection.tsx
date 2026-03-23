'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { FileText, Search, Brain, FileOutput } from 'lucide-react'
import { ScrollReveal } from '@/components/veritai/ScrollReveal'

const steps = [
  {
    number: '01',
    icon: FileText,
    title: 'Input & Extract',
    description: 'Text, URL, or Image is processed and scraped to extract 5-10 clean, verifiable claims.',
  },
  {
    number: '02',
    icon: Search,
    title: 'Multi-Query Search',
    description: '3 parallel Tavily queries per claim gather evidence. Sources are scored Tier 1/2/3.',
  },
  {
    number: '03',
    icon: Brain,
    title: 'Judge & Reflect',
    description: 'Summarizer processes evidence, Judge Agent assigns verdicts, Self-reflection verifies.',
  },
  {
    number: '04',
    icon: FileOutput,
    title: 'Report & Export',
    description: 'Full accuracy report with confidence scores, sources, and PDF export ready.',
  },
]

export function HowItWorksSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  
  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <ScrollReveal className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#1C1040] text-violet-400 text-xs font-mono uppercase tracking-wider border border-violet-900/40 mb-4">
            Pipeline
          </span>
          <h2 className="font-display text-5xl lg:text-6xl font-bold text-violet-400 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-v max-w-2xl mx-auto">
            From input to verified report in seconds, powered by our multi-agent architecture.
          </p>
        </ScrollReveal>
        
        {/* Steps */}
        <div ref={ref} className="relative">
          {/* Connecting line - Desktop */}
          <div className="hidden lg:block absolute top-[88px] left-[12.5%] right-[12.5%] h-0.5 bg-[#1E2340]">
            <motion.div
              className="h-full bg-gradient-to-r from-violet-500 via-purple-400 to-cyan-400"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: isInView ? 1 : 0 }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              style={{ transformOrigin: 'left' }}
            />
          </div>
          
          <div className="grid lg:grid-cols-4 gap-8 lg:gap-6 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ 
                  duration: 0.7, 
                  delay: index * 0.15, 
                  ease: [0.16, 1, 0.3, 1] 
                }}
                className="flex flex-col items-center text-center"
              >
                <span className="font-mono text-xs text-violet-400 uppercase tracking-widest mb-3 block">
                  STEP {step.number}
                </span>

                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-16 h-16 rounded-full flex items-center justify-center bg-[#1C1040] border-2 border-[#1E2340] shrink-0 shadow-[0_0_20px_rgba(139,92,246,0.15)]"
                >
                  <step.icon className="w-7 h-7 text-white" />
                </motion.div>

                <h3 className="font-display font-bold text-lg text-white mb-2">
                  {step.title}
                </h3>
                
                {/* Description */}
                <p className="text-sm text-neutral-400 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
