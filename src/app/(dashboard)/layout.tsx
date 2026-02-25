import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { Toaster } from '@/components/ui/sonner'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  )
}
