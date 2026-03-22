'use client'

import { motion } from 'framer-motion'
import { Bot, User, AlertCircle, CheckCircle, HelpCircle, ArrowLeft, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useVerificationStore, type AIDetectResult } from '@/lib/stores/verification-store'

const verdictConfig: Record<AIDetectResult['verdict'], {
  label: string
  color: string
  bg: string
  icon: LucideIcon
  description: string
}> = {
  ai_generated: {
    label: 'AI Generated',
    color: 'text-red-v',
    bg: 'bg-red-v/10 border-red-v/20',
    icon: Bot,
    description: 'This content shows strong signs of AI generation.',
  },
  likely_ai: {
    label: 'Likely AI Generated',
    color: 'text-orange',
    bg: 'bg-orange/10 border-orange/20',
    icon: Bot,
    description: 'This content shows several patterns common in AI-generated content.',
  },
  uncertain: {
    label: 'Uncertain',
    color: 'text-amber',
    bg: 'bg-amber/10 border-amber/20',
    icon: HelpCircle,
    description: 'Could not determine with confidence whether this is AI or human generated.',
  },
  likely_human: {
    label: 'Likely Human Written',
    color: 'text-cyan',
    bg: 'bg-cyan/10 border-cyan/20',
    icon: User,
    description: 'This content shows several patterns typical of human writing.',
  },
  human_written: {
    label: 'Human Written',
    color: 'text-green-v',
    bg: 'bg-green-v/10 border-green-v/20',
    icon: User,
    description: 'This content strongly resembles human-written text.',
  },
  real_photo: {
    label: 'Real Photo / Human Made',
    color: 'text-green-v',
    bg: 'bg-green-v/10 border-green-v/20',
    icon: CheckCircle,
    description: 'This image appears to be a real photograph or human-made artwork.',
  },
}

export function AIDetectResultView() {
  const { aiDetectResult, reset } = useVerificationStore()

  if (!aiDetectResult) return null

  const config = verdictConfig[aiDetectResult.verdict] ?? verdictConfig.uncertain
  const Icon = config.icon

  return (
    <div className="max-w-2xl mx-auto">
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={reset}
        className="flex items-center gap-2 text-muted-v hover:text-text
          transition-colors mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">New check</span>
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className={cn(
          'p-6 rounded-2xl border-2 flex items-start gap-4',
          config.bg
        )}>
          <div className={cn(
            'w-14 h-14 rounded-xl flex items-center justify-center shrink-0',
            'bg-bg/50'
          )}>
            <Icon className={cn('w-7 h-7', config.color)} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h2 className={cn('font-display text-2xl font-bold', config.color)}>
                {config.label}
              </h2>
              <span className={cn(
                'px-2.5 py-1 rounded-full text-xs font-bold',
                config.bg,
                config.color
              )}>
                {aiDetectResult.confidence.toFixed(0)}% confidence
              </span>
            </div>
            <p className="text-sm text-muted-v">{config.description}</p>
          </div>
        </div>

        <div className="bg-card-v rounded-2xl border border-border-v p-5">
          <p className="text-sm font-semibold text-text mb-3">Confidence Level</p>
          <div className="w-full bg-surface rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${aiDetectResult.confidence}%` }}
              transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1], delay: 0.3 }}
              className={cn('h-full rounded-full', {
                'bg-red-v': aiDetectResult.verdict === 'ai_generated',
                'bg-orange': aiDetectResult.verdict === 'likely_ai',
                'bg-amber': aiDetectResult.verdict === 'uncertain',
                'bg-cyan': aiDetectResult.verdict === 'likely_human',
                'bg-green-v': aiDetectResult.verdict === 'human_written'
                  || aiDetectResult.verdict === 'real_photo',
              })}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-xs text-muted-v">Human</span>
            <span className="text-xs text-muted-v font-mono">
              {aiDetectResult.confidence.toFixed(1)}%
            </span>
            <span className="text-xs text-muted-v">AI</span>
          </div>
        </div>

        <div className="bg-card-v rounded-2xl border border-border-v p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-cyan" />
            <p className="text-xs font-semibold text-cyan uppercase tracking-wider">
              Analysis
            </p>
          </div>
          <p className="text-sm text-text leading-relaxed">{aiDetectResult.reasoning}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {aiDetectResult.signals.ai_signals.length > 0 && (
            <div className="bg-card-v rounded-2xl border border-border-v p-5">
              <div className="flex items-center gap-2 mb-3">
                <Bot className="w-4 h-4 text-red-v" />
                <p className="text-xs font-semibold text-red-v uppercase tracking-wider">
                  AI Signals Detected
                </p>
              </div>
              <ul className="space-y-1.5">
                {aiDetectResult.signals.ai_signals.map((signal, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-v">
                    <span className="text-red-v shrink-0 mt-0.5">&bull;</span>
                    {signal}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {aiDetectResult.signals.human_signals.length > 0 && (
            <div className="bg-card-v rounded-2xl border border-border-v p-5">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-green-v" />
                <p className="text-xs font-semibold text-green-v uppercase tracking-wider">
                  Human Signals Detected
                </p>
              </div>
              <ul className="space-y-1.5">
                {aiDetectResult.signals.human_signals.map((signal, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-v">
                    <span className="text-green-v shrink-0 mt-0.5">&bull;</span>
                    {signal}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <p className="text-xs text-muted-v text-center px-4">
          AI detection is probabilistic and not 100% accurate. Use as a guide,
          not a definitive verdict.
        </p>
      </motion.div>
    </div>
  )
}
