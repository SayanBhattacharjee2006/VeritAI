'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, X, Zap } from 'lucide-react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useUIStore } from '@/lib/stores/ui-store'

const plans = [
  {
    id: 'free' as const,
    name: 'Free',
    price: '$0',
    period: '/forever',
    description: 'Perfect for getting started',
    features: [
      '5 verifications per day',
      'Text and URL input',
      'Basic accuracy report',
      'Standard processing speed',
    ],
    notIncluded: [
      'Image input',
      'PDF export',
      'History saved to cloud',
      'API access',
    ],
    highlighted: false,
  },
  {
    id: 'pro' as const,
    name: 'Pro',
    price: '$19',
    period: '/month',
    description: 'For regular fact-checkers',
    features: [
      '50 verifications per day',
      'Text, URL, and Image input',
      'Full accuracy report',
      'PDF export',
      'Cloud history sync',
      'Priority processing',
    ],
    notIncluded: ['API access'],
    highlighted: true,
  },
  {
    id: 'premium' as const,
    name: 'Premium',
    price: '$49',
    period: '/month',
    description: 'For power users and teams',
    features: [
      'Unlimited verifications',
      'All input types',
      'Full accuracy report',
      'PDF export',
      'Cloud history sync',
      'Priority processing',
      'API access',
    ],
    notIncluded: [],
    highlighted: false,
  },
]

const planColors = {
  free: 'from-violet-500/5 to-cyan-400/5',
  pro: 'from-violet-500/10 to-purple-500/10',
  premium: 'from-cyan-400/5 to-violet-500/5',
} as const

export default function UpgradePage() {
  const { plan: currentPlan, setPlan } = useAuthStore()
  const { addToast } = useUIStore()
  const [planSynced, setPlanSynced] = useState(false)
  const [isUpgrading, setIsUpgrading] = useState<string | null>(null)

  useEffect(() => {
    const syncCurrentPlan = async () => {
      try {
        const token = localStorage.getItem('veritai-token')
        if (!token) {
          setPlanSynced(true)
          return
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/user/plan`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (res.ok) {
          const data = await res.json()
          if (data.plan) setPlan(data.plan)
        }
      } catch {
        // use persisted value
      } finally {
        setPlanSynced(true)
      }
    }

    syncCurrentPlan()
  }, [setPlan])

  const handleUpgrade = async (planId: 'free' | 'pro' | 'premium') => {
    if (planId === currentPlan) return
    setIsUpgrading(planId)

    try {
      const token = localStorage.getItem('veritai-token')
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/upgrade`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token ?? ''}`,
          },
          body: JSON.stringify({ plan: planId }),
        }
      )

      if (!res.ok) throw new Error('Upgrade failed')

      setPlan(planId)
      addToast({
        title: `Upgraded to ${planId.charAt(0).toUpperCase() + planId.slice(1)}!`,
        description: 'Your plan has been updated.',
        type: 'success',
      })
    } catch {
      addToast({
        title: 'Upgrade failed',
        description: 'Please try again.',
        type: 'error',
      })
    } finally {
      setIsUpgrading(null)
    }
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-5xl lg:text-6xl font-bold text-violet-400 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-neutral-400">
            Choose the perfect plan for your fact-checking needs
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-12 pt-4">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="h-full"
            >
            <motion.div
              whileHover={{ y: -8, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
              className={`relative rounded-2xl h-full ${
                plan.highlighted ? 'md:scale-105 shadow-[0_0_60px_rgba(139,92,246,0.15)]' : ''
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                  <span className="px-4 py-1 rounded-full bg-violet-600 text-white text-xs font-semibold border border-violet-500/40 whitespace-nowrap">
                    Most Popular
                  </span>
                </div>
              )}
              <div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${planColors[plan.id]} opacity-50`}
              />
              <div className="absolute inset-0 border border-[#1E2340] rounded-2xl" />

              <div className="relative z-10 p-8">
                <h3 className="font-mono text-xs text-violet-400 uppercase tracking-wider mb-2">
                  {plan.name}
                </h3>
                <p className="text-neutral-400 text-sm mb-6">
                  {plan.description}
                </p>

                <div className="mb-8">
                  <span className="font-display text-5xl font-black text-white">
                    {plan.price}
                  </span>
                  <span className="text-neutral-500 ml-1">
                    {plan.period}
                  </span>
                </div>

                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={!planSynced || currentPlan === plan.id || isUpgrading === plan.id}
                  className={`w-full py-3 rounded-lg font-semibold transition-all mb-8 ${
                    plan.highlighted
                      ? 'btn-primary'
                      : 'btn-ghost'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {!planSynced
                    ? 'Checking plan...'
                    : isUpgrading === plan.id
                    ? 'Upgrading...'
                    : currentPlan === plan.id
                    ? 'Current Plan'
                    : `Upgrade to ${plan.name}`}
                </button>

                <div className="space-y-4">
                  <p className="text-sm font-semibold text-text mb-4">
                    What's included:
                  </p>
                  {plan.features.map((feature, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3"
                    >
                      <Check className="w-5 h-5 text-green-v flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-white/80">
                        {feature}
                      </span>
                    </div>
                  ))}

                  {plan.notIncluded.length > 0 && (
                    <div className="pt-6 border-t border-[#1E2340] space-y-3">
                      <p className="text-xs font-semibold text-muted-v uppercase">
                        Not included
                      </p>
                      {plan.notIncluded.map((feature, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3"
                        >
                          <X className="w-5 h-5 text-muted-v flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-white/60">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="font-display text-2xl font-bold text-violet-400 mb-8 text-center">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {[
              {
                q: 'Can I change my plan anytime?',
                a: 'Yes, you can switch between Free, Pro, and Premium whenever you need. Your account updates immediately.',
              },
              {
                q: 'Is there a free trial?',
                a: 'Yes, every account starts on the Free plan so you can try VeritAI before upgrading.',
              },
              {
                q: 'Do I need a payment flow right now?',
                a: 'This environment upgrades plans directly through the backend for testing and internal use.',
              },
              {
                q: 'What does Premium unlock?',
                a: 'Premium gives you effectively unlimited daily verifications plus every input type and API access.',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="bg-[#0D1021] border border-[#1E2340] rounded-xl p-6"
              >
                <h3 className="font-semibold text-white mb-2">
                  {item.q}
                </h3>
                <p className="text-neutral-400 text-sm">{item.a}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-16 text-center"
        >
          <p className="text-muted-v mb-4">
            Need help choosing the right plan?
          </p>
          <button className="text-violet-400 font-semibold hover:underline">
            Contact our sales team →
          </button>
        </motion.div>
      </div>
    </div>
  )
}
