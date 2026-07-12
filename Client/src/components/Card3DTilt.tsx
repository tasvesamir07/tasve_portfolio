'use client'

import React, { useRef, useState } from 'react'

interface Props {
  children: React.ReactNode
  className?: string
}

export default function Card3DTilt({ children, className = '' }: Props) {
  const cardRef = useRef<HTMLDivElement | null>(null)
  const [coords, setCoords] = useState({ x: '50%', y: '50%' })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return

    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const xPercent = `${(x / rect.width) * 100}%`
    const yPercent = `${(y / rect.height) * 100}%`
    setCoords({ x: xPercent, y: yPercent })

    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = ((y - centerY) / centerY) * -10 // Max tilt 10 degrees
    const rotateY = ((x - centerX) / centerX) * 10

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
  }

  const handleMouseLeave = () => {
    const card = cardRef.current
    if (!card) return

    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative transition-transform duration-100 ease-out style-3d ${className}`}
      style={
        {
          transformStyle: 'preserve-3d' as const,
          perspective: '1000px',
          '--mouse-x': coords.x,
          '--mouse-y': coords.y,
        } as React.CSSProperties & { '--mouse-x': string; '--mouse-y': string }
      }
    >
      {children}
    </div>
  )
}
