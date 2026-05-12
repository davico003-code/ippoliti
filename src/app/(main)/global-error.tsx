'use client'

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="es">
      <body style={{ fontFamily: 'Raleway, system-ui, sans-serif', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f9fafb' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ width: '64px', height: '64px', background: '#1A5C38', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <span style={{ color: 'white', fontWeight: 900, fontSize: '28px' }}>SI</span>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#1a1a1a', marginBottom: '12px' }}>
            Algo salió mal
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>
            Ocurrió un error inesperado. Por favor intentá de nuevo.
          </p>
          <button
            onClick={reset}
            style={{ padding: '12px 24px', background: '#1A5C38', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  )
}
