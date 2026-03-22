'use client'

import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // AnimatePresence with mode="wait" was removed intentionally.
  // mode="wait" unmounts the old page FULLY before mounting the new
  // one — this caused DashboardLayout to remount on every navigation,
  // re-triggering the Zustand hydration check and causing blank pages.
  //
  // The animation still works: each new route fades and slides in.
  // But without AnimatePresence tearing down the layout in between.
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}
