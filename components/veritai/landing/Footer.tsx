'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ShieldCheck, Github, Sun, Moon } from 'lucide-react'
import { useUIStore } from '@/lib/stores/ui-store'
import { ScrollReveal } from '@/components/veritai/ScrollReveal'

const footerLinks = {
  product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'API', href: '#' },
    { label: 'Changelog', href: '#' },
  ],
  company: [
    { label: 'About', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Contact', href: '#' },
  ],
  legal: [
    { label: 'Privacy', href: '#' },
    { label: 'Terms', href: '#' },
    { label: 'Security', href: '#' },
  ],
}

export function Footer() {
  const { theme, toggleTheme } = useUIStore()
  
  return (
    <footer className="relative bg-[#050505] border-t border-[#1a1a1a]">
      {/* Glow line */}
      <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
      
      <ScrollReveal direction="none" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-5 gap-12 mb-12">
          {/* Brand column */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-white/10 border border-white/10 transition-all hover:bg-white/15">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-white">VeritAI</span>
            </Link>
            <p className="text-neutral-600 text-sm leading-relaxed max-w-xs">
              Evidence-backed truth, powered by AI. Stop believing. Start verifying.
            </p>
          </div>
          
          {/* Product links */}
          <div>
            <h4 className="font-semibold text-text mb-4">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href}
                    className="text-sm text-neutral-300 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Company links */}
          <div>
            <h4 className="font-semibold text-text mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href}
                    className="text-sm text-neutral-300 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Legal links */}
          <div>
            <h4 className="font-semibold text-text mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href}
                    className="text-sm text-neutral-300 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-[#1a1a1a] gap-4">
          <p className="text-sm text-neutral-600">
            &copy; {new Date().getFullYear()} VeritAI. All rights reserved.
          </p>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-600">Built for truth</span>
            
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-surface transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-neutral-600" />
              ) : (
                <Moon className="w-5 h-5 text-neutral-600" />
              )}
            </button>
            
            <motion.a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1 }}
              className="p-2 rounded-lg hover:bg-surface transition-colors"
            >
              <Github className="w-5 h-5 text-neutral-600" />
            </motion.a>
          </div>
        </div>
      </ScrollReveal>
    </footer>
  )
}
