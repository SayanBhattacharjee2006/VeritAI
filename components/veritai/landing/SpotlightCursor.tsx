'use client'

import { useEffect, useRef } from 'react'

export function SpotlightCursor() {
  const spotlightRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return

    const el = spotlightRef.current
    if (!el) return

    const onMouseMove = (e: MouseEvent) => {
      el.style.left = e.clientX + 'px'
      el.style.top = e.clientY + 'px'
      el.style.opacity = '1'
    }

    const onMouseLeave = () => {
      el.style.opacity = '0'
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('mouseleave', onMouseLeave)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [])

  return (
    <div
      ref={spotlightRef}
      className="pointer-events-none fixed z-[9999] -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-0 transition-opacity duration-300"
      style={{
        background:
          'radial-gradient(circle, rgba(255,107,43,0.08) 0%, rgba(245,158,11,0.04) 30%, transparent 70%)',
      }}
      aria-hidden="true"
    />
  )
}
