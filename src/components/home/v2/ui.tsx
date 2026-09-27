// Piezas comunes de la home v2 (propuesta estilo SERHANT adaptada a SI).

export const RALEWAY = "var(--font-raleway), 'Raleway', system-ui, sans-serif"
export const POPPINS = "var(--font-poppins), 'Poppins', system-ui, sans-serif"
export const VERDE = '#1A5C38'
export const VERDE_OSCURO = '#0F3D24'

/** Título de sección: grande, verde, sin eyebrow (como los de SERHANT). */
export function Titulo({ children, bajada, claro = false, className = '' }: { children: React.ReactNode; bajada?: React.ReactNode; claro?: boolean; className?: string }) {
  return (
    <header className={`revela ${className}`}>
      <h2 style={{ fontFamily: RALEWAY, fontWeight: 800, fontSize: 'clamp(32px, 4vw, 54px)', lineHeight: 1.02, letterSpacing: '-0.035em', color: claro ? '#fff' : VERDE, margin: 0 }}>
        {children}
      </h2>
      {bajada && (
        <p style={{ fontFamily: RALEWAY, fontWeight: 600, fontSize: 'clamp(15px, 1.2vw, 17px)', lineHeight: 1.55, color: claro ? 'rgba(255,255,255,.72)' : '#5b6170', margin: '14px 0 0', maxWidth: 620 }}>
          {bajada}
        </p>
      )}
    </header>
  )
}

export function Flecha({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 6l6 6-6 6" />
    </svg>
  )
}
