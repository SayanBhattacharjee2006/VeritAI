'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { 
  FileText, 
  Link as LinkIcon, 
  Image, 
  Share2, 
  Download,
  AlertTriangle,
  Lightbulb,
  ArrowLeft
} from 'lucide-react'
import { useVerificationStore, type Verdict } from '@/lib/stores/verification-store'
import { useUIStore } from '@/lib/stores/ui-store'
import { TruthRing } from '../TruthRing'
import { ClaimCard } from '../ClaimCard'

type FilterType = 'all' | 'priority' | Verdict

export function ResultsView() {
  const { report, reset } = useVerificationStore()
  const { addToast } = useUIStore()
  const [filter, setFilter] = useState<FilterType>('priority')
  
  if (!report) return null
  
  const inputIcon = {
    text: FileText,
    url: LinkIcon,
    image: Image,
  }
  
  const Icon = inputIcon[report.inputType]
  
  // Sort claims: FALSE first, then PARTIAL, then TRUE, then UNVERIFIABLE
  const sortedClaims = [...report.claims].sort((a, b) => {
    const order: Record<Verdict, number> = { false: 0, partial: 1, true: 2, unverifiable: 3 }
    return order[a.verdict] - order[b.verdict]
  })
  
  const filteredClaims = filter === 'all' || filter === 'priority'
    ? sortedClaims
    : sortedClaims.filter(claim => claim.verdict === filter)
  
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    addToast({
      title: 'Link copied!',
      description: 'Share this report with others.',
      type: 'success',
    })
  }
  
  const handleExport = async () => {
    addToast({
      title: 'Generating PDF...',
      description: 'Please wait a moment.',
      type: 'info',
    })

    try {
      const { default: jsPDF } = await import('jspdf')
      const { default: html2canvas } = await import('html2canvas')

      const reportEl = document.getElementById('veritai-report')
      if (!reportEl) {
        addToast({
          title: 'Export failed',
          description: 'Report element not found.',
          type: 'error',
        })
        return
      }

      const canvas = await html2canvas(reportEl, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0A0F1E',
        logging: false,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4',
      })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width

      // Add header
      pdf.setFillColor(10, 15, 30)
      pdf.rect(0, 0, pdfWidth, 40, 'F')
      pdf.setTextColor(255, 107, 43)
      pdf.setFontSize(18)
      pdf.text('VeritAI — Fact Check Report', 20, 26)
      pdf.setFontSize(10)
      pdf.setTextColor(136, 146, 164)
      pdf.text(
        `Generated: ${new Date().toLocaleString()}  |  ID: ${report!.id}`,
        20,
        38
      )

      // Add report content
      pdf.addImage(imgData, 'PNG', 0, 50, pdfWidth, pdfHeight)

      // Add footer
      pdf.setFontSize(9)
      pdf.setTextColor(136, 146, 164)
      pdf.text(
        'veritai.io — Evidence-backed truth, powered by AI',
        20,
        pdf.internal.pageSize.getHeight() - 10
      )

      pdf.save(`veritai-report-${report!.id}.pdf`)

      addToast({
        title: 'PDF exported!',
        description: `Saved as veritai-report-${report!.id}.pdf`,
        type: 'success',
      })
    } catch (e) {
      addToast({
        title: 'Export failed',
        description: 'Could not generate PDF. Please try again.',
        type: 'error',
      })
    }
  }
  
  return (
    <div id="veritai-report" className="max-w-4xl mx-auto">
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={reset}
        className="flex items-center gap-2 text-muted-v hover:text-text transition-colors mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">New verification</span>
      </motion.button>
      
      {/* Report header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
          <div>
            <p className="font-mono text-xs text-cyan mb-2">
              Research Analysis — ID {report.id}
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-text">
              {report.title}
            </h1>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-lg btn-ghost text-sm"
            >
              <Share2 className="w-4 h-4" />
              Share
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 rounded-lg btn-primary text-sm"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </motion.button>
          </div>
        </div>
        
        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border-v">
            <Icon className="w-4 h-4 text-muted-v" />
            <span className="text-xs font-medium text-text uppercase">
              {report.inputType}
            </span>
          </span>
          <span className="font-mono text-xs text-muted-v">
            {new Date(report.timestamp).toLocaleString()}
          </span>
        </div>
      </motion.div>
      
      {/* Summary card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card-v rounded-2xl border border-border-v p-6 mb-8"
      >
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Truth ring and stats */}
          <div className="flex flex-col items-center lg:items-start">
            <TruthRing score={report.score} size={140} />
            <div className="flex flex-wrap justify-center lg:justify-start gap-3 mt-4">
              <span className="text-green-v text-sm font-medium">
                {report.stats.true} TRUE
              </span>
              <span className="text-red-v text-sm font-medium">
                {report.stats.false} FALSE
              </span>
              <span className="text-amber text-sm font-medium">
                {report.stats.partial} PARTIAL
              </span>
              {report.stats.unverifiable > 0 && (
                <span className="text-muted-v text-sm font-medium">
                  {report.stats.unverifiable} UNVERIFIABLE
                </span>
              )}
            </div>
          </div>
          
          {/* Right: Warnings and takeaways preview */}
          <div className="flex-1 space-y-4">
            {/* Conflict warning */}
            {report.hasConflict && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber/10 border border-amber/20">
                <AlertTriangle className="w-5 h-5 text-amber shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber">
                    Conflicting Evidence Detected
                  </p>
                  <p className="text-xs text-muted-v mt-1">
                    Some claims have sources with contradictory information. Review carefully.
                  </p>
                </div>
              </div>
            )}
            
            {/* Key takeaways preview */}
            <div className="p-4 rounded-xl bg-surface">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-amber" />
                <span className="text-sm font-semibold text-text">Key Takeaways</span>
              </div>
              <ul className="space-y-1">
                {report.takeaways.slice(0, 2).map((takeaway, index) => (
                  <li key={index} className="text-sm text-muted-v flex items-start gap-2">
                    <span className="text-cyan shrink-0">•</span>
                    <span className="line-clamp-1">{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Claims section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* Section header with filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-lg font-semibold text-text">
            Analyzed Claims ({report.claims.length})
          </h2>
          
          <div className="flex flex-wrap gap-2">
            {(['priority', 'all', 'true', 'false', 'partial'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer',
                  filter === f
                    ? 'bg-card-high text-text'
                    : 'bg-surface text-muted-v hover:text-text'
                )}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        {/* Claims list */}
        <div className="space-y-4">
          {filteredClaims.map((claim, index) => (
            <ClaimCard 
              key={claim.id} 
              claim={claim} 
              index={index}
              defaultExpanded={index === 0}
            />
          ))}
        </div>
      </motion.div>
      
      {/* Full takeaways section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 p-6 rounded-2xl bg-amber/5 border border-amber/20"
      >
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-amber" />
          <h3 className="text-lg font-semibold text-text">Key Takeaways</h3>
        </div>
        <ul className="space-y-3">
          {report.takeaways.map((takeaway, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="text-cyan shrink-0 mt-1">•</span>
              <span className="text-muted-v leading-relaxed">{takeaway}</span>
            </li>
          ))}
        </ul>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleExport}
          className="mt-6 w-full sm:w-auto px-6 py-3 rounded-xl btn-ghost font-semibold flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5" />
          Export Full Report as PDF
        </motion.button>
      </motion.div>
    </div>
  )
}
