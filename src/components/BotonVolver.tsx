'use client'

import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function BotonVolver() {
  return (
    <Link
      href="/emprendimientos"
      aria-label="Volver a emprendimientos"
      className="fixed top-3 left-3 sm:top-4 sm:left-4 z-50 flex items-center gap-2 rounded-full bg-white/85 px-3 py-2 sm:px-4 shadow-md backdrop-blur-md transition-colors hover:bg-white"
    >
      <ChevronLeft size={18} className="text-[#1A5C38]" />
      <span className="hidden sm:inline font-poppins font-medium text-[#1A5C38]">
        Volver
      </span>
    </Link>
  )
}
