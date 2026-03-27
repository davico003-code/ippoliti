import { ImageResponse } from 'next/og'
import {
  getPropertyById,
  getIdFromSlug,
  getMainPhoto,
  formatPrice,
  getOperationType,
  getTotalSurface,
  getRoofedArea,
  getLotSurface,
} from '@/lib/tokko'

export const runtime = 'edge'

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const id = getIdFromSlug(params.slug)
  if (isNaN(id)) {
    return new Response('Not found', { status: 404 })
  }

  const property = await getPropertyById(id)
  const photo = getMainPhoto(property)
  const price = formatPrice(property)
  const operation = getOperationType(property)
  const title = property.publication_title || property.address
  const area = getTotalSurface(property)
  const roofed = getRoofedArea(property)
  const lot = getLotSurface(property)

  // Build stats array — only include stats with values > 0
  const stats: { icon: string; value: string; label: string }[] = []
  if (area != null && area > 0) stats.push({ icon: '⊞', value: `${area}`, label: 'm² total' })
  if (roofed != null && roofed > 0 && roofed !== area) stats.push({ icon: '⌂', value: `${roofed}`, label: 'm² cub.' })
  if (lot != null && lot > 0 && lot !== area) stats.push({ icon: '◱', value: `${lot}`, label: 'm² lote' })
  if (property.room_amount > 0) stats.push({ icon: '◫', value: `${property.room_amount}`, label: 'dorm.' })
  if (property.bathroom_amount > 0) stats.push({ icon: '◈', value: `${property.bathroom_amount}`, label: `baño${property.bathroom_amount > 1 ? 's' : ''}` })
  if (property.parking_lot_amount > 0) stats.push({ icon: '▣', value: `${property.parking_lot_amount}`, label: 'cochera' })

  const displayTitle = title.length > 90 ? title.slice(0, 90) + '…' : title

  return new ImageResponse(
    (
      <div
        style={{
          width: 1080,
          height: 1920,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          fontFamily: 'sans-serif',
          background: '#000',
        }}
      >
        {/* Background photo */}
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
          <img
            src={photo}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 1080,
              height: 1920,
              objectFit: 'cover',
            }}
          />
        )}

        {/* Vignette overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 1080,
            height: 1920,
            background: 'rgba(0,0,0,0.2)',
            display: 'flex',
          }}
        />

        {/* Bottom gradient overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: 1080,
            height: 1152,
            background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.92) 55%)',
            display: 'flex',
          }}
        />

        {/* Top frosted bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 1080,
            height: 80,
            background: 'rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 48px',
          }}
        >
          {/* Left: name */}
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 500 }}>David Flores</span>
          {/* Right: matricula */}
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 500, letterSpacing: 4, textTransform: 'uppercase' as const }}>Mat. N° 0621</span>
        </div>

        {/* Bottom content */}
        <div
          style={{
            position: 'absolute',
            bottom: 100,
            left: 48,
            right: 48,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Operation badge */}
          {operation && (
            <div style={{ display: 'flex', marginBottom: 20 }}>
              <span
                style={{
                  background: '#1A5C38',
                  color: 'white',
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '6px 16px',
                  borderRadius: 50,
                  letterSpacing: 4,
                  textTransform: 'uppercase' as const,
                }}
              >
                {operation}
              </span>
            </div>
          )}

          {/* Green accent line */}
          <div style={{ display: 'flex', marginBottom: 20 }}>
            <div style={{ width: 48, height: 3, background: '#1A5C38', borderRadius: 2 }} />
          </div>

          {/* Title */}
          <span
            style={{
              color: 'white',
              fontSize: 52,
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: -0.5,
              marginBottom: 24,
            }}
          >
            {displayTitle}
          </span>

          {/* Price */}
          <span
            style={{
              color: '#4ADE80',
              fontSize: 64,
              fontWeight: 800,
              letterSpacing: -1,
              marginBottom: 24,
            }}
          >
            {price}
          </span>

          {/* Stats grid */}
          {stats.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 10,
                marginTop: 24,
              }}
            >
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 50,
                    padding: '8px 16px',
                  }}
                >
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{stat.icon}</span>
                  <span style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>{stat.value}</span>
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{stat.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom divider + handle */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '0 48px 44px',
          }}
        >
          <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.1)', marginBottom: 16, display: 'flex' }} />
          <span
            style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: 4,
              textTransform: 'uppercase' as const,
            }}
          >
            @inmobiliaria.si
          </span>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1920,
    }
  )
}
