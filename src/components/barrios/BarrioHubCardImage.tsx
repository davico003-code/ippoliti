import Image from 'next/image'

export type HubTier = 'premium' | 'consolidado' | 'joven' | 'desarrollo' | 'proximamente'

const TIER_GRADIENT: Record<HubTier, string> = {
  premium: 'linear-gradient(160deg, #1A5C38 0%, #0F3F26 100%)',
  consolidado: 'linear-gradient(160deg, #4A7C5C 0%, #2E5742 100%)',
  joven: 'linear-gradient(160deg, #B8935A 0%, #8B6D3F 100%)',
  desarrollo: 'linear-gradient(160deg, #8B5A2B 0%, #5C3A1A 100%)',
  proximamente: 'linear-gradient(160deg, #0F2419 0%, #061A0F 100%)',
}

interface Props {
  src: string | null
  nombre: string
  tier: HubTier
  priority?: boolean
}

export default function BarrioHubCardImage({ src, nombre, tier, priority = false }: Props) {
  // Próximamente: placeholder dedicado con nombre + leyenda. Aplica
  // también cuando hay src pero el barrio es "Próximamente" — David
  // todavía no aprobó la foto, así que evitamos mostrarla.
  if (!src || tier === 'proximamente') {
    return (
      <div
        role="img"
        aria-label={`${nombre} — próximamente`}
        style={{
          background: TIER_GRADIENT[tier],
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          textAlign: 'center',
        }}
      >
        {tier === 'proximamente' && (
          <>
            <span
              style={{
                fontFamily: 'Raleway, sans-serif',
                fontWeight: 700,
                fontSize: 'clamp(20px, 4vw, 28px)',
                color: '#FFFFFF',
                lineHeight: 1.15,
                letterSpacing: '-0.01em',
              }}
            >
              {nombre}
            </span>
            <span
              style={{
                marginTop: 10,
                fontFamily: 'Raleway, sans-serif',
                fontWeight: 600,
                fontSize: 10,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              Próximamente
            </span>
          </>
        )}
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={`Vista de ${nombre} — barrio cerrado en Funes`}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
      loading={priority ? 'eager' : 'lazy'}
      priority={priority}
      className="object-cover"
    />
  )
}
