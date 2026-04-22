'use client'

// Shared sticky right column for desktop: WhatsApp + Call + Agent + Share + Visit.
import { MessageCircle, Phone } from 'lucide-react'
import {
  type TokkoProperty,
  getOperationType,
  generatePropertySlug,
} from '@/lib/tokko'
import ShareButtons from '../ShareButtons'
import VisitWidget from '../VisitWidget'

const R = "'Raleway', system-ui, sans-serif"
const GREEN = '#1A5C38'

export default function PropertyDetailSidebar({
  property,
  whatsappUrl,
  /**
   * Offset from the top of the scroll container when sticky. Full page uses
   * 96 (header height). Modal panel uses 80 (modal header height).
   */
  topOffset = 96,
}: {
  property: TokkoProperty
  whatsappUrl: string
  topOffset?: number
}) {
  const operation = getOperationType(property)
  const slug = generatePropertySlug(property)
  const address = property.fake_address || property.address

  return (
    <div className="w-full md:w-[360px] md:shrink-0">
      <div className="md:sticky space-y-4" style={{ top: topOffset }}>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full font-semibold text-sm transition-colors mb-2.5"
            style={{ background: '#25d366', color: '#fff' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#1ab856' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#25d366' }}
          >
            <MessageCircle className="w-5 h-5" /> Consultar por WhatsApp
          </a>
          <a
            href="tel:+5493412101694"
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full font-semibold text-sm transition-colors mb-2.5"
            style={{ border: '1.5px solid #e5e7eb', color: '#111' }}
          >
            <Phone className="w-5 h-5" /> Llamar <span className="font-numeric">(341) 210-1694</span>
          </a>

          <div className="border-t border-gray-100 pt-4 mt-2.5">
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                style={{ background: GREEN, fontFamily: R }}
              >
                DF
              </div>
              <div className="flex-1 min-w-0">
                <span style={{ fontFamily: R, fontWeight: 700, fontSize: 16, color: '#111', display: 'block' }}>David Flores</span>
                <span className="text-xs text-gray-400">Mat. N° 0621</span>
              </div>
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
                style={{ background: '#e7f2eb', color: GREEN }}
              >
                Agente
              </span>
            </div>
          </div>

          <div className="border-t border-gray-100 mt-5 pt-4">
            <p className="text-xs text-gray-400 tracking-wider uppercase mb-3">Compartir propiedad</p>
            <ShareButtons
              slug={slug}
              title={property.publication_title || address}
              placaHref={`/propiedades/${slug}/placa`}
            />
          </div>
        </div>

        {operation?.toLowerCase().includes('venta') && (
          <VisitWidget propertyId={property.id} propertyTitle={property.publication_title || address} />
        )}
      </div>
    </div>
  )
}
