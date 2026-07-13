'use client'

import React, { useEffect, useRef, useState } from 'react'

export default function CustomCursor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const hoveredRef = useRef(false)
  const [isMobile, setIsMobile] = useState(true)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const motionHandler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', motionHandler)

    const checkDevice = () => {
      const mobile = window.innerWidth <= 1024
      setIsMobile(mobile)
    }
    checkDevice()
    window.addEventListener('resize', checkDevice)

    if (isMobile || reducedMotion) return () => {
      mq.removeEventListener('change', motionHandler)
      window.removeEventListener('resize', checkDevice)
    }

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
        const lerpSpeed = 0.15
        ringX += (mouseX - ringX) * lerpSpeed
        ringY += (mouseY - ringY) * lerpSpeed

        const targetRadius = hov ? 22 : 10
        currentRadius += (targetRadius - currentRadius) * 0.15

        ctx.beginPath()
        ctx.arc(ringX, ringY, currentRadius, 0, Math.PI * 2)
        ctx.strokeStyle = hov ? 'rgba(236, 72, 153, 0.5)' : 'rgba(6, 182, 212, 0.4)'
        ctx.lineWidth = hov ? 2.0 : 1.5
        ctx.stroke()

        ctx.beginPath()
        ctx.arc(mouseX, mouseY, hov ? 4 : 3, 0, Math.PI * 2)
        ctx.fillStyle = hov ? 'rgb(236, 72, 153)' : 'rgb(6, 182, 212)'
        ctx.shadowBlur = hov ? 8 : 4
        ctx.shadowColor = hov ? 'rgba(236, 72, 153, 0.6)' : 'rgba(6, 182, 212, 0.6)'
        ctx.fill()
        ctx.shadowBlur = 0
      }

      animationFrameId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener('resize', checkDevice)
      window.removeEventListener('resize', resizeCanvas)
      mq.removeEventListener('change', motionHandler)
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseover', handleMouseOver)
      cancelAnimationFrame(animationFrameId)
    }
  }, [isMobile, reducedMotion])

  if (isMobile || reducedMotion) return null

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-[9999]"
      style={{ mixBlendMode: 'screen' }}
    />
  )
}
