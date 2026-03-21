'use client'

import { motion } from 'framer-motion'
import { FileSearch, Globe, ScanLine } from 'lucide-react'

const steps = [
  {
    step: '1',
    icon: FileSearch,
    title: 'Claim Extraction',
    description: 'Paste text or a URL. Our AI decomposes it into atomic, verifiable statements.',
  },
  {
    step: '2',
    icon: Globe,
    title: 'Evidence Retrieval',
    description: 'Autonomous web search formulates queries and cross-references authoritative sources.',
  },
  {
    step: '3',
    icon: ScanLine,
    title: 'Verification Report',
    description: 'Each claim gets rated True / False / Partially True / Unverifiable with citations and confidence scores.',
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden bg-[#0D0D0D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <h2 className="font-sans text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
            How It Works
          </h2>
          <p className="text-lg text-[#A0A0A0] max-w-2xl mx-auto">
            A seamless 3-step pipeline designed for precision and speed.
          </p>
        </div>

        <div className="relative">
          {/* Animated Connector Line - Desktop Only */}
          <div className="hidden lg:block absolute top-24 left-[16.6%] right-[16.6%] h-[2px] bg-[#2A2A2A] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#FF6B2B] to-[#FF9F1C]"
              initial={{ x: '-100%' }}
              whileInView={{ x: '100%' }}
              viewport={{ once: true }}
              transition={{ duration: 2, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }}
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.2 }}
                className="relative group"
              >
                {/* Background Card */}
                <div className="h-full rounded-2xl bg-[#1A1A1A]/80 backdrop-blur-sm border border-[#2A2A2A] p-8 pt-12 text-center transition-all duration-300 hover:border-[#FF6B2B]/40 hover:shadow-[0_0_30px_rgba(255,107,43,0.1)] hover:-translate-y-2">
                  
                  {/* Step Number Circle */}
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-[#1A1A1A] border-2 border-[#FF6B2B] flex items-center justify-center shadow-[0_0_15px_rgba(255,107,43,0.3)] group-hover:shadow-[0_0_25px_rgba(255,107,43,0.6)] transition-all duration-300">
                    <span className="font-bold text-[#FF9F1C] text-lg">{step.step}</span>
                  </div>

                  <div className="flex justify-center mb-6">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-[#2A2A2A] to-[#141414] border border-[#2A2A2A]">
                      <step.icon className="w-8 h-8 text-[#FF9F1C]" />
                    </div>
                  </div>

                  <h3 className="font-sans font-semibold text-xl text-white mb-4">
                    {step.title}
                  </h3>
                  <p className="text-[#A0A0A0] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
