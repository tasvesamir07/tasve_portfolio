import { AdminSkeleton } from '@/components/Skeleton'

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-[#07090e] p-6">
      <div className="max-w-4xl mx-auto">
        <AdminSkeleton />
      </div>
    </div>
  )
}
