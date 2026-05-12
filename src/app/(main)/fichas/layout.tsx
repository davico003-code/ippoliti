// Layout propio del panel /fichas. NO usa AgentShell (el panel es accesible
// con código de equipo, no con sesión de agente). Navbar y FooterWrapper se
// ocultan condicionalmente por usePathname() en sus propios componentes.

import Link from 'next/link'

export const dynamic = 'force-dynamic'

const R = "'Raleway', system-ui, sans-serif"

export default function FichasLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#FAFAF8',
        fontFamily: R,
      }}
    >
      <header
        style={{
          background: '#fff',
          borderBottom: '1px solid #E5E7EB',
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <h1
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: '#111',
              margin: 0,
              letterSpacing: '-0.01em',
            }}
          >
            Fichas para colegas
          </h1>
          <Link
            href="/"
            style={{
              fontSize: 13,
              color: '#1A5C38',
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            ← Volver al sitio
          </Link>
        </div>
      </header>

      <main
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '32px 24px 60px',
        }}
      >
        {children}
      </main>
    </div>
  )
}
