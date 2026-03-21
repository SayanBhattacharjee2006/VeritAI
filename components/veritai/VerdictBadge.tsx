'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { Verdict } from '@/lib/stores/verification-store'

interface VerdictBadgeProps {
  verdict: Verdict
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const verdictConfig = {
  true: {
    label: 'TRUE',
    bg: 'bg-green-v/20',
    border: 'border-green-v/30',
    text: 'text-green-v',
  },
  false: {
    label: 'FALSE',
    bg: 'bg-red-v/20',
    border: 'border-red-v/30',
    text: 'text-red-v',
  },
  partial: {
    label: 'PARTIAL',
    bg: 'bg-amber/20',
    border: 'border-amber/30',
    text: 'text-amber',
  },
  unverifiable: {
    label: 'UNVERIFIABLE',
    bg: 'bg-muted-v/20',
    border: 'border-muted-v/30',
    text: 'text-muted-v',
  },
}

const sizeConfig = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
}

export function VerdictBadge({ verdict, size = 'md', className }: VerdictBadgeProps) {
  const config = verdictConfig[verdict]
  
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'inline-flex items-center font-mono font-semibold uppercase tracking-wider rounded-full border',
        config.bg,
        config.border,
        config.text,
        sizeConfig[size],
        className
      )}
    >
      {config.label}
    </motion.span>
  )
}
