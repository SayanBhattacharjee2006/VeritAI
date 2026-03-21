'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Mail } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <div className="mb-8">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-muted-v hover:text-text transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>
        </div>

        <div className="rounded-3xl border border-border-v bg-card-v p-8">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-text mb-2">Reset Password</h1>
            <p className="text-muted-v">Enter your email and we&apos;ll send you a reset link.</p>
          </div>

          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-v" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-surface border border-border-v rounded-xl text-text placeholder:text-muted-v focus:outline-none focus:ring-2 focus:ring-primary-glow/30"
                />
              </div>
            </div>

            <button type="submit" className="w-full py-3 rounded-xl btn-primary font-semibold">
              Send Reset Link
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
