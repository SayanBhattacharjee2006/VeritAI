'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Zap } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth-store';

const plans = [
  {
    name: 'Basic',
    price: 'Free',
    description: 'Perfect for getting started',
    limits: {
      queriesPerMonth: 10,
      sourceAccess: 5,
      advancedAnalytics: false,
      prioritySupport: false,
      apiAccess: false,
    },
    features: [
      'Up to 10 claims per month',
      'Access to 5 source databases',
      'Standard processing speed',
      'Email support',
    ],
    color: 'from-blue-500/20 to-cyan-500/20',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'For regular fact-checkers',
    limits: {
      queriesPerMonth: 500,
      sourceAccess: 50,
      advancedAnalytics: true,
      prioritySupport: true,
      apiAccess: false,
    },
    features: [
      'Up to 500 claims per month',
      'Access to 50 source databases',
      'Advanced analytics dashboard',
      'Priority email support',
      'Claim history export',
      'Batch verification',
    ],
    color: 'from-purple-500/20 to-pink-500/20',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For organizations and teams',
    limits: {
      queriesPerMonth: Infinity,
      sourceAccess: Infinity,
      advancedAnalytics: true,
      prioritySupport: true,
      apiAccess: true,
    },
    features: [
      'Unlimited claims per month',
      'Access to all source databases',
      'Advanced analytics & reporting',
      '24/7 phone & email support',
      'Team collaboration tools',
      'Custom integrations & API',
      'Dedicated account manager',
    ],
    color: 'from-amber-500/20 to-orange-500/20',
    highlighted: false,
  },
];

export default function UpgradePage() {
  const { plan: currentPlan } = useAuthStore();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const handleUpgrade = (planName: string) => {
    console.log(`Upgrading to ${planName}`);
    // In a real app, this would redirect to Stripe checkout
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Choose the perfect plan for your fact-checking needs
          </p>

          {/* Billing Toggle */}
          <div className="flex justify-center items-center gap-4">
            <span
              className={`text-sm font-medium transition-colors ${
                billingPeriod === 'monthly'
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              Monthly
            </span>
            <button
              onClick={() =>
                setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')
              }
              className="relative inline-flex h-8 w-14 items-center rounded-full bg-muted"
            >
              <motion.div
                className="inline-block h-6 w-6 transform rounded-full bg-primary"
                animate={{
                  x: billingPeriod === 'yearly' ? 28 : 2,
                }}
              />
            </button>
            <span
              className={`text-sm font-medium transition-colors ${
                billingPeriod === 'yearly'
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs bg-success/20 text-success px-2 py-1 rounded-full">
                Save 20%
              </span>
            </span>
          </div>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-2xl overflow-hidden transition-all ${
                plan.highlighted ? 'md:scale-105 md:shadow-2xl' : ''
              }`}
            >
              {/* Background */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${plan.color} opacity-50`}
              />
              <div className="absolute inset-0 border border-border/50" />

              {/* Content */}
              <div className="relative z-10 p-8">
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Most Popular
                    </div>
                  </div>
                )}

                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {plan.name}
                </h3>
                <p className="text-muted-foreground text-sm mb-6">
                  {plan.description}
                </p>

                {/* Price */}
                <div className="mb-8">
                  <span className="text-4xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-muted-foreground ml-1">
                      {billingPeriod === 'yearly' ? plan.period.replace('/month', '/month (billed yearly)') : plan.period}
                    </span>
                  )}
                </div>

                {/* Button */}
                <button
                  onClick={() => handleUpgrade(plan.name)}
                  disabled={currentPlan === plan.name.toLowerCase()}
                  className={`w-full py-3 rounded-lg font-semibold transition-all mb-8 ${
                    plan.highlighted
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'bg-background/50 text-foreground border border-border hover:bg-background'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {currentPlan === plan.name.toLowerCase()
                    ? 'Current Plan'
                    : 'Get Started'}
                </button>

                {/* Features */}
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-foreground mb-4">
                    What's included:
                  </p>
                  {plan.features.map((feature, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3"
                    >
                      <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground/80">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Limits */}
                <div className="mt-8 pt-8 border-t border-border/50 space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">
                    Limits
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-foreground/70">Queries/month:</span>
                      <span className="font-semibold">
                        {plan.limits.queriesPerMonth === Infinity
                          ? 'Unlimited'
                          : plan.limits.queriesPerMonth}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/70">Source access:</span>
                      <span className="font-semibold">
                        {plan.limits.sourceAccess === Infinity
                          ? 'All'
                          : `${plan.limits.sourceAccess}`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {[
              {
                q: 'Can I change my plan anytime?',
                a: 'Yes, you can upgrade or downgrade your plan at any time. Changes will take effect at your next billing cycle.',
              },
              {
                q: 'Is there a free trial?',
                a: 'Yes, all users start with the Basic plan free forever. Upgrade whenever you need more features.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards via Stripe. For Enterprise plans, contact our sales team for custom payment options.',
              },
              {
                q: 'Do you offer refunds?',
                a: 'We offer a 30-day money-back guarantee on paid plans if you\'re not satisfied.',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-6"
              >
                <h3 className="font-semibold text-foreground mb-2">
                  {item.q}
                </h3>
                <p className="text-muted-foreground text-sm">{item.a}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-16 text-center"
        >
          <p className="text-muted-foreground mb-4">
            Still have questions?
          </p>
          <button className="text-primary font-semibold hover:underline">
            Contact our sales team →
          </button>
        </motion.div>
      </div>
    </div>
  );
}
