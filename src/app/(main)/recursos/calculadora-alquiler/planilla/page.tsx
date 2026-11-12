import { Suspense } from 'react'
import type { Metadata } from 'next'
import QRCode from 'qrcode'
import PlanillaPrintable from './PlanillaPrintable'
import { WHATSAPP_URL } from './contacto'

export const metadata: Metadata = {
  title: 'Planilla de costos — SI INMOBILIARIA',
  robots: { index: false, follow: false },
}

export default async function PlanillaPage() {
  // QR precomputado server-side (como el kiosco): SVG nítido al imprimir y la
  // librería no viaja al bundle del cliente.
  let qrSvg = ''
  try {
    qrSvg = await QRCode.toString(WHATSAPP_URL, {
      type: 'svg',
      margin: 0,
      errorCorrectionLevel: 'M',
      color: { dark: '#1C1C1E', light: '#0000' },
    })
  } catch { /* sin QR si falla: el número queda en la tarjeta */ }

  return (
    <Suspense fallback={null}>
      <PlanillaPrintable qrSvg={qrSvg} />
    </Suspense>
  )
}
