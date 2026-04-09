'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

export default function BackButton() {
  const router = useRouter()
  return (
    <button
      onClick={() => router.back()}
      className="flex items-center gap-1.5 text-sm font-semibold text-[#1A5C38] hover:opacity-75 transition-opacity mb-4"
    >
      <ChevronLeft className="w-4 h-4" />
      Volver al catálogo
    </button>
  )
}
