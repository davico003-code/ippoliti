'use client'

import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function BotonVolver() {
  return (
    <Link
      href="/emprendimientos"
      aria-label="Volver a emprendimientos"
      className="fixed top-5 left-5 z-50 inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2.5 font-poppins text-sm font-medium text-[#1A5C38] shadow-md backdrop-blur-md transition-all hover:-translate-x-0.5 hover:bg-white"
    >
      <ChevronLeft size={18} strokeWidth={2.5} />
      <span className="hidden sm:inline">Volver</span>
    </Link>
  )
}
