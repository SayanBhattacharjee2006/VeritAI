'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Sparkles, ArrowRight, Search } from 'lucide-react'
import { MagneticButton } from '../MagneticButton'

const Logos = () => (
  <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8 mt-6">
    {['OpenAI', 'Anthropic', 'Google', 'Meta', 'Reuters'].map((logo, i) => (
      <motion.div 
        key={i} 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 + (i * 0.1), duration: 0.8 }}
        className="text-[#666666] font-display font-bold text-xl tracking-wider hover:text-[#A0A0A0] transition-colors filter grayscale hover:grayscale-0 duration-500 cursor-default"
      >
        {logo}
      </motion.div>
    ))}
  </div>
);

// Floating 3D Orbs/Rings for background
const AbstractShapes = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
    <motion.div 
      animate={{ 
        y: [0, -20, 0],
        rotate: [0, 5, 0],
        scale: [1, 1.05, 1] 
      }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-1/4 -left-10 w-[300px] h-[300px] rounded-[40%] bg-gradient-to-br from-[#FF6B2B]/20 to-[#FF9F1C]/5 blur-[80px]" 
    />
    <motion.div 
      animate={{ 
        y: [0, 30, 0],
        x: [0, -20, 0]
      }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      className="absolute bottom-1/4 -right-20 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-[#FF9F1C]/10 to-[#FF6B2B]/20 blur-[100px]" 
    />
  </div>
);

export function HeroSection() {
  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative pt-24 pb-16">
      <AbstractShapes />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
        
        {/* Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1A1A1A]/80 border border-[#2A2A2A] backdrop-blur-md mb-8"
        >
          <Sparkles className="w-4 h-4 text-[#FF9F1C]" />
          <span className="text-sm font-medium text-[#FF9F1C]">AI-Powered Fact Checking</span>
        </motion.div>

        {/* H1 Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          className="font-sans text-5xl sm:text-7xl lg:text-[5.5rem] font-bold tracking-tight leading-[1.1] mb-8 max-w-5xl"
        >
          <span className="text-white">Stop Trusting.</span>
          <br />
          <span className="bg-gradient-to-r from-[#FF6B2B] to-[#FF9F1C] bg-clip-text text-transparent">Start Verifying.</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className="text-[#A0A0A0] text-lg sm:text-xl leading-relaxed max-w-2xl mb-12"
        >
          Automatically extract claims, search real-world evidence, and get confidence-scored accuracy reports in seconds.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row items-center gap-5 mb-20"
        >
          <MagneticButton>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#FF6B2B] to-[#FF9F1C] text-white text-lg font-semibold shadow-[0_0_30px_rgba(255,107,43,0.3)] hover:shadow-[0_0_40px_rgba(255,107,43,0.5)] transition-shadow w-full sm:w-auto"
              >
                Analyze Text
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </MagneticButton>

          <MagneticButton>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-transparent border border-[#2A2A2A] text-white text-lg font-semibold hover:bg-[#1A1A1A] hover:border-[#FF6B2B]/50 transition-all w-full sm:w-auto shadow-sm"
              >
                <Search className="w-5 h-5 text-[#A0A0A0]" />
                Try a URL
              </Link>
            </motion.div>
          </MagneticButton>
        </motion.div>

        {/* Trust Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="pt-10 border-t border-[#2A2A2A]/50 w-full max-w-4xl"
        >
          <p className="text-sm font-medium text-[#666666] mb-4 uppercase tracking-widest text-center">
            Trusted by teams at
          </p>
          <Logos />
        </motion.div>

      </div>
    </section>
  )
}
