'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07090e] px-6">
      <div className="flex flex-col items-center gap-6 text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <span className="text-red-400 text-2xl">!</span>
        </div>
        <h2 className="text-xl font-bold text-white">Something went wrong</h2>
        <p className="text-gray-400 text-sm">{error.message || 'An unexpected error occurred.'}</p>
        <button
          onClick={reset}
          className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
