import { ImageResponse } from 'next/og'
import {
  getPropertyById,
  getIdFromSlug,
  getMainPhoto,
  formatPrice,
  getOperationType,
  getTotalSurface,
  getLotSurface,
} from '@/lib/tokko'

export const runtime = 'edge'

// SVG icons as JSX for @vercel/og
const icons = {
  area: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 21V9" />
    </svg>
  ),
  lote: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
      <path d="M3 21h18M3 21V7l9-4 9 4v14M9 21v-6h6v6" />
    </svg>
  ),
  dorm: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
      <path d="M2 9V19M22 9v10M2 14h20M2 9a5 5 0 0 1 5-5h10a5 5 0 0 1 5 5" />
      <circle cx="7.5" cy="11.5" r="1.5" fill="white" />
    </svg>
  ),
  bath: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
      <path d="M4 12h16v4a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-4z" />
      <path d="M4 12V5a2 2 0 0 1 2-2h2v5" />
    </svg>
  ),
  car: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
      <path d="M5 17H3v-5l2-5h14l2 5v5h-2M5 17h14M5 17v2M19 17v2" />
      <circle cx="7.5" cy="17" r="1.5" fill="white" />
      <circle cx="16.5" cy="17" r="1.5" fill="white" />
    </svg>
  ),
}

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
  const lot = getLotSurface(property)

  // Build stats — only values > 0
  const stats: { icon: React.ReactNode; text: string }[] = []
  if (area != null && area > 0) stats.push({ icon: icons.area, text: `${area} m²` })
  if (lot != null && lot > 0 && lot !== area) stats.push({ icon: icons.lote, text: `${lot} m² lote` })
  if (property.room_amount > 0) stats.push({ icon: icons.dorm, text: `${property.room_amount} dorm.` })
  if (property.bathroom_amount > 0) stats.push({ icon: icons.bath, text: `${property.bathroom_amount} baño${property.bathroom_amount > 1 ? 's' : ''}` })
  if (property.parking_lot_amount > 0) stats.push({ icon: icons.car, text: `${property.parking_lot_amount} cochera` })

  const displayTitle = title.length > 70 ? title.slice(0, 70) + '…' : title

  return new ImageResponse(
    (
      <div
        style={{
          width: 1080,
          height: 1920,
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'sans-serif',
          background: '#0a0a0a',
        }}
      >
        {/* Top half — hero image (55%) */}
        <div style={{ width: 1080, height: 1056, position: 'relative', display: 'flex' }}>
          {photo && (
            // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
            <img
              src={photo}
              style={{
                width: 1080,
                height: 1056,
                objectFit: 'cover',
              }}
            />
          )}
          {/* Subtle vignette on image */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 1080,
              height: 1056,
              background: 'rgba(0,0,0,0.15)',
              display: 'flex',
            }}
          />
          {/* Top bar over image */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 1080,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px 32px',
            }}
          >
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 22, fontWeight: 500, letterSpacing: 4 }}>David Flores</span>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 22, fontWeight: 500, letterSpacing: 4, textTransform: 'uppercase' as const }}>Mat. N° 0621</span>
          </div>
        </div>

        {/* Green separator */}
        <div style={{ width: 1080, height: 3, background: '#1A5C38', display: 'flex' }} />

        {/* Bottom half — text on dark (45%) */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '28px 32px',
            background: '#0a0a0a',
          }}
        >
          {/* Operation badge */}
          {operation && (
            <div style={{ display: 'flex', marginBottom: 14 }}>
              <span
                style={{
                  background: '#1A5C38',
                  color: 'white',
                  fontSize: 22,
                  fontWeight: 700,
                  padding: '10px 28px',
                  borderRadius: 50,
                  letterSpacing: 4,
                  textTransform: 'uppercase' as const,
                }}
              >
                {operation}
              </span>
            </div>
          )}

          {/* Title */}
          <span
            style={{
              color: 'white',
              fontSize: 76,
              fontWeight: 700,
              letterSpacing: -1,
              lineHeight: 1.2,
              marginTop: 14,
            }}
          >
            {displayTitle}
          </span>

          {/* Price */}
          <span
            style={{
              color: '#4ADE80',
              fontSize: 104,
              fontWeight: 800,
              letterSpacing: -2,
              marginTop: 8,
            }}
          >
            {price}
          </span>

          {/* Stats */}
          {stats.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 16,
                marginTop: 32,
              }}
            >
              {stats.map((stat, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: 50,
                    padding: '12px 24px',
                  }}
                >
                  {stat.icon}
                  <span style={{ color: 'white', fontSize: 28, fontWeight: 500 }}>{stat.text}</span>
                </div>
              ))}
            </div>
          )}

          {/* Spacer */}
          <div style={{ flex: 1, display: 'flex' }} />

          {/* Bottom handle */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span
              style={{
                color: 'rgba(255,255,255,0.4)',
                fontSize: 22,
                fontWeight: 500,
                letterSpacing: 4,
                textTransform: 'uppercase' as const,
              }}
            >
              @inmobiliaria.si
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1920,
    }
  )
}
