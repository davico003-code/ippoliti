'use client'

import { startTransition, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

// Cuando algo falla, la página se hace cargo (no "Ocurrió un error
// inesperado") y da tres salidas: reintentar, una persona por WhatsApp (en el
// listado, las tasaciones y las landings el botón flotante no aparece) o el
// inicio.

const R = "var(--font-raleway, 'Raleway'), system-ui, sans-serif"

const boton = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 48,
  padding: '0 26px',
  borderRadius: 999,
  fontFamily: R,
  fontWeight: 700,
  fontSize: 15,
  textDecoration: 'none',
  cursor: 'pointer',
} as const

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Log detallado en dev para no quedar ciegos ante crashes data-dependent.
    console.error('[error-boundary] message:', error.message)
    console.error('[error-boundary] digest:', error.digest)
    console.error('[error-boundary] stack:', error.stack)
  }, [error])

  // Armado en el render (no después de un await): el link ya está listo al tocar.
  const whatsapp = `https://wa.me/5493413340916?text=${encodeURIComponent(
    `¡Hola! Quise entrar a siinmobiliaria.com${pathname ?? ''} y no me cargó.`,
  )}`

  // Si el error vino del server, reset() solo vuelve a mostrar lo mismo: hay
  // que pedir la página de nuevo (refresh) y recién ahí limpiar el error.
  function reintentar() {
    startTransition(() => {
      router.refresh()
      reset()
    })
  }

  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px calc(48px + env(safe-area-inset-bottom, 0px))',
        textAlign: 'center',
        color: 'var(--foreground)',
      }}
    >
      <title>Se nos trabó esta página | SI INMOBILIARIA</title>
      <h1
        style={{
          fontFamily: R,
          fontWeight: 800,
          fontSize: 'clamp(26px, 6.5vw, 32px)',
          lineHeight: 1.15,
          letterSpacing: '-0.02em',
          color: 'var(--foreground)',
          margin: '0 0 12px',
        }}
      >
        Se nos trabó esta página
      </h1>
      <p
        style={{
          fontFamily: R,
          fontWeight: 500,
          fontSize: 16,
          lineHeight: 1.6,
          color: 'var(--theme-muted, #6e6e73)',
          maxWidth: 380,
          margin: '0 0 28px',
        }}
      >
        Probá de nuevo en un momento. Si sigue igual, escribinos y te ayudamos.
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={reintentar}
          className="si-tap"
          style={{ ...boton, background: '#1A5C38', color: '#fff', border: 'none' }}
        >
          Reintentar
        </button>
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="si-tap"
          style={{ ...boton, background: 'transparent', color: 'var(--brand)', border: '1px solid var(--line)' }}
        >
          Escribinos por WhatsApp
        </a>
      </div>
      <Link
        href="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          minHeight: 44,
          marginTop: 16,
          padding: '0 12px',
          fontFamily: R,
          fontWeight: 600,
          fontSize: 14,
          color: 'var(--theme-muted, #6e6e73)',
          textDecoration: 'underline',
          textUnderlineOffset: 3,
        }}
      >
        Ir al inicio
      </Link>
    </div>
  )
}
