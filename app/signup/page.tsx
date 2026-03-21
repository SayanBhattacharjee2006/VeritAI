'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'

// Apple Logo SVG
const AppleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-white" xmlns="http://www.w3.org/2000/svg">
    <path d="M16.365 21.49c-.835.63-1.63 1.25-2.615 1.25s-1.745-.63-2.68-.63c-.925 0-1.84.6-2.675.6-1.045 0-1.95-.62-2.685-1.4C3.89 18.23 2.05 11.66 4.975 7.64c1.19-1.64 2.92-2.3 4.67-2.3 1.575 0 3.01.69 4.145.69 1.125 0 2.76-.84 4.545-.84 1.765 0 3.315.68 4.385 1.95-3.665 2-2.925 6.94.385 8.16-1.03 2.5-3.155 5.5-4.74 6.19zM15.11 4.59c-.615.71-1.57 1.15-2.5 1.09-.16-1.12.355-2.14.995-2.815.65-.68 1.63-1.14 2.47-1.095.125 1.14-.385 2.11-.965 2.82z" />
  </svg>
)

// Google Logo SVG
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" xmlns="http://www.w3.org/2000/svg">
    <path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/>
    <path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.565 24 12.255 24z"/>
    <path fill="#FBBC05" d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 000 10.76l3.98-3.09z"/>
    <path fill="#EA4335" d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0 7.565 0 3.515 2.7 1.545 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/>
  </svg>
)

export default function SignupPage() {
  const [errors, setErrors] = useState<{ email?: boolean, first?: boolean, last?: boolean }>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({ email: true, first: true, last: true })
    setTimeout(() => setErrors({}), 600)
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 overflow-hidden font-sans">
      
      {/* BACKGROUND - DEEP DARK RADIAL */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 40%, #220E00 0%, #080808 50%, #000000 100%)',
        }}
      />
      
      {/* Vertical transition overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-black" />



      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-[380px] z-10 mx-auto"
      >
        {/* TOP RIGHT LINK */}
        <div className="absolute -top-12 right-0">
          <Link href="/login" className="text-[14px] text-white hover:text-white/80 transition-colors underline underline-offset-4 decoration-white/40 font-normal">
            Log in
          </Link>
        </div>



        {/* TITLE */}
        <div className="text-center mb-[28px] leading-tight flex flex-col items-center justify-center">
          <h1 className="text-[32px] text-white tracking-tight flex flex-col justify-center items-center">
            <span className="font-light tracking-wide">Sign up for </span>
            <span className="font-bold -mt-1">VeritAI</span>
          </h1>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="flex flex-col">
          
          <div className="flex justify-between gap-[12px] mb-[14px]">
            {/* First Name Field */}
            <div className="flex flex-col flex-1 w-full">
              <label className="text-[13px] text-[rgba(255,255,255,0.5)] mb-1.5 ml-1">First name</label>
              <motion.div animate={errors.first ? { x: [-4, 4, -4, 4, 0] } : {}} transition={{ duration: 0.4 }} className="flex-1 w-full">
                <input 
                  type="text" 
                  placeholder="First" 
                  className={`w-full h-[52px] bg-[rgba(255,255,255,0.06)] border rounded-[14px] px-[20px] py-[16px] text-[15px] text-white placeholder-[rgba(255,255,255,0.35)] outline-none transition-all duration-200 focus:bg-[rgba(255,255,255,0.08)] focus:border-[rgba(255,69,0,0.6)] focus:shadow-[inset_0_0_15px_rgba(255,69,0,0.15)] ${errors.first ? 'border-red-500/50' : 'border-[rgba(255,255,255,0.1)]'}`}
                />
              </motion.div>
            </div>

            {/* Last Name Field */}
            <div className="flex flex-col flex-1 w-full">
              <label className="text-[13px] text-[rgba(255,255,255,0.5)] mb-1.5 ml-1">Last name</label>
              <motion.div animate={errors.last ? { x: [-4, 4, -4, 4, 0] } : {}} transition={{ duration: 0.4 }} className="flex-1 w-full">
                <input 
                  type="text" 
                  placeholder="Last" 
                  className={`w-full h-[52px] bg-[rgba(255,255,255,0.06)] border rounded-[14px] px-[20px] py-[16px] text-[15px] text-white placeholder-[rgba(255,255,255,0.35)] outline-none transition-all duration-200 focus:bg-[rgba(255,255,255,0.08)] focus:border-[rgba(255,69,0,0.6)] focus:shadow-[inset_0_0_15px_rgba(255,69,0,0.15)] ${errors.last ? 'border-red-500/50' : 'border-[rgba(255,255,255,0.1)]'}`}
                />
              </motion.div>
            </div>
          </div>

          <div className="flex flex-col mb-[28px]">
            {/* Email Field */}
            <div className="flex flex-col">
              <label className="text-[13px] text-[rgba(255,255,255,0.5)] mb-1.5 ml-1">Email address</label>
              <motion.div animate={errors.email ? { x: [-4, 4, -4, 4, 0] } : {}} transition={{ duration: 0.4 }}>
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className={`w-full h-[52px] bg-[rgba(255,255,255,0.06)] border rounded-[14px] px-[20px] py-[16px] text-[15px] text-white placeholder-[rgba(255,255,255,0.35)] outline-none transition-all duration-200 focus:bg-[rgba(255,255,255,0.08)] focus:border-[rgba(255,69,0,0.6)] focus:shadow-[inset_0_0_15px_rgba(255,69,0,0.15)] ${errors.email ? 'border-red-500/50' : 'border-[rgba(255,255,255,0.1)]'}`}
                />
              </motion.div>
            </div>
          </div>

          {/* Primary CTA button */}
          <motion.button
            whileHover={{ scale: 1.02, filter: 'brightness(1.1)' }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="w-full h-[56px] mb-[16px] rounded-[50px] bg-gradient-to-r from-[#FF4500] via-[#FFB800] to-[#FFE033] text-white font-semibold text-[16px] shadow-[0_8px_32px_rgba(255,100,0,0.45)]"
          >
            Continue
          </motion.button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-[16px]">
          <div className="h-px bg-white/10 flex-1" />
          <span className="text-[12px] text-[rgba(255,255,255,0.3)] uppercase tracking-wider font-medium">or</span>
          <div className="h-px bg-white/10 flex-1" />
        </div>

        {/* Social Buttons */}
        <div className="flex justify-between gap-[12px] mb-[24px]">
          <button className="flex-1 h-[52px] flex items-center justify-center gap-[8px] bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.12)] rounded-[50px] hover:bg-[rgba(255,255,255,0.12)] transition-colors text-white text-[15px] font-medium">
            <AppleIcon />
            Apple
          </button>
          <button className="flex-1 h-[52px] flex items-center justify-center gap-[8px] bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.12)] rounded-[50px] hover:bg-[rgba(255,255,255,0.12)] transition-colors text-white text-[15px] font-medium">
            <GoogleIcon />
            Google
          </button>
        </div>

        {/* BOTTOM LINK */}
        <div className="text-center pb-6">
          <p className="text-[13px] text-[rgba(255,255,255,0.5)]">
            Already have an account?{' '}
            <Link href="/login" className="text-[#FF5500] hover:text-[#FF6600] transition-colors border-b border-transparent hover:border-[#FF6600]">
              Log in
            </Link>
          </p>
        </div>

      </motion.div>
    </div>
  )
}
