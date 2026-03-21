'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { ScrollReveal } from '@/components/veritai/ScrollReveal'

const faqs = [
  {
    question: 'What inputs does VeritAI accept?',
    answer: 'VeritAI accepts three types of input: plain text (articles, paragraphs, essays), URLs (we scrape and extract content automatically), and images (we use vision AI to extract text and claims). All inputs are processed through our multi-agent pipeline for thorough verification.',
  },
  {
    question: 'How does the multi-query search work?',
    answer: 'For each claim extracted from your input, we perform 3 parallel search queries using Tavily AI to gather diverse evidence. Sources are automatically scored into Tier 1 (highly authoritative), Tier 2 (reliable), and Tier 3 (general) categories. This ensures comprehensive evidence gathering from multiple perspectives.',
  },
  {
    question: 'How is the confidence score calculated?',
    answer: 'Confidence scores are calculated based on multiple factors: the number and quality of sources found, the consistency of evidence across sources, the authority tier of supporting sources, and the clarity of the claim itself. Our self-reflection agent then validates the initial assessment for accuracy.',
  },
  {
    question: "What's the difference between Free and Pro?",
    answer: 'Free accounts get 5 verifications per day with text input only and basic reports. Pro accounts ($19/month) include 50 verifications daily, support for URL and image inputs, full detailed reports with PDF export, and priority processing speed. Pro is perfect for researchers, journalists, and fact-checkers.',
  },
  {
    question: 'Is my data stored?',
    answer: 'We store your verification history so you can access past reports. All data is encrypted at rest and in transit. We never share your data with third parties. You can delete your history at any time from your dashboard settings. Enterprise customers can request custom data retention policies.',
  },
  {
    question: 'How accurate is the AI verification?',
    answer: 'Our verification pipeline achieves 98% accuracy on benchmark datasets. This is achieved through our multi-agent architecture: claim extraction, multi-query evidence search, separated judge agent, and self-reflection verification. However, we always recommend human review for critical decisions.',
  },
]

interface FAQItemProps {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
  index: number
}

function FAQItem({ question, answer, isOpen, onToggle, index }: FAQItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="border-b border-border-v"
    >
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full py-6 text-left cursor-pointer group"
      >
        <span className="text-lg font-medium text-text group-hover:text-orange transition-colors pr-8">
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="shrink-0"
        >
          <ChevronDown className="w-5 h-5 text-muted-v" />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-muted-v leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  
  return (
    <section id="faq" className="py-24 relative">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <ScrollReveal className="text-center mb-12">
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-text">
            Frequently Asked Questions
          </h2>
        </ScrollReveal>
        
        {/* FAQ items */}
        <ScrollReveal delay={0.2} className="divide-y divide-border-v border-t border-border-v">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
              index={index}
            />
          ))}
        </ScrollReveal>
      </div>
    </section>
  )
}
