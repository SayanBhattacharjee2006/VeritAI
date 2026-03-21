'use client'

import { motion } from 'framer-motion'
import { Sparkles, Activity, ShieldAlert, Cpu } from 'lucide-react'

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 relative overflow-hidden bg-[#000000]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-sans text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
            Built for Precision
          </h2>
          <p className="text-lg text-[#A0A0A0] max-w-2xl mx-auto">
            Deep dive into the architecture powering our verification engine.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Full-width Top Card (Spans 2 cols on md+) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="md:col-span-2 relative group overflow-hidden rounded-[2rem] bg-[#1A1A1A] border border-[#2A2A2A] shadow-xl p-8 lg:p-12 flex flex-col lg:flex-row items-center gap-8 lg:gap-16 hover:border-[#FF6B2B]/30 transition-colors"
          >
            {/* Dot Grid Background */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#A0A0A0 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            
            <div className="relative z-10 flex-1">
              <div className="inline-flex items-center justify-center p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 mb-6 group-hover:bg-orange-500/20 transition-colors">
                <Cpu className="w-6 h-6 text-[#FF9F1C]" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">Multi-Step Agentic Pipeline</h3>
              <p className="text-[#A0A0A0] text-lg leading-relaxed">
                Watch the AI think â€” live streaming output shows every step: <span className="text-white">Extracting â†’ Searching â†’ Verifying</span>. Real-time transparency at unprecedented scale.
              </p>
            </div>
            
            <div className="relative z-10 flex-1 w-full bg-[#000000] rounded-2xl border border-[#2A2A2A] p-6 shadow-inner overflow-hidden">
               {/* Mockup Progress Visual */}
               <div className="space-y-4">
                 {[
                   { step: "Extracting claims from article...", progress: 100, active: false },
                   { step: "Searching 50+ knowledge bases...", progress: 100, active: false },
                   { step: "Cross-referencing evidence...", progress: 65, active: true },
                 ].map((item, i) => (
                   <div key={i} className="flex flex-col gap-2">
                     <div className="flex justify-between items-center text-sm">
                       <span className={item.active ? "text-[#FF9F1C] font-semibold" : "text-[#A0A0A0]"}>{item.step}</span>
                       <span className={item.active ? "text-[#FF9F1C]" : "text-[#A0A0A0]"}>{item.progress}%</span>
                     </div>
                     <div className="h-1.5 w-full bg-[#1A1A1A] rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         whileInView={{ width: `${item.progress}%` }}
                         transition={{ duration: 1.5, ease: "easeOut", delay: i * 0.5 }}
                         className={`h-full rounded-full ${item.active ? 'bg-gradient-to-r from-[#FF6B2B] to-[#FF9F1C] shadow-[0_0_10px_#FF6B2B]' : 'bg-[#333333]'}`}
                       />
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </motion.div>

          {/* Half-width Left Card */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative group overflow-hidden rounded-[2rem] bg-[#1A1A1A] border border-[#2A2A2A] p-8 lg:p-10 hover:border-[#FF6B2B]/30 transition-colors"
          >
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#A0A0A0 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            <div className="relative z-10 h-full flex flex-col">
              <div className="inline-flex items-center justify-center p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 mb-6 self-start">
                <Activity className="w-6 h-6 text-[#FF9F1C]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Confidence Scoring</h3>
              <p className="text-[#A0A0A0] leading-relaxed mb-8">
                Every claim gets a 0â€“100% confidence score backed by cited sources. Never guess the reliability of information again.
              </p>
              
              <div className="mt-auto h-32 flex items-end justify-center gap-4 border-b border-[#2A2A2A] pb-0 relative">
                  {/* Decorative Stacked Bar Chart */}
                  {[40, 70, 45, 90, 60].map((height, i) => (
                    <motion.div 
                      key={i}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${height}%` }}
                      transition={{ duration: 1, type: "spring", delay: 0.3 + (i * 0.1) }}
                      className={`w-12 rounded-t-lg bg-gradient-to-t ${i === 3 ? 'from-[#FF6B2B] to-[#FF9F1C] shadow-[0_0_15px_rgba(255,107,43,0.4)]' : 'from-[#222222] to-[#333333]'}`}
                    />
                  ))}
              </div>
            </div>
          </motion.div>

          {/* Half-width Right Card */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative group overflow-hidden rounded-[2rem] bg-[#1A1A1A] border border-[#2A2A2A] p-8 lg:p-10 hover:border-[#FF6B2B]/30 transition-colors"
          >
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#A0A0A0 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            
            {/* Abstract Decorative 3D Network/Cross shape */}
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              className="absolute -right-12 -bottom-12 w-64 h-64 opacity-20 pointer-events-none"
            >
              <div className="absolute inset-x-0 top-1/2 h-2 bg-[#FF6B2B] blur-sm transform -translate-y-1/2" />
              <div className="absolute inset-y-0 left-1/2 w-2 bg-[#FF9F1C] blur-sm transform -translate-x-1/2" />
              <div className="absolute inset-0 rounded-full border-4 border-[#FF6B2B]/50 blur-md scale-75" />
            </motion.div>

            <div className="relative z-10 h-full flex flex-col">
              <div className="inline-flex items-center justify-center p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 mb-6 self-start">
                <ShieldAlert className="w-6 h-6 text-[#FF6B2B]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Conflict Detection</h3>
              <p className="text-[#A0A0A0] leading-relaxed">
                Handles contradictory sources gracefully. Flags ambiguous or temporally sensitive claims, ensuring nuanced and accurate reporting across conflicting narratives.
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
