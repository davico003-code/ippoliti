'use client'

// Piezas compartidas por la vista del cliente de una selección: el mazo del
// celular, las tarjetas de la compu, la ficha en hoja y el cierre.

import Image from 'next/image'
import { BedDouble, Bath, Flame, Ruler } from 'lucide-react'
import AgenteAvatar from '@/components/property-detail/AgenteAvatar'
import { displayImageUrl } from '@/lib/external-images'
import { estiloSinLogo, type PosicionLogo } from '@/lib/feed-en-red'
import type { SeleccionItem } from '@/lib/seleccion'

export type ReactKey = 'encanta' | 'no'
export interface Reaction {
  liked?: boolean | null
  wantVisit?: boolean
  comment?: string
  reaction?: ReactKey | null
}
export type Decision = 'like' | 'nope' | 'visita'

export const VERDE = '#1A5C38'
export const VERDE_VIVO = '#00754A'
export const ROJO = '#F40009'
export const AMARILLO = '#fbce07'

export function isValidNote(note: string | undefined | null): boolean {
  return !!note && note.trim().length > 3
}

export function iniciales(nombre: string): string {
  const p = nombre.trim().split(/\s+/).filter(Boolean)
  return ((p[0]?.[0] ?? '') + (p[1]?.[0] ?? '')).toUpperCase() || nombre.slice(0, 2).toUpperCase()
}

export const primerNombre = (nombre: string) => nombre.trim().split(/\s+/)[0] ?? nombre

/** Tiene ficha para abrir adentro: la propia, la neutra, o una En red que HILO arma al abrirla. */
export const tieneFicha = (item: SeleccionItem) => !!item.fichaUrl || !!item.redId

/**
 * Las de otras inmobiliarias van marcadas "En red" (David: no hacerlas pasar
 * por nuestras). "Muy vista" = entre las más vistas de la zona en 30 días.
 * Mismo lenguaje que el feed En red de la ficha.
 */
export function ChipsRed({ item, sobreFoto = false }: { item: SeleccionItem; sobreFoto?: boolean }) {
  if (!item.enRed && !item.masVista) return null
  return (
    <span className="inline-flex items-center gap-1.5">
      {item.enRed && (
        <span className={`rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${sobreFoto ? 'bg-[#FFF4DE]/95' : 'bg-[#FFF4DE]'} text-[#8A5A00]`}>En red</span>
      )}
      {item.masVista && (
        <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11.5px] font-semibold text-[#111814]">
          <Flame className="h-3.5 w-3.5 text-[#F40009]" fill="#F40009" strokeWidth={1.5} /> Muy vista
        </span>
      )}
    </span>
  )
}

export const LINEA_EN_RED = 'Algunas las publican otras inmobiliarias. Te las mostramos y te coordinamos la visita nosotros.'

// Fotos que /_next/image puede optimizar (remotePatterns de next.config). Las
// de portales/proxy van directo, como en la ficha.
function optimizable(src: string): boolean {
  try {
    const u = new URL(src)
    const h = u.hostname
    return (
      h.endsWith('.supabase.co') ||
      h.endsWith('.public.blob.vercel-storage.com') ||
      h.endsWith('tokkobroker.com') ||
      // Red Propia en vivo (colegas de Rosario en las parecidas).
      h === 'propia-assets-v2.nyc3.cdn.digitaloceanspaces.com' ||
      h === 'propia-assets-v2.nyc3.digitaloceanspaces.com' ||
      (h === 'storage.googleapis.com' && u.pathname.startsWith('/portales-prod-images/'))
    )
  } catch {
    return false
  }
}

/**
 * `logo`: fotos de colegas con el logo impreso (MA, Crestale): se agranda un
 * poco desde la esquina opuesta y el logo queda afuera. El contenedor tiene
 * que tener overflow-hidden.
 */
export function Foto({
  src, alt, sizes, eager, onLoad, logo,
}: { src: string; alt: string; sizes: string; eager?: boolean; onLoad?: () => void; logo?: PosicionLogo | null }) {
  const url = displayImageUrl(src)
  return (
    <Image
      src={url}
      alt={alt}
      fill
      sizes={sizes}
      unoptimized={!optimizable(url)}
      loading={eager ? 'eager' : 'lazy'}
      draggable={false}
      onLoad={onLoad}
      className="pointer-events-none select-none object-cover"
      style={estiloSinLogo(logo)}
    />
  )
}

/** Dormitorios · baños · m², solo lo que hay. */
export function Specs({ item, className = '' }: { item: SeleccionItem; className?: string }) {
  const partes = [
    item.rooms > 0 && { icon: BedDouble, txt: `${item.rooms} dorm.` },
    item.baths > 0 && { icon: Bath, txt: `${item.baths} baño${item.baths > 1 ? 's' : ''}` },
    item.area > 0 && { icon: Ruler, txt: `${item.area.toLocaleString('es-AR')} m²` },
  ].filter(Boolean) as { icon: typeof BedDouble; txt: string }[]
  if (partes.length === 0) return null
  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 ${className}`}>
      {partes.map(({ icon: Icon, txt }) => (
        <span key={txt} className="font-numeric inline-flex items-center gap-1">
          <Icon className="h-3.5 w-3.5 opacity-70" strokeWidth={1.8} /> {txt}
        </span>
      ))}
    </div>
  )
}

export function Avatar({ foto, nombre, size }: { foto?: string | null; nombre: string; size: number }) {
  if (foto) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={foto} alt={nombre} width={size} height={size} className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />
    )
  }
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-[#EAF3EE] font-bold text-[#1A5C38]"
      style={{ width: size, height: size, fontSize: size * 0.34 }}
    >
      {iniciales(nombre)}
    </span>
  )
}

/**
 * La cara del asesor, grande (David, 6-oct: "la foto de Gisela más
 * protagonista"): con su video de saludo si lo tiene, como la burbuja de la
 * ficha. El cliente sabe con quién está hablando antes de mirar una casa.
 */
export function FotoAsesor({ foto, nombre, size }: { foto?: string | null; nombre: string; size: number }) {
  return (
    <AgenteAvatar
      name={nombre}
      picture={foto}
      initials={iniciales(nombre)}
      bg={VERDE}
      fontFamily="var(--font-raleway), Raleway, system-ui, sans-serif"
      size={size}
      conFoto
      className="shadow-[0_10px_30px_-12px_rgba(16,40,28,0.55)] ring-4 ring-white"
    />
  )
}
