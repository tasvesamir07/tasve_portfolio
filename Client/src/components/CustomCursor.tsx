'use client'

import React, { useEffect, useRef, useState } from 'react'

export default function CustomCursor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [hovered, setHovered] = useState(false)
  const [isMobile, setIsMobile] = useState(true)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const motionHandler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', motionHandler)

    // Check if device is desktop
    const checkDevice = () => {
      const mobile = window.innerWidth <= 1024
      setIsMobile(mobile)
    }
    checkDevice()
    window.addEventListener('resize', checkDevice)

    if (isMobile || reducedMotion) {
      return () => {
        mq.removeEventListener('change', motionHandler)
        window.removeEventListener('resize', checkDevice)
      }
    }

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Resize canvas
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

    // Track interactive hovers
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const isInteractive = target.closest(
        'a, button, [role="button"], input, textarea, select, .project-card, .info-card, .cursor-zoom-in'
      )
      setHovered(!!isInteractive)
    }
    document.addEventListener('mouseover', handleMouseOver)

    // Animation Loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (initialized && mouseX >= 0 && mouseY >= 0) {
        // Smoothly interpolate outer ring position (Lerp)
        const lerpSpeed = 0.15
        ringX += (mouseX - ringX) * lerpSpeed
        ringY += (mouseY - ringY) * lerpSpeed

        // Smoothly interpolate outer ring radius
        const targetRadius = hovered ? 22 : 10
        currentRadius += (targetRadius - currentRadius) * 0.15

        // Draw outer floating ring
        ctx.beginPath()
        ctx.arc(ringX, ringY, currentRadius, 0, Math.PI * 2)
        ctx.strokeStyle = hovered ? 'rgba(236, 72, 153, 0.5)' : 'rgba(6, 182, 212, 0.4)'
        ctx.lineWidth = hovered ? 2.0 : 1.5
        ctx.stroke()

        // Draw center dot
        ctx.beginPath()
        ctx.arc(mouseX, mouseY, hovered ? 4 : 3, 0, Math.PI * 2)
        ctx.fillStyle = hovered ? 'rgb(236, 72, 153)' : 'rgb(6, 182, 212)'
        ctx.shadowBlur = hovered ? 8 : 4
        ctx.shadowColor = hovered ? 'rgba(236, 72, 153, 0.6)' : 'rgba(6, 182, 212, 0.6)'
        ctx.fill()
        ctx.shadowBlur = 0 // reset shadow
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
  }, [isMobile, hovered])

  if (isMobile || reducedMotion) return null

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-[9999]"
      style={{ mixBlendMode: 'screen' }}
    />
  )
}
