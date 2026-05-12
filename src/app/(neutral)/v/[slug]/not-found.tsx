// not-found neutro: se renderea cuando page.tsx llama notFound() (ficha
// inexistente, expirada o revocada) o cuando el middleware rewrite-ea cualquier
// path inválido bajo verficha.casa hacia /v/__nf__.
//
// Copy genérico a propósito para no filtrar si el slug existió alguna vez.

export default function NeutralNotFound() {
  return (
    <main
      style={{
        maxWidth: 480,
        margin: '120px auto',
        padding: '0 24px',
        textAlign: 'center',
      }}
    >
      <h1 style={{ fontSize: 22, fontWeight: 600, color: '#1A1A1A' }}>
        Este enlace ya no está disponible
      </h1>
      <p style={{ fontSize: 14, color: '#6B6B6B', marginTop: 12, lineHeight: 1.6 }}>
        El link puede haber expirado o ser inválido.
      </p>
    </main>
  )
}
