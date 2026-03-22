'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef } from 'react'
import { cn } from '@/lib/utils'
import { 
  FileText, 
  Link as LinkIcon, 
  Image, 
  Sparkles, 
  Upload,
  X,
  ExternalLink,
  Clock
} from 'lucide-react'
import { useVerificationStore, type InputType } from '@/lib/stores/verification-store'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useUIStore } from '@/lib/stores/ui-store'
import { ProcessingView } from '@/components/veritai/app/ProcessingView'
import { ResultsView } from '@/components/veritai/app/ResultsView'

const inputTabs: { id: InputType; label: string; icon: typeof FileText }[] = [
  { id: 'text', label: 'Text', icon: FileText },
  { id: 'url', label: 'URL', icon: LinkIcon },
  { id: 'image', label: 'Image', icon: Image },
]

function IdleView() {
  const [activeTab, setActiveTab] = useState<InputType>('text')
  const [textInput, setTextInput] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { startVerification, history } = useVerificationStore()
  const { dailyChecksUsed, maxDailyChecks } = useAuthStore()
  
  const fileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result
        if (typeof result !== 'string') {
          reject(new Error('Failed to read file'))
          return
        }
        resolve(result.split(',')[1] ?? result)
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })

  const handleStartVerification = async () => {
    // Check daily limit first
    if (dailyChecksUsed >= maxDailyChecks) {
      useUIStore.getState().addToast({
        title: 'Daily limit reached',
        description: `You've used all ${maxDailyChecks} verifications for today. Upgrade for more.`,
        type: 'warning',
      })
      return
    }

    let content = ''
    
    if (activeTab === 'text') {
      content = textInput
    } else if (activeTab === 'url') {
      content = urlInput.trim()
      if (content && !content.startsWith('http://') && !content.startsWith('https://')) {
        content = 'https://' + content
      }
    } else if (activeTab === 'image' && imageFile) {
      try {
        content = await fileToBase64(imageFile)
      } catch {
        useUIStore.getState().addToast({
          title: 'Image upload failed',
          description: 'Could not process the selected image.',
          type: 'error',
        })
        return
      }
    }
    
    if (!content) return
    
    startVerification({ type: activeTab, content })
  }
  
  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }
  
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }
  
  const clearImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }
  
  const isInputValid = () => {
    if (activeTab === 'text') return textInput.trim().length > 0
    if (activeTab === 'url') return urlInput.trim().length > 0
    if (activeTab === 'image') return imageFile !== null
    return false
  }
  
  const recentHistory = history.slice(0, 3)
  const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  }
  const blockVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }
  
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="max-w-2xl mx-auto"
    >
      {/* Header */}
      <motion.div
        variants={blockVariants}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-8"
      >
        <h1 className="font-display text-4xl font-bold text-text mb-3">
          What do you want to verify?
        </h1>
        <p className="text-muted-v">
          Paste text, enter a URL, or upload an image. We&apos;ll extract and verify every claim.
        </p>
        <p className="text-sm text-muted-v mt-2">
          {dailyChecksUsed} / {maxDailyChecks} daily verifications used
        </p>
      </motion.div>
      
      {/* Input type tabs */}
      <motion.div
        variants={blockVariants}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex justify-center mb-6"
      >
        <div className="inline-flex p-1 rounded-full bg-surface border border-border-v">
          {inputTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'relative flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-colors cursor-pointer',
                activeTab === tab.id ? 'text-text' : 'text-muted-v hover:text-text'
              )}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-card-high rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <tab.icon className="w-4 h-4 relative z-10" />
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>
      </motion.div>
      
      {/* Input area */}
      <motion.div
        variants={blockVariants}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="bg-card-v rounded-2xl border border-border-v p-6 mb-6"
      >
        <AnimatePresence mode="wait">
          {/* Text input */}
          {activeTab === 'text' && (
            <motion.div
              key="text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Paste any article, paragraph, essay, or claim..."
                className={cn(
                  'w-full min-h-[180px] p-4 rounded-xl bg-surface border border-border-v',
                  'text-text placeholder:text-muted-v resize-none',
                  'focus:outline-none focus:ring-2 focus:ring-primary-glow/30 focus:border-primary-glow/50'
                )}
                maxLength={5000}
              />
              <div className="flex justify-end mt-2">
                <span className="text-xs text-muted-v">
                  {textInput.length}/5000
                </span>
              </div>
            </motion.div>
          )}
          
          {/* URL input */}
          {activeTab === 'url' && (
            <motion.div
              key="url"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-v" />
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com/article"
                    className={cn(
                      'w-full pl-12 pr-4 py-4 rounded-xl bg-surface border border-border-v',
                      'text-text placeholder:text-muted-v',
                      'focus:outline-none focus:ring-2 focus:ring-primary-glow/30 focus:border-primary-glow/50'
                    )}
                  />
                </div>
                <button
                  className="px-6 py-4 rounded-xl btn-ghost font-semibold shrink-0"
                  disabled={!urlInput.trim()}
                >
                  Fetch
                </button>
              </div>
              
              {/* URL preview placeholder */}
              {urlInput && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 rounded-xl bg-surface border border-border-v flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-lg bg-card-high flex items-center justify-center">
                    <ExternalLink className="w-5 h-5 text-muted-v" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text truncate">
                      {urlInput}
                    </p>
                    <p className="text-xs text-muted-v">Ready to analyze</p>
                  </div>
                  <button
                    onClick={() => setUrlInput('')}
                    className="p-1 rounded hover:bg-card-high transition-colors"
                  >
                    <X className="w-4 h-4 text-muted-v" />
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
          
          {/* Image input */}
          {activeTab === 'image' && (
            <motion.div
              key="image"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {!imagePreview ? (
                <div
                  onDrop={handleImageDrop}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    'min-h-[180px] rounded-xl border-2 border-dashed cursor-pointer transition-colors',
                    'flex flex-col items-center justify-center gap-3',
                    isDragging 
                      ? 'border-cyan bg-cyan/5' 
                      : 'border-border-v hover:border-muted-v'
                  )}
                >
                  <div className="p-4 rounded-full bg-surface">
                    <Upload className="w-8 h-8 text-muted-v" />
                  </div>
                  <div className="text-center">
                    <p className="text-text font-medium">
                      Drop image here or click to upload
                    </p>
                    <p className="text-sm text-muted-v mt-1">
                      PNG, JPG up to 10MB
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full max-h-[300px] object-contain rounded-xl"
                  />
                  <button
                    onClick={clearImage}
                    className="absolute top-2 right-2 p-2 rounded-full bg-bg/80 hover:bg-bg transition-colors"
                  >
                    <X className="w-4 h-4 text-text" />
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Analyze button */}
      <motion.div
        variants={blockVariants}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.button
          onClick={handleStartVerification}
          disabled={!isInputValid()}
          whileHover={isInputValid() ? { scale: 1.02 } : {}}
          whileTap={isInputValid() ? { scale: 0.98 } : {}}
          className={cn(
            'w-full py-4 rounded-xl font-display font-bold text-lg',
            'flex items-center justify-center gap-3',
            isInputValid()
              ? 'btn-primary'
              : 'bg-muted-v/20 text-muted-v cursor-not-allowed'
          )}
        >
          <Sparkles className="w-5 h-5" />
          Analyze & Verify
        </motion.button>
      </motion.div>
      
      {/* Recent checks */}
      {recentHistory.length > 0 && (
        <motion.div
          variants={blockVariants}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12"
        >
          <h3 className="text-sm font-semibold text-muted-v uppercase tracking-wider mb-4">
            Recent Checks
          </h3>
          <div className="space-y-3">
            {recentHistory.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="p-4 rounded-xl bg-card-v border border-border-v flex items-center gap-4 hover:bg-card-high transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center">
                  {item.inputType === 'text' && <FileText className="w-5 h-5 text-muted-v" />}
                  {item.inputType === 'url' && <LinkIcon className="w-5 h-5 text-muted-v" />}
                  {item.inputType === 'image' && <Image className="w-5 h-5 text-muted-v" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text truncate">
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-v flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    {new Date(item.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <div className={cn(
                  'px-2.5 py-1 rounded-full text-xs font-semibold',
                  item.accuracy < 0 && 'bg-muted-v/20 text-muted-v',
                  item.accuracy >= 80 && 'bg-green-v/20 text-green-v',
                  item.accuracy >= 50 && item.accuracy < 80 && 'bg-amber/20 text-amber',
                  item.accuracy >= 0 && item.accuracy < 50 && 'bg-red-v/20 text-red-v'
                )}>
                  {item.accuracy < 0 ? 'N/A' : `${item.accuracy}%`}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default function DashboardPage() {
  const { state } = useVerificationStore()

  // AnimatePresence mode="wait" removed — it unmounts the current view
  // COMPLETELY before mounting the new one, causing a blank screen gap.
  // For image/URL input where startVerification() is called after an
  // async operation, the exit animation was still running when the
  // new state was set, resulting in a permanently blank screen.
  //
  // Fix: use a single motion.div keyed on state — React swaps the
  // content instantly, and the enter animation plays on top of it.
  return (
    <motion.div
      key={state}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {state === 'idle' && <IdleView />}
      {state === 'processing' && <ProcessingView />}
      {state === 'results' && <ResultsView />}
    </motion.div>
  )
}
