'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '@/lib/stores/ui-store'
import { cn } from '@/lib/utils'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'

const typeConfig = {
  success: {
    icon: CheckCircle,
    bg: 'bg-green-v/10',
    border: 'border-green-v/20',
    iconColor: 'text-green-v',
  },
  error: {
    icon: AlertCircle,
    bg: 'bg-red-v/10',
    border: 'border-red-v/20',
    iconColor: 'text-red-v',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber/10',
    border: 'border-amber/20',
    iconColor: 'text-amber',
  },
  info: {
    icon: Info,
    bg: 'bg-cyan/10',
    border: 'border-cyan/20',
    iconColor: 'text-cyan',
  },
}

export function ToastContainer() {
  const { toasts, removeToast } = useUIStore()
  
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const config = typeConfig[toast.type]
          const Icon = config.icon
          
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                'flex items-start gap-3 p-4 rounded-lg border backdrop-blur-sm',
                'min-w-[300px] max-w-[400px] shadow-lg',
                config.bg,
                config.border
              )}
            >
              <Icon className={cn('w-5 h-5 shrink-0 mt-0.5', config.iconColor)} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text">{toast.title}</p>
                {toast.description && (
                  <p className="text-xs text-muted-v mt-1">{toast.description}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 p-1 rounded hover:bg-surface/50 transition-colors"
              >
                <X className="w-4 h-4 text-muted-v" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
