import { create } from 'zustand'
import { useAuthStore } from '@/lib/stores/auth-store'

export type VerificationState = 'idle' | 'processing' | 'results'
export type InputType = 'text' | 'url' | 'image'
export type Verdict = 'true' | 'false' | 'partial' | 'unverifiable'
export type StepStatus = 'done' | 'active' | 'pending'

export interface ProcessingStep {
  id: string
  label: string
  status: StepStatus
  subLabel?: string
}

export interface TerminalLine {
  timestamp: string
  text: string
  type: 'info' | 'success' | 'warning' | 'error' | 'claim' | 'verdict'
}

export interface Source {
  domain: string
  url: string
  tier: 1 | 2 | 3
  title?: string
}

export interface Claim {
  id: string
  text: string
  verdict: Verdict
  confidence: number
  reasoning: string
  sources: Source[]
  isTemporal: boolean
  hasConflict: boolean
}

export interface Report {
  id: string
  title: string
  inputType: InputType
  inputPreview: string
  timestamp: string
  score: number
  stats: {
    true: number
    false: number
    partial: number
    unverifiable: number
  }
  claims: Claim[]
  takeaways: string[]
  hasConflict: boolean
}

export interface HistoryItem {
  id: string
  title: string
  inputType: InputType
  inputPreview: string
  timestamp: string
  claimCount: number
  accuracy: number
}

interface VerificationStore {
  state: VerificationState
  currentInput: { type: InputType; content: string } | null
  processingSteps: ProcessingStep[]
  terminalLines: TerminalLine[]
  report: Report | null
  history: HistoryItem[]

  startVerification: (input: { type: InputType; content: string }) => void
  updateStep: (stepId: string, updates: Partial<ProcessingStep>) => void
  addTerminalLine: (line: Omit<TerminalLine, 'timestamp'>) => void
  setReport: (report: Report) => void
  reset: () => void
  setState: (state: VerificationState) => void
  addToHistory: (item: HistoryItem) => void
}

const initialSteps: ProcessingStep[] = [
  { id: 'extract', label: 'Extracting Claims', status: 'pending' },
  { id: 'refine', label: 'Refining', status: 'pending' },
  { id: 'search', label: 'Searching Evidence', status: 'pending' },
  { id: 'verify', label: 'Verifying', status: 'pending' },
  { id: 'report', label: 'Building Report', status: 'pending' },
]

export const useVerificationStore = create<VerificationStore>((set, get) => ({
  state: 'idle',
  currentInput: null,
  processingSteps: initialSteps,
  terminalLines: [],
  report: null,
  history: [],

  startVerification: (input) => {
    set({
      state: 'processing',
      currentInput: input,
      processingSteps: initialSteps.map((step, index) => ({
        ...step,
        status: index === 0 ? 'active' : 'pending',
      })),
      terminalLines: [],
      report: null,
    })

    void (async () => {
      const { updateStep, addTerminalLine, setReport, addToHistory, setState } = get()
      let reportCompleted = false

      try {
        const token = localStorage.getItem('veritai-token')
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token ?? ''}`,
          },
          body: JSON.stringify({ type: input.type, content: input.content }),
        })

        if (!response.ok || !response.body) {
          let message = 'Failed to start verification.'

          try {
            const data = await response.json()
            if (typeof data?.detail === 'string') {
              message = data.detail
            }
          } catch {
            if (!response.ok) {
              message = `Verification request failed with status ${response.status}`
            }
          }

          addTerminalLine({ text: `Error: ${message}`, type: 'error' })
          await new Promise(resolve => setTimeout(resolve, 500))
          setState('idle')
          return
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            if (!line.startsWith('data: ')) {
              continue
            }

            try {
              const event = JSON.parse(line.slice(6))
              const eventType = event.event ?? event.type

              if (eventType === 'step_update') {
                updateStep(event.stepId, {
                  status: event.status,
                  subLabel: event.subLabel,
                })
              }

              if (eventType === 'terminal_line') {
                addTerminalLine({
                  text: event.text,
                  type: event.type,
                })
              }

              if (eventType === 'report_complete') {
                const rawReport = event.report
                const report: Report = {
                  id: rawReport.id,
                  title: rawReport.title,
                  inputType: rawReport.input_type ?? rawReport.inputType,
                  inputPreview: rawReport.input_preview ?? rawReport.inputPreview,
                  timestamp: rawReport.timestamp,
                  score: rawReport.score,
                  stats: rawReport.stats,
                  claims: (rawReport.claims ?? []).map((claim: {
                    id: string
                    text: string
                    verdict: Verdict
                    confidence: number
                    reasoning: string
                    sources: Source[]
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
                    sources: claim.sources,
                    isTemporal: claim.is_temporal ?? claim.isTemporal ?? false,
                    hasConflict: claim.has_conflict ?? claim.hasConflict ?? false,
                  })),
                  takeaways: rawReport.takeaways ?? [],
                  hasConflict: rawReport.has_conflict ?? rawReport.hasConflict ?? false,
                }

                setReport(report)
                addToHistory({
                  id: report.id,
                  title: report.title,
                  inputType: report.inputType,
                  inputPreview: report.inputPreview,
                  timestamp: report.timestamp,
                  claimCount: report.claims.length,
                  accuracy: report.score,
                })

                // Increment daily check counter
                const { incrementChecks } = useAuthStore.getState()
                incrementChecks()

                reportCompleted = true
              }

              if (eventType === 'error') {
                addTerminalLine({
                  text: `Error: ${event.message}`,
                  type: 'error',
                })
                await new Promise(resolve => setTimeout(resolve, 500))
                setState('idle')
              }
            } catch {
              // Ignore malformed SSE payloads and continue reading the stream.
            }
          }
        }

        if (!reportCompleted) {
          await new Promise(resolve => setTimeout(resolve, 500))
          setState('idle')
        }
      } catch (error) {
        addTerminalLine({
          text: `Error: ${error instanceof Error ? error.message : 'Verification failed.'}`,
          type: 'error',
        })
        await new Promise(resolve => setTimeout(resolve, 500))
        setState('idle')
      }
    })()
  },

  updateStep: (stepId, updates) => set((state) => ({
    processingSteps: state.processingSteps.map((step) =>
      step.id === stepId ? { ...step, ...updates } : step
    ),
  })),

  addTerminalLine: (line) => {
    const timestamp = new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    set((state) => ({
      terminalLines: [...state.terminalLines, { ...line, timestamp }],
    }))
  },

  setReport: (report) => set({ report, state: 'results' }),

  reset: () => set({
    state: 'idle',
    currentInput: null,
    processingSteps: initialSteps,
    terminalLines: [],
    report: null,
  }),

  setState: (state) => set({ state }),

  addToHistory: (item) => set((state) => ({
    history: [item, ...state.history].slice(0, 50),
  })),
}))
