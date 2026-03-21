import { create } from 'zustand'

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
  
  // Actions
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
    
    // Simulate processing pipeline
    simulateProcessing(get, set, input)
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
      second: '2-digit' 
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

// Simulation function for demo purposes
async function simulateProcessing(
  get: () => VerificationStore,
  set: (partial: Partial<VerificationStore> | ((state: VerificationStore) => Partial<VerificationStore>)) => void,
  input: { type: InputType; content: string }
) {
  const { addTerminalLine, updateStep, setReport, addToHistory } = get()
  
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
  
  // Step 1: Extracting Claims
  addTerminalLine({ text: 'Initializing claim extraction pipeline...', type: 'info' })
  await delay(800)
  addTerminalLine({ text: `Processing ${input.type} input...`, type: 'info' })
  await delay(600)
  addTerminalLine({ text: 'Claim: "Global temperatures rose by 1.5°C since pre-industrial times"', type: 'claim' })
  await delay(400)
  addTerminalLine({ text: 'Claim: "Renewable energy now accounts for 30% of global electricity"', type: 'claim' })
  await delay(400)
  addTerminalLine({ text: 'Claim: "The Amazon rainforest produces 20% of Earth\'s oxygen"', type: 'claim' })
  await delay(400)
  addTerminalLine({ text: 'Claim: "Electric vehicles will outsell gas cars by 2025"', type: 'claim' })
  await delay(400)
  addTerminalLine({ text: 'Claim: "Ocean plastic will outweigh fish by 2050"', type: 'claim' })
  await delay(300)
  updateStep('extract', { status: 'done', subLabel: '5 claims found' })
  addTerminalLine({ text: '✓ Extracted 5 verifiable claims', type: 'success' })
  
  // Step 2: Refining
  await delay(500)
  updateStep('refine', { status: 'active' })
  addTerminalLine({ text: 'Refining and categorizing claims...', type: 'info' })
  await delay(700)
  addTerminalLine({ text: 'Identified 1 temporal claim (time-sensitive)', type: 'warning' })
  await delay(500)
  updateStep('refine', { status: 'done', subLabel: 'Claims refined' })
  addTerminalLine({ text: '✓ Claims refined and ready for verification', type: 'success' })
  
  // Step 3: Searching Evidence
  await delay(400)
  updateStep('search', { status: 'active' })
  addTerminalLine({ text: 'Initiating multi-query evidence search...', type: 'info' })
  await delay(600)
  addTerminalLine({ text: 'Searching Claim 1/5: "Global temperatures..."', type: 'info' })
  await delay(800)
  addTerminalLine({ text: '✓ Found 12 sources (Tier 1: 4, Tier 2: 5, Tier 3: 3)', type: 'success' })
  await delay(500)
  addTerminalLine({ text: 'Searching Claim 2/5: "Renewable energy..."', type: 'info' })
  await delay(700)
  addTerminalLine({ text: '✓ Found 8 sources (Tier 1: 3, Tier 2: 4, Tier 3: 1)', type: 'success' })
  await delay(500)
  addTerminalLine({ text: 'Searching Claim 3/5: "Amazon rainforest..."', type: 'info' })
  await delay(600)
  addTerminalLine({ text: '⚠ Conflicting evidence detected', type: 'warning' })
  await delay(400)
  addTerminalLine({ text: '✓ Found 15 sources with varying conclusions', type: 'success' })
  await delay(500)
  addTerminalLine({ text: 'Searching Claim 4/5: "Electric vehicles..."', type: 'info' })
  await delay(700)
  addTerminalLine({ text: '✓ Found 10 sources (Tier 1: 2, Tier 2: 5, Tier 3: 3)', type: 'success' })
  await delay(500)
  addTerminalLine({ text: 'Searching Claim 5/5: "Ocean plastic..."', type: 'info' })
  await delay(600)
  addTerminalLine({ text: '✓ Found 9 sources (Tier 1: 4, Tier 2: 3, Tier 3: 2)', type: 'success' })
  updateStep('search', { status: 'done', subLabel: '54 sources found' })
  
  // Step 4: Verifying
  await delay(400)
  updateStep('verify', { status: 'active' })
  addTerminalLine({ text: 'Starting Judge Agent analysis...', type: 'info' })
  await delay(800)
  addTerminalLine({ text: 'Claim 1: TRUE (Confidence: 94%)', type: 'verdict' })
  await delay(600)
  addTerminalLine({ text: 'Claim 2: PARTIAL (Confidence: 78%) - Varies by region', type: 'verdict' })
  await delay(600)
  addTerminalLine({ text: 'Claim 3: FALSE (Confidence: 89%) - Common misconception', type: 'verdict' })
  await delay(600)
  addTerminalLine({ text: 'Claim 4: FALSE (Confidence: 82%) - Projection not met', type: 'verdict' })
  await delay(600)
  addTerminalLine({ text: 'Claim 5: PARTIAL (Confidence: 71%) - Based on one study projection', type: 'verdict' })
  await delay(400)
  addTerminalLine({ text: 'Running self-reflection verification pass...', type: 'info' })
  await delay(700)
  addTerminalLine({ text: '✓ Self-reflection complete - verdicts confirmed', type: 'success' })
  updateStep('verify', { status: 'done', subLabel: '5/5 verified' })
  
  // Step 5: Building Report
  await delay(400)
  updateStep('report', { status: 'active' })
  addTerminalLine({ text: 'Generating comprehensive analysis report...', type: 'info' })
  await delay(600)
  addTerminalLine({ text: 'Calculating overall accuracy score...', type: 'info' })
  await delay(500)
  addTerminalLine({ text: '✓ Report generated successfully', type: 'success' })
  updateStep('report', { status: 'done', subLabel: 'Complete' })
  
  // Generate report
  const report: Report = {
    id: `VX-${Math.floor(1000 + Math.random() * 9000)}`,
    title: input.type === 'url' 
      ? 'Article Analysis Report' 
      : input.type === 'image' 
        ? 'Image Claim Analysis' 
        : 'Text Analysis Report',
    inputType: input.type,
    inputPreview: input.content.substring(0, 100) + (input.content.length > 100 ? '...' : ''),
    timestamp: new Date().toISOString(),
    score: 62,
    stats: { true: 1, false: 2, partial: 2, unverifiable: 0 },
    hasConflict: true,
    claims: [
      {
        id: '1',
        text: 'Global temperatures rose by 1.5°C since pre-industrial times',
        verdict: 'true',
        confidence: 94,
        reasoning: 'Multiple Tier 1 sources including IPCC reports, NASA, and NOAA confirm global average temperature increase of approximately 1.1-1.2°C as of 2023, with projections to reach 1.5°C threshold between 2030-2052. The claim is substantively accurate.',
        sources: [
          { domain: 'ipcc.ch', url: 'https://ipcc.ch', tier: 1, title: 'IPCC Climate Report 2023' },
          { domain: 'nasa.gov', url: 'https://nasa.gov', tier: 1, title: 'NASA Global Temperature Data' },
          { domain: 'noaa.gov', url: 'https://noaa.gov', tier: 1, title: 'NOAA Climate Analysis' },
        ],
        isTemporal: false,
        hasConflict: false,
      },
      {
        id: '2',
        text: 'Renewable energy now accounts for 30% of global electricity',
        verdict: 'partial',
        confidence: 78,
        reasoning: 'According to IEA and IRENA data, renewable energy accounted for approximately 29-30% of global electricity generation in 2023, but this varies significantly by region. Some countries exceed 80% while others remain below 10%.',
        sources: [
          { domain: 'iea.org', url: 'https://iea.org', tier: 1, title: 'IEA Renewables Report' },
          { domain: 'irena.org', url: 'https://irena.org', tier: 1, title: 'IRENA Statistics' },
          { domain: 'bp.com', url: 'https://bp.com', tier: 2, title: 'BP Statistical Review' },
        ],
        isTemporal: false,
        hasConflict: false,
      },
      {
        id: '3',
        text: 'The Amazon rainforest produces 20% of Earth\'s oxygen',
        verdict: 'false',
        confidence: 89,
        reasoning: 'This is a common misconception. Scientific consensus indicates the Amazon produces approximately 6-9% of oxygen through photosynthesis, but also consumes nearly all of it through respiration and decomposition. Net oxygen contribution is close to zero. Ocean phytoplankton are the primary oxygen producers.',
        sources: [
          { domain: 'nature.com', url: 'https://nature.com', tier: 1, title: 'Amazon Oxygen Myth Study' },
          { domain: 'nationalgeographic.com', url: 'https://nationalgeographic.com', tier: 2, title: 'The Truth About Amazon Oxygen' },
          { domain: 'scientificamerican.com', url: 'https://scientificamerican.com', tier: 2, title: 'Rainforest Oxygen Facts' },
        ],
        isTemporal: false,
        hasConflict: true,
      },
      {
        id: '4',
        text: 'Electric vehicles will outsell gas cars by 2025',
        verdict: 'false',
        confidence: 82,
        reasoning: 'Current market data shows EVs represent approximately 18-20% of global new car sales in 2024. While EV adoption is accelerating, projections indicate EVs will not achieve majority market share until 2030-2035 in most markets.',
        sources: [
          { domain: 'iea.org', url: 'https://iea.org', tier: 1, title: 'Global EV Outlook' },
          { domain: 'bloomberg.com', url: 'https://bloomberg.com', tier: 2, title: 'BloombergNEF EV Report' },
          { domain: 'reuters.com', url: 'https://reuters.com', tier: 2, title: 'EV Sales Analysis' },
        ],
        isTemporal: true,
        hasConflict: false,
      },
      {
        id: '5',
        text: 'Ocean plastic will outweigh fish by 2050',
        verdict: 'partial',
        confidence: 71,
        reasoning: 'This projection comes from a 2016 World Economic Forum report based on Ellen MacArthur Foundation research. While widely cited, newer studies suggest uncertainty in both plastic accumulation rates and fish population estimates. The claim represents a possible scenario rather than a definitive prediction.',
        sources: [
          { domain: 'weforum.org', url: 'https://weforum.org', tier: 1, title: 'The New Plastics Economy' },
          { domain: 'ellenmacarthurfoundation.org', url: 'https://ellenmacarthurfoundation.org', tier: 2, title: 'Plastics Report' },
          { domain: 'science.org', url: 'https://science.org', tier: 1, title: 'Ocean Plastic Study' },
        ],
        isTemporal: true,
        hasConflict: false,
      },
    ],
    takeaways: [
      'The temperature rise claim is accurate and well-supported by authoritative climate science organizations.',
      'The "Amazon produces 20% of oxygen" claim is a persistent myth - ocean phytoplankton are the primary oxygen producers.',
      'EV sales projections for 2025 dominance were overly optimistic; realistic timeline is 2030-2035.',
      'Two claims were marked as time-sensitive and may need re-verification as conditions change.',
      'One claim showed conflicting evidence requiring careful interpretation.',
    ],
  }
  
  await delay(500)
  
  // Add to history
  addToHistory({
    id: report.id,
    title: report.title,
    inputType: report.inputType,
    inputPreview: report.inputPreview,
    timestamp: report.timestamp,
    claimCount: report.claims.length,
    accuracy: report.score,
  })
  
  setReport(report)
}
