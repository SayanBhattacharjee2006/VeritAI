'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SpeechToTextButtonProps {
  onTranscript: (text: string) => void
  disabled?: boolean
}

type RecognitionState = 'idle' | 'listening' | 'processing'

interface ISpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  maxAlternatives: number
  start(): void
  stop(): void
  onstart: (() => void) | null
  onend: (() => void) | null
  onerror: ((event: Event) => void) | null
  onresult: ((event: ISpeechRecognitionEvent) => void) | null
}

interface ISpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: { transcript: string }
    }
  }
}

interface ISpeechRecognitionWindow extends Window {
  SpeechRecognition: new () => ISpeechRecognition
  webkitSpeechRecognition: new () => ISpeechRecognition
}

export function SpeechToTextButton({ onTranscript, disabled = false }: SpeechToTextButtonProps) {
  const [state, setState] = useState<RecognitionState>('idle')
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef<ISpeechRecognition | null>(null)

  useEffect(() => {
    const w = window as unknown as ISpeechRecognitionWindow
    const SpeechRecognitionAPI = w.SpeechRecognition || w.webkitSpeechRecognition
    setIsSupported(!!SpeechRecognitionAPI)
  }, [])

  const startListening = () => {
    const w = window as unknown as ISpeechRecognitionWindow
    const SpeechRecognitionAPI = w.SpeechRecognition || w.webkitSpeechRecognition

    if (!SpeechRecognitionAPI) return

    const recognition = new SpeechRecognitionAPI()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setState('listening')
    }

    recognition.onresult = (event: ISpeechRecognitionEvent) => {
      setState('processing')
      const transcript = event.results[0]?.[0]?.transcript ?? ''
      if (transcript) {
        onTranscript(transcript)
      }
      setTimeout(() => setState('idle'), 600)
    }

    recognition.onerror = () => {
      setState('idle')
    }

    recognition.onend = () => {
      if (state === 'listening') setState('idle')
    }

    recognitionRef.current = recognition
    recognition.start()
  }

  const stopListening = () => {
    recognitionRef.current?.stop()
    setState('idle')
  }

  const handleClick = () => {
    if (state === 'listening') {
      stopListening()
    } else if (state === 'idle') {
      startListening()
    }
  }

  // Don't render if browser doesn't support it
  if (!isSupported) return null

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || state === 'processing'}
      title={
        state === 'listening'
          ? 'Click to stop recording'
          : state === 'processing'
          ? 'Processing...'
          : 'Click to speak'
      }
      className={cn(
        'relative flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200',
        'border focus:outline-none focus:ring-2 focus:ring-violet-500/30',
        state === 'idle' &&
          'bg-[#1C1040] border-[#2E2060] text-violet-400 hover:bg-violet-600/20 hover:border-violet-500/50 hover:text-violet-300',
        state === 'listening' &&
          'bg-red-500/15 border-red-500/40 text-red-400 animate-pulse',
        state === 'processing' &&
          'bg-violet-600/10 border-violet-500/20 text-violet-400 opacity-60 cursor-not-allowed'
      )}
    >
      {state === 'processing' ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : state === 'listening' ? (
        <MicOff className="w-4 h-4" />
      ) : (
        <Mic className="w-4 h-4" />
      )}

      {/* Listening ripple ring */}
      {state === 'listening' && (
        <span className="absolute inset-0 rounded-lg ring-2 ring-red-500/30 animate-ping" />
      )}
    </button>
  )
}
