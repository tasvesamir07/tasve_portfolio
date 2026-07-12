import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function ProjectNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07090e] px-6">
      <div className="flex flex-col items-center gap-6 text-center max-w-md">
        <span className="font-mono text-8xl font-black text-white/10">404</span>
        <h2 className="text-xl font-bold text-white">Project not found</h2>
        <p className="text-gray-400 text-sm">
          This project doesn&apos;t exist or may have been removed.
        </p>
        <Link
          href="/#projects"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity"
        >
          <ArrowLeft className="w-4 h-4" /> Back to projects
        </Link>
      </div>
    </div>
  )
}
