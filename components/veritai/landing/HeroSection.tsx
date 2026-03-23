'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Sparkles, Play, ChevronRight } from 'lucide-react'
import { TruthRing } from '../TruthRing'
import { VerdictBadge } from '../VerdictBadge'
import { MagneticButton } from '../MagneticButton'

function useAnimatedCounter(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    if (!hasStarted) return

    let startTime: number
    let animationFrame: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)

      setCount(Math.floor(progress * target))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationFrame)
  }, [hasStarted, target, duration])

  return { count, start: () => setHasStarted(true) }
}

function HeroCard() {
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = ((e.clientX - cx) / rect.width) * 12
    const dy = ((e.clientY - cy) / rect.height) * 8
    e.currentTarget.style.transform = `perspective(800px) rotateY(${dx}deg) rotateX(${-dy}deg)`
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg)'
    e.currentTarget.style.transition = 'transform 0.4s ease'
  }

  const claims = [
    { text: 'Global temperatures rose by 1.5C...', verdict: 'true' as const },
    { text: 'Amazon produces 20% of oxygen...', verdict: 'false' as const },
    { text: 'Renewable energy accounts for 30%...', verdict: 'partial' as const },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative"
    >
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-violet-500/15 via-transparent to-violet-900/10 blur-xl" />

      <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}>
        <div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ transition: 'transform 0.1s ease' }}
          className="relative rounded-2xl border border-[#1E2340] bg-[#0D1021] p-6 w-full max-w-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <span className="font-mono text-xs text-violet-400">ANALYSIS_ID: VX-9920</span>
            <span className="text-xs text-muted-v">Just now</span>
          </div>

          <div className="flex justify-center mb-6">
            <TruthRing score={94} size={120} strokeWidth={10} />
          </div>

          <div className="space-y-3">
            {claims.map((claim, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg bg-surface/50 border-l-2',
                  claim.verdict === 'true' && 'border-l-green-v',
                  claim.verdict === 'false' && 'border-l-red-v',
                  claim.verdict === 'partial' && 'border-l-amber'
                )}
              >
                <VerdictBadge verdict={claim.verdict} size="sm" />
                <span className="text-sm text-muted-v truncate">{claim.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function HeroSection() {
  const claimsCounter = useAnimatedCounter(10000, 2500)
  const countriesCounter = useAnimatedCounter(50, 2000)

  useEffect(() => {
    const timer = setTimeout(() => {
      claimsCounter.start()
      countriesCounter.start()
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section className="min-h-screen flex items-center relative overflow-hidden pt-16">
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute top-0 left-0 right-0 h-[70vh] pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-violet-950/30 blur-[130px]" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[250px] rounded-full bg-violet-600/[0.07] blur-[80px]" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-800/40 bg-[#1C1040] backdrop-blur-sm mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping animate-pulse absolute inline-flex h-full w-full rounded-full bg-green-v opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-v" />
              </span>
              <span className="text-neutral-400 text-sm">Evidence Engine v1.0 - Live</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.08]"
            >
              <span className="text-white">Stop Believing.</span>
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-cyan-300 bg-clip-text text-transparent">Start Verifying.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-neutral-500 text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 mb-8"
            >
              VeritAI extracts every claim from articles, URLs, and images - then verifies each against real-time web evidence.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start mb-8"
            >
              <MagneticButton>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl btn-primary text-base font-semibold"
                  >
                    <Sparkles className="w-5 h-5" />
                    Try for Free
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </motion.div>
              </MagneticButton>

              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl btn-ghost text-base font-semibold"
                >
                  <Play className="w-5 h-5" />
                  See How It Works
                </Link>
              </motion.div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-sm text-muted-v"
            >
              Used to verify <span className="gradient-text font-semibold">{claimsCounter.count.toLocaleString()}+</span>{' '}
              claims across <span className="gradient-text font-semibold">{countriesCounter.count}+</span> countries
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="flex items-center gap-3 mt-6"
            >
              <div className="flex -space-x-2">
                {['A', 'M', 'R', 'S'].map((initial, i) => {
                  const colors = [
                    'from-violet-500 to-purple-400',
                    'from-cyan-400 to-violet-400',
                    'from-purple-400 to-pink-400',
                    'from-violet-400 to-cyan-300',
                  ]
                  return (
                    <div
                      key={i}
                      className={`w-8 h-8 rounded-full border-2 border-bg bg-gradient-to-br ${colors[i]} flex items-center justify-center shrink-0`}
                    >
                      <span className="text-xs font-bold text-bg">{initial}</span>
                    </div>
                  )
                })}
              </div>
              <span className="text-sm text-muted-v">
                Trusted by <span className="text-text font-semibold">2,000+</span> researchers
              </span>
            </motion.div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <HeroCard />
          </div>
        </div>
      </div>
    </section>
  )
}
