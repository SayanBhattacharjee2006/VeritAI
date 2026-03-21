'use client'

import { useRef } from 'react'

export function MagneticButton({
  children,
  className,
  onClick,
  strength = 0.35,
}: {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  strength?: number
}) {
  const ref = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = ref.current!.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = (e.clientX - cx) * strength
    const dy = (e.clientY - cy) * strength
    ref.current!.style.transform = `translate(${dx}px, ${dy}px)`
  }

  const handleMouseLeave = () => {
    ref.current!.style.transform = 'translate(0px, 0px)'
    ref.current!.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
  }

  const handleMouseEnter = () => {
    ref.current!.style.transition = 'transform 0.1s ease'
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      onClick={onClick}
      className={className}
    >
      {children}
    </div>
  )
}
