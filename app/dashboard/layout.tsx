'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/auth-store'
import { AppLayout } from '@/components/veritai/app/AppLayout'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  // useAuthStore.persist.hasHydrated() is the CORRECT way to check
  // if Zustand has finished reading from localStorage.
  // It is synchronous and does NOT reset on client-side navigation
  // because the store singleton stays alive between page navigations.
  const [hydrated, setHydrated] = useState(
    () => useAuthStore.persist.hasHydrated()
  )

  useEffect(() => {
    if (!hydrated) {
      // Subscribe to hydration completion event
      const unsub = useAuthStore.persist.onFinishHydration(() => {
        setHydrated(true)
      })
      // Check again synchronously in case it hydrated between
      // render and this effect running
      if (useAuthStore.persist.hasHydrated()) {
        setHydrated(true)
      }
      return unsub
    }
  }, [hydrated])

  // Redirect to login if user is not authenticated (Temporarily Disabled for UI Testing)
  // useEffect(() => {
  //   if (hydrated && !isAuthenticated) {
  //     router.replace('/login')
  //   }
  // }, [hydrated, isAuthenticated, router])

  // Still reading from localStorage — show spinner
  if (!hydrated) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
          <p className="text-sm text-muted-v font-mono">Loading...</p>
        </div>
      </div>
    )
  }

  // Hydration complete — isAuthenticated is now trustworthy (Temporarily Disabled)
  // if (!isAuthenticated) {
  //   return null
  // }

  return <AppLayout>{children}</AppLayout>
}
