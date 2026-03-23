'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { ShieldCheck, Sun, Moon, Menu, X } from 'lucide-react'
import { useUIStore } from '@/lib/stores/ui-store'
import { MagneticButton } from '../MagneticButton'

const navLinks = [
  { href: '#features', label: 'Product' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'About' },
]

export function Navbar() {
  const { theme, toggleTheme } = useUIStore()
  const [activeLink, setActiveLink] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  
  return (
    <motion.header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'bg-black/80 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_1px_0_rgba(255,255,255,0.04)]' : 'bg-transparent'
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 12, scale: 1.05 }}
              className="p-1.5 rounded-lg bg-white/10 border border-white/10 transition-all hover:bg-white/15"
            >
              <ShieldCheck className="w-5 h-5 text-white" />
            </motion.div>
            <span className="font-display font-bold text-xl text-white">VeritAI</span>
          </Link>
          
          {/* Center nav - Desktop */}
          <div className="hidden md:flex items-center">
            <div className="flex items-center gap-1 p-1 rounded-full bg-white/[0.03] border border-white/[0.08]">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setActiveLink(link.href)}
                  className="relative px-4 py-2 text-sm font-medium text-neutral-500 hover:text-white transition-colors"
                >
                  {activeLink === link.href && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-white/[0.08] rounded-full"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
          
          {/* Right section */}
          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-white/[0.06] transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-neutral-500" />
              ) : (
                <Moon className="w-5 h-5 text-neutral-500" />
              )}
            </button>
            
            {/* Login button */}
            <Link
              href="/login"
              className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-neutral-500 hover:text-white transition-colors"
            >
              Login
            </Link>
            
            {/* CTA button */}
            <MagneticButton className="hidden sm:block">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/login"
                  className="hidden sm:inline-flex px-5 py-2.5 rounded-lg btn-primary text-sm font-semibold transition-shadow"
                >
                  Get Started
                </Link>
              </motion.div>
            </MagneticButton>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/[0.06] transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-white" />
              ) : (
                <Menu className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        <motion.div
          initial={false}
          animate={{ height: mobileMenuOpen ? 'auto' : 0, opacity: mobileMenuOpen ? 1 : 0 }}
          className="md:hidden overflow-hidden"
        >
          <div className="py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-sm font-medium text-neutral-500 hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 flex flex-col gap-2">
              <Link
                href="/login"
                className="px-4 py-2 text-center text-sm font-medium text-neutral-500 hover:text-white transition-colors"
              >
                Login
              </Link>
              <MagneticButton>
                <Link
                  href="/login"
                  className="block px-4 py-2.5 text-center rounded-lg btn-primary text-sm font-semibold"
                >
                  Get Started
                </Link>
              </MagneticButton>
            </div>
          </div>
        </motion.div>
      </nav>
    </motion.header>
  )
}
