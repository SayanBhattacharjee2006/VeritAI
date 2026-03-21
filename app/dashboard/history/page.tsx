'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Download, Clock, FileText, Link as LinkIcon, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useVerificationStore, type InputType } from '@/lib/stores/verification-store'
import { useAuthStore } from '@/lib/stores/auth-store'

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const { history } = useVerificationStore()
  const [isLoading, setIsLoading] = useState(true)
  const [backendHistory, setBackendHistory] = useState<typeof history>([])

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('veritai-token')
        const { isAuthenticated } = useAuthStore.getState()
        if (!token || !isAuthenticated) {
          setIsLoading(false)
          return
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/history`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )

        if (res.ok) {
          const data = await res.json()
          const mapped = (data.items ?? []).map((item: {
            id: string
            title: string
            input_type: string
            input_preview: string
            timestamp: string
            claim_count: number
            accuracy: number
          }) => ({
            id: item.id,
            title: item.title,
            inputType: item.input_type as InputType,
            inputPreview: item.input_preview,
            timestamp: item.timestamp,
            claimCount: item.claim_count,
            accuracy: item.accuracy,
          }))
          setBackendHistory(mapped)
        }
      } catch {
        // Fall back to Zustand store on error
      } finally {
        setIsLoading(false)
      }
    }

    fetchHistory()
  }, [])

  const mergedHistory = [
    ...backendHistory,
    ...history.filter(
      (local) => !backendHistory.some((backendItem) => backendItem.id === local.id)
    ),
  ].sort(
    (a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  const filteredHistory = mergedHistory.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.inputPreview.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleExportAll = () => {
    const csv = [
      ['Title', 'Input Type', 'Claims', 'Accuracy', 'Date'],
      ...mergedHistory.map((item) => [
        item.title,
        item.inputType,
        item.claimCount,
        item.accuracy,
        new Date(item.timestamp).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `veritai-history-${Date.now()}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const renderIcon = (type: InputType) => {
    if (type === 'url') return <LinkIcon className="w-5 h-5 text-muted-v" />
    if (type === 'image') return <ImageIcon className="w-5 h-5 text-muted-v" />
    return <FileText className="w-5 h-5 text-muted-v" />
  }

  return (
    <div className="max-w-6xl mx-auto py-2">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-display text-4xl font-bold text-text mb-2">Verification History</h1>
        <p className="text-muted-v">Track and manage all your fact-checked claims</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card-v border border-border-v rounded-2xl p-4 mb-8"
      >
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-v" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-surface border border-border-v rounded-xl text-text placeholder:text-muted-v focus:outline-none focus:ring-2 focus:ring-primary-glow/30"
            />
          </div>

          <button
            onClick={handleExportAll}
            disabled={mergedHistory.length === 0}
            className="px-4 py-3 rounded-xl btn-ghost disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-44 rounded-2xl bg-card-v border border-border-v animate-pulse"
            />
          ))}
        </div>
      ) : (
        <>
          {filteredHistory.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 rounded-2xl bg-card-v border border-border-v"
            >
              <p className="text-muted-v mb-4">
                {mergedHistory.length === 0
                  ? 'No verifications yet. Start by checking a claim.'
                  : 'No results match your search'}
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredHistory.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-5 rounded-2xl bg-card-v border border-border-v hover:bg-card-high transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-surface flex items-center justify-center shrink-0">
                      {renderIcon(item.inputType)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-lg font-semibold text-text truncate">{item.title}</h2>
                      <p className="text-sm text-muted-v mt-1 line-clamp-2">{item.inputPreview}</p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-v">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                    </div>
                    <span className="text-text font-medium">{item.claimCount} claims</span>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-muted-v">{item.inputType}</span>
                    <span
                      className={cn(
                        'px-2.5 py-1 rounded-full text-xs font-semibold',
                        item.accuracy < 0 && 'bg-muted-v/20 text-muted-v',
                        item.accuracy >= 80 && 'bg-green-v/20 text-green-v',
                        item.accuracy >= 50 && item.accuracy < 80 && 'bg-amber/20 text-amber',
                        item.accuracy >= 0 && item.accuracy < 50 && 'bg-red-v/20 text-red-v'
                      )}
                    >
                      {item.accuracy < 0 ? 'N/A' : `${item.accuracy}% accuracy`}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {mergedHistory.length > 0 && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-12 pt-8 border-t border-border-v"
        >
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-text">{mergedHistory.length}</p>
              <p className="text-sm text-muted-v">Total Reports</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-v">
                {mergedHistory.reduce((sum, item) => sum + item.claimCount, 0)}
              </p>
              <p className="text-sm text-muted-v">Claims Reviewed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange">
                {(() => {
                  const validItems = mergedHistory.filter(item => item.accuracy >= 0)
                  if (validItems.length === 0) return 'N/A'
                  const avg = validItems.reduce((sum, item) => sum + item.accuracy, 0) / validItems.length
                  return `${Math.round(avg)}%`
                })()}
              </p>
              <p className="text-sm text-muted-v">Avg Accuracy</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
