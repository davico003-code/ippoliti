'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'

const NAV_ITEMS = [
  { label: 'Inicio', icon: '🏠', href: '/agentes' },
  { label: 'Selecciones', icon: '🔗', href: '/agentes/seleccion', badge: true },
  { label: 'Contratos y modelos', icon: '📋', href: '/agentes/modulo/contratos' },
  { label: 'Análisis de mercado', icon: '📊', href: '/agentes/modulo/mercado' },
  { label: 'Guías para asesores', icon: '🧭', href: '/agentes/modulo/guias' },
  { label: 'Capacitación', icon: '🎓', href: '/agentes/modulo/capacitacion' },
]

interface Props {
  agentName: string
  agentRole: 'admin' | 'agent'
  children: React.ReactNode
}

export default function AgentShell({ agentName, agentRole, children }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [selCount, setSelCount] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    fetch('/api/seleccion')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSelCount(data.filter((s: { expiresAt: string }) => new Date(s.expiresAt) > new Date()).length)
        }
      })
      .catch(() => {})
  }, [pathname])

  async function handleLogout() {
    await fetch('/api/agentes/logout', { method: 'POST' })
    router.push('/agentes/login')
    router.refresh()
  }

  // Don't wrap login page
  if (pathname === '/agentes/login') return <>{children}</>

  const isActive = (href: string) => {
    if (href === '/agentes') return pathname === '/agentes'
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7]" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl" style={{ borderBottom: '0.5px solid rgba(60,60,67,0.12)' }}>
        <div className="flex items-center justify-between px-4 md:px-6" style={{ height: '57px' }}>
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden w-8 h-8 flex items-center justify-center text-[#6E6E73]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
            </button>
            <div className="w-8 h-8 bg-[#1A5C38] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs" style={{ fontFamily: 'Raleway, sans-serif' }}>SI</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#6E6E73] hidden sm:block">{agentName}</span>
            {agentRole === 'admin' && (
              <span className="text-[10px] font-semibold bg-[#1A5C38]/10 text-[#1A5C38] px-2 py-0.5 rounded-full hidden sm:block">Admin</span>
            )}
            <button
              onClick={handleLogout}
              className="text-sm text-[#6E6E73] hover:text-[#1C1C1E] transition-colors"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar — desktop always, mobile toggle */}
        <aside
          className={`fixed md:sticky top-[57px] left-0 z-30 h-[calc(100vh-57px)] w-[220px] bg-white shrink-0 overflow-y-auto transition-transform duration-200 md:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{ borderRight: '0.5px solid rgba(60,60,67,0.12)' }}
        >
          <nav className="p-[10px] space-y-0.5">
            {NAV_ITEMS.map(item => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-2.5 px-[14px] py-[9px] rounded-xl text-sm transition-all duration-150 ${
                    active
                      ? 'bg-[#1A5C38]/[0.07] text-[#1A5C38] font-semibold'
                      : 'text-[#6E6E73] hover:bg-[#1A5C38]/[0.06] hover:text-[#1C1C1E]'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && selCount > 0 && (
                    <span className="text-[10px] font-bold bg-[#1A5C38] text-white min-w-[20px] h-5 rounded-full flex items-center justify-center px-1.5">
                      {selCount}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          <style>{`aside::-webkit-scrollbar { width: 0; }`}</style>
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-20 bg-black/30 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
