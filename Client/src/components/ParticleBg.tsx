'use client'

import React, { useEffect, useRef } from 'react'
import { useTheme } from '@/lib/theme'

export default function ParticleBg() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const { theme } = useTheme()

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let particlesArray: Particle[] = []
    let animationFrameId: number
    let particleCount = typeof window !== 'undefined' && window.innerWidth < 768 ? 40 : 100

    const canvasMouse = {
      x: null as number | null,
      y: null as number | null,
      radius: 140,
    }

    const handleMouseMove = (event: MouseEvent) => {
      canvasMouse.x = event.clientX
      canvasMouse.y = event.clientY
    }

    const handleMouseOut = () => {
      canvasMouse.x = null
      canvasMouse.y = null
    }

    const handleResize = () => {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      particleCount = window.innerWidth < 768 ? 40 : 100
      initParticles()
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseout', handleMouseOut)
    window.addEventListener('resize', handleResize)

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    class Particle {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      color: string

      constructor() {
        this.x = Math.random() * (canvas?.width || 800)
        this.y = Math.random() * (canvas?.height || 600)
        this.size = Math.random() * 2 + 1
        this.speedX = Math.random() * 0.8 - 0.4
        this.speedY = Math.random() * 0.8 - 0.4
        this.color = theme === 'dark' 
          ? 'rgba(167, 139, 250, 0.8)' 
          : 'rgba(79, 70, 229, 0.8)'
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY

        if (canvas) {
          if (this.x > canvas.width) this.x = 0
          else if (this.x < 0) this.x = canvas.width

          if (this.y > canvas.height) this.y = 0
          else if (this.y < 0) this.y = canvas.height
        }
      }

      draw() {
        if (!ctx) return
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    function initParticles() {
      particlesArray = []
      for (let i = 0; i < particleCount; i++) {
        particlesArray.push(new Particle())
      }
    }

    function connectParticles() {
      if (!ctx) return
      let opacityValue = 1
      for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a + 1; b < particlesArray.length; b++) {
          const dx = particlesArray[a].x - particlesArray[b].x
          const dy = particlesArray[a].y - particlesArray[b].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 110) {
            opacityValue = 1 - distance / 110
            ctx.strokeStyle = theme === 'dark'
              ? `rgba(34, 211, 238, ${opacityValue * 0.35})`
              : `rgba(71, 85, 105, ${opacityValue * 0.45})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(particlesArray[a].x, particlesArray[a].y)
            ctx.lineTo(particlesArray[b].x, particlesArray[b].y)
            ctx.stroke()
          }
        }

        if (canvasMouse.x !== null && canvasMouse.y !== null) {
          const dxMouse = particlesArray[a].x - canvasMouse.x
          const dyMouse = particlesArray[a].y - canvasMouse.y
          const distanceMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse)
          if (distanceMouse < canvasMouse.radius) {
            opacityValue = 1 - distanceMouse / canvasMouse.radius
            ctx.strokeStyle = theme === 'dark'
              ? `rgba(244, 63, 94, ${opacityValue * 0.45})`
              : `rgba(219, 39, 119, ${opacityValue * 0.55})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(particlesArray[a].x, particlesArray[a].y)
            ctx.lineTo(canvasMouse.x, canvasMouse.y)
            ctx.stroke()
          }
        }
      }
    }

    let frameCount = 0

    function animateParticles() {
      if (!ctx || !canvas) return
      frameCount++
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update()
        particlesArray[i].draw()
      }
      if (frameCount % 2 === 0) {
        connectParticles()
      }
      animationFrameId = requestAnimationFrame(animateParticles)
    }

    initParticles()
    animateParticles()

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseout', handleMouseOut)
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [theme])

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10 bg-[#07090e] pointer-events-none"
    />
  )
}
