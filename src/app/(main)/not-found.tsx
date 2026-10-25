import type { Metadata } from 'next'
import Link from 'next/link'

// Lo ve quien abre un link viejo (la propiedad que se vendió y quedó guardada
// en un WhatsApp) o una dirección mal escrita. Tiene que decir qué pasó en
// criollo y dar la salida: el catálogo, una persona, o el inicio.
// En /propiedades/* el botón flotante de WhatsApp no aparece, por eso va acá.

// Título propio de la pestaña (antes quedaba el genérico del sitio). El
// noindex lo pone Next solo en toda página no encontrada.
export const metadata: Metadata = {
  title: 'No encontramos esa página | SI INMOBILIARIA',
}

const R = "var(--font-raleway, 'Raleway'), system-ui, sans-serif"
const P = "var(--font-poppins, 'Poppins'), system-ui, sans-serif"
// Mismo número de la oficina que el botón flotante (FloatingWhatsApp).
const WHATSAPP = `https://wa.me/5493413340916?text=${encodeURIComponent('¡Hola! Entré a un link de la web que ya no existe. ¿Me ayudan a encontrar lo que buscaba?')}`

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
} as const

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: 'calc(100svh - 64px)',
        background: 'var(--background)',
        color: 'var(--foreground)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 24px calc(64px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
        <div
          aria-hidden="true"
          style={{
            width: 72,
            height: 72,
            background: '#1A5C38',
            borderRadius: 16,
            margin: '0 auto 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontFamily: P,
            fontWeight: 700,
            fontSize: 28,
          }}
        >
          SI
        </div>
        <h1
          style={{
            fontFamily: R,
            fontWeight: 800,
            fontSize: 'clamp(28px, 7vw, 36px)',
            lineHeight: 1.15,
            color: 'var(--foreground)',
            letterSpacing: '-0.02em',
            margin: '0 0 12px',
            textWrap: 'balance',
          }}
        >
          No encontramos esa página
        </h1>
        <p
          style={{
            fontFamily: R,
            fontWeight: 500,
            fontSize: 16,
            color: 'var(--theme-muted, #6e6e73)',
            lineHeight: 1.6,
            margin: '0 0 32px',
            textWrap: 'pretty',
          }}
        >
          Puede que la propiedad ya se haya vendido o que el link haya cambiado.
          Mirá las que están disponibles, o escribinos y te ayudamos a encontrarla.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/propiedades"
            className="si-tap"
            style={{ ...boton, background: '#1A5C38', color: '#fff' }}
          >
            Ver propiedades
          </Link>
          <a
            href={WHATSAPP}
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
    </main>
  )
}
