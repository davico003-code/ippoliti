// Página de confirmación post-firma.
// Carga la autorización, 404 si no firmada (incluyendo si está pendiente),
// renderiza tarjeta de éxito con CTA de descarga del PDF (endpoint del commit 3).

import { notFound } from 'next/navigation'
import { getAutorizacion } from '@/lib/autorizaciones'
import { formatFechaFirma } from '@/lib/autorizaciones/documentoTexto'

export const dynamic = 'force-dynamic'

const GREEN = '#1A5C38'
const TEXT_DARK = '#1A1A1A'
const TEXT_SOFT = '#5A5A55'
const TEXT_MUTED = '#8A8A85'
const LABEL_MUTED = '#6B6B66'
const LINE = '#E5E5E0'
const R = "'Raleway', system-ui, sans-serif"
const P = "'Poppins', system-ui, sans-serif"

interface Props {
  params: { slug: string }
}

export default async function FirmadaPage({ params }: Props) {
  const auth = await getAutorizacion(params.slug)
  if (!auth || auth.status !== 'firmada' || !auth.signer || !auth.signed_at) notFound()

  const fechaHora = formatFechaFirma(new Date(auth.signed_at))
  const firstName = auth.signer.nombre.split(/\s+/)[0] || auth.signer.nombre

  return (
    <div style={{ textAlign: 'center', paddingTop: 8 }}>
      <div
        style={{
          margin: '12px auto 20px',
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: GREEN,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-hidden
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h1
        style={{
          fontFamily: R,
          fontSize: 22,
          fontWeight: 600,
          color: TEXT_DARK,
          margin: '0 0 8px',
          lineHeight: 1.3,
        }}
      >
        Autorización firmada
      </h1>
      <p
        style={{
          fontFamily: R,
          fontSize: 16,
          color: TEXT_DARK,
          margin: '0 0 16px',
        }}
      >
        Gracias, <span style={{ fontWeight: 500 }}>{firstName}</span>.
      </p>
      <p
        style={{
          fontFamily: R,
          fontSize: 14,
          fontWeight: 300,
          color: TEXT_SOFT,
          lineHeight: 1.6,
          margin: '0 auto 28px',
          maxWidth: 520,
        }}
      >
        Recibimos tu autorización el <span style={{ color: TEXT_DARK, fontWeight: 500 }}>{fechaHora}</span> y ya está en manos de nuestro equipo. Nos pondremos en contacto a la brevedad para coordinar los próximos pasos.
      </p>

      <a
        href={`/api/autorizaciones/${auth.slug}/pdf`}
        download
        style={{
          display: 'inline-flex',
          width: '100%',
          maxWidth: 360,
          boxSizing: 'border-box',
          padding: '14px 18px',
          borderRadius: 12,
          background: GREEN,
          color: '#fff',
          fontFamily: P,
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: '0.02em',
          textDecoration: 'none',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        Descargar mi copia en PDF
      </a>

      <hr style={{ border: 'none', borderTop: `1px solid ${LINE}`, margin: '36px 0 18px' }} />

      <p
        style={{
          fontFamily: P,
          fontSize: 11,
          fontWeight: 600,
          color: LABEL_MUTED,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          margin: '0 0 10px',
        }}
      >
        Datos de contacto del agente
      </p>
      <p style={{ fontFamily: R, fontSize: 14, fontWeight: 500, color: TEXT_DARK, margin: '0 0 4px' }}>
        {auth.agente.nombre}
      </p>
      <p style={{ fontFamily: R, fontSize: 13, fontWeight: 400, color: TEXT_SOFT, margin: '0 0 4px' }}>
        {auth.agente.rol} Mat. N.º {auth.agente.matricula}
      </p>
      <p style={{ fontFamily: R, fontSize: 13, fontWeight: 400, color: TEXT_SOFT, margin: 0 }}>
        SI INMOBILIARIA · siinmobiliaria.com
      </p>

      <div
        style={{
          marginTop: 32,
          textAlign: 'center',
          color: TEXT_MUTED,
          fontFamily: R,
          fontSize: 11,
          lineHeight: 1.6,
        }}
      >
        SI INMOBILIARIA · Funes · Roldán · Rosario
        <br />
        siinmobiliaria.com
      </div>
    </div>
  )
}
