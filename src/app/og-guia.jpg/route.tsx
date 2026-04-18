/* eslint-disable @next/next/no-img-element, jsx-a11y/alt-text */
import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          background: 'linear-gradient(135deg, #1A5C38 0%, #0d3d24 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Foto David izquierda */}
        <div style={{ width: 360, height: 630, display: 'flex', position: 'relative' }}>
          <img
            src="https://siinmobiliaria.com/david-flores.jpg"
            style={{ width: 360, height: 630, objectFit: 'cover' }}
          />
          <div
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'linear-gradient(to right, transparent 60%, #0d3d24 100%)',
            }}
          />
        </div>

        {/* Contenido derecha */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '60px 60px 60px 40px',
            color: 'white',
          }}
        >
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
            <div
              style={{
                width: 44, height: 44, background: 'white', borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#1A5C38', fontWeight: 900, fontSize: 20,
              }}
            >
              SI
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.9)' }}>
              INMOBILIARIA
            </span>
          </div>

          {/* Título */}
          <div style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.1, marginBottom: 20 }}>
            Guía del
          </div>
          <div style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.1, marginBottom: 24, fontStyle: 'italic', color: '#D4B685' }}>
            Comprador 2026
          </div>

          {/* Subtítulo */}
          <div style={{ fontSize: 20, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5, maxWidth: 500 }}>
            13 capítulos para comprar tu propiedad en Funes, Roldán y Rosario sin equivocarte.
          </div>

          {/* Autor */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 40 }}>
            <div style={{ width: 32, height: 1, background: 'rgba(255,255,255,0.4)' }} />
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', fontWeight: 600, letterSpacing: '0.1em' }}>
              POR DAVID FLORES · MATRÍCULA 0621
            </span>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
