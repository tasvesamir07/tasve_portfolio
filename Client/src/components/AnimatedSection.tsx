'use client'

import { motion } from 'framer-motion'
import type { MotionProps } from 'framer-motion'

interface Props extends MotionProps {
  className?: string
  children: React.ReactNode
}

export default function AnimatedSection({ className, children, ...motionProps }: Props) {
  return (
    <motion.div className={className} {...motionProps}>
      {children}
    </motion.div>
  )
}
