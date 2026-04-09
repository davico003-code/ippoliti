'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

export default function BackButton() {
  const router = useRouter()
  return (
    <button
      onClick={() => router.back()}
      className="md:hidden absolute top-4 left-4 z-10 inline-flex items-center gap-1 bg-black/45 backdrop-blur-sm text-white rounded-full px-4 py-2 text-sm font-medium"
      aria-label="Volver"
    >
      <ChevronLeft className="w-4 h-4" />
      Volver
    </button>
  )
}
