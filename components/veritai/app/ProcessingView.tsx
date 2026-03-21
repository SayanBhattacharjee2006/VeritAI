'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { FileText, Link as LinkIcon, Image, X } from 'lucide-react'
import { useVerificationStore } from '@/lib/stores/verification-store'
import { ProgressStepper } from '../ProgressStepper'
import { TerminalLog } from '../TerminalLog'

export function ProcessingView() {
  const { currentInput, processingSteps, terminalLines, reset } = useVerificationStore()
  
  const inputIcon = {
    text: FileText,
    url: LinkIcon,
    image: Image,
  }
  
  const Icon = currentInput ? inputIcon[currentInput.type] : FileText
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* Compact input summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-card-v border border-border-v">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-muted-v" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-v uppercase tracking-wider">
                Analyzing {currentInput?.type} input
              </p>
              <p className="text-sm text-text truncate">
                {currentInput?.content.substring(0, 100)}
                {currentInput && currentInput.content.length > 100 ? '...' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={reset}
            className="p-2 rounded-lg hover:bg-surface transition-colors shrink-0"
            aria-label="Cancel verification"
          >
            <X className="w-5 h-5 text-muted-v" />
          </button>
        </div>
      </motion.div>
      
      {/* Progress stepper */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <ProgressStepper steps={processingSteps} />
      </motion.div>
      
      {/* Terminal log */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-sm font-semibold text-muted-v uppercase tracking-wider mb-4">
          Pipeline Log
        </h3>
        <TerminalLog lines={terminalLines} maxHeight="400px" />
      </motion.div>
    </div>
  )
}
