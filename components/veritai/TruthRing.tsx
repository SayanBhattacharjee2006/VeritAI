'use client'

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'

interface TruthRingProps {
  score: number
  size?: number
  strokeWidth?: number
  className?: string
}

export function TruthRing({ score, size = 160, strokeWidth = 12, className }: TruthRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  
  const motionValue = useMotionValue(0)
  const spring = useSpring(motionValue, { stiffness: 50, damping: 20 })
  const displayValue = useTransform(spring, (v) => Math.round(v))
  
  useEffect(() => {
    motionValue.set(score)
  }, [score, motionValue])
  
  const getScoreColor = (value: number) => {
    if (value < 0) return 'var(--muted)'
    if (value >= 80) return 'var(--green)'
    if (value >= 60) return 'var(--cyan)'
    if (value >= 40) return 'var(--amber)'
    return 'var(--red)'
  }
  
  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--surface)"
          strokeWidth={strokeWidth}
        />
        {/* Animated progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getScoreColor(score)}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{
            strokeDashoffset:
              score < 0
                ? circumference
                : circumference - (circumference * score) / 100,
          }}
          transition={{ 
            duration: 1.8, 
            ease: [0.34, 1.56, 0.64, 1],
            delay: 0.3
          }}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {score < 0 ? (
          <span className="font-display text-3xl font-bold text-muted-v">
            N/A
          </span>
        ) : (
          <motion.span 
            className="font-display text-4xl font-bold gradient-text"
          >
            {displayValue}
          </motion.span>
        )}
        <span className="text-xs text-muted-v font-medium uppercase tracking-wider">
          {score < 0 ? 'Unverifiable' : 'Accuracy'}
        </span>
      </div>
    </div>
  )
}
