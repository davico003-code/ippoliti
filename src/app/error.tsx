'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
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
      <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mb-6">
        <span className="text-brand-600 text-2xl font-black">!</span>
      </div>
      <h2 className="text-2xl font-black text-gray-900 mb-3">Algo salió mal</h2>
      <p className="text-gray-500 mb-8 max-w-sm">
        Ocurrió un error inesperado. Por favor intentá de nuevo.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg transition-colors"
        >
          Reintentar
        </button>
        <Link
          href="/"
          className="px-6 py-3 border border-gray-200 text-gray-600 hover:border-brand-600 hover:text-brand-600 font-semibold rounded-lg transition-colors"
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  )
}
