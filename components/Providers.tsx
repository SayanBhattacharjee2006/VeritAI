'use client'

import { useEffect } from 'react'
import { useUIStore } from '@/lib/stores/ui-store'
import { useAuthStore } from '@/lib/stores/auth-store'

export function Providers({ children }: { children: React.ReactNode }) {
  const { theme } = useUIStore()
  const { isAuthenticated, setPlan } = useAuthStore()

  // Sync theme on mount and when it changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Sync plan from backend on mount if user is logged in
  useEffect(() => {
    if (!isAuthenticated) return

    const syncPlan = async () => {
      try {
        const token = localStorage.getItem('veritai-token')
        if (!token) return

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/user/plan`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )

        if (res.ok) {
          const data = await res.json()
          if (data.plan) {
            setPlan(data.plan)
          }
        }
      } catch {
        // Silently fail — Zustand persisted value is used as fallback
      }
    }

    syncPlan()
  }, [isAuthenticated, setPlan])

  return <>{children}</>
}
