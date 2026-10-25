'use client'

import { useEffect, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { haptico } from '@/lib/haptico'

export default function PropertyError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()
  const [reintentando, startTransition] = useTransition()

  useEffect(() => {
    console.error(error)
  }, [error])

  // reset() solo vuelve a dibujar en el cliente lo que ya había llegado del
  // server, con el error adentro: si Hilo tuvo un 5xx pasajero, "Reintentar"
  // no reintentaba nada. router.refresh() le vuelve a pedir la ficha al server;
  // juntos en una transición, el botón queda en "Reintentando…" hasta que llega.
  const reintentar = () => {
    haptico()
    startTransition(() => {
      router.refresh()
      reset()
    })
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <h2 className="text-2xl font-black text-gray-900 mb-3">Error al cargar la propiedad</h2>
      <p className="text-gray-500 mb-8 max-w-sm">
        No pudimos cargar los datos de esta propiedad. Intentá de nuevo o buscá en el catálogo.
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={reintentar}
          disabled={reintentando}
          aria-busy={reintentando}
          className="si-tap min-h-[44px] px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-70"
        >
          {reintentando ? 'Reintentando…' : 'Reintentar'}
        </button>
        <Link
          href="/propiedades"
          className="si-tap inline-flex min-h-[44px] items-center px-6 py-3 border border-gray-200 text-gray-600 hover:border-brand-600 hover:text-brand-600 font-semibold rounded-lg transition-colors"
        >
          Ver catálogo
        </Link>
      </div>
    </div>
  )
}
