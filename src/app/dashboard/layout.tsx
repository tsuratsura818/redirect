import type { Metadata } from 'next'
import Sidebar from '@/components/Sidebar'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-background min-w-0">
        <div className="p-4 pt-16 md:p-6 lg:p-8 md:pt-6 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  )
}
