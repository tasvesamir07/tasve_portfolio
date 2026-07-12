import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07090e] px-6">
      <div className="flex flex-col items-center gap-6 text-center max-w-md">
        <span className="font-mono text-8xl font-black text-white/10">404</span>
        <h2 className="text-xl font-bold text-white">Page not found</h2>
        <p className="text-gray-400 text-sm">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity"
        >
          Go home
        </Link>
      </div>
    </div>
  )
}
