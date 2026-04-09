'use client'

import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Volver arriba"
      className="fixed bottom-24 right-5 z-[9990] w-11 h-11 rounded-full bg-[#1A5C38] hover:bg-[#0f3d25] text-white shadow-[0_8px_24px_rgba(0,0,0,0.25)] flex items-center justify-center transition-all"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  )
}
