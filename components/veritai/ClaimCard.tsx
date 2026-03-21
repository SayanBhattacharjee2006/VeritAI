'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown, Brain, AlertTriangle, Clock } from 'lucide-react'
import { VerdictBadge } from './VerdictBadge'
import { ConfidenceBar } from './ConfidenceBar'
import { SourceChip } from './SourceChip'
import type { Claim } from '@/lib/stores/verification-store'

interface ClaimCardProps {
  claim: Claim
  index: number
  defaultExpanded?: boolean
  className?: string
}

const verdictBorderColors = {
  true: 'border-l-green-v',
  false: 'border-l-red-v',
  partial: 'border-l-amber',
  unverifiable: 'border-l-muted-v',
}

export function ClaimCard({ claim, index, defaultExpanded = false, className }: ClaimCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className={cn(
        'bg-card-v rounded-lg border border-border-v overflow-hidden',
        'border-l-4',
        verdictBorderColors[claim.verdict],
        className
      )}
    >
      {/* Header - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-start gap-4 text-left hover:bg-card-high/50 transition-colors cursor-pointer"
      >
        <div className="flex-1 min-w-0">
          {/* Top row: verdict badge, claim number, temporal/conflict badges */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <VerdictBadge verdict={claim.verdict} size="sm" />
            <span className="text-xs text-muted-v font-mono">Claim #{index + 1}</span>
            {claim.isTemporal && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan/20 text-cyan text-[10px] font-medium">
                <Clock className="w-3 h-3" />
                Time-sensitive
              </span>
            )}
            {claim.hasConflict && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber/20 text-amber text-[10px] font-medium">
                <AlertTriangle className="w-3 h-3" />
                Conflicting evidence
              </span>
            )}
          </div>
          
          {/* Claim text */}
          <p className="text-text font-medium leading-relaxed">
            {claim.text}
          </p>
        </div>
        
        {/* Expand/collapse chevron */}
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 mt-1"
        >
          <ChevronDown className="w-5 h-5 text-muted-v" />
        </motion.div>
      </button>
      
      {/* Expandable content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4 border-t border-border-v pt-4">
              {/* AI Reasoning */}
              <div className="bg-surface rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-cyan" />
                  <span className="text-xs font-mono text-cyan uppercase tracking-wider">
                    AI Reasoning Log
                  </span>
                </div>
                <p className="text-sm text-muted-v leading-relaxed font-mono">
                  {claim.reasoning}
                </p>
              </div>
              
              {/* Conflict warning */}
              {claim.hasConflict && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-amber/10 border border-amber/20">
                  <AlertTriangle className="w-5 h-5 text-amber shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber">Conflicting Evidence Detected</p>
                    <p className="text-xs text-muted-v mt-1">
                      Multiple sources provide contradictory information. Review sources carefully.
                    </p>
                  </div>
                </div>
              )}
              
              {/* Confidence bar */}
              <ConfidenceBar value={claim.confidence} verdict={claim.verdict} />
              
              {/* Sources */}
              <div>
                <span className="text-xs text-muted-v font-medium block mb-2">Sources:</span>
                <div className="flex flex-wrap gap-2">
                  {claim.sources.map((source, idx) => (
                    <SourceChip
                      key={idx}
                      domain={source.domain}
                      url={source.url}
                      tier={source.tier}
                      title={source.title}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
