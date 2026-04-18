import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Guía del Comprador 2026 | SI Inmobiliaria',
  description: '14 capítulos sobre cómo comprar en Funes y Roldán con criterio.',
  robots: { index: false, follow: false },
}

const SECRET = new TextEncoder().encode(process.env.AGENT_JWT_SECRET ?? 'si-secret-2026')
const COOKIE_NAME = 'si_guia_token'

export default async function GuiaLeerPage() {
  // Validar cookie
  const cookieStore = cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value

  if (!token) {
    redirect('/guia')
  }

  try {
    await jwtVerify(token, SECRET)
  } catch {
    redirect('/guia')
  }

  // Cookie válida → redirigir a /guia
  redirect('/guia')
}
