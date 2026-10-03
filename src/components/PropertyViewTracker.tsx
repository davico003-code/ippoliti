'use client'

import { useEffect } from 'react'
import { events } from '@/lib/analytics'

/** Una visita por ficha, por navegador y por día: recargar no suma. */
function contarVistaEnHilo(propertyId: number) {
  try {
    if (navigator.webdriver) return
    const dia = new Date().toISOString().slice(0, 10)
    const clave = `si:vista:${propertyId}`
    if (localStorage.getItem(clave) === dia) return
    localStorage.setItem(clave, dia)
  } catch {
    // Sin localStorage (modo privado estricto) igual se cuenta.
  }
  fetch('/api/propiedades/vista', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ id: propertyId }),
    keepalive: true,
  }).catch(() => {})
}

export default function PropertyViewTracker({ propertyId, title, price }: {
  propertyId: number
  title: string
  price: string
}) {
  useEffect(() => {
    events.viewProperty(propertyId, title, price)
    contarVistaEnHilo(propertyId)
  }, [propertyId, title, price])

  return null
}
