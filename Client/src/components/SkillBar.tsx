'use client'

import { motion } from 'framer-motion'

interface Props {
  name: string
  value: number
}

export default function SkillBar({ name, value }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-sm text-gray-400 font-semibold">
        <span>{name}</span>
        <span className="font-mono text-cyan-400">{value}%</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full"
          initial={{ width: 0 }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
