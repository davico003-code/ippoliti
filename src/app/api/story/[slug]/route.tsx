import { ImageResponse } from 'next/og'
import {
  getPropertyById,
  getIdFromSlug,
  getMainPhoto,
  formatPrice,
  getOperationType,
  getTotalSurface,
  formatLocation,
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
  const location = formatLocation(property)

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

        {/* Dark gradient overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 1080,
            height: 1920,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.7) 70%, rgba(0,0,0,0.9) 100%)',
            display: 'flex',
          }}
        />

        {/* Top branding */}
        <div
          style={{
            position: 'absolute',
            top: 80,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              color: 'rgba(255,255,255,0.8)',
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: 6,
              textTransform: 'uppercase' as const,
            }}
          >
            SI INMOBILIARIA · DESDE 1983
          </span>
        </div>

        {/* Bottom content */}
        <div
          style={{
            position: 'absolute',
            bottom: 120,
            left: 60,
            right: 60,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Operation badge */}
          {operation && (
            <div style={{ display: 'flex', marginBottom: 24 }}>
              <span
                style={{
                  background: '#1A5C38',
                  color: 'white',
                  fontSize: 26,
                  fontWeight: 700,
                  padding: '10px 28px',
                  borderRadius: 50,
                  letterSpacing: 3,
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
              fontSize: 52,
              fontWeight: 700,
              lineHeight: 1.2,
              marginBottom: 20,
              textShadow: '0 2px 8px rgba(0,0,0,0.5)',
            }}
          >
            {title.length > 80 ? title.slice(0, 80) + '...' : title}
          </span>

          {/* Price */}
          <span
            style={{
              color: 'white',
              fontSize: 64,
              fontWeight: 800,
              marginBottom: 28,
              textShadow: '0 2px 8px rgba(0,0,0,0.5)',
            }}
          >
            {price}
          </span>

          {/* Stats row */}
          <div
            style={{
              display: 'flex',
              gap: 32,
              marginBottom: 24,
            }}
          >
            {area != null && area > 0 && (
              <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 30, fontWeight: 600 }}>
                {area} m²
              </span>
            )}
            {property.room_amount > 0 && (
              <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 30, fontWeight: 600 }}>
                {property.room_amount} dorm.
              </span>
            )}
            {property.bathroom_amount > 0 && (
              <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 30, fontWeight: 600 }}>
                {property.bathroom_amount} baño{property.bathroom_amount > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Location */}
          {location && (
            <span
              style={{
                color: 'rgba(255,255,255,0.6)',
                fontSize: 28,
                fontWeight: 500,
              }}
            >
              {location}
            </span>
          )}
        </div>

        {/* Bottom handle */}
        <div
          style={{
            position: 'absolute',
            bottom: 50,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: 26,
              fontWeight: 500,
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
