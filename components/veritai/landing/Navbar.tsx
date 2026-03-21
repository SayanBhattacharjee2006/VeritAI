'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { ShieldCheck, Menu, X } from 'lucide-react'
import { MagneticButton } from '../MagneticButton'

const navLinks = [
  { href: '#home', label: 'Home' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#features', label: 'Features' },
  { href: '#pricing', label: 'Pricing' },
]

export function Navbar() {
  const [activeLink, setActiveLink] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        scrolled ? 'bg-[#000000]/70 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-5'
      )}
    >
      <nav className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              className="p-1.5 rounded-lg bg-gradient-to-br from-[#FF6B2B] to-[#FF9F1C] transition-shadow shadow-[0_0_15px_rgba(255,107,43,0.3)] group-hover:shadow-[0_0_20px_rgba(255,107,43,0.6)]"
            >
              <ShieldCheck className="w-5 h-5 text-white" />
            </motion.div>
            <span className="font-sans font-bold text-xl text-white tracking-tight">VeritAI</span>
          </Link>
          
          {/* Center nav - Desktop */}
          <div className="hidden md:flex items-center absolute left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-2 p-1.5 rounded-full bg-[#1A1A1A]/80 border border-[#2A2A2A] backdrop-blur-sm">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setActiveLink(link.href)}
                  className={cn(
                    "relative px-5 py-2 text-sm font-medium transition-colors hover:text-white",
                    activeLink === link.href ? "text-white" : "text-[#A0A0A0]"
                  )}
                >
                  <span className="relative z-10">{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
          
          {/* Right section */}
          <div className="flex items-center gap-4">
            {/* Try for free button - Gradient Border */}
            <div className="hidden md:block relative group">
              <div className="absolute -inset-[1px] rounded-full bg-gradient-to-r from-[#FF6B2B] to-[#FF9F1C] opacity-70 group-hover:opacity-100 transition duration-500 blur-[2px] group-hover:blur-[6px]"></div>
              <div className="absolute -inset-[1px] rounded-full bg-gradient-to-r from-[#FF6B2B] to-[#FF9F1C] opacity-100"></div>
              <MagneticButton>
                <Link
                  href="/login"
                  className="relative inline-flex px-6 py-2.5 rounded-full bg-[#000000] text-white text-sm font-semibold transition-all group-hover:bg-transparent tracking-wide"
                >
                  <span className="relative z-10">Try for Free</span>
                </Link>
              </MagneticButton>
            </div>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-white hover:bg-[#1A1A1A] transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        <motion.div
          initial={false}
          animate={{ height: mobileMenuOpen ? 'auto' : 0, opacity: mobileMenuOpen ? 1 : 0 }}
          className="md:hidden overflow-hidden"
        >
          <div className="py-5 space-y-2 mt-4 border-t border-[#2A2A2A]">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-base font-medium text-[#A0A0A0] hover:text-white hover:bg-[#1A1A1A] rounded-xl transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 px-4">
              <Link
                href="/login"
                className="block w-full py-3.5 text-center rounded-xl bg-gradient-to-r from-[#FF6B2B] to-[#FF9F1C] text-white text-base font-semibold shadow-[0_0_20px_rgba(255,107,43,0.3)]"
              >
                Try for Free
              </Link>
            </div>
          </div>
        </motion.div>
      </nav>
    </motion.header>
  )
}
