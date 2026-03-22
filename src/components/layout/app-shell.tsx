import { Outlet } from 'react-router-dom'
import { SiteHeader } from '@/components/layout/site-header'

export function AppShell() {
  return (
    <div className="flex min-h-svh flex-col bg-[#fafafa]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
