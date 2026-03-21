'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import type { TerminalLine } from '@/lib/stores/verification-store'

interface TerminalLogProps {
  lines: TerminalLine[]
  className?: string
  maxHeight?: string
}

const typeColors = {
  info: 'text-text',
  success: 'text-green-v',
  warning: 'text-amber',
  error: 'text-red-v',
  claim: 'text-primary-v',
  verdict: 'text-cyan',
}

export function TerminalLog({ lines, className, maxHeight = '400px' }: TerminalLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  
  // Auto-scroll to bottom when new lines are added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [lines])
  
  return (
    <div 
      className={cn(
        'terminal rounded-lg border border-border-v overflow-hidden',
        className
      )}
    >
      {/* Terminal header */}
      <div className="flex items-center gap-2 px-4 py-2 bg-surface/50 border-b border-border-v">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-v/80" />
          <div className="w-3 h-3 rounded-full bg-amber/80" />
          <div className="w-3 h-3 rounded-full bg-green-v/80" />
        </div>
        <span className="text-xs text-muted-v ml-2">VeritAI Pipeline</span>
      </div>
      
      {/* Terminal content */}
      <div 
        ref={scrollRef}
        className="p-4 overflow-y-auto"
        style={{ maxHeight }}
      >
        <AnimatePresence mode="popLayout">
          {lines.map((line, index) => (
            <motion.div
              key={`${line.timestamp}-${index}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15, delay: 0.05 }}
              className="flex gap-3 py-0.5"
            >
              <span className="text-cyan shrink-0">[{line.timestamp}]</span>
              <span className={cn('break-all', typeColors[line.type])}>
                {line.text}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Blinking cursor */}
        {lines.length > 0 && (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-muted-v">$</span>
            <span className="terminal-cursor" />
          </div>
        )}
      </div>
    </div>
  )
}
