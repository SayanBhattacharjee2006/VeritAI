'use client'

import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-[#0D0D0D] border-t border-[#1A1A1A] py-12 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 group cursor-default">
              <div className="p-1 rounded bg-[#1A1A1A] border border-[#2A2A2A]">
                <ShieldCheck className="w-5 h-5 text-[#FF9F1C]" />
              </div>
              <span className="font-sans font-bold text-lg text-white tracking-tight">VeritAI</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-medium text-[#A0A0A0]">
            <Link href="#features" className="hover:text-white transition-colors">Product</Link>
            <Link href="#" className="hover:text-white transition-colors">Company</Link>
            <Link href="#" className="hover:text-white transition-colors">Legal</Link>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-[#1A1A1A] flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[#666666]">
          <p>© 2025 VerifyAI. Built for truth.</p>
          <div className="flex gap-4">
             <Link href="#" className="hover:text-[#A0A0A0] transition-colors">Privacy Policy</Link>
             <Link href="#" className="hover:text-[#A0A0A0] transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
