'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  size: number
  opacity: number
  speedX: number
  speedY: number
  fadeSpeed: number
  life: number
  maxLife: number
  color: string
}

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

    const colors = [
      'rgba(255,107,43,',
      'rgba(245,158,11,',
      'rgba(76,215,246,',
      'rgba(173,198,255,',
    ]

    const particles: Particle[] = []
    const MAX_PARTICLES = 80

    const spawn = (): Particle => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      opacity: 0,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3 - 0.1,
      fadeSpeed: Math.random() * 0.008 + 0.004,
      life: 0,
      maxLife: Math.random() * 120 + 80,
      color: colors[Math.floor(Math.random() * colors.length)],
    })

    for (let i = 0; i < MAX_PARTICLES; i++) {
      const p = spawn()
      p.life = Math.random() * p.maxLife
      particles.push(p)
    }

    let raf: number

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.life++
        p.x += p.speedX
        p.y += p.speedY

        const half = p.maxLife / 2
        p.opacity = p.life < half
          ? (p.life / half) * 0.7
          : ((p.maxLife - p.life) / half) * 0.7

        if (p.life >= p.maxLife) {
          particles[i] = spawn()
          continue
        }

        ctx.save()
        ctx.globalAlpha = p.opacity
        ctx.fillStyle = p.color + p.opacity + ')'
        ctx.translate(p.x, p.y)
        ctx.fillRect(-p.size, -p.size / 4, p.size * 2, p.size / 2)
        ctx.fillRect(-p.size / 4, -p.size, p.size / 2, p.size * 2)
        ctx.restore()
      }

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
