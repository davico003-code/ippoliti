// Encabezado común de las secciones de la home: título + bajada, siempre
// alineado a la izquierda y con la misma escala. Es lo que hace que la home se
// lea como una sola pieza.
//
// Sin eyebrow (la etiqueta verde en mayúscula espaciada que iba arriba del
// título): PRODUCT.md la nombra como mobiliario de landing de plantilla y era
// una línea más que leer antes de cada título, que ya dice lo mismo. La prop
// queda (opcional, no se dibuja) para no tocar cada sección que la pasa; si se
// quiere volver, es restituir el <p> de abajo del <header>.

const RALEWAY = "var(--font-raleway), 'Raleway', system-ui, sans-serif"

type Props = {
  /** Ya no se dibuja (ver arriba). */
  eyebrow?: string
  titulo: React.ReactNode
  bajada?: React.ReactNode
  /** h2 por defecto; h3 cuando la sección ya tiene su h2. */
  nivel?: 'h2' | 'h3'
  className?: string
}

export default function EncabezadoSeccion({ titulo, bajada, nivel = 'h2', className = '' }: Props) {
  const H = nivel
  return (
    <header className={`revela ${className}`}>
      <H
        style={{
          fontFamily: RALEWAY,
          fontWeight: 800,
          fontSize: 'clamp(28px, 3.3vw, 44px)',
          lineHeight: 1.06,
          letterSpacing: '-0.035em',
          color: 'var(--foreground)',
          margin: 0,
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
            color: 'var(--tinta-soft)',
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
