'use client'

// Card "Autorizaciones de venta" en /recursos que solo aparece si el navegador
// tiene un team code en localStorage ('si_team_access'). Es el atajo del agente
// para entrar al panel sin tipear la URL completa.
//
// Renderiza null hasta el primer paint cliente (evita mismatch SSR/CSR y
// previene que el HTML inicial filtre que existe la sección).

import { useEffect, useState } from 'react'
import RecursoCard from './RecursoCard'

const STORAGE_KEY = 'si_team_access'

const IconSignature = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-6 h-6"
    aria-hidden
  >
    <path d="M3 17c2-1 4-3 6-5s4-4 6-4 2 2 0 4-4 4-2 5 4-1 6-3" />
    <path d="M3 21h18" />
  </svg>
)

export default function AdminAutorizacionesCard() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    setShow(!!window.localStorage.getItem(STORAGE_KEY))
  }, [])

  if (!show) return null

  return (
    <RecursoCard
      href="/recursos/autorizaciones"
      eyebrow="Equipo SI"
      title="Autorizaciones de venta"
      description="Generá autorizaciones de venta digitales y compartilas por WhatsApp. El cliente firma desde su celular y vos recibís la copia en PDF."
      cta="Generar autorización"
      icon={IconSignature}
    />
  )
}
