import { ImageResponse } from 'next/og'
import {
  getPropertyById,
  getIdFromSlug,
  getMainPhoto,
  formatPrice,
  getTotalSurface,
  translatePropertyType,
  getOperationType,
} from '@/lib/tokko'

export const runtime = 'nodejs'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const id = getIdFromSlug(params.slug)
  const property = await getPropertyById(id)
  if (!property) return new Response('Not found', { status: 404 })

  const precio = formatPrice(property)
  const operacion = getOperationType(property).toUpperCase()
  const tipo = translatePropertyType(property.type?.name).toUpperCase()
  const titulo = property.publication_title || property.fake_address || property.address
  const superficie = getTotalSurface(property)
  const dormitorios = property.suite_amount || property.room_amount || null
  const banos = property.bathroom_amount || null
  const foto = getMainPhoto(property)

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
          backgroundColor: '#0d1a12',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        {foto && (
          <img
            src={foto}
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

        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 1080,
            height: 1920,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 20%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.75) 65%, rgba(0,0,0,0.93) 100%)',
            display: 'flex',
          }}
        />

        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            padding: '72px 80px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '38px', fontWeight: 400 }}>
              David Flores
            </span>
            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '38px', fontWeight: 400 }}>
              MAT. N° 0621
            </span>
          </div>

          <div style={{ flex: 1, display: 'flex' }} />

          <div style={{ display: 'flex', gap: '24px', marginBottom: '36px' }}>
            <div
              style={{
                background: '#1A5C38',
                color: '#fff',
                fontSize: '30px',
                fontWeight: 700,
                letterSpacing: '4px',
                padding: '14px 40px',
                borderRadius: '100px',
              }}
            >
              {operacion}
            </div>
            <div
              style={{
                background: 'rgba(255,255,255,0.15)',
                color: '#fff',
                fontSize: '30px',
                fontWeight: 600,
                letterSpacing: '3px',
                padding: '14px 40px',
                borderRadius: '100px',
                border: '2px solid rgba(255,255,255,0.35)',
              }}
            >
              {tipo}
            </div>
          </div>

          <div
            style={{
              color: '#fff',
              fontSize: '68px',
              fontWeight: 500,
              lineHeight: 1.3,
              marginBottom: '40px',
            }}
          >
            {titulo}
          </div>

          <div
            style={{
              color: '#fff',
              fontSize: '90px',
              fontWeight: 800,
              letterSpacing: '-1px',
              marginBottom: '40px',
              lineHeight: 1,
            }}
          >
            {precio}
          </div>

          <div style={{ display: 'flex', gap: '20px', marginBottom: '52px' }}>
            {superficie ? (
              <div
                style={{
                  border: '2px solid rgba(255,255,255,0.45)',
                  borderRadius: '100px',
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: '32px',
                  padding: '12px 36px',
                }}
              >
                {superficie} m²
              </div>
            ) : null}
            {dormitorios ? (
              <div
                style={{
                  border: '2px solid rgba(255,255,255,0.45)',
                  borderRadius: '100px',
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: '32px',
                  padding: '12px 36px',
                }}
              >
                {dormitorios} dorm.
              </div>
            ) : null}
            {banos ? (
              <div
                style={{
                  border: '2px solid rgba(255,255,255,0.45)',
                  borderRadius: '100px',
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: '32px',
                  padding: '12px 36px',
                }}
              >
                {banos} baños
              </div>
            ) : null}
          </div>

          <div
            style={{
              height: '1px',
              background: 'rgba(255,255,255,0.2)',
              marginBottom: '40px',
              display: 'flex',
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '30px' }}>
                @inmobiliaria.si
              </span>
              <span style={{ color: '#fff', fontSize: '36px', fontWeight: 700 }}>
                Escribinos por DM
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '88px', height: '88px', borderRadius: '16px', background: '#1A5C38' }}>
              <span style={{ color: '#fff', fontSize: '36px', fontWeight: 800, fontFamily: 'sans-serif' }}>SI</span>
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1920 }
  )
}
