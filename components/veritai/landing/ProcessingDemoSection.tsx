'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Check, Loader2 } from 'lucide-react'
import { ScrollReveal } from '@/components/veritai/ScrollReveal'

const demoSteps = [
  { label: 'Extracting Claims', done: true },
  { label: 'Refining', done: true },
  { label: 'Searching Evidence', active: true },
  { label: 'Verifying', pending: true },
  { label: 'Building Report', pending: true },
]

const terminalLines = [
  { text: '[10:24:01] Initializing claim extraction pipeline...', type: 'info' },
  { text: '[10:24:02] Processing text input (2,847 characters)...', type: 'info' },
  { text: '[10:24:03] Claim: "Global temperatures rose by 1.5°C since pre-industrial times"', type: 'claim' },
  { text: '[10:24:03] Claim: "Renewable energy accounts for 30% of global electricity"', type: 'claim' },
  { text: '[10:24:04] Claim: "The Amazon produces 20% of Earth\'s oxygen"', type: 'claim' },
  { text: '[10:24:04] ✓ Extracted 3 verifiable claims', type: 'success' },
  { text: '[10:24:05] Refining and categorizing claims...', type: 'info' },
  { text: '[10:24:06] ✓ Claims refined and ready for verification', type: 'success' },
  { text: '[10:24:07] Initiating multi-query evidence search...', type: 'info' },
  { text: '[10:24:08] Searching Claim 1/3: "Global temperatures..."', type: 'info' },
  { text: '[10:24:10] ✓ Found 12 sources (Tier 1: 4, Tier 2: 5, Tier 3: 3)', type: 'success' },
  { text: '[10:24:11] ⚠ Conflicting evidence detected for Claim 3', type: 'warning' },
]

const typeColors: Record<string, string> = {
  info: 'text-text',
  success: 'text-green-v',
  warning: 'text-amber',
  error: 'text-red-v',
  claim: 'text-primary-v',
}

export function ProcessingDemoSection() {
  const [visibleLines, setVisibleLines] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState(true)
  
  useEffect(() => {
    if (!isPlaying) return
    
    if (visibleLines < terminalLines.length) {
      const timer = setTimeout(() => {
        setVisibleLines((prev) => prev + 1)
      }, 800)
      return () => clearTimeout(timer)
    } else {
      // Reset after a pause
      const resetTimer = setTimeout(() => {
        setVisibleLines(0)
      }, 3000)
      return () => clearTimeout(resetTimer)
    }
  }, [visibleLines, isPlaying])
  
  return (
    <section className="py-24 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <ScrollReveal className="text-center mb-12">
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-text mb-4">
            Watch the pipeline in real-time
          </h2>
          <p className="text-lg text-muted-v">
            See exactly what happens when you submit content for verification.
          </p>
        </ScrollReveal>
        
        {/* Processing stepper */}
        <ScrollReveal delay={0.2} className="flex items-center justify-center gap-2 mb-8 overflow-x-auto pb-2">
          {demoSteps.map((step, index) => (
            <div key={step.label} className="flex items-center">
              <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-surface border border-border-v">
                {step.done ? (
                  <Check className="w-4 h-4 text-green-v" />
                ) : step.active ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                  >
                    <Loader2 className="w-4 h-4 text-cyan" />
                  </motion.div>
                ) : (
                  <span className="w-4 h-4 rounded-full border border-muted-v flex items-center justify-center text-[10px] text-muted-v">
                    {index + 1}
                  </span>
                )}
                <span className={cn(
                  'text-sm font-medium whitespace-nowrap',
                  step.done && 'text-green-v',
                  step.active && 'text-cyan',
                  step.pending && 'text-muted-v'
                )}>
                  {step.label}
                </span>
              </div>
              {index < demoSteps.length - 1 && (
                <div className="w-4 h-px bg-border-v mx-1" />
              )}
            </div>
          ))}
        </ScrollReveal>
        
        {/* Terminal */}
        <ScrollReveal delay={0.35} className="terminal rounded-xl border border-border-v overflow-hidden">
          {/* Terminal header */}
          <div className="flex items-center gap-2 px-4 py-3 bg-surface/50 border-b border-border-v">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-v/80" />
              <div className="w-3 h-3 rounded-full bg-amber/80" />
              <div className="w-3 h-3 rounded-full bg-green-v/80" />
            </div>
            <span className="text-xs text-muted-v ml-2 font-mono">VeritAI Pipeline — Live Demo</span>
          </div>
          
          {/* Terminal content */}
          <div className="p-4 h-[320px] overflow-y-auto">
            <AnimatePresence mode="popLayout">
              {terminalLines.slice(0, visibleLines).map((line, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15 }}
                  className="py-0.5"
                >
                  <span className={cn('font-mono text-sm', typeColors[line.type])}>
                    {line.text}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {/* Blinking cursor */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-muted-v">$</span>
              <span className="terminal-cursor" />
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
