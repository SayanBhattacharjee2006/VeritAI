'use client'

import { motion } from 'framer-motion'

export default function SettingsPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-xl rounded-3xl border border-border-v bg-card-v p-10 text-center"
      >
        <h1 className="font-display text-4xl font-bold text-text mb-3">Settings</h1>
        <p className="text-muted-v">Coming soon</p>
      </motion.div>
    </div>
  )
}
