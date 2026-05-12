// STUB temporal — el page real con OG, snapshot fetch, galería, mapa y card
// del colega entra en el Commit B (Bloque 3 real).
//
// Mantengo este stub para que el build de la movida route-groups pase y para
// poder probar el rewrite del middleware en local sin todavía tener fichas
// reales en Redis.

export default function NeutralFichaStub({ params }: { params: { slug: string } }) {
  return (
    <main style={{ maxWidth: 720, margin: '80px auto', padding: '0 24px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 600 }}>Stub /v/{params.slug}</h1>
      <p style={{ fontSize: 14, color: '#6B6B6B', marginTop: 8 }}>
        Render real próximamente.
      </p>
    </main>
  )
}
