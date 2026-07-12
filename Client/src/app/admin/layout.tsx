import type { Metadata } from 'next'
import '../globals.css'

export const metadata: Metadata = {
  title: 'Admin - Portfolio',
  robots: 'noindex',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth antialiased">
      <body className="font-sans bg-[#07090e] text-white min-h-screen">{children}</body>
    </html>
  )
}
