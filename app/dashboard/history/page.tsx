'use client'

import { Suspense, useEffect, useState, useCallback, type MouseEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import {
  Bot,
  Search,
  Download,
  Clock,
  FileText,
  Link as LinkIcon,
  Image as ImageIcon,
  Trash2,
  Trash,
  ArrowLeft,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useVerificationStore, type InputType, type Report } from '@/lib/stores/verification-store'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useUIStore } from '@/lib/stores/ui-store'
import { TruthRing } from '@/components/veritai/TruthRing'
import { ClaimCard } from '@/components/veritai/ClaimCard'

function ReportDetailView({
  reportId,
  onBack,
}: {
  reportId: string
  onBack: () => void
}) {
  const [report, setReport] = useState<Report | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const token = localStorage.getItem('veritai-token')
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/history/${reportId}`,
          { headers: { Authorization: `Bearer ${token ?? ''}` } }
        )

        if (!res.ok) throw new Error('Report not found')
        const data = await res.json()

        const mapped: Report = {
          id: data.id,
          title: data.title,
          inputType: data.input_type ?? data.inputType,
          inputPreview: data.input_preview ?? data.inputPreview,
          timestamp: data.timestamp,
          score: data.score,
          stats: data.stats,
          takeaways: data.takeaways ?? [],
          hasConflict: data.has_conflict ?? data.hasConflict ?? false,
          claims: (data.claims ?? []).map((claim: {
            id: string
            text: string
            verdict: Report['claims'][number]['verdict']
            confidence: number
            reasoning: string
            sources: { domain: string; url: string; tier: 1 | 2 | 3; title?: string }[]
            is_temporal?: boolean
            isTemporal?: boolean
            has_conflict?: boolean
            hasConflict?: boolean
          }) => ({
            id: claim.id,
            text: claim.text,
            verdict: claim.verdict,
            confidence: claim.confidence,
            reasoning: claim.reasoning,
            sources: claim.sources ?? [],
            isTemporal: claim.is_temporal ?? claim.isTemporal ?? false,
            hasConflict: claim.has_conflict ?? claim.hasConflict ?? false,
          })),
        }

        setReport(mapped)
      } catch {
        setError('Could not load report.')
      } finally {
        setIsLoading(false)
      }
    }

    void fetchReport()
  }, [reportId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-orange/30 border-t-orange animate-spin" />
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="text-center py-16">
        <p className="text-red-v mb-4">{error || 'Report not found.'}</p>
        <button onClick={onBack} className="btn-ghost px-4 py-2 rounded-lg text-sm">
          &larr; Back to History
        </button>
      </div>
    )
  }

  const inputIcon: Record<InputType, typeof FileText> = {
    'ai-detect': Bot,
    text: FileText,
    url: LinkIcon,
    image: ImageIcon,
  }
  const Icon = inputIcon[report.inputType] ?? FileText

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-v hover:text-text transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back to History</span>
      </button>

      <div className="mb-6">
        <p className="font-mono text-xs text-cyan mb-2">
          Research Analysis &#8212; ID {report.id}
        </p>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-text mb-1">
          {report.title}
        </h1>
        <div className="flex items-center gap-3 mt-3">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border-v">
            <Icon className="w-4 h-4 text-muted-v" />
            <span className="text-xs font-medium text-text uppercase">{report.inputType}</span>
          </span>
          <span className="font-mono text-xs text-muted-v">
            {new Date(report.timestamp).toLocaleString()}
          </span>
        </div>
      </div>

      <div className="bg-card-v rounded-2xl border border-border-v p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex flex-col items-center lg:items-start">
            <TruthRing score={report.score} size={140} />
            <div className="flex flex-wrap justify-center lg:justify-start gap-3 mt-4">
              <span className="text-green-v text-sm font-medium">{report.stats.true} TRUE</span>
              <span className="text-red-v text-sm font-medium">{report.stats.false} FALSE</span>
              <span className="text-amber text-sm font-medium">{report.stats.partial} PARTIAL</span>
              {report.stats.unverifiable > 0 && (
                <span className="text-muted-v text-sm font-medium">
                  {report.stats.unverifiable} UNVERIFIABLE
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 space-y-4">
            {report.hasConflict && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber/10 border border-amber/20">
                <AlertTriangle className="w-5 h-5 text-amber shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber">Conflicting Evidence Detected</p>
                  <p className="text-xs text-muted-v mt-0.5">
                    Some claims have sources with contradictory information.
                  </p>
                </div>
              </div>
            )}
            {report.takeaways.length > 0 && (
              <div className="p-4 rounded-xl bg-surface">
                <p className="text-sm font-semibold text-text mb-2">Key Takeaways</p>
                <ul className="space-y-1">
                  {report.takeaways.slice(0, 3).map((takeaway, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-v">
                      <span className="text-cyan shrink-0">&bull;</span>
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      <h2 className="font-display text-xl font-bold text-text mb-4">
        Analyzed Claims ({report.claims.length})
      </h2>
      <div className="space-y-3">
        {report.claims.map((claim, index) => (
          <ClaimCard
            key={claim.id}
            claim={claim}
            index={index}
            defaultExpanded={index === 0}
          />
        ))}
      </div>
    </motion.div>
  )
}

function HistoryContent() {
  const searchParams = useSearchParams()
  const queryFromUrl = searchParams.get('q') ?? ''
  const [searchQuery, setSearchQuery] = useState(queryFromUrl)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'accuracy_high' | 'accuracy_low'>('newest')
  const [filterType, setFilterType] = useState<'all' | 'text' | 'url' | 'image' | 'ai-detect' | 'fact-check'>('all')
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeletingAll, setIsDeletingAll] = useState(false)
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false)

  const { history, removeFromHistory, clearHistory } = useVerificationStore()
  const { addToast } = useUIStore()
  const [isLoading, setIsLoading] = useState(true)
  const [backendHistory, setBackendHistory] = useState<typeof history>([])

  useEffect(() => {
    setSearchQuery(queryFromUrl)
  }, [queryFromUrl])

  const fetchHistory = useCallback(async () => {
    try {
      const token = localStorage.getItem('veritai-token')
      const { isAuthenticated } = useAuthStore.getState()
      if (!token || !isAuthenticated) {
        setIsLoading(false)
        return
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/history`,
        { headers: { Authorization: `Bearer ${token}` } }
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
          analysisType: item.input_type === 'ai-detect' ? 'ai-detect' as const : 'fact-check' as const,
        }))
        setBackendHistory(mapped)
      }
    } catch {
      // Fall back to local history if the backend is unavailable.
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchHistory()
  }, [fetchHistory])

  const mergedHistory = [
    ...backendHistory,
    ...history.filter(
      (local) => !backendHistory.some((b) => b.id === local.id)
    ),
  ]

  const sortedFilteredHistory = mergedHistory
    .filter((item) => {
      if (filterType === 'all') return true
      if (filterType === 'fact-check') {
        return item.analysisType === 'fact-check' ||
          (!item.analysisType && item.inputType !== 'ai-detect')
      }
      if (filterType === 'ai-detect') {
        return item.analysisType === 'ai-detect' ||
          item.inputType === 'ai-detect'
      }
      return item.inputType === filterType
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        case 'oldest':
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        case 'accuracy_high':
          return (b.accuracy ?? -1) - (a.accuracy ?? -1)
        case 'accuracy_low': {
          const aAcc = a.accuracy < 0 ? 999 : a.accuracy
          const bAcc = b.accuracy < 0 ? 999 : b.accuracy
          return aAcc - bAcc
        }
        default:
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      }
    })

  const filteredHistory = sortedFilteredHistory.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.inputPreview.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDeleteOne = async (id: string, e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    setDeletingId(id)

    try {
      const token = localStorage.getItem('veritai-token')
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/history/${id}`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${token ?? ''}` } }
      )

      if (res.ok || res.status === 404) {
        setBackendHistory((prev) => prev.filter((item) => item.id !== id))
        removeFromHistory(id)
        if (selectedReportId === id) {
          setSelectedReportId(null)
        }
        addToast({ title: 'Report deleted', type: 'success' })
      } else {
        throw new Error('Delete failed')
      }
    } catch {
      addToast({ title: 'Delete failed', description: 'Please try again.', type: 'error' })
    } finally {
      setDeletingId(null)
    }
  }

  const handleDeleteAll = async () => {
    setIsDeletingAll(true)

    try {
      const token = localStorage.getItem('veritai-token')
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/history`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${token ?? ''}` } }
      )

      if (res.ok) {
        setBackendHistory([])
        clearHistory()
        setSelectedReportId(null)
        addToast({ title: 'All history cleared', type: 'success' })
      } else {
        throw new Error('Delete failed')
      }
    } catch {
      addToast({ title: 'Delete failed', description: 'Please try again.', type: 'error' })
    } finally {
      setIsDeletingAll(false)
      setShowDeleteAllConfirm(false)
    }
  }

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
    if (type === 'ai-detect') return <Bot className="w-5 h-5 text-muted-v" />
    return <FileText className="w-5 h-5 text-muted-v" />
  }

  if (selectedReportId) {
    return (
      <ReportDetailView
        reportId={selectedReportId}
        onBack={() => setSelectedReportId(null)}
      />
    )
  }

  return (
    <div className="max-w-6xl mx-auto py-2">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display text-4xl font-bold text-text mb-2">Verification History</h1>
        <p className="text-muted-v">Track and manage all your fact-checked reports</p>
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
              className="w-full pl-10 pr-4 py-3 bg-surface border border-border-v rounded-xl
                text-text placeholder:text-muted-v focus:outline-none
                focus:ring-2 focus:ring-primary-glow/30"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-2 rounded-xl bg-surface border border-border-v text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary-glow/30 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="accuracy_high">Highest Accuracy</option>
              <option value="accuracy_low">Lowest Accuracy</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as typeof filterType)}
              className="px-3 py-2 rounded-xl bg-surface border border-border-v text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary-glow/30 cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="fact-check">Fact Check</option>
              <option value="ai-detect">AI Detect</option>
              <option value="text">Text</option>
              <option value="url">URL</option>
              <option value="image">Image</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportAll}
              disabled={sortedFilteredHistory.length === 0}
              className="px-4 py-3 rounded-xl btn-ghost disabled:opacity-50
                disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            {sortedFilteredHistory.length > 0 && (
              <button
                onClick={() => setShowDeleteAllConfirm(true)}
                className="px-4 py-3 rounded-xl text-red-v hover:bg-red-v/10
                  transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <Trash className="w-4 h-4" />
                Clear All
              </button>
            )}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showDeleteAllConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-bg/80 backdrop-blur-sm z-50
              flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card-v border border-border-v rounded-2xl p-6
                max-w-sm w-full shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-v/10 flex items-center justify-center">
                  <Trash className="w-5 h-5 text-red-v" />
                </div>
                <div>
                  <h3 className="font-semibold text-text">Clear All History?</h3>
                  <p className="text-sm text-muted-v">
                    This will permanently delete all {sortedFilteredHistory.length} reports.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteAllConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl btn-ghost text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAll}
                  disabled={isDeletingAll}
                  className="flex-1 py-2.5 rounded-xl bg-red-v/90 hover:bg-red-v
                    text-bg text-sm font-semibold transition-colors
                    disabled:opacity-50"
                >
                  {isDeletingAll ? 'Deleting...' : 'Delete All'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="h-44 rounded-2xl bg-card-v border border-border-v animate-pulse" />
          ))}
        </div>
      ) : filteredHistory.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 rounded-2xl bg-card-v border border-border-v"
        >
          <p className="text-muted-v">
            {sortedFilteredHistory.length === 0
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
              onClick={() => setSelectedReportId(item.id)}
              className="p-5 rounded-2xl bg-card-v border border-border-v
                hover:bg-card-high transition-colors cursor-pointer group relative"
            >
              <button
                onClick={(e) => void handleDeleteOne(item.id, e)}
                disabled={deletingId === item.id}
                className="absolute top-3 right-3 p-1.5 rounded-lg opacity-0
                  group-hover:opacity-100 hover:bg-red-v/10 text-muted-v
                  hover:text-red-v transition-all disabled:opacity-50"
                title="Delete report"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-surface flex items-center justify-center shrink-0">
                  {renderIcon(item.inputType)}
                </div>
                <div className="min-w-0 flex-1 pr-6">
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
                <span className="text-xs uppercase tracking-wider text-muted-v">
                  {item.inputType}
                </span>
                {item.analysisType === 'ai-detect' || item.inputType === 'ai-detect' ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan/20 text-cyan">
                    AI Detect
                  </span>
                ) : (
                  <span className={cn(
                    'px-2.5 py-1 rounded-full text-xs font-semibold',
                    item.accuracy < 0 && 'bg-muted-v/20 text-muted-v',
                    item.accuracy >= 80 && 'bg-green-v/20 text-green-v',
                    item.accuracy >= 50 && item.accuracy < 80 && 'bg-amber/20 text-amber',
                    item.accuracy >= 0 && item.accuracy < 50 && 'bg-red-v/20 text-red-v',
                  )}>
                    {item.accuracy < 0 ? 'N/A' : `${item.accuracy}% accuracy`}
                  </span>
                )}
              </div>

              <div className="mt-3 flex items-center gap-1 text-xs text-muted-v
                opacity-0 group-hover:opacity-100 transition-opacity">
                <ExternalLink className="w-3 h-3" />
                <span>Click to view full report</span>
              </div>
            </motion.div>
          ))}
        </div>
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
                  const valid = mergedHistory.filter((item) => item.accuracy >= 0)
                  if (!valid.length) return 'N/A'
                  return `${Math.round(valid.reduce((sum, item) => sum + item.accuracy, 0) / valid.length)}%`
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

export default function HistoryPage() {
  return (
    <Suspense fallback={
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="h-44 rounded-2xl bg-card-v border border-border-v animate-pulse" />
        ))}
      </div>
    }>
      <HistoryContent />
    </Suspense>
  )
}
