'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Image from '@/components/Imagen'
import { ArrowLeft, Check, Copy, Link2 } from 'lucide-react'
import StoryPlateMulti from './StoryPlateMulti'
import { lineaDatos, registrarCompartir, urlCompartible } from '@/lib/compartir'
import { copiarTexto } from '@/lib/share-ficha'
import { haptico } from '@/lib/haptico'
import { showToast } from '@/components/Toast'

const RALEWAY = "var(--font-raleway, 'Raleway'), system-ui, sans-serif"
const POPPINS = "var(--font-poppins, 'Poppins'), system-ui, sans-serif"

export interface PlacaPhoto {
  thumb: string
  full: string
}

interface Props {
  slug: string
  photos: PlacaPhoto[]
  blueprints: PlacaPhoto[]
  title: string
  price: string
  operation: string
  propertyType: string
  area: number | null
  rooms: number
  bathrooms: number
  lotSurface: number | null
  parking: number
  city: string | null
  neighborhood: string | null
  locationLabel: string
  addressLine: string
}

export default function PlacaSelectorClient(props: Props) {
  const [selected, setSelected] = useState<string[]>([])
  const [copiado, setCopiado] = useState<'texto' | 'link' | null>(null)
  const timerCopiado = useRef<ReturnType<typeof setTimeout>>()
  useEffect(() => () => clearTimeout(timerCopiado.current), [])

  // Lo que acompaña a la placa al publicarla (25-oct): antes el agente escribía
  // el copy a mano y el sticker de link de la story llegaba sin atribución
  // ("directo" en GA4). Un toque para cada uno.
  const linkSticker = urlCompartible(`/propiedades/${props.slug}`, 'placa', 'ficha')
  const zona = [props.neighborhood, props.city].filter(Boolean).join(', ')
  const datos = [
    props.rooms > 0 ? `${props.rooms} dorm.` : null,
    props.bathrooms > 0 ? `${props.bathrooms} ${props.bathrooms === 1 ? 'baño' : 'baños'}` : null,
    props.area ? `${props.area} m²` : null,
  ].filter(Boolean).slice(0, 2).join(' · ')
  const textoPosteo = [
    props.title,
    lineaDatos({ precio: props.price, ubicacion: zona }),
    datos,
    'Escribinos por DM o entrá al link de la bio.',
  ].filter(Boolean).join('\n')

  // Dentro del toque (copiarTexto llama al portapapeles en el acto). "Copiado"
  // solo si de verdad se copió.
  function copiar(que: 'texto' | 'link') {
    const valor = que === 'texto' ? textoPosteo : linkSticker
    void copiarTexto(valor).then((ok) => {
      if (!ok) {
        showToast('No se pudo copiar: mantené apretado el texto para copiarlo a mano.', { variant: 'error', duration: 6000 })
        return
      }
      haptico()
      if (que === 'link') registrarCompartir('placa', 'ficha')
      setCopiado(que)
      clearTimeout(timerCopiado.current)
      timerCopiado.current = setTimeout(() => setCopiado(null), 2000)
    })
  }

  const toggle = (full: string) => {
    setSelected(prev => {
      if (prev.includes(full)) return prev.filter(x => x !== full)
      if (prev.length >= 2) return prev
      return [...prev, full]
    })
  }

  // Preview always shows something: empty selection → first available image
  // (photos primero, planos como fallback si no hay fotos)
  const firstAvailable = props.photos[0] || props.blueprints[0]
  // Memo: un array nuevo en cada render cambiaba renderPlate y redibujaba la
  // placa entera (y descartaba el PNG ya preparado para compartir) con cualquier
  // re-render, por ejemplo al tocar "Copiar texto".
  const primeraFull = firstAvailable?.full
  const previewPhotos = useMemo(
    () => (selected.length > 0 ? selected : primeraFull ? [primeraFull] : []),
    [selected, primeraFull],
  )

  const counterTone =
    selected.length === 0
      ? 'bg-gray-100 text-gray-500'
      : selected.length === 1
        ? 'bg-[#e7f2eb] text-[#1A5C38]'
        : 'bg-amber-100 text-amber-800'

  const sharedPlateProps = {
    title: props.title,
    price: props.price,
    operation: props.operation,
    propertyType: props.propertyType,
    area: props.area,
    rooms: props.rooms,
    bathrooms: props.bathrooms,
    lotSurface: props.lotSurface,
    parking: props.parking,
    city: props.city ?? undefined,
    neighborhood: props.neighborhood ?? undefined,
    address: props.addressLine,
  }

  const renderThumb = (p: PlacaPhoto) => {
    const idx = selected.indexOf(p.full)
    const isSelected = idx >= 0
    const isFull = !isSelected && selected.length >= 2
    return (
      <button
        key={p.full}
        type="button"
        onClick={() => toggle(p.full)}
        disabled={isFull}
        aria-pressed={isSelected}
        className={`relative aspect-square overflow-hidden rounded-xl bg-gray-100 transition-all ${
          isSelected
            ? 'ring-4 ring-[#1A5C38]'
            : 'ring-1 ring-gray-200 hover:ring-gray-400'
        } ${isFull ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <Image
          src={p.thumb}
          alt=""
          fill
          sizes="(max-width: 768px) 50vw, 33vw"
          className="object-cover"
          unoptimized
        />
        {isSelected && (
          <span
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#1A5C38] text-white text-sm font-bold flex items-center justify-center shadow-md"
            style={{ fontFamily: POPPINS }}
          >
            {idx + 1}
          </span>
        )}
      </button>
    )
  }

  const downloadBtnStyle: React.CSSProperties = {
    width: '100%',
    height: 50,
    borderRadius: 14,
    border: 'none',
    fontSize: 15,
    fontWeight: 700,
    fontFamily: RALEWAY,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    letterSpacing: '0.02em',
  }

  return (
    <div className="min-h-screen bg-[#F4F6F5]">
      {/* Topbar sticky */}
      <header
        className="sticky top-0 z-40 border-b border-gray-200"
        style={{
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          background: 'rgba(255,255,255,0.92)',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between gap-3">
          <Link
            href={`/propiedades/${props.slug}`}
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-[#1A5C38] transition-colors"
            style={{ fontFamily: RALEWAY }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver</span>
          </Link>
          <h1
            className="font-bold text-base text-gray-900 truncate text-center flex-1 mx-2"
            style={{ fontFamily: RALEWAY }}
          >
            Crear placa
          </h1>
          <span
            className={`flex items-center justify-center min-w-[58px] h-8 rounded-full px-3 text-sm font-bold tabular-nums transition-colors ${counterTone}`}
            style={{ fontFamily: POPPINS }}
            aria-live="polite"
          >
            {selected.length} / 2
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-5 pb-44 md:pb-12">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] gap-6 md:gap-8">
          {/* Left: image grid (photos + blueprints) */}
          <section>
            <p
              className="text-[11px] text-gray-500 mb-3 uppercase tracking-[0.15em] font-bold"
              style={{ fontFamily: POPPINS }}
            >
              Elegí 1 o 2 imágenes
            </p>

            {props.photos.length > 0 && (
              <>
                <p
                  className="text-[10px] text-gray-400 mb-2 uppercase tracking-[0.12em] font-bold"
                  style={{ fontFamily: POPPINS }}
                >
                  Fotos
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
                  {props.photos.map(p => renderThumb(p))}
                </div>
              </>
            )}

            {props.blueprints.length > 0 && (
              <>
                <p
                  className="text-[10px] text-gray-400 mb-2 uppercase tracking-[0.12em] font-bold"
                  style={{ fontFamily: POPPINS }}
                >
                  Planos
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {props.blueprints.map(p => renderThumb(p))}
                </div>
              </>
            )}

            {props.photos.length === 0 && props.blueprints.length === 0 && (
              <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
                <p className="text-sm text-gray-500">Esta propiedad no tiene fotos ni planos disponibles.</p>
              </div>
            )}
          </section>

          {/* Right: info + preview + download */}
          <aside>
            <div className="md:sticky md:top-[72px] space-y-4">
              {/* Property info */}
              <div className="bg-white border border-gray-200 rounded-2xl p-4">
                <p
                  className="text-[11px] uppercase tracking-[0.15em] text-gray-500 font-bold mb-1"
                  style={{ fontFamily: POPPINS }}
                >
                  {props.locationLabel}
                </p>
                <h2
                  className="font-bold text-base text-gray-900 leading-tight"
                  style={{ fontFamily: RALEWAY }}
                >
                  {props.title}
                </h2>
                <p
                  className="font-bold text-lg text-[#1A5C38] mt-2 tabular-nums"
                  style={{ fontFamily: POPPINS }}
                >
                  {props.price}
                </p>
              </div>

              <StoryPlateMulti
                {...sharedPlateProps}
                slug={props.slug}
                photos={previewPhotos}
                disabled={selected.length === 0}
                buttonLabel="Descargar placa"
                btnStyle={downloadBtnStyle}
              />

              {/* Para publicar: el texto del posteo y el link del sticker de la story. */}
              <div className="bg-white border border-gray-200 rounded-2xl p-4">
                <p
                  className="text-[11px] uppercase tracking-[0.15em] text-gray-500 font-bold mb-2"
                  style={{ fontFamily: POPPINS }}
                >
                  Para publicar
                </p>
                <p
                  className="whitespace-pre-line select-all rounded-xl bg-gray-50 px-3 py-2.5 text-[13px] leading-relaxed text-gray-800"
                  style={{ fontFamily: RALEWAY }}
                >
                  {textoPosteo}
                </p>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-1">
                  <button
                    type="button"
                    onClick={() => copiar('texto')}
                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-[13.5px] font-semibold text-gray-900 transition active:scale-[0.98] hover:border-[#1A5C38]"
                    style={{ fontFamily: RALEWAY }}
                  >
                    {copiado === 'texto' ? <Check className="h-4 w-4 text-[#1A5C38]" strokeWidth={2.6} /> : <Copy className="h-4 w-4" />}
                    {copiado === 'texto' ? 'Texto copiado' : 'Copiar texto del posteo'}
                  </button>
                  <button
                    type="button"
                    onClick={() => copiar('link')}
                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-[13.5px] font-semibold text-gray-900 transition active:scale-[0.98] hover:border-[#1A5C38]"
                    style={{ fontFamily: RALEWAY }}
                  >
                    {copiado === 'link' ? <Check className="h-4 w-4 text-[#1A5C38]" strokeWidth={2.6} /> : <Link2 className="h-4 w-4" />}
                    {copiado === 'link' ? 'Link copiado' : 'Copiar link para el sticker'}
                  </button>
                </div>
                <p className="mt-2 truncate text-[11px] text-gray-400" style={{ fontFamily: RALEWAY }} title={linkSticker}>
                  {linkSticker}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
