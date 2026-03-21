'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ShieldCheck, Eye, EyeOff, Loader2, Mail, Lock, User } from 'lucide-react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useUIStore } from '@/lib/stores/ui-store'

type AuthMode = 'login' | 'signup'

interface FormErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
}

export default function AuthPage() {
  const router = useRouter()
  const { login } = useAuthStore()
  const { addToast } = useUIStore()
  
  const [mode, setMode] = useState<AuthMode>('login')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // Form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  
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
    
    if (mode === 'signup') {
      if (!confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password'
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Mock successful login/signup
    login({
      id: '1',
      name: mode === 'signup' ? name : 'Demo User',
      email,
      avatar: undefined,
    })
    
    addToast({
      title: mode === 'login' ? 'Welcome back!' : 'Account created!',
      description: 'Redirecting to dashboard...',
      type: 'success',
    })
    
    setIsLoading(false)
    router.push('/dashboard')
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="glass rounded-2xl border border-border-v p-8">
          {/* Logo */}
          <Link href="/" className="flex items-center justify-center gap-2 mb-8">
            <div className="p-2 rounded-xl bg-gradient-to-br from-orange to-amber">
              <ShieldCheck className="w-6 h-6 text-bg" />
            </div>
            <span className="font-display font-bold text-2xl text-text">VeritAI</span>
          </Link>
          
          {/* Tab switcher */}
          <div className="relative flex p-1 rounded-lg bg-surface mb-8">
            <motion.div
              className="absolute inset-1 w-[calc(50%-4px)] rounded-md bg-card-high"
              animate={{ x: mode === 'login' ? 0 : '100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
            <button
              onClick={() => setMode('login')}
              className={cn(
                'relative z-10 flex-1 py-2 text-sm font-medium transition-colors cursor-pointer',
                mode === 'login' ? 'text-text' : 'text-muted-v'
              )}
            >
              Login
            </button>
            <button
              onClick={() => setMode('signup')}
              className={cn(
                'relative z-10 flex-1 py-2 text-sm font-medium transition-colors cursor-pointer',
                mode === 'signup' ? 'text-text' : 'text-muted-v'
              )}
            >
              Sign Up
            </button>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block text-sm font-medium text-text mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-v" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className={cn(
                        'w-full pl-10 pr-4 py-3 rounded-lg bg-surface border text-text',
                        'placeholder:text-muted-v focus:outline-none focus:ring-2 focus:ring-primary-glow/30',
                        errors.name ? 'border-red-v' : 'border-border-v'
                      )}
                    />
                  </div>
                  <AnimatePresence>
                    {errors.name && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-xs text-red-v mt-1"
                      >
                        {errors.name}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-v" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={cn(
                    'w-full pl-10 pr-4 py-3 rounded-lg bg-surface border text-text',
                    'placeholder:text-muted-v focus:outline-none focus:ring-2 focus:ring-primary-glow/30',
                    errors.email ? 'border-red-v' : 'border-border-v'
                  )}
                />
              </div>
              <AnimatePresence>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-xs text-red-v mt-1"
                  >
                    {errors.email}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            
            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-text">
                  Password
                </label>
                {mode === 'login' && (
                  <Link href="/forgot-password" className="text-xs text-cyan hover:underline">
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-v" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={cn(
                    'w-full pl-10 pr-12 py-3 rounded-lg bg-surface border text-text',
                    'placeholder:text-muted-v focus:outline-none focus:ring-2 focus:ring-primary-glow/30',
                    errors.password ? 'border-red-v' : 'border-border-v'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-v hover:text-text"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <AnimatePresence>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-xs text-red-v mt-1"
                  >
                    {errors.password}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            
            {/* Confirm Password (signup only) */}
            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.div
                  key="confirmPassword"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block text-sm font-medium text-text mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-v" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className={cn(
                        'w-full pl-10 pr-12 py-3 rounded-lg bg-surface border text-text',
                        'placeholder:text-muted-v focus:outline-none focus:ring-2 focus:ring-primary-glow/30',
                        errors.confirmPassword ? 'border-red-v' : 'border-border-v'
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-v hover:text-text"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <AnimatePresence>
                    {errors.confirmPassword && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-xs text-red-v mt-1"
                      >
                        {errors.confirmPassword}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'w-full py-3 rounded-lg btn-primary font-semibold',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                  className="w-5 h-5 mx-auto"
                >
                  <Loader2 className="w-5 h-5" />
                </motion.div>
              ) : (
                mode === 'login' ? 'Login' : 'Sign Up'
              )}
            </motion.button>
          </form>
          {/* Footer text */}
          <p className="text-center text-sm text-muted-v mt-6">
            {mode === 'login' ? (
              <>
                {"Don't have an account? "}
                <button
                  onClick={() => setMode('signup')}
                  className="text-cyan hover:underline cursor-pointer"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                {'Already have an account? '}
                <button
                  onClick={() => setMode('login')}
                  className="text-cyan hover:underline cursor-pointer"
                >
                  Login
                </button>
              </>
            )}
          </p>
        </div>
      </motion.div>
    </div>
  )
}
