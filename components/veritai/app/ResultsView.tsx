'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Bot,
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
    'ai-detect': Bot,
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

      // Clone the element to avoid hydration mismatch issues
      // caused by browser extensions modifying the DOM
      const clone = reportEl.cloneNode(true) as HTMLElement
      clone.style.position = 'fixed'
      clone.style.top = '0'
      clone.style.left = '0'
      clone.style.width = reportEl.scrollWidth + 'px'
      clone.style.zIndex = '-9999'
      clone.style.pointerEvents = 'none'
      document.body.appendChild(clone)

      let canvas: HTMLCanvasElement
      try {
        canvas = await html2canvas(clone, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#0A0F1E',
          logging: false,
          width: reportEl.scrollWidth,
          height: reportEl.scrollHeight,
        })
      } finally {
        document.body.removeChild(clone)
      }

      // Use mm units - standard and reliable across all jsPDF versions
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const PAGE_W = 210
      const PAGE_H = 297
      const MARGIN = 10
      const HEADER_H = 18
      const FOOTER_H = 8
      const CONTENT_W = PAGE_W - MARGIN * 2
      const CONTENT_H = PAGE_H - MARGIN * 2 - HEADER_H - FOOTER_H

      // Convert canvas pixels to mm at 96dpi
      // canvas is at scale:2 so effective dpi = 192
      const PX_TO_MM = 25.4 / 192
      const imgHeightMm = canvas.height * PX_TO_MM
      const imgWidthMm = canvas.width * PX_TO_MM

      // Scale image to fit content width
      const scale = CONTENT_W / imgWidthMm
      const scaledH = imgHeightMm * scale
      const scaledW = CONTENT_W

      // Split into pages
      const totalPages = Math.ceil(scaledH / CONTENT_H)

      for (let page = 0; page < totalPages; page++) {
        if (page > 0) pdf.addPage()

        // Header
        pdf.setFillColor(10, 15, 30)
        pdf.rect(0, 0, PAGE_W, MARGIN + HEADER_H, 'F')
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(13)
        pdf.setTextColor(255, 107, 43)
        pdf.text('VeritAI - Fact Check Report', MARGIN, MARGIN + 8)
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(7)
        pdf.setTextColor(136, 146, 164)
        pdf.text(
          `ID: ${report!.id}  |  ${new Date().toLocaleString()}  |  Page ${page + 1}/${totalPages}`,
          MARGIN,
          MARGIN + 14
        )

        // Clip and draw the relevant slice of the image for this page
        const srcY = page * CONTENT_H
        const sliceH = Math.min(CONTENT_H, scaledH - srcY)

        // sourceY in original canvas pixels
        const canvasSrcY = (srcY / scale) / PX_TO_MM
        const canvasSliceH = (sliceH / scale) / PX_TO_MM

        // Create a temporary canvas for just this slice
        const sliceCanvas = document.createElement('canvas')
        sliceCanvas.width = canvas.width
        sliceCanvas.height = Math.round(canvasSliceH)
        const ctx = sliceCanvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(
            canvas,
            0, Math.round(canvasSrcY),
            canvas.width, Math.round(canvasSliceH),
            0, 0,
            canvas.width, Math.round(canvasSliceH)
          )
        }
        const sliceData = sliceCanvas.toDataURL('image/png')

        pdf.addImage(
          sliceData,
          'PNG',
          MARGIN,
          MARGIN + HEADER_H,
          scaledW,
          sliceH
        )

        // Footer
        pdf.setFillColor(10, 15, 30)
        pdf.rect(0, PAGE_H - MARGIN - FOOTER_H, PAGE_W, MARGIN + FOOTER_H, 'F')
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(7)
        pdf.setTextColor(136, 146, 164)
        pdf.text(
          'veritai.io - Evidence-backed truth, powered by AI',
          MARGIN,
          PAGE_H - MARGIN - 2
        )
      }

      pdf.save(`veritai-report-${report!.id}.pdf`)

      addToast({
        title: 'PDF exported!',
        description: `Saved as veritai-report-${report!.id}.pdf`,
        type: 'success',
      })
    } catch (e) {
      console.error('PDF export error:', e)
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
              Research Analysis &#8212; ID {report.id}
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
                {report.takeaways.slice(0, 3).map((takeaway, index) => (
                  <li key={index} className="text-sm text-muted-v flex items-start gap-2">
                    <span className="text-cyan shrink-0">&bull;</span>
                    <span className="text-sm text-muted-v leading-relaxed">{takeaway}</span>
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
              <span className="text-cyan shrink-0 mt-1">&bull;</span>
              <span className="text-sm text-muted-v leading-relaxed">{takeaway}</span>
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
