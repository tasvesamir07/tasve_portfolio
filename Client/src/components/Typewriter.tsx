'use client'

import React, { useEffect, useState } from 'react'

interface Props {
  roles: string[]
}

export default function Typewriter({ roles }: Props) {
  const [roleIndex, setRoleIndex] = useState(0)
  const [text, setText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const rolesList = roles && roles.length > 0 ? roles : ['Creative Web Architect', 'UI/UX Engineer', 'Problem Solver']
    const currentRole = rolesList[roleIndex]

    const tick = () => {
      if (isDeleting) {
        setText(currentRole.substring(0, text.length - 1))
        if (text.length === 1) {
          setIsDeleting(false)
          setRoleIndex((prev) => (prev + 1) % rolesList.length)
        }
      } else {
        setText(currentRole.substring(0, text.length + 1))
        if (text.length === currentRole.length - 1) {
          setIsDeleting(true)
        }
      }
    }

    const speed = isDeleting ? 50 : text.length === currentRole.length ? 2000 : 120
    const timer = setTimeout(tick, speed)
    return () => clearTimeout(timer)
  }, [text, isDeleting, roleIndex, roles])

  return (
    <div className="font-heading text-2xl md:text-4xl font-bold text-gray-300 min-h-[45px] flex items-center justify-center md:justify-start">
      <span className="bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">
        {text}
      </span>
      <span className="text-purple-500 font-light animate-blink ml-1">|</span>
    </div>
  )
}
