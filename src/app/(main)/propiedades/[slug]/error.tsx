'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function PropertyError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <h2 className="text-2xl font-black text-gray-900 mb-3">Error al cargar la propiedad</h2>
      <p className="text-gray-500 mb-8 max-w-sm">
        No pudimos cargar los datos de esta propiedad. Intentá de nuevo o buscá en el catálogo.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg transition-colors"
        >
          Reintentar
        </button>
        <Link
          href="/propiedades"
          className="px-6 py-3 border border-gray-200 text-gray-600 hover:border-brand-600 hover:text-brand-600 font-semibold rounded-lg transition-colors"
        >
          Ver catálogo
        </Link>
      </div>
    </div>
  )
}
