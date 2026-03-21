'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Check, Loader2 } from 'lucide-react'
import type { ProcessingStep } from '@/lib/stores/verification-store'

interface ProgressStepperProps {
  steps: ProcessingStep[]
  className?: string
  orientation?: 'horizontal' | 'vertical'
}

export function ProgressStepper({ steps, className, orientation = 'horizontal' }: ProgressStepperProps) {
  const currentStepIndex = steps.findIndex(step => step.status === 'active')
  const completedSteps = steps.filter(step => step.status === 'done').length
  const progress = (completedSteps / steps.length) * 100
  
  return (
    <div className={cn(
      'relative',
      orientation === 'horizontal' ? 'w-full' : 'flex flex-col',
      className
    )}>
      {/* Connecting line */}
      {orientation === 'horizontal' && (
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-surface mx-12">
          <motion.div
            className="h-full bg-gradient-to-r from-green-v to-cyan"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: progress / 100 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{ transformOrigin: 'left' }}
          />
        </div>
      )}
      
      <div className={cn(
        orientation === 'horizontal' 
          ? 'flex items-start justify-between relative z-10' 
          : 'flex flex-col gap-4'
      )}>
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={cn(
              'flex',
              orientation === 'horizontal' 
                ? 'flex-col items-center gap-2' 
                : 'items-center gap-4'
            )}
          >
            {/* Step circle */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center',
                'border-2 transition-colors duration-300',
                step.status === 'done' && 'bg-green-v/20 border-green-v text-green-v',
                step.status === 'active' && 'bg-cyan/20 border-cyan text-cyan',
                step.status === 'pending' && 'bg-surface border-border-v text-muted-v'
              )}
            >
              {step.status === 'done' ? (
                <Check className="w-5 h-5" />
              ) : step.status === 'active' ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                >
                  <Loader2 className="w-5 h-5" />
                </motion.div>
              ) : (
                <span className="font-mono text-sm font-semibold">{index + 1}</span>
              )}
            </motion.div>
            
            {/* Step content */}
            <div className={cn(
              orientation === 'horizontal' ? 'text-center' : 'flex-1'
            )}>
              <p className={cn(
                'text-sm font-medium transition-colors',
                step.status === 'done' && 'text-green-v',
                step.status === 'active' && 'text-cyan',
                step.status === 'pending' && 'text-muted-v'
              )}>
                {step.label}
              </p>
              {step.subLabel && (
                <p className="text-xs text-muted-v mt-0.5">{step.subLabel}</p>
              )}
            </div>
            
            {/* Vertical connecting line */}
            {orientation === 'vertical' && index < steps.length - 1 && (
              <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-surface">
                <motion.div
                  className="w-full bg-green-v"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: step.status === 'done' ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ transformOrigin: 'top', height: '100%' }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
