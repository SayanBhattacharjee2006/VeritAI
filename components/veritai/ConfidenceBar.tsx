'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { Verdict } from '@/lib/stores/verification-store'

interface ConfidenceBarProps {
  value: number
  verdict: Verdict
  showLabel?: boolean
  className?: string
}

const verdictColors = {
  true: 'bg-green-v',
  false: 'bg-red-v',
  partial: 'bg-amber',
  unverifiable: 'bg-muted-v',
}

export function ConfidenceBar({ value, verdict, showLabel = true, className }: ConfidenceBarProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      {showLabel && (
        <span className="text-xs text-muted-v font-medium shrink-0">Confidence:</span>
      )}
      <div className="flex-1 h-2 bg-surface rounded-full overflow-hidden">
        <motion.div
          className={cn('h-full rounded-full', verdictColors[verdict])}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ 
            duration: 1.2, 
            ease: [0.34, 1.56, 0.64, 1],
            delay: 0.2
          }}
          style={{ 
            width: `${value}%`,
            transformOrigin: 'left'
          }}
        />
      </div>
      <span className="text-sm font-mono font-semibold text-text w-12 text-right">
        {value}%
      </span>
    </div>
  )
}
