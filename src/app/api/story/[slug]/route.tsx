import { ImageResponse } from 'next/og'
import {
  getPropertyById,
  getIdFromSlug,
  getMainPhoto,
  getAllPhotos,
  formatPrice,
  getOperationType,
  getTotalSurface,
  getLotSurface,
} from '@/lib/tokko'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const icon = (size: number, children: React.ReactNode) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
    {children}
  </svg>
)

const icons = {
  area: icon(16, <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></>),
  lote: icon(16, <path d="M3 21h18M3 21V7l9-4 9 4v14M9 21v-6h6v6" />),
  dorm: icon(16, <><path d="M2 9V19M22 9v10M2 14h20M2 9a5 5 0 0 1 5-5h10a5 5 0 0 1 5 5" /><circle cx="7.5" cy="11.5" r="1.5" fill="white" /></>),
  bath: icon(16, <><path d="M4 12h16v4a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-4z" /><path d="M4 12V5a2 2 0 0 1 2-2h2v5" /></>),
  car: icon(16, <><path d="M5 17H3v-5l2-5h14l2 5v5h-2M5 17h14M5 17v2M19 17v2" /><circle cx="7.5" cy="17" r="1.5" fill="white" /><circle cx="16.5" cy="17" r="1.5" fill="white" /></>),
  pool: icon(16, <><path d="M2 12h20M2 17c2-2 4 2 6 0s4-2 6 0 4 2 6 0M6 12V7a3 3 0 0 1 6 0v5M18 12V7" /></>),
}

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const id = getIdFromSlug(params.slug)
  if (isNaN(id)) {
    return new Response('Invalid slug', { status: 400 })
  }

  let property
  try {
    property = await getPropertyById(id)
  } catch (err) {
    console.error('Story API - Tokko fetch error:', err)
    return new Response('Error fetching property', { status: 500 })
  }

  if (!property) {
    return new Response('Property not found', { status: 404 })
  }

  const photo = getMainPhoto(property)
  const photos = getAllPhotos(property)
  const secondPhoto = photos.length > 1 ? photos[1] : null
  const price = formatPrice(property)
  const operation = getOperationType(property)
  const title = property.publication_title || property.address
  const area = getTotalSurface(property)
  const lot = getLotSurface(property)

  const stats: { icon: React.ReactNode; text: string }[] = []
  if (area != null && area > 0) stats.push({ icon: icons.area, text: `${area} m²` })
  if (lot != null && lot > 0 && lot !== area) stats.push({ icon: icons.lote, text: `${lot} m² lote` })
  if (property.room_amount > 0) stats.push({ icon: icons.dorm, text: `${property.room_amount} dorm.` })
  if (property.bathroom_amount > 0) stats.push({ icon: icons.bath, text: `${property.bathroom_amount} baño${property.bathroom_amount > 1 ? 's' : ''}` })
  if (property.parking_lot_amount > 0) stats.push({ icon: icons.car, text: `${property.parking_lot_amount} cochera` })

  const displayTitle = title.length > 60 ? title.slice(0, 60) + '…' : title

  return new ImageResponse(
    (
      <div
        style={{
          width: 1080,
          height: 1920,
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'sans-serif',
          background: '#0f0f0f',
        }}
      >
        {/* Top half — hero image (55%) */}
        <div style={{ width: 1080, height: 1056, position: 'relative', display: 'flex' }}>
          {photo && (
            // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
            <img
              src={photo}
              style={{ width: 1080, height: 1056, objectFit: 'cover' }}
            />
          )}
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
          {/* Top bar — floating text */}
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
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 500 }}>David Flores</span>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 500, letterSpacing: 4, textTransform: 'uppercase' as const }}>Mat. N° 0621</span>
          </div>

          {/* Second photo inset */}
          {secondPhoto && (
            <div
              style={{
                position: 'absolute',
                bottom: 28,
                right: 28,
                width: 150,
                height: 150,
                borderRadius: 16,
                overflow: 'hidden',
                border: '2px solid rgba(255,255,255,0.15)',
                display: 'flex',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img src={secondPhoto} style={{ width: 150, height: 150, objectFit: 'cover' }} />
            </div>
          )}
        </div>

        {/* Thin separator */}
        <div style={{ width: 1080, height: 1, background: 'rgba(255,255,255,0.06)', display: 'flex' }} />

        {/* Bottom half */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '32px 36px 28px',
            background: 'linear-gradient(to bottom, #0f0f0f, #1a1a1a)',
          }}
        >
          {/* Operation badge */}
          {operation && (
            <div style={{ display: 'flex', marginBottom: 16 }}>
              <span
                style={{
                  background: '#1A5C38',
                  color: 'white',
                  fontSize: 12,
                  fontWeight: 700,
                  padding: '6px 18px',
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
          <div style={{ display: 'flex', marginBottom: 18 }}>
            <div style={{ width: 48, height: 3, background: '#3DD68C', borderRadius: 2 }} />
          </div>

          {/* Title */}
          <span
            style={{
              color: 'white',
              fontSize: 42,
              fontWeight: 700,
              letterSpacing: -0.5,
              lineHeight: 1.2,
              marginTop: 14,
            }}
          >
            {displayTitle}
          </span>

          {/* Price */}
          <span
            style={{
              color: '#3DD68C',
              fontSize: 58,
              fontWeight: 800,
              letterSpacing: -1,
              marginTop: 10,
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
                gap: 10,
                marginTop: 24,
              }}
            >
              {stats.map((stat, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'rgba(255,255,255,0.10)',
                    border: '1px solid rgba(255,255,255,0.18)',
                    borderRadius: 50,
                    padding: '10px 18px',
                  }}
                >
                  {stat.icon}
                  <span style={{ color: 'white', fontSize: 15, fontWeight: 600 }}>{stat.text}</span>
                </div>
              ))}
            </div>
          )}

          {/* Spacer */}
          <div style={{ flex: 1, display: 'flex' }} />

          {/* Bottom watermark */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span
              style={{
                color: 'rgba(255,255,255,0.5)',
                fontSize: 13,
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
