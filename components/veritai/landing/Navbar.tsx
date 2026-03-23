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
        scrolled ? 'bg-surface/60 backdrop-blur-xl shadow-lg' : 'bg-transparent'
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 12, scale: 1.05 }}
              className="p-1.5 rounded-lg bg-gradient-to-br from-orange to-amber transition-shadow hover:shadow-[0_0_12px_rgba(255,107,43,0.5)]"
            >
              <ShieldCheck className="w-5 h-5 text-bg" />
            </motion.div>
            <span className="font-display font-bold text-xl text-text">VeritAI</span>
          </Link>
          
          {/* Center nav - Desktop */}
          <div className="hidden md:flex items-center">
            <div className="flex items-center gap-1 p-1 rounded-full bg-surface/50 border border-border-v">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setActiveLink(link.href)}
                  className="relative px-4 py-2 text-sm font-medium text-muted-v hover:text-text transition-colors"
                >
                  {activeLink === link.href && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-card-high rounded-full"
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
              className="p-2 rounded-lg hover:bg-surface transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-muted-v" />
              ) : (
                <Moon className="w-5 h-5 text-muted-v" />
              )}
            </button>
            
            {/* Login button */}
            <Link
              href="/login"
              className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-muted-v hover:text-text transition-colors"
            >
              Login
            </Link>
            
            {/* CTA button */}
            <MagneticButton className="hidden sm:block">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/login"
                  className="hidden sm:inline-flex px-5 py-2.5 rounded-lg btn-primary text-sm font-semibold shadow-[0_0_20px_rgba(255,107,43,0.25)] hover:shadow-[0_0_28px_rgba(255,107,43,0.4)] transition-shadow"
                >
                  Get Started
                </Link>
              </motion.div>
            </MagneticButton>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-surface transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-text" />
              ) : (
                <Menu className="w-5 h-5 text-text" />
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
                className="block px-4 py-2 text-sm font-medium text-muted-v hover:text-text hover:bg-surface rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 flex flex-col gap-2">
              <Link
                href="/login"
                className="px-4 py-2 text-center text-sm font-medium text-muted-v hover:text-text transition-colors"
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
