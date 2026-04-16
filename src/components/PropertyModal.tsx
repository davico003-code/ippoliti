'use client'

import { useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function PropertyModal({ children }: { children: ReactNode }) {
  const router = useRouter()

  // Bloquear scroll del body
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') router.back()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [router])

  return (
    <div className="fixed inset-0 z-[200]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => router.back()}
        style={{ animation: 'fadeIn 200ms ease-out' }}
      />

      {/* Panel */}
      <div
        className="absolute inset-0 md:inset-y-0 md:right-0 md:left-[60px] lg:left-[80px] bg-[#fafafa] overflow-y-auto"
        style={{ animation: 'slideFromRight 250ms ease-out' }}
      >
        {/* Volver a la búsqueda */}
        <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 py-3 text-sm font-semibold text-gray-700 hover:text-[#1A5C38] transition-colors"
              style={{ fontFamily: "'Raleway', system-ui, sans-serif" }}
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a la búsqueda
            </button>
          </div>
        </div>

        {/* Contenido */}
        {children}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideFromRight { from { transform: translateX(30px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>
    </div>
  )
}
