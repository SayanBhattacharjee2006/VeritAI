'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  ShieldCheck,
  LayoutDashboard,
  History,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  Crown,
  Search,
  Bell,
  Sun,
  Moon,
} from 'lucide-react'
import { useUIStore } from '@/lib/stores/ui-store'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useVerificationStore } from '@/lib/stores/verification-store'
import { ToastContainer } from '../Toast'
import { MagneticButton } from '../MagneticButton'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/history', icon: History, label: 'History' },
]

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebar, theme, toggleTheme } = useUIStore()
  const { user, plan } = useAuthStore()
  const { reset } = useVerificationStore()

  const isNavItemActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <div className="min-h-screen flex">
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 64 : 240 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="hidden md:flex flex-col bg-surface border-r border-border-v fixed top-0 left-0 bottom-0 z-40"
      >
        <div className="flex items-center justify-between p-4 h-16 border-b border-border-v">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-orange to-amber shrink-0">
              <ShieldCheck className="w-5 h-5 text-bg" />
            </div>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-display font-bold text-lg text-text"
              >
                VeritAI
              </motion.span>
            )}
          </Link>
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg hover:bg-card-high transition-colors"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4 text-muted-v" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-muted-v" />
            )}
          </button>
        </div>

        <div className="p-3">
          <MagneticButton>
            <Link
              href="/dashboard"
              onClick={() => reset()}
              className={cn(
                'flex items-center justify-center gap-2 py-3 rounded-xl btn-primary font-semibold',
                sidebarCollapsed ? 'px-3' : 'px-4'
              )}
            >
              <PlusCircle className="w-5 h-5 shrink-0" />
              {!sidebarCollapsed && <span>New Check</span>}
            </Link>
          </MagneticButton>
        </div>

        <nav className="flex-1 px-3 py-2">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = isNavItemActive(item.href)

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative group',
                      isActive ? 'bg-card-high text-text' : 'text-muted-v hover:text-text hover:bg-card-v'
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNavItem"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-orange"
                      />
                    )}
                    <item.icon className="w-5 h-5 shrink-0" />
                    {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                    {sidebarCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 rounded bg-card-v text-xs text-text opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                        {item.label}
                      </div>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {plan === 'free' && !sidebarCollapsed && (
          <div className="mx-3 mb-3 p-4 rounded-xl bg-gradient-to-br from-orange/10 to-amber/10 border border-orange/20">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-4 h-4 text-amber" />
              <span className="text-sm font-semibold text-text">Upgrade to Pro</span>
            </div>
            <p className="text-xs text-muted-v mb-3">Get 50 verifications/day and PDF exports</p>
            <Link
              href="/dashboard/upgrade"
              className="block text-center text-xs font-semibold text-orange hover:underline"
            >
              View Plans
            </Link>
          </div>
        )}

        <div className="p-3 border-t border-border-v">
          <div
            className={cn(
              'flex items-center gap-3 p-2 rounded-lg hover:bg-card-v transition-colors',
              sidebarCollapsed && 'justify-center'
            )}
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange to-amber flex items-center justify-center shrink-0 ring-2 ring-orange/20">
              <span className="text-sm font-bold text-bg uppercase">{user?.name?.charAt(0) || 'U'}</span>
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-muted-v truncate">{user?.email || 'user@example.com'}</p>
              </div>
            )}
          </div>
        </div>
      </motion.aside>

      <div
        className={cn(
          'flex-1 flex flex-col min-h-screen transition-all duration-300',
          sidebarCollapsed ? 'md:ml-16' : 'md:ml-60'
        )}
      >
        <header className="sticky top-0 z-30 h-16 bg-bg/80 backdrop-blur-lg border-b border-border-v">
          <div className="h-full px-4 sm:px-6">
            <div className="flex items-center gap-4 w-full h-full">
              <div className="flex md:hidden items-center gap-2 shrink-0">
                <Link href="/dashboard" className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-orange to-amber">
                    <ShieldCheck className="w-5 h-5 text-bg" />
                  </div>
                </Link>
              </div>

              <div className="flex-1 flex justify-center">
                <div className="w-full max-w-md">
                  <div className="relative hidden sm:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-v" />
                    <input
                      type="search"
                      placeholder="Search history..."
                      className="w-full pl-10 pr-4 py-2 rounded-lg bg-surface border border-border-v text-sm text-text placeholder:text-muted-v focus:outline-none focus:ring-2 focus:ring-primary-glow/30"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button className="relative p-2 rounded-lg hover:bg-surface transition-colors">
                  <Bell className="w-5 h-5 text-muted-v" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-v" />
                </button>

                <span
                  className={cn(
                    'hidden sm:inline-flex px-2.5 py-1 rounded-full text-xs font-semibold uppercase',
                    plan === 'free' && 'bg-muted-v/20 text-muted-v',
                    plan === 'pro' && 'bg-orange/20 text-orange',
                    plan === 'premium' && 'bg-amber/20 text-amber'
                  )}
                >
                  {plan}
                </span>

                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg hover:bg-surface transition-colors"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-5 h-5 text-muted-v" />
                  ) : (
                    <Moon className="w-5 h-5 text-muted-v" />
                  )}
                </button>

                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange to-amber flex items-center justify-center shrink-0 ring-2 ring-orange/20">
                  <span className="text-sm font-bold text-bg uppercase">{user?.name?.charAt(0) || 'U'}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-border-v">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = isNavItemActive(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2',
                  isActive ? 'text-orange' : 'text-muted-v'
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            )
          })}
          <Link
            href="/dashboard/upgrade"
            className={cn(
              'flex flex-col items-center gap-1 px-3 py-2',
              pathname === '/dashboard/upgrade' ? 'text-orange' : 'text-muted-v'
            )}
          >
            <Crown className="w-5 h-5" />
            <span className="text-[10px] font-medium">Upgrade</span>
          </Link>
        </div>
      </nav>

      <ToastContainer />
    </div>
  )
}
