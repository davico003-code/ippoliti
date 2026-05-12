import Link from 'next/link'

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: 'calc(100vh - 64px)',
        background: '#f5f5f7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 24px',
      }}
    >
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
        <div
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
            fontFamily: "var(--font-poppins), 'Poppins', system-ui, sans-serif",
            fontWeight: 700,
            fontSize: 28,
          }}
        >
          SI
        </div>
        <h1
          style={{
            fontFamily: "var(--font-raleway), 'Raleway', system-ui, sans-serif",
            fontWeight: 300,
            fontSize: 36,
            color: '#1d1d1f',
            letterSpacing: '-0.02em',
            margin: '0 0 12px',
          }}
        >
          Esta página no existe
        </h1>
        <p
          style={{
            fontFamily: "var(--font-poppins), 'Poppins', system-ui, sans-serif",
            fontSize: 15,
            color: '#6e6e73',
            lineHeight: 1.6,
            margin: '0 0 36px',
          }}
        >
          La propiedad que buscás puede haber sido vendida o el link cambió.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/propiedades"
            style={{
              display: 'inline-block',
              background: '#1A5C38',
              color: '#fff',
              padding: '13px 28px',
              borderRadius: 999,
              fontFamily: "var(--font-poppins), 'Poppins', system-ui, sans-serif",
              fontWeight: 600,
              fontSize: 14,
              textDecoration: 'none',
            }}
          >
            Ver propiedades disponibles
          </Link>
          <Link
            href="/"
            style={{
              display: 'inline-block',
              background: 'transparent',
              color: '#1A5C38',
              border: '1px solid #1A5C38',
              padding: '13px 28px',
              borderRadius: 999,
              fontFamily: "var(--font-poppins), 'Poppins', system-ui, sans-serif",
              fontWeight: 600,
              fontSize: 14,
              textDecoration: 'none',
            }}
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  )
}
