'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useTheme } from '@/lib/theme'

export default function CustomCursor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const hoveredRef = useRef(false)
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const hasHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!hasHover) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    let mouseX = -100
    let mouseY = -100
    let ringX = -100
    let ringY = -100
    let initialized = false
    let currentRadius = 10
    let animationFrameId: number

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      if (!initialized) {
        ringX = mouseX
        ringY = mouseY
        initialized = true
      }
    }

    window.addEventListener('mousemove', handleMouseMove)

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const isInteractive = target.closest(
        'a, button, [role="button"], input, textarea, select, .project-card, .info-card, .cursor-zoom-in'
      )
      hoveredRef.current = !!isInteractive
    }
    document.addEventListener('mouseover', handleMouseOver)

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (initialized && mouseX >= 0 && mouseY >= 0) {
        const hov = hoveredRef.current
        const lerpSpeed = prefersReduced ? 1.0 : 0.15
        ringX += (mouseX - ringX) * lerpSpeed
        ringY += (mouseY - ringY) * lerpSpeed

        const targetRadius = hov ? 22 : 10
        currentRadius += (targetRadius - currentRadius) * (prefersReduced ? 1.0 : 0.15)

        // Outer Ring
        ctx.beginPath()
        ctx.arc(ringX, ringY, currentRadius, 0, Math.PI * 2)
        if (theme === 'dark') {
          ctx.strokeStyle = hov ? 'rgba(236, 72, 153, 0.5)' : 'rgba(6, 182, 212, 0.4)'
        } else {
          ctx.strokeStyle = hov ? 'rgba(139, 92, 246, 0.6)' : 'rgba(6, 182, 212, 0.6)'
        }
        ctx.lineWidth = hov ? 2.0 : 1.5
        ctx.stroke()

        // Inner Dot
        ctx.beginPath()
        ctx.arc(mouseX, mouseY, hov ? 4 : 3, 0, Math.PI * 2)
        if (theme === 'dark') {
          ctx.fillStyle = hov ? 'rgb(236, 72, 153)' : 'rgb(6, 182, 212)'
          ctx.shadowBlur = hov ? 8 : 4
          ctx.shadowColor = hov ? 'rgba(236, 72, 153, 0.6)' : 'rgba(6, 182, 212, 0.6)'
        } else {
          ctx.fillStyle = hov ? 'rgb(139, 92, 246)' : 'rgb(8, 145, 178)'
          ctx.shadowBlur = hov ? 6 : 3
          ctx.shadowColor = hov ? 'rgba(139, 92, 246, 0.4)' : 'rgba(8, 145, 178, 0.4)'
        }
        ctx.fill()
        ctx.shadowBlur = 0
      }

      animationFrameId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseover', handleMouseOver)
      cancelAnimationFrame(animationFrameId)
    }
  }, [mounted, theme])

  if (!mounted) return null

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-[9999] block"
      style={{ mixBlendMode: theme === 'dark' ? 'screen' : 'multiply' }}
    />
  )
}
