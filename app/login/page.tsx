'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useUIStore } from '@/lib/stores/ui-store'
import { cn } from '@/lib/utils'

type FormErrors = {
  name?: string
  email?: string
  password?: string
}

export default function AuthPage() {
  const router = useRouter()
  const { login, setPlan, isAuthenticated } = useAuthStore()
  const { addToast } = useUIStore()

  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard')
    }
  }, [isAuthenticated, router])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    
    if (mode === 'signup' && !name.trim()) {
      newErrors.name = 'Full name is required'
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email'
    }
    
    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setSubmitError('')
    setIsLoading(true)

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          mode === 'login'
            ? { email, password }
            : { name, email, password }
        ),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          typeof data?.detail === 'string' ? data.detail : 'Authentication failed'
        )
      }

      localStorage.setItem('veritai-token', data.access_token)
      login(data.user)
      if (data.user?.plan) {
        setPlan(data.user.plan)
      }

      addToast({
        title: mode === 'login' ? 'Welcome back!' : 'Account created!',
        description: 'Redirecting to dashboard...',
        type: 'success',
      })

      router.push('/dashboard')
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Authentication failed'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 overflow-hidden font-sans">
      {/* BACKGROUND - DEEP DARK RADIAL */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 50% 40%, #1a0533 0%, #080808 50%, #000000 100%)' }}
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
          <button 
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login')
              setErrors({})
              setSubmitError('')
            }}
            className="text-[14px] text-white hover:text-white/80 transition-colors underline underline-offset-4 decoration-white/40 font-normal outline-none cursor-pointer"
          >
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </div>

        {/* TITLE */}
        <div className="text-center mb-[28px] leading-tight">
          <h1 className="text-[32px] text-white tracking-tight flex flex-col justify-center items-center">
            <span className="font-light tracking-wide">{mode === 'login' ? 'Log In to ' : 'Sign up for '}</span>
            <span className="font-display font-bold -mt-1">VeritAI</span>
          </h1>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="flex flex-col">
          {submitError && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500 text-center mb-4 bg-red-500/10 py-2 rounded-lg border border-red-500/20">
              {submitError}
            </motion.p>
          )}

          <AnimatePresence mode="wait">
            {mode === 'signup' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-col flex-1 w-full mb-[14px] overflow-hidden">
                <label className="text-[13px] text-[rgba(255,255,255,0.5)] mb-1.5 ml-1">Full name</label>
                <motion.div animate={errors.name ? { x: [-4, 4, -4, 4, 0] } : {}} transition={{ duration: 0.4 }} className="flex-1 w-full">
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name" 
                    className={`w-full h-[52px] bg-[rgba(255,255,255,0.06)] border rounded-[14px] px-[20px] py-[16px] text-[15px] text-white placeholder-[rgba(255,255,255,0.35)] outline-none transition-all duration-200 focus:bg-[rgba(255,255,255,0.08)] focus:border-[rgba(167,139,250,0.6)] focus:shadow-[inset_0_0_15px_rgba(124,58,237,0.15)] ${errors.name ? 'border-red-500/50' : 'border-[rgba(255,255,255,0.1)]'}`} 
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1 ml-1">{errors.name}</p>}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className={mode === 'signup' ? 'flex flex-col mb-[28px]' : 'flex flex-col gap-[14px] mb-[8px]'}>
            <div className="flex flex-col">
              <label className="text-[13px] text-[rgba(255,255,255,0.5)] mb-1.5 ml-1">Email address</label>
              <motion.div animate={errors.email ? { x: [-4, 4, -4, 4, 0] } : {}} transition={{ duration: 0.4 }} className="flex-1 w-full">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email" 
                  className={`w-full h-[52px] bg-[rgba(255,255,255,0.06)] border rounded-[14px] px-[20px] py-[16px] text-[15px] text-white placeholder-[rgba(255,255,255,0.35)] outline-none transition-all duration-200 focus:bg-[rgba(255,255,255,0.08)] focus:border-[rgba(167,139,250,0.6)] focus:shadow-[inset_0_0_15px_rgba(124,58,237,0.15)] ${errors.email ? 'border-red-500/50' : 'border-[rgba(255,255,255,0.1)]'}`} 
                />
                {errors.email && <p className="text-xs text-red-500 mt-1 ml-1">{errors.email}</p>}
              </motion.div>
            </div>

            <motion.div className="flex flex-col" layout>
              <label className="text-[13px] text-[rgba(255,255,255,0.5)] mb-1.5 ml-1">Password</label>
              <motion.div animate={errors.password ? { x: [-4, 4, -4, 4, 0] } : {}} transition={{ duration: 0.4 }} className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password" 
                  className={`w-full h-[52px] bg-[rgba(255,255,255,0.06)] border rounded-[14px] pl-[20px] pr-[44px] py-[16px] text-[15px] text-white placeholder-[rgba(255,255,255,0.35)] outline-none transition-all duration-200 focus:bg-[rgba(255,255,255,0.08)] focus:border-[rgba(167,139,250,0.6)] focus:shadow-[inset_0_0_15px_rgba(124,58,237,0.15)] ${errors.password ? 'border-red-500/50' : 'border-[rgba(255,255,255,0.1)]'}`} 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-[16px] top-[26px] -translate-y-1/2 text-[rgba(255,255,255,0.4)] hover:text-white transition-colors cursor-pointer">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </motion.div>
              {errors.password && <p className="text-xs text-red-500 mt-1 ml-1">{errors.password}</p>}
            </motion.div>
          </div>

          <AnimatePresence>
            {mode === 'login' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex justify-end mb-[20px]">
                <Link href="/forgot-password" className="text-[13px] text-[rgba(255,255,255,0.5)] hover:text-white transition-colors hover:underline underline-offset-4 mt-[4px]">
                  Forgot Password?
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            disabled={isLoading}
            whileHover={{ scale: isLoading ? 1 : 1.02, filter: isLoading ? 'brightness(1)' : 'brightness(1.1)' }}
            whileTap={{ scale: isLoading ? 1 : 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="w-full h-[56px] mt-[16px] mb-[16px] rounded-[50px] bg-white text-[#080808] font-semibold text-[16px] shadow-[0_8px_32px_rgba(255,255,255,0.10)] flex items-center justify-center outline-none cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed hover:bg-[#f0f0f0] transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : mode === 'login' ? 'Login' : 'Continue'}
          </motion.button>
        </form>

        <AnimatePresence>
          {mode === 'signup' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-center mt-4">
              <p className="text-[13px] text-[rgba(255,255,255,0.5)]">
                Already have an account?{' '}
                <button type="button" onClick={() => {
                  setMode('login'); setErrors({}); setSubmitError('');
                }} className="text-violet-400 hover:text-violet-300 transition-colors border-b border-transparent hover:border-violet-300 outline-none cursor-pointer">
                  Log in
                </button>
              </p>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  )
}
