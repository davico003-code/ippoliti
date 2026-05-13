interface Props {
  nombre: string
  className?: string
  ratio?: 'wide' | 'square'
}

export default function BarrioPlaceholderImg({ nombre, className = '', ratio = 'wide' }: Props) {
  const viewBox = ratio === 'wide' ? '0 0 1920 1080' : '0 0 1080 1080'
  return (
    <svg
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={`Imagen pendiente del barrio ${nombre}`}
      className={className}
    >
      <defs>
        <linearGradient id={`bg-${nombre}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F5F2EC" />
          <stop offset="100%" stopColor="#E2DDD2" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill={`url(#bg-${nombre})`} />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Raleway, system-ui, sans-serif"
        fontSize={ratio === 'wide' ? 72 : 56}
        fontWeight={300}
        letterSpacing="2"
        fill="#1A5C38"
        opacity={0.6}
      >
        {nombre.toUpperCase()}
      </text>
      <text
        x="50%"
        y="62%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Raleway, system-ui, sans-serif"
        fontSize={ratio === 'wide' ? 22 : 18}
        fill="#1A5C38"
        opacity={0.4}
      >
        SI INMOBILIARIA · Foto en producción
      </text>
    </svg>
  )
}
