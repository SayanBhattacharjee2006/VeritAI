'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ExternalLink } from 'lucide-react'

interface SourceChipProps {
  domain: string
  url: string
  tier: 1 | 2 | 3
  title?: string
  className?: string
}

const tierConfig = {
  1: {
    color: 'bg-green-v',
    label: 'Tier 1',
  },
  2: {
    color: 'bg-violet-500',
    label: 'Tier 2',
  },
  3: {
    color: 'bg-muted-v',
    label: 'Tier 3',
  },
}

export function SourceChip({ domain, url, tier, title, className }: SourceChipProps) {
  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ y: -2, backgroundColor: 'var(--card-high)' }}
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg',
        'bg-[#0D1021] border border-[#1E2340]',
        'text-sm text-white hover:text-cyan',
        'transition-colors cursor-pointer group',
        className
      )}
      title={title}
    >
      <span 
        className={cn('w-2 h-2 rounded-full shrink-0', tierConfig[tier].color)} 
        aria-label={tierConfig[tier].label}
      />
      <span className="truncate max-w-[150px]">{domain}</span>
      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </motion.a>
  )
}
