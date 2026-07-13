'use client'

import { motion } from 'framer-motion'
import { getSkillIcon } from '@/lib/skill-icons'

interface Props {
  name: string
  value: number
  icon?: string
}

export default function SkillBar({ name, value, icon }: Props) {
  const Icon = getSkillIcon(icon || '', name)
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-sm text-gray-400 font-semibold items-center">
        <span className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 shrink-0" />}
          {name}
        </span>
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
