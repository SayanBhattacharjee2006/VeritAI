'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/auth-store'
import { AppLayout } from '@/components/veritai/app/AppLayout'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated, _hasHydrated } = useAuthStore()

  // Zustand persist reads localStorage asynchronously.
  // Until _hasHydrated is true, isAuthenticated is unreliable.
  // Show a spinner instead of null to prevent blank screen
  // on both full refresh AND client-side navigation.
  if (!_hasHydrated) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-orange/30 border-t-orange animate-spin" />
          <p className="text-sm text-muted-v font-mono">Loading...</p>
        </div>
      </div>
    )
  }

  // Hydration complete — isAuthenticated is now trustworthy
  if (!isAuthenticated) {
    router.replace('/login')
    return null
  }

  return <AppLayout>{children}</AppLayout>
}
