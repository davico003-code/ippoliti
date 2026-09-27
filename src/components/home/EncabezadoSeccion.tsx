// Encabezado común de las secciones de la home: eyebrow verde + título +
// bajada, siempre alineado a la izquierda y con la misma escala. Es lo que
// hace que la home se lea como una sola pieza.

const RALEWAY = "var(--font-raleway), 'Raleway', system-ui, sans-serif"

type Props = {
  eyebrow: string
  titulo: React.ReactNode
  bajada?: React.ReactNode
  /** h2 por defecto; h3 cuando la sección ya tiene su h2. */
  nivel?: 'h2' | 'h3'
  className?: string
}

export default function EncabezadoSeccion({ eyebrow, titulo, bajada, nivel = 'h2', className = '' }: Props) {
  const H = nivel
  return (
    <header className={`revela ${className}`}>
      <p
        style={{
          fontFamily: RALEWAY,
          fontWeight: 700,
          fontSize: 12,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: '#00754A',
          margin: 0,
        }}
      >
        {eyebrow}
      </p>
      <H
        style={{
          fontFamily: RALEWAY,
          fontWeight: 800,
          fontSize: 'clamp(28px, 3.3vw, 44px)',
          lineHeight: 1.06,
          letterSpacing: '-0.035em',
          color: '#111',
          margin: '10px 0 0',
        }}
      >
        {titulo}
      </H>
      {bajada && (
        <p
          style={{
            fontFamily: RALEWAY,
            fontWeight: 600,
            fontSize: 'clamp(15px, 1.2vw, 17px)',
            lineHeight: 1.5,
            color: '#6b7280',
            margin: '10px 0 0',
            maxWidth: 620,
          }}
        >
          {bajada}
        </p>
      )}
    </header>
  )
}
