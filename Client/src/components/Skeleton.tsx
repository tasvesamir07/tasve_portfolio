export function SkeletonLine({ className = '' }: { className?: string }) {
  return <div className={`h-4 bg-white/5 rounded animate-pulse ${className}`} />
}

export function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`bg-white/5 rounded-xl animate-pulse ${className}`} />
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-glass-bg border border-white/5 rounded-xl p-5 ${className}`}>
      <SkeletonLine className="w-3/4 h-5 mb-3" />
      <SkeletonLine className="w-1/2 h-3 mb-2" />
      <SkeletonLine className="w-full h-3 mb-1" />
      <SkeletonLine className="w-2/3 h-3" />
    </div>
  )
}

export function AdminSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <SkeletonBlock key={i} className="h-24" />
        ))}
      </div>
      <SkeletonBlock className="h-64" />
    </div>
  )
}

export function ProjectDetailSkeleton() {
  return (
    <div className="min-h-screen bg-[#07090e]">
      <div className="max-w-4xl mx-auto px-6 pt-8 pb-24">
        <SkeletonLine className="w-32 h-4 mb-8" />
        <SkeletonBlock className="w-full h-64 md:h-80 mb-8" />
        <SkeletonLine className="w-3/4 h-8 mb-2" />
        <SkeletonLine className="w-1/3 h-4 mb-6" />
        <div className="flex gap-4 mb-10">
          <SkeletonBlock className="w-32 h-10 rounded-lg" />
          <SkeletonBlock className="w-32 h-10 rounded-lg" />
        </div>
        <SkeletonLine className="w-1/4 h-6 mb-3" />
        <SkeletonLine className="w-full h-4 mb-2" />
        <SkeletonLine className="w-full h-4 mb-2" />
        <SkeletonLine className="w-3/4 h-4 mb-10" />
        <SkeletonLine className="w-1/4 h-6 mb-3" />
        <div className="flex flex-wrap gap-2 mb-10">
          {[...Array(4)].map((_, i) => (
            <SkeletonBlock key={i} className="h-8 w-24 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}
