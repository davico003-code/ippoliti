'use client'

// Shared sticky right column for desktop: WhatsApp + Call + Agent + Share + Visit.
import { MessageCircle, Phone } from 'lucide-react'
import {
  type TokkoProperty,
  getOperationType,
  generatePropertySlug,
  formatPrice,
} from '@/lib/tokko'
import ShareButtons from '../ShareButtons'
import VisitWidget from '../VisitWidget'
import TourMeetWidget from './TourMeetWidget'

const TOUR_MEET_USD_THRESHOLD = 450_000

function getUsdPrice(property: TokkoProperty): number {
  const op = property.operations?.[0]
  if (!op?.prices) return 0
  const usd = op.prices.find(p => p.currency === 'USD')
  return usd?.price ?? 0
}

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
  const isVenta = operation === 'Venta'
  const usdPrice = getUsdPrice(property)
  const isPremiumSale = isVenta && usdPrice >= TOUR_MEET_USD_THRESHOLD
  const propertyTitle = property.publication_title || address
  const propertyUrl = `https://siinmobiliaria.com/propiedades/${slug}`

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
              {(() => {
                const producer = property.producer
                const name = producer?.name?.trim() || 'SI Inmobiliaria'
                const subtitle = producer?.email?.trim() || 'Equipo SI Inmobiliaria'
                const initials = name
                  .split(/\s+/)
                  .filter(Boolean)
                  .slice(0, 2)
                  .map(s => s[0])
                  .join('')
                  .toUpperCase() || 'SI'
                return (
                  <>
                    {producer?.picture ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={producer.picture}
                        alt={name}
                        width={44}
                        height={44}
                        className="w-11 h-11 rounded-full object-cover flex-shrink-0 bg-gray-100"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                        style={{ background: GREEN, fontFamily: R }}
                      >
                        {initials}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <span style={{ fontFamily: R, fontWeight: 700, fontSize: 16, color: '#111', display: 'block' }}>{name}</span>
                      <span className="text-xs text-gray-400 block truncate">{subtitle}</span>
                    </div>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider flex-shrink-0"
                      style={{ background: '#e7f2eb', color: GREEN }}
                    >
                      Asesor
                    </span>
                  </>
                )
              })()}
            </div>
          </div>

          <ShareButtons
            slug={slug}
            title={property.publication_title || address}
            placaHref={`/propiedades/${slug}/placa`}
          />
        </div>

        {operation?.toLowerCase().includes('venta') && (
          <VisitWidget propertyId={property.id} propertyTitle={propertyTitle} />
        )}

        {isPremiumSale && (
          <TourMeetWidget
            propertyId={property.id}
            propertyTitle={propertyTitle}
            propertyPrice={formatPrice(property)}
            propertyUrl={propertyUrl}
          />
        )}
      </div>
    </div>
  )
}
