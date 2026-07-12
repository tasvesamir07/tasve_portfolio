export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07090e]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm font-mono">Loading...</p>
      </div>
    </div>
  )
}
