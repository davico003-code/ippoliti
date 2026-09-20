// Landing de emprendimiento pensada como funnel, todo a ancho completo:
//   1. Hero        → atención (render a pantalla + precio desde + 2 accesos)
//   2. Datos clave → califica rápido (precio, tipologías, superficie, plan)
//   3. Proyecto    → interés
//   4. Galería     → deseo
//   5. Unidades    → lista de precios simple
//   6. Financiación→ saca la objeción del pago
//   7. Amenities / Ubicación → refuerzo
//   8. Contacto    → acción (agendar visita + WhatsApp)
// No hay columna lateral: el contacto vive en el cierre y en el FAB, que lleva
// el mensaje precargado del emprendimiento (un solo WhatsApp persistente).

import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, CalendarCheck, CheckCircle2, MapPin, MessageCircle, Phone } from 'lucide-react'
import {
  generateDevSlug,
  getDevMainPhoto,
  translateDevType,
  translateTag,
  type Development,
  type DevUnit,
} from '@/lib/developments'
import { estructurarDescripcion } from '@/lib/devDescripcion'
import DevUnitsSection from '@/components/DevUnitsSection'
import PhotoGalleryLazy from '@/components/PhotoGalleryLazy'
import PropertyMapLazy from '@/components/PropertyMapLazy'
import NearbyPlacesLazy from '@/components/NearbyPlacesLazy'
import ShareButtons from '@/components/ShareButtons'
import VisitWidget from '@/components/VisitWidget'
import WhatsAppCta from './WhatsAppCta'

export interface FunnelMedia {
  /** Hero a pantalla (desktop) y su recorte vertical para celular. */
  hero?: string | null
  heroMobile?: string
  /** Imagen que acompaña "El proyecto". */
  proyecto?: string
  /** Aérea real de la zona, para "Ubicación". */
  ubicacion?: string
}

interface Props {
  dev: Development
  slug: string
  displayName: string
  typeName: string
  status: string
  locationName: string
  /** Líneas de la descripción (ya sin HTML y con los fixes de SEO). */
  lineas: string[]
  photos: string[]
  media: FunnelMedia
  units: DevUnit[]
  otherDevs: Development[]
  whatsappUrl: string
}

const CONTAINER = 'mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-12'
const EYEBROW = 'text-[13px] font-bold uppercase tracking-[0.14em] text-[#1A5C38]'
const H2 = 'text-balance text-[clamp(28px,3.6vw,48px)] font-black leading-[1.05] tracking-[-0.02em] text-gray-900'

// Regla de marca: Raleway para texto, Poppins solo para cifras. El copy del CRM
// mezcla ambos ("Entrega 20% y saldo en 36 cuotas"), así que se envuelve cada
// cifra en vez de pasar toda la línea a Poppins.
function conCifras(texto: string): ReactNode[] {
  return texto.split(/(\d[\d.,]*\s?(?:%|m²)?)/g).map((parte, i) =>
    i % 2 === 1 ? <span key={i} className="font-numeric">{parte}</span> : parte,
  )
}

function rango(valores: number[], sufijo: string): string | null {
  const v = valores.filter(n => n > 0).sort((a, b) => a - b)
  if (v.length === 0) return null
  const min = v[0].toLocaleString('es-AR')
  const max = v[v.length - 1].toLocaleString('es-AR')
  return min === max ? `${min} ${sufijo}` : `${min} a ${max} ${sufijo}`
}

export default function EmprendimientoFunnel({
  dev, slug, displayName, typeName, status, locationName, lineas, photos, media, units, otherDevs, whatsappUrl,
}: Props) {
  const desc = estructurarDescripcion(lineas)
  const pageUrl = `https://siinmobiliaria.com/emprendimientos/${slug}`

  // Datos clave derivados de las unidades vivas (nunca hardcodeados).
  const precios = units
    .map(u => u.operations?.[0]?.prices?.[0])
    .filter((p): p is { price: number; currency: string } => !!p && p.price > 0)
    .sort((a, b) => a.price - b.price)
  const desde = precios[0] ? `${precios[0].currency || 'USD'} ${precios[0].price.toLocaleString('es-AR')}` : null
  const dormitorios = rango(units.map(u => u.suite_amount || u.room_amount || 0), 'dorm.')
  const superficies = rango(
    units.map(u => parseFloat(u.roofed_surface || u.total_surface || u.surface || '0') || 0),
    'm²',
  )

  const datos = [
    desde ? { label: 'Desde', value: desde } : { label: 'Tipología', value: typeName },
    dormitorios ? { label: 'Tipologías', value: dormitorios } : { label: 'Estado', value: status },
    superficies ? { label: 'Superficies', value: superficies } : { label: 'Ubicación', value: dev.location?.name || 'Consultar' },
    { label: 'Financiación', value: dev.financing_details || 'Consultar' },
  ]

  const heroSrc = media.hero ?? photos[0] ?? null
  const fotoProyecto = media.proyecto ?? photos[1] ?? null
  const tags = (dev.tags || []).filter(t => t.name !== 'Venta directa' && t.name !== 'Direct sale')
  const video = dev.videos?.[0]
  const videoUrl =
    video?.provider === 'youtube' && video.player_url
      ? video.player_url.startsWith('https://www.youtube.com/embed/')
        ? video.player_url
        : `https://www.youtube.com/embed/${video.video_id}`
      : null
  const tieneFinanciacion = !!dev.financing_details || desc.financiacion.pasos.length > 0
  const direccion = dev.fake_address || dev.address

  return (
    <>
      {/* ── 1. Hero ─────────────────────────────────────────────── */}
      <section className="relative isolate flex min-h-[78svh] w-full items-end overflow-hidden bg-[#0f2a1c] md:min-h-[88vh]">
        {heroSrc && (
          <picture>
            {media.heroMobile && <source media="(max-width: 768px)" srcSet={media.heroMobile} />}
            <Image src={heroSrc} alt={displayName} fill priority sizes="100vw" className="object-cover" />
          </picture>
        )}
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(8,24,16,.9)_0%,rgba(8,24,16,.5)_38%,rgba(8,24,16,.05)_70%)]" />

        <div className={`${CONTAINER} relative z-[1] pb-10 pt-40 md:pb-16`}>
          <div className="mb-5 flex flex-wrap gap-2">
            <span className="rounded-full bg-[#1A5C38] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-white">
              {typeName}
            </span>
            <span className="rounded-full bg-white/90 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-[#1A5C38]">
              {status}
            </span>
          </div>
          <h1 className="max-w-[16ch] text-balance text-[clamp(40px,6.4vw,88px)] font-black leading-[0.98] tracking-[-0.03em] text-white">
            {displayName}
          </h1>
          <p className="mt-5 flex items-center gap-2 text-base font-medium text-white/85 md:text-lg">
            <MapPin className="h-5 w-5 shrink-0" aria-hidden />
            {locationName}
          </p>
          {desde && (
            <p className="mt-6 text-lg text-white/85 md:text-xl">
              Unidades desde{' '}
              <span className="font-numeric text-2xl font-bold text-white md:text-3xl">{desde}</span>
            </p>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#unidades"
              className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-white px-8 text-[15px] font-bold text-[#1A5C38] transition-colors hover:bg-gray-100"
            >
              Ver unidades y precios
              <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
            <a
              href="#contacto"
              className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full border-2 border-white/70 px-8 text-[15px] font-bold text-white transition-colors hover:bg-white/10"
            >
              <CalendarCheck className="h-4 w-4" aria-hidden />
              Agendar visita
            </a>
          </div>
        </div>
      </section>

      {/* ── 2. Datos clave ──────────────────────────────────────── */}
      <section className="border-b border-gray-200 bg-white">
        <dl className={`${CONTAINER} grid grid-cols-2 lg:grid-cols-4`}>
          {datos.map((d, i) => (
            <div
              key={d.label}
              className={`py-6 md:py-8 ${i % 2 === 1 ? 'pl-5 lg:pl-8' : 'pr-5 lg:pr-8'} ${
                i > 0 ? 'lg:border-l lg:border-gray-200 lg:pl-8' : ''
              } ${i >= 2 ? 'border-t border-gray-200 lg:border-t-0' : ''}`}
            >
              <dt className="text-xs font-bold uppercase tracking-[0.12em] text-gray-400">{d.label}</dt>
              <dd className="mt-1.5 text-pretty text-lg font-bold leading-snug text-gray-900 md:text-[22px]">
                {conCifras(d.value)}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ── 3. El proyecto ──────────────────────────────────────── */}
      {(desc.presentacion.length > 0 || desc.bloques.length > 0) && (
        <section id="proyecto" className="bg-white">
          <div className="grid lg:grid-cols-2">
            <div className="flex items-center px-5 py-14 sm:px-8 md:py-20 lg:justify-end lg:px-12">
              <div className="w-full max-w-[600px]">
                <p className={EYEBROW}>El proyecto</p>
                <h2 className={`${H2} mt-3`}>Sobre {displayName.split(' - ')[0]}</h2>
                <div className="mt-6 space-y-4">
                  {desc.presentacion.map((p, i) => (
                    <p key={i} className={`text-pretty leading-relaxed ${i === 0 ? 'text-lg text-gray-800 md:text-xl' : 'text-base text-gray-600 md:text-[17px]'}`}>
                      {conCifras(p)}
                    </p>
                  ))}
                </div>
              </div>
            </div>
            {fotoProyecto && (
              <div className="relative min-h-[320px] lg:min-h-[640px]">
                <Image
                  src={fotoProyecto}
                  alt={`${displayName} — vista del proyecto`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            )}
          </div>

          {desc.bloques.length > 0 && (
            <div className="border-t border-gray-200 bg-gray-50">
              <div className={`${CONTAINER} grid gap-10 py-14 md:grid-cols-2 md:gap-16 md:py-20`}>
                {desc.bloques.map(b => (
                  <div key={b.titulo}>
                    <h3 className="text-2xl font-black tracking-[-0.01em] text-gray-900 md:text-[28px]">{b.titulo}</h3>
                    <ul className="mt-5 space-y-3.5">
                      {b.lineas.map((l, i) => (
                        <li key={i} className="flex gap-3 text-base leading-relaxed text-gray-700 md:text-[17px]">
                          <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#1A5C38]" aria-hidden />
                          <span>{conCifras(l)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ── 4. Galería ──────────────────────────────────────────── */}
      {photos.length > 1 && (
        <section id="galeria" className="bg-white pt-14 md:pt-20">
          <div className={`${CONTAINER} mb-8 flex items-end justify-between gap-4`}>
            <div>
              <p className={EYEBROW}>Galería</p>
              <h2 className={`${H2} mt-3`}>Así se vive</h2>
            </div>
            <p className="shrink-0 text-sm text-gray-400">
              <span className="font-numeric">{photos.length}</span> fotos
            </p>
          </div>
          <PhotoGalleryLazy photos={photos} alt={displayName} variant="mosaico" />
        </section>
      )}

      {/* Video */}
      {videoUrl && (
        <section className="bg-white pt-14 md:pt-20">
          <div className="mx-auto w-full max-w-[1100px] px-5 sm:px-8">
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black">
              <iframe
                src={videoUrl}
                title={video?.title || displayName}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
          </div>
        </section>
      )}

      {/* ── 5. Unidades ─────────────────────────────────────────── */}
      <section id="unidades" className="scroll-mt-20 bg-white py-14 md:py-20">
        <div className="mx-auto w-full max-w-[1100px] px-5 sm:px-8">
          <p className={EYEBROW}>Disponibilidad</p>
          <h2 className={`${H2} mt-3`}>Unidades y precios</h2>
          {units.length > 0 && (
            <p className="mb-8 mt-3 text-base text-gray-500">
              <span className="font-numeric">{units.length}</span> unidad{units.length !== 1 ? 'es' : ''} en venta, con
              precios actualizados.
            </p>
          )}
          <div className={units.length === 0 ? 'mt-8' : ''}>
            <DevUnitsSection
              units={units}
              devName={displayName}
              whatsappUrl={whatsappUrl}
              location={dev.location?.name}
              pageUrl={pageUrl}
            />
          </div>
        </div>
      </section>

      {/* ── 6. Financiación ─────────────────────────────────────── */}
      {tieneFinanciacion && (
        <section id="financiacion" className="bg-[#1A5C38] text-white">
          <div className={`${CONTAINER} py-14 md:py-20`}>
            <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-white/70">Financiación</p>
            <h2 className="mt-3 max-w-[22ch] text-balance text-[clamp(28px,3.6vw,48px)] font-black leading-[1.05] tracking-[-0.02em]">
              {conCifras(dev.financing_details || 'Plan de pagos a tu medida')}
            </h2>

            {desc.financiacion.pasos.length > 0 && (
              <ol className="mt-10 grid gap-px overflow-hidden rounded-2xl bg-white/20 sm:grid-cols-3">
                {desc.financiacion.pasos.map((p, i) => (
                  <li key={p.etiqueta} className="bg-[#1A5C38] p-6 md:p-8">
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/60">
                      <span className="font-numeric">{i + 1}</span> · {p.etiqueta}
                    </p>
                    <p className="mt-2 text-pretty text-2xl font-bold leading-tight md:text-[28px]">{conCifras(p.valor)}</p>
                  </li>
                ))}
              </ol>
            )}

            <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-[70ch] space-y-2">
                {desc.financiacion.texto.map((t, i) => (
                  <p key={i} className="text-pretty text-base leading-relaxed text-white/85">{conCifras(t)}</p>
                ))}
              </div>
              <a
                href="#contacto"
                className="inline-flex min-h-[52px] shrink-0 items-center justify-center gap-2 rounded-full bg-white px-8 text-[15px] font-bold text-[#1A5C38] transition-colors hover:bg-gray-100"
              >
                Quiero que me asesoren
                <ArrowRight className="h-4 w-4" aria-hidden />
              </a>
            </div>
          </div>
        </section>
      )}

      {/* ── 7a. Amenities ───────────────────────────────────────── */}
      {(desc.amenities.length > 0 || tags.length > 0) && (
        <section id="amenities" className="bg-white py-14 md:py-20">
          <div className={CONTAINER}>
            <p className={EYEBROW}>Amenities y servicios</p>
            <h2 className={`${H2} mt-3`}>Todo resuelto, sin salir</h2>

            {desc.amenities.length > 0 && (
              <ul className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-gray-200 bg-gray-200 sm:grid-cols-2 lg:grid-cols-3">
                {desc.amenities.map((a, i) => (
                  <li key={i} className="flex items-start gap-3 bg-white p-6 text-[17px] font-semibold leading-snug text-gray-900">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#1A5C38]" aria-hidden />
                    {a.replace(/\.$/, '')}
                  </li>
                ))}
              </ul>
            )}

            {tags.length > 0 && (
              <ul className="mt-8 flex flex-wrap gap-2.5">
                {tags.map(tag => (
                  <li key={tag.id} className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
                    {translateTag(tag.name)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {/* ── 7b. Ubicación ───────────────────────────────────────── */}
      {dev.geo_lat && dev.geo_long && (
        <section id="ubicacion" className="bg-gray-50 py-14 md:py-20">
          <div className={CONTAINER}>
            <p className={EYEBROW}>Ubicación</p>
            <h2 className={`${H2} mt-3`}>{dev.location?.name || locationName}</h2>
            <p className="mt-4 flex items-start gap-2 text-base text-gray-600">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#1A5C38]" aria-hidden />
              <span>{direccion}{locationName ? `, ${locationName}` : ''}</span>
            </p>
            {desc.ubicacion.map((t, i) => (
              <p key={i} className="mt-4 max-w-[75ch] text-pretty text-base leading-relaxed text-gray-700 md:text-[17px]">{t}</p>
            ))}

            <div className={`mt-10 grid gap-4 ${media.ubicacion ? 'lg:grid-cols-2' : ''}`}>
              {media.ubicacion && (
                <div className="relative h-[280px] overflow-hidden rounded-xl md:h-[380px]">
                  <Image
                    src={media.ubicacion}
                    alt={`Vista aérea de la zona de ${displayName}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              )}
              <PropertyMapLazy lat={dev.geo_lat} lng={dev.geo_long} address={direccion} />
            </div>

            <div className="mt-12">
              <NearbyPlacesLazy lat={dev.geo_lat} lng={dev.geo_long} />
            </div>
          </div>
        </section>
      )}

      {/* ── 8. Contacto: el cierre del funnel ───────────────────── */}
      <section id="contacto" className="scroll-mt-20 border-t border-gray-200 bg-white py-14 md:py-20">
        <div className={`${CONTAINER} grid gap-10 lg:grid-cols-2 lg:gap-16`}>
          <div>
            <p className={EYEBROW}>Próximo paso</p>
            <h2 className={`${H2} mt-3`}>Conocé {displayName.split(' - ')[0]} en persona</h2>
            <div className="mt-5 max-w-[60ch] space-y-3">
              {(desc.cierre.length > 0
                ? desc.cierre
                : ['Coordinamos una visita, te mostramos las unidades disponibles y armamos el plan de pagos que mejor te quede.']
              ).map((t, i) => (
                <p key={i} className="text-pretty text-base leading-relaxed text-gray-600 md:text-[17px]">{t}</p>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <WhatsAppCta
                href={whatsappUrl}
                devId={dev.id}
                devName={displayName}
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-[#25D366] px-7 text-[15px] font-bold text-white transition-colors hover:bg-[#1ea952]"
              >
                <MessageCircle className="h-5 w-5" aria-hidden />
                Consultar por WhatsApp
              </WhatsAppCta>
              <a
                href="tel:+5493413340916"
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full border-2 border-gray-200 px-7 text-[15px] font-bold text-gray-700 transition-colors hover:bg-gray-50"
              >
                <Phone className="h-5 w-5" aria-hidden />
                <span className="font-numeric">(341) 334-0916</span>
              </a>
            </div>

            <div className="mt-8 flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1A5C38] text-sm font-bold text-white">
                DF
              </div>
              <div>
                <span className="block text-sm font-bold text-gray-900">David Flores</span>
                <span className="text-xs text-gray-500">
                  Corredor inmobiliario · Mat. N° <span className="font-numeric">0621</span>
                </span>
              </div>
            </div>

            {/* Sin placaHref: la placa de emprendimientos necesita su propio adapter. */}
            <div className="max-w-sm">
              <ShareButtons slug={`emprendimientos/${slug}`} title={displayName} />
            </div>
          </div>

          <div className="lg:justify-self-end lg:w-full lg:max-w-[520px]">
            <VisitWidget
              propertyId={dev.id}
              propertyTitle={displayName}
              propertyUrl={pageUrl}
              source="emprendimiento"
            />
          </div>
        </div>
      </section>

      {/* Otros emprendimientos */}
      <section className="bg-gray-50 py-14 md:py-16">
        <div className={CONTAINER}>
          {otherDevs.length > 0 && (
            <>
              <h2 className="mb-6 text-2xl font-black tracking-[-0.01em] text-gray-900">Otros emprendimientos</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {otherDevs.map(d => {
                  const photo = getDevMainPhoto(d)
                  return (
                    <Link
                      key={d.id}
                      href={`/emprendimientos/${generateDevSlug(d)}`}
                      className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition-shadow hover:shadow-md"
                    >
                      <div className="relative h-56 overflow-hidden bg-gray-100">
                        {photo && (
                          <Image
                            src={photo}
                            alt={d.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        )}
                      </div>
                      <div className="p-5">
                        <p className="mb-1 text-xs font-bold uppercase tracking-wider text-[#1A5C38]">
                          {translateDevType(d.type?.name || '')}
                        </p>
                        <h3 className="font-bold text-gray-900">{d.name}</h3>
                        <p className="mt-1 text-sm text-gray-500">{d.location?.name || d.address}</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </>
          )}
          <div className={otherDevs.length > 0 ? 'mt-10' : ''}>
            <Link
              href="/emprendimientos"
              className="inline-flex items-center gap-2 font-bold text-[#1A5C38] transition-colors hover:text-[#15472c]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden /> Volver a emprendimientos
            </Link>
          </div>
        </div>
      </section>

      {/* FAB propio: mismo lugar que el global (oculto en esta ruta), pero con
          el mensaje del emprendimiento ya escrito. */}
      <WhatsAppCta
        href={whatsappUrl}
        devId={dev.id}
        devName={displayName}
        fab
        ariaLabel={`Consultar por ${displayName} en WhatsApp`}
        className="si-tap fixed bottom-4 right-4 z-50 flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 text-[15px] font-bold text-white shadow-[0_4px_14px_0_rgba(37,211,102,0.39)] transition-colors hover:bg-[#128C7E] md:bottom-6 md:right-6"
      >
        <MessageCircle className="h-6 w-6" aria-hidden />
        Consultar
      </WhatsAppCta>
    </>
  )
}
