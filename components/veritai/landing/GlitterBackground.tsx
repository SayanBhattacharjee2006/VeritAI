'use client'

import { useEffect, useRef } from 'react'

export function GlitterBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize, { passive: true })

    let t = 0
    let raf: number

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Subtle radial veil — deep purple glow at top center (Dark Veil effect)
      const grad1 = ctx.createRadialGradient(
        canvas.width / 2, 0, 0,
        canvas.width / 2, 0, canvas.height * 0.75
      )
      grad1.addColorStop(0, 'rgba(124, 58, 237, 0.09)')
      grad1.addColorStop(0.5, 'rgba(109, 40, 217, 0.04)')
      grad1.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = grad1
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Slow drifting secondary glow (bottom left, cyan tint)
      const cx2 = canvas.width * 0.15 + Math.sin(t * 0.0004) * 60
      const cy2 = canvas.height * 0.7 + Math.cos(t * 0.0003) * 40
      const grad2 = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, 350)
      grad2.addColorStop(0, 'rgba(103, 232, 249, 0.05)')
      grad2.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = grad2
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      t++
      raf = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  )
}
