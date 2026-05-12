// Se renderea cuando page.tsx llama notFound() (slug inexistente, expirado o
// revocado) o cuando el middleware rewrite-ea cualquier path inválido bajo
// verficha.casa hacia /v/__nf__ (que tampoco existe en Redis).
//
// Copy genérico a propósito para no filtrar si el slug existió alguna vez —
// 404 y 410 muestran lo mismo en UI.

const NEUTRAL_DOMAIN = process.env.NEXT_PUBLIC_NEUTRAL_DOMAIN || 'verficha.casa'

export default function NeutralNotFound() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 24px',
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: '#1A1A1A',
            margin: 0,
            letterSpacing: '-0.01em',
          }}
        >
          Este enlace ya no está disponible
        </h1>
        <p
          style={{
            fontSize: 14,
            color: '#6B6B6B',
            marginTop: 12,
            lineHeight: 1.6,
          }}
        >
          El link puede haber expirado o ser inválido.
        </p>
      </div>

      <footer
        style={{
          position: 'absolute',
          bottom: 24,
          fontSize: 12,
          color: '#9A9A9A',
        }}
      >
        {NEUTRAL_DOMAIN}
      </footer>
    </main>
  )
}
