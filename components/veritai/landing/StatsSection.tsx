'use client'

import { motion, useMotionValue, useSpring, useTransform, useInView } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { ScrollReveal } from '@/components/veritai/ScrollReveal'

interface StatCardProps {
  value: string
  numericValue?: number
  label: string
  suffix?: string
  index: number
}

function StatCard({ value, numericValue, label, suffix = '', index }: StatCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  
  const motionValue = useMotionValue(0)
  const spring = useSpring(motionValue, { stiffness: 50, damping: 20 })
  const displayValue = useTransform(spring, (v) => Math.round(v))
  
  useEffect(() => {
    if (isInView && numericValue) {
      motionValue.set(numericValue)
    }
  }, [isInView, numericValue, motionValue])
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6, transition: { type: 'spring', stiffness: 300 } }}
      className="relative group"
    >
      {/* Hover glow */}
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-violet-500/0 to-cyan-400/0 group-hover:from-violet-500/10 group-hover:to-cyan-400/10 transition-all duration-300 blur-xl" />
      
      <div className="relative p-8 rounded-2xl bg-[#0e0e0e] border border-[#1e1e1e] border-b-2 border-b-violet-500/40 group-hover:border-violet-500/30 transition-colors overflow-hidden">
        <span className="flex items-baseline gap-0.5 overflow-hidden font-display text-5xl lg:text-6xl font-bold gradient-text mb-3 leading-none truncate text-white">
          {numericValue ? (
            <>
              <motion.span>{displayValue}</motion.span>
              <span className="text-4xl lg:text-5xl font-bold gradient-text text-white">{suffix}</span>
            </>
          ) : (
            value
          )}
        </span>
        <span className="text-neutral-500 font-medium">{label}</span>
      </div>
    </motion.div>
  )
}

const stats = [
  { value: '98%', numericValue: 98, suffix: '%', label: 'Accuracy Rate' },
  { value: '12K+', numericValue: 12, suffix: 'K+', label: 'Claims Verified' },
  { value: '3s', numericValue: 3, suffix: 's', label: 'Avg Per Claim' },
  { value: '4', numericValue: 4, suffix: '', label: 'Verdict Types' },
]

export function StatsSection() {
  return (
    <section className="py-24 relative overflow-hidden bg-transparent">
      <div className="absolute inset-0 bg-transparent pointer-events-none" aria-hidden="true" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <ScrollReveal key={stat.label} delay={index * 0.12} direction="up">
              <StatCard
                value={stat.value}
                numericValue={stat.numericValue}
                suffix={stat.suffix}
                label={stat.label}
                index={index}
              />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
