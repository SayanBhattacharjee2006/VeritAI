'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { MagneticButton } from '../MagneticButton'

export function CTASection() {
  return (
    <section className="py-32 relative overflow-hidden bg-[#000000] border-t border-[#141414]">
      {/* Floating 3D Triangle Shapes (Afterglow style) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <motion.div
           animate={{ 
             y: [0, -30, 0], 
             rotate: [0, 45, 0],
             scale: [1, 1.1, 1] 
           }}
           transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
           className="absolute top-10 left-[10%] w-[250px] h-[250px]"
        >
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_30px_rgba(255,107,43,0.3)] filter opacity-60">
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#FF6B2B', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#FF9F1C', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            <path d="M50 15 L85 80 L15 80 Z" fill="url(#grad1)" stroke="#FF6B2B" strokeWidth="1" strokeLinejoin="round" />
          </svg>
        </motion.div>

        <motion.div
           animate={{ 
             y: [0, 40, 0], 
             rotate: [45, -15, 45],
             scale: [1, 0.9, 1] 
           }}
           transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
           className="absolute bottom-10 right-[10%] w-[350px] h-[350px]"
        >
           <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_40px_rgba(255,159,28,0.2)] filter opacity-40">
            <defs>
               <linearGradient id="grad2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#FF9F1C', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#FF6B2B', stopOpacity: 0.8 }} />
              </linearGradient>
            </defs>
            <path d="M50 85 L85 20 L15 20 Z" fill="url(#grad2)" stroke="#FF9F1C" strokeWidth="1" strokeLinejoin="round" />
          </svg>
        </motion.div>

        {/* Center Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FF6B2B]/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-sans text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight"
        >
          Ready to Kill Misinformation?
        </motion.h2>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
           className="text-[#A0A0A0] text-xl max-w-2xl mx-auto mb-12"
        >
          Start your free analysis now. No signup required.
        </motion.p>

        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           whileInView={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.6, delay: 0.2 }}
           className="flex justify-center"
        >
          <MagneticButton>
            <Link
              href="/login"
              className="relative inline-flex items-center gap-3 px-10 py-5 rounded-full bg-gradient-to-r from-[#FF6B2B] to-[#FF9F1C] text-white text-lg font-bold group hover:shadow-[0_0_40px_rgba(255,107,43,0.6)] transition-all duration-300"
            >
              <div className="absolute inset-0 rounded-full animate-pulse bg-gradient-to-r from-[#FF6B2B] to-[#FF9F1C] blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
              <span className="relative z-10 tracking-wide">Analyze Now</span>
              <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
            </Link>
          </MagneticButton>
        </motion.div>
      </div>
    </section>
  )
}
