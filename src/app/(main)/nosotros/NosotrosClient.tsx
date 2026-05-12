'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { Target, Eye, Gem, Navigation, Phone, MessageCircle, Clock } from 'lucide-react'
import HeroVideoNosotros from '@/components/nosotros/HeroVideoNosotros'

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const direccion = [
  {
    nombre: 'Susana Ippoliti',
    cargo: 'Fundadora',
    desc: 'Más de 40 años construyendo confianza en Roldán y Funes. Matrícula N° 0559 COCIR.',
    foto: '/team/susana-ippoliti.jpg',
  },
  {
    nombre: 'David Flores',
    cargo: 'Corredor Inmobiliario — Responsable Sucursal Funes',
    desc: 'Más de 15 años de experiencia. Matrícula N° 0621 COCIR.',
    foto: '/team/david-flores.jpg',
  },
  {
    nombre: 'Laura Flores',
    cargo: 'Corredora Inmobiliaria y Administradora de Empresas — Responsable Sucursal Roldán',
    desc: 'A cargo de la operación de la sucursal Roldán y la gestión integral del equipo.',
    foto: '/team/laura-flores.jpg',
  },
]

const historia = [
  { año: '1983', titulo: 'Fundación', desc: 'Susana Ippoliti abre la primera oficina en 1ro de Mayo 258, Roldán. Comienza una historia familiar de confianza y profesionalismo.' },
  { año: '2015', titulo: 'Segunda oficina en Roldán', desc: 'Apertura de la segunda oficina en Catamarca 775, Roldán. Consolidación como referente inmobiliario en la ciudad.' },
  { año: '2022', titulo: 'Expansión a Funes', desc: 'Aprobación del Concejo Deliberante de Funes para construir la nueva sede en Hipólito Yrigoyen 2643.' },
  { año: '2024', titulo: 'Oficina Funes + Galería + Rebranding', desc: 'Inauguración de la oficina en Funes, un espacio único que combina inmobiliaria con galería de arte. Nace SI Inmobiliaria.' },
]

const testimonios: { texto: string; nombre: string; etiqueta: string; antiguedad: string }[] = [
  { texto: 'Vendimos nuestra casa en tiempo récord gracias al equipo de SI. Profesionales de principio a fin.', nombre: 'Familia García', etiqueta: 'Local Guide · Roldán', antiguedad: 'hace 2 meses' },
  { texto: 'Encontramos el terreno ideal en Funes con su ayuda. Nos acompañaron en todo el proceso hasta la escritura.', nombre: 'Martín R.', etiqueta: 'Local Guide · Funes', antiguedad: 'hace 5 meses' },
  { texto: 'Profesionales, honestos y siempre disponibles. Más de 40 años de experiencia se notan en cada detalle.', nombre: 'Carolina S.', etiqueta: 'Local Guide · Fisherton', antiguedad: 'hace 8 meses' },
]

const GOOGLE_AVATAR_COLORS = ['#4285F4', '#EA4335', '#34A853', '#FBBC04']

function GoogleLogo() {
  return (
    <span
      aria-label="Google"
      className="select-none text-2xl md:text-3xl font-medium leading-none"
      style={{ fontFamily: 'Poppins, sans-serif' }}
    >
      <span style={{ color: '#4285F4' }}>G</span>
      <span style={{ color: '#EA4335' }}>o</span>
      <span style={{ color: '#FBBC04' }}>o</span>
      <span style={{ color: '#4285F4' }}>g</span>
      <span style={{ color: '#34A853' }}>l</span>
      <span style={{ color: '#EA4335' }}>e</span>
    </span>
  )
}

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  const stars = []
  const full = Math.floor(rating)
  const hasHalf = rating - full >= 0.4 && rating - full < 0.9
  for (let i = 0; i < 5; i++) {
    let fill = '#E0E0E0'
    if (i < full) fill = '#FBBC04'
    else if (i === full && hasHalf) fill = 'url(#half-star)'
    stars.push(
      <svg key={i} width={size} height={size} viewBox="0 0 24 24" aria-hidden>
        {i === full && hasHalf && (
          <defs>
            <linearGradient id="half-star">
              <stop offset="50%" stopColor="#FBBC04" />
              <stop offset="50%" stopColor="#E0E0E0" />
            </linearGradient>
          </defs>
        )}
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z"
          fill={fill}
        />
      </svg>
    )
  }
  return (
    <div className="inline-flex items-center gap-0.5" aria-label={`${rating} de 5 estrellas`}>
      {stars}
    </div>
  )
}

function SucursalRating({
  sucursal,
  rating,
  reseñas,
  href,
}: {
  sucursal: string
  rating: number
  reseñas: number
  href: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between gap-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors px-4 py-3"
    >
      <div>
        <p className="text-xs uppercase tracking-wide text-neutral-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
          {sucursal}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-lg font-bold tabular-nums text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {rating.toFixed(1).replace('.', ',')}
          </span>
          <Stars rating={rating} size={14} />
        </div>
      </div>
      <span className="text-xs text-neutral-500 whitespace-nowrap" style={{ fontFamily: 'Poppins, sans-serif' }}>
        {reseñas} reseñas
      </span>
    </a>
  )
}

function ReviewCard({
  review,
  idx,
}: {
  review: { texto: string; nombre: string; etiqueta: string; antiguedad: string }
  idx: number
}) {
  const color = GOOGLE_AVATAR_COLORS[idx % GOOGLE_AVATAR_COLORS.length]
  const initial = review.nombre.trim().charAt(0).toUpperCase()
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-6 flex flex-col shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-base font-semibold shrink-0"
          style={{ backgroundColor: color, fontFamily: 'Poppins, sans-serif' }}
          aria-hidden
        >
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-black truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {review.nombre}
          </p>
          <p className="text-xs text-neutral-500 truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {review.etiqueta}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <Stars rating={5} size={14} />
        <span className="text-xs text-neutral-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
          {review.antiguedad}
        </span>
      </div>
      <p className="text-sm text-neutral-700 leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
        {review.texto}
      </p>
    </div>
  )
}

const WHATSAPP_NUMBER = '5493412101694'
const TEL_FALLBACK = '+5493412101694'

// Coordenadas verificadas contra Nominatim (OpenStreetMap) — 2026-05-11
const oficinas = [
  {
    numero: '01',
    badge: 'Desde 1983',
    titulo: 'ROLDÁN — HISTÓRICA',
    subtitulo: 'Primera sucursal · 40 años de trayectoria',
    dir: 'Primero de Mayo 258, Roldán',
    horario: 'Lunes a Viernes · 9 a 17hs',
    maps: 'https://maps.google.com/?q=Primero+de+Mayo+258+Roldan+Santa+Fe',
    tel: TEL_FALLBACK,
    lat: -32.9012620,
    lng: -60.9106239,
  },
  {
    numero: '02',
    badge: 'Desde 2015',
    titulo: 'ROLDÁN — CENTRO',
    subtitulo: 'Oficina comercial principal',
    dir: 'Catamarca 775, Roldán',
    horario: 'Lunes a Viernes · 9 a 17hs',
    maps: 'https://maps.google.com/?q=Catamarca+775+Roldan+Santa+Fe',
    tel: TEL_FALLBACK,
    lat: -32.9054168,
    lng: -60.9097686,
  },
  {
    numero: '03',
    badge: 'Nuevo 2024',
    titulo: 'FUNES',
    subtitulo: 'Inmobiliaria + Galería de Arte',
    dir: 'Hipólito Yrigoyen 2643, Funes',
    horario: 'Lunes a Viernes · 9 a 17hs',
    maps: 'https://maps.google.com/?q=Hipolito+Yrigoyen+2643+Funes+Santa+Fe',
    tel: TEL_FALLBACK,
    lat: -32.9263523,
    lng: -60.8117412,
  },
]

const MAP_CENTER: [number, number] = [
  oficinas.reduce((s, o) => s + o.lat, 0) / oficinas.length,
  oficinas.reduce((s, o) => s + o.lng, 0) / oficinas.length,
]

function iniciales(nombre: string) {
  return nombre.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
}

type TokkoAgent = {
  id: number
  name: string
  email: string
  phone: string
  cellphone: string
  picture: string | null
  position: string
}

/* ─────────────────────────────────────────────
   MAP COMPONENT (Leaflet, lazy + interactivo)
───────────────────────────────────────────── */
/* eslint-disable @typescript-eslint/no-explicit-any */
function makePinIcon(L: any, n: number, active: boolean) {
  const size = active ? 44 : 32
  const fontSize = active ? 16 : 13
  const bg = active ? '#000000' : '#0A2818'
  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;border-radius:9999px;background:${bg};color:#fff;display:flex;align-items:center;justify-content:center;font-family:Poppins,sans-serif;font-weight:600;font-size:${fontSize}px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.35);transition:width 0.2s,height 0.2s,background 0.2s">${n}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 2)],
    className: '',
  })
}

function OficinasMapa({
  activeIdx,
  onPinClick,
}: {
  activeIdx: number | null
  onPinClick: (i: number) => void
}) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const LRef = useRef<any>(null)
  const onPinClickRef = useRef(onPinClick)
  onPinClickRef.current = onPinClick

  useEffect(() => {
    if (mapInstance.current || !mapRef.current) return
    let cancelled = false

    import('leaflet').then((L) => {
      if (cancelled || !mapRef.current) return
      LRef.current = L

      // @ts-expect-error leaflet icon hack
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current, {
        center: MAP_CENTER,
        zoom: 13,
        zoomControl: true,
        scrollWheelZoom: false,
      })
      mapInstance.current = map

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map)

      oficinas.forEach((o, idx) => {
        const marker = L.marker([o.lat, o.lng], { icon: makePinIcon(L, idx + 1, false) })
          .addTo(map)
          .bindPopup(
            `<div style="font-family:Poppins,sans-serif;min-width:180px;padding:4px 0">
              <p style="font-family:Raleway,sans-serif;font-weight:700;font-size:13px;letter-spacing:0.06em;margin:0 0 4px">${o.titulo}</p>
              ${o.subtitulo ? `<p style="font-size:11px;color:#888;margin:0 0 6px">${o.subtitulo}</p>` : ''}
              <p style="font-size:12px;color:#555;margin:0 0 2px">${o.dir}</p>
              <p style="font-size:12px;color:#555;margin:0 0 8px">${o.horario}</p>
              <div style="display:flex;gap:8px">
                <a href="${o.maps}" target="_blank" rel="noopener" style="font-size:11px;color:#000;font-weight:600;text-decoration:underline">Cómo llegar</a>
                <span style="color:#ccc">·</span>
                <a href="tel:${o.tel}" style="font-size:11px;color:#000;font-weight:600;text-decoration:underline">Llamar</a>
              </div>
            </div>`,
            { maxWidth: 240 }
          )
          .on('click', () => onPinClickRef.current(idx))
        markersRef.current[idx] = marker
      })
    })

    return () => {
      cancelled = true
      if (mapInstance.current) {
        ;(mapInstance.current as { remove: () => void }).remove()
        mapInstance.current = null
        markersRef.current = []
        LRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (activeIdx === null) return
    const map = mapInstance.current
    const L = LRef.current
    if (!map || !L) return
    const office = oficinas[activeIdx]
    map.flyTo([office.lat, office.lng], 16, { duration: 1 })
    markersRef.current.forEach((m, i) => {
      if (!m) return
      m.setIcon(makePinIcon(L, i + 1, i === activeIdx))
    })
    const target = markersRef.current[activeIdx]
    if (target) {
      const t = setTimeout(() => {
        try { target.openPopup() } catch { /* noop */ }
      }, 1050)
      return () => clearTimeout(t)
    }
  }, [activeIdx])

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossOrigin="" />
      <div
        ref={mapRef}
        className="w-full rounded-2xl overflow-hidden border border-neutral-200 shadow-md"
        style={{ height: 'clamp(400px, 60vh, 560px)' }}
      />
    </>
  )
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/* ─────────────────────────────────────────────
   TEAM CARD (Tokko-driven)
───────────────────────────────────────────── */
function TeamCard({ agent }: { agent: TokkoAgent }) {
  const [imgError, setImgError] = useState(false)
  const hasPhoto = agent.picture && !imgError
  return (
    <div className="group flex flex-col items-center text-center">
      <div className="relative w-32 h-32 sm:w-36 sm:h-36 mb-4 rounded-full overflow-hidden bg-black ring-1 ring-black/10 transition-transform duration-300 group-hover:scale-105">
        {hasPhoto ? (
          <Image
            src={agent.picture!}
            alt={agent.name}
            fill
            sizes="(min-width: 1024px) 144px, (min-width: 640px) 144px, 128px"
            className="object-cover object-center"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white text-xl tracking-wide" style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 600 }}>
            {iniciales(agent.name)}
          </div>
        )}
      </div>
      <p
        className="text-sm font-bold leading-tight mb-1 text-black group-hover:underline underline-offset-4 decoration-black"
        style={{ fontFamily: 'Raleway, sans-serif' }}
      >
        {agent.name}
      </p>
      {agent.position && (
        <p className="text-xs text-neutral-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
          {agent.position}
        </p>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   OFICINAS INTERACTIVAS
───────────────────────────────────────────── */
function OficinasInteractivas() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null)
  const mapWrapperRef = useRef<HTMLDivElement>(null)

  const handleCardActivate = (i: number) => {
    setActiveIdx(i)
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      mapWrapperRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  return (
    <section className="py-20 md:py-28 bg-neutral-50 text-black">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-sm uppercase tracking-widest text-neutral-500 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Dónde estamos
          </p>
          <h2 className="text-3xl md:text-5xl font-bold mb-5 text-black" style={{ fontFamily: 'Raleway, sans-serif' }}>
            Nuestras oficinas
          </h2>
          <div className="w-12 h-px bg-black mx-auto mb-5" />
          <p className="text-sm text-neutral-500 max-w-xl mx-auto" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Tres ubicaciones para atenderte mejor
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 items-start">
          {/* CARDS (verde oscuro sobre fondo claro) */}
          <div className="lg:col-span-2 flex flex-col gap-4 order-1 lg:order-none">
            {oficinas.map((o, idx) => {
              const active = activeIdx === idx
              return (
                <button
                  key={o.titulo}
                  type="button"
                  onMouseEnter={() => setActiveIdx(idx)}
                  onClick={() => handleCardActivate(idx)}
                  className={`text-left rounded-2xl p-5 md:p-6 transition-all duration-200 bg-[#0A2818] text-white border ${
                    active
                      ? 'border-white/40 shadow-xl ring-2 ring-black/20 scale-[1.01]'
                      : 'border-white/10 hover:border-white/25 hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <span
                      className="text-3xl font-light text-white/40 tabular-nums leading-none mt-1"
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                      aria-hidden
                    >
                      {o.numero}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3
                          className="text-base font-bold uppercase tracking-wide text-white"
                          style={{ fontFamily: 'Raleway, sans-serif' }}
                        >
                          {o.titulo}
                        </h3>
                        <span
                          className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-white/10 text-white/70"
                          style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                          {o.badge}
                        </span>
                      </div>
                      <p
                        className="text-xs text-white/60 mb-2"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                      >
                        {o.subtitulo}
                      </p>
                      <p
                        className="text-sm text-white/85 mb-2"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                      >
                        {o.dir}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-white/60 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        <Clock className="w-3.5 h-3.5" aria-hidden />
                        <span>{o.horario}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <a
                          href={o.maps}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs transition-colors"
                          style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                          <Navigation className="w-3.5 h-3.5" aria-hidden />
                          Cómo llegar
                        </a>
                        <a
                          href={`tel:${o.tel}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs transition-colors"
                          style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                          <Phone className="w-3.5 h-3.5" aria-hidden />
                          Llamar
                        </a>
                        <a
                          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                            `Hola, quería consultar por la sucursal ${o.titulo} (${o.dir}).`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs transition-colors"
                          style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                          <MessageCircle className="w-3.5 h-3.5" aria-hidden />
                          WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* MAPA */}
          <div className="lg:col-span-3 order-2 lg:order-none lg:sticky lg:top-24" ref={mapWrapperRef}>
            <OficinasMapa activeIdx={activeIdx} onPinClick={(i) => setActiveIdx(i)} />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
export default function NosotrosClient() {
  const [agents, setAgents] = useState<TokkoAgent[] | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/tokko/agents')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data?.agents) return
        setAgents(data.agents as TokkoAgent[])
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main className="bg-white text-gray-900">

      {/* HERO — solo imagen/video, sin texto encima */}
      <section className="relative h-[70vh] min-h-[480px] md:h-[80vh] md:min-h-[560px] overflow-hidden">
        {/* Imagen fija en mobile (poster) */}
        <Image
          src="/videos/hero-nosotros-poster.webp"
          alt="Equipo de SI Inmobiliaria"
          fill
          className="object-cover object-center md:hidden"
          priority
          sizes="100vw"
        />

        {/* Video de fondo en desktop */}
        <HeroVideoNosotros />

        {/* Fade inferior blanco — empalme con la sección de abajo */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-20 md:h-28 bg-gradient-to-t from-white via-white/50 to-transparent" />
      </section>

      {/* HEADLINE — bajo el hero */}
      <section className="bg-white pt-12 pb-16 md:pt-16 md:pb-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-3 mb-6">
            <span className="w-10 h-px bg-neutral-300" />
            <p
              className="text-xs uppercase tracking-widest text-neutral-500"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Quiénes somos
            </p>
            <span className="w-10 h-px bg-neutral-300" />
          </div>
          <h1
            className="text-3xl md:text-5xl lg:text-6xl font-bold text-black leading-tight"
            style={{ fontFamily: 'Raleway, sans-serif' }}
          >
            Desde 1983 acompañando<br className="hidden md:block" /> cada decisión importante
          </h1>
        </div>
      </section>

      {/* MISIÓN · VISIÓN · VALORES */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm uppercase tracking-widest text-neutral-500 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Nuestros principios</p>
            <h2 className="text-3xl md:text-5xl font-bold text-black mb-5" style={{ fontFamily: 'Raleway, sans-serif' }}>Misión, visión y valores</h2>
            <div className="w-12 h-px bg-black mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { titulo: 'Misión', texto: 'Acompañar a cada persona en su camino inmobiliario, brindando un asesoramiento honesto, cercano y profesional.', Icon: Target },
              { titulo: 'Visión', texto: 'Ser la inmobiliaria de referencia en Funes, Roldán y la región, reconocida por nuestra calidez humana, trayectoria y compromiso real con cada cliente.', Icon: Eye },
              { titulo: 'Valores', texto: 'Honestidad, compromiso y profesionalismo son los pilares que guían cada operación. Más de 40 años de trayectoria nos respaldan.', Icon: Gem },
            ].map(({ titulo, texto, Icon }) => (
              <div
                key={titulo}
                className="bg-neutral-50 rounded-2xl p-8 transition-all duration-300 hover:shadow-md hover:-translate-y-1 flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center mb-6 p-4">
                  <Icon className="w-full h-full text-white" strokeWidth={1.6} aria-hidden />
                </div>
                <h3
                  className="text-base font-semibold uppercase tracking-wide mb-3 text-black"
                  style={{ fontFamily: 'Raleway, sans-serif' }}
                >
                  {titulo}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {texto}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NUESTRA DIRECCIÓN */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm uppercase tracking-widest text-neutral-500 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Liderazgo</p>
            <h2 className="text-3xl md:text-5xl font-bold text-black mb-5" style={{ fontFamily: 'Raleway, sans-serif' }}>Nuestra dirección</h2>
            <div className="w-12 h-px bg-black mx-auto" />
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {direccion.map((p) => (
              <div key={p.nombre} className="flex flex-col items-center text-center group">
                <div className="relative w-48 h-48 mb-6 rounded-full overflow-hidden ring-4 ring-gray-100 group-hover:ring-black/30 transition-all duration-300 shadow-md">
                  <Image src={p.foto} alt={p.nombre} fill className="object-cover object-top" sizes="192px" />
                </div>
                <h3 className="text-xl font-semibold mb-1" style={{ fontFamily: 'Raleway, sans-serif' }}>{p.nombre}</h3>
                <p className="text-sm mb-4 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>{p.cargo}</p>
                <p className="text-sm text-gray-500 leading-relaxed max-w-xs" style={{ fontFamily: 'Poppins, sans-serif' }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EQUIPO COMPLETO (Tokko) */}
      <section className="py-20 md:py-28 bg-neutral-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm uppercase tracking-widest text-neutral-500 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>El equipo</p>
            <h2 className="text-3xl md:text-5xl font-bold text-black mb-5" style={{ fontFamily: 'Raleway, sans-serif' }}>Nuestro equipo</h2>
            <div className="w-12 h-px bg-black mx-auto mb-5" />
            <p className="text-sm text-neutral-500 max-w-xl mx-auto" style={{ fontFamily: 'Poppins, sans-serif' }}>Profesionales especializados en el mercado de Funes y Roldán</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10 mb-14">
            {(agents ?? []).map((a) => (
              <TeamCard key={a.id} agent={a} />
            ))}
            {agents === null &&
              Array.from({ length: 8 }).map((_, i) => (
                <div key={`skel-${i}`} className="flex flex-col items-center">
                  <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-neutral-200 animate-pulse mb-4" />
                  <div className="h-3 w-24 bg-neutral-200 rounded animate-pulse mb-2" />
                  <div className="h-2 w-16 bg-neutral-200 rounded animate-pulse" />
                </div>
              ))}
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-400 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>¿Querés ser parte del equipo?</p>
            <a href="https://wa.me/5493412101694?text=Hola%2C%20me%20interesa%20sumarme%20al%20equipo%20de%20SI%20Inmobiliaria"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-sm font-medium border-2 border-black text-black transition-all hover:bg-black hover:text-white"
              style={{ fontFamily: 'Poppins, sans-serif' }}>
              Escribinos por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* HISTORIA — editorial sin foto stock, sobre verde oscuro */}
      <section className="py-24 md:py-32 bg-[#0A2818] text-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest text-white/60 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Nuestra historia</p>
            <h2 className="text-5xl md:text-7xl font-bold mb-4 text-white leading-tight" style={{ fontFamily: 'Raleway, sans-serif' }}>
              Más de 40 años
            </h2>
            <p className="text-xl md:text-2xl text-white/70 font-light max-w-2xl mx-auto" style={{ fontFamily: 'Poppins, sans-serif' }}>
              construyendo confianza en Roldán y Funes
            </p>
          </div>

          {/* Stats grid editorial */}
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10 mb-16 border-y border-white/10 py-8">
            {[
              { num: '1983', label: 'Año de fundación' },
              { num: '1.500+', label: 'Propiedades vendidas' },
              { num: '3', label: 'Sucursales' },
              { num: '20K+', label: 'Seguidores en Instagram' },
            ].map((s) => (
              <div key={s.label} className="px-3 md:px-6 text-center">
                <p className="text-4xl md:text-5xl font-bold text-white tabular-nums mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {s.num}
                </p>
                <p className="text-xs uppercase tracking-widest text-white/60" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div className="relative max-w-3xl mx-auto">
            <div className="absolute left-[1.4rem] top-2 bottom-2 w-px hidden md:block bg-white/15" />
            <div className="space-y-6">
              {historia.map((h, i) => (
                <div key={i} className="flex gap-6 md:gap-8 items-start">
                  <div className="hidden md:flex flex-col items-center w-12 shrink-0 pt-5">
                    <div className="w-3 h-3 rounded-full ring-4 ring-[#0A2818] z-10 bg-white" />
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-7 flex-1 backdrop-blur-sm">
                    <span className="text-xs font-semibold px-3 py-1 rounded-full inline-block mb-3 bg-white text-[#0A2818]" style={{ fontFamily: 'Poppins, sans-serif' }}>{h.año}</span>
                    <h3 className="text-lg font-semibold mb-2 text-white" style={{ fontFamily: 'Raleway, sans-serif' }}>{h.titulo}</h3>
                    <p className="text-sm text-white/70 leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>{h.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIOS — Google Reviews */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest text-neutral-500 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Reseñas verificadas</p>
            <h2 className="text-3xl md:text-5xl font-bold text-black mb-5" style={{ fontFamily: 'Raleway, sans-serif' }}>Lo que dicen nuestros clientes</h2>
            <div className="w-12 h-px bg-black mx-auto" />
          </div>

          {/* Knowledge Panel card */}
          <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 md:p-8 mb-10">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="flex items-center justify-center sm:justify-start">
                <GoogleLogo />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center gap-3 justify-center sm:justify-start mb-1">
                  <span className="text-4xl font-bold text-black tabular-nums" style={{ fontFamily: 'Poppins, sans-serif' }}>4,9</span>
                  <Stars rating={5} />
                </div>
                <p className="text-sm text-neutral-600 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  99 reseñas verificadas en Google
                </p>
                <a
                  href="https://www.google.com/search?q=SI+Inmobiliaria+Funes+rese%C3%B1as"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
                  style={{ color: '#1A73E8', fontFamily: 'Poppins, sans-serif' }}
                >
                  Ver en Google →
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 pt-6 border-t border-neutral-100">
              <SucursalRating sucursal="Sucursal Funes" rating={5.0} reseñas={13} href="https://www.google.com/search?q=SI+Inmobiliaria+Funes" />
              <SucursalRating sucursal="Sucursal Roldán" rating={3.9} reseñas={86} href="https://www.google.com/search?q=SI+Inmobiliaria+Roldan" />
            </div>
          </div>

          {/* Testimonial cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {testimonios.map((t, i) => (
              <ReviewCard key={i} review={t} idx={i} />
            ))}
          </div>

          <div className="text-center mt-10">
            <a
              href="https://www.google.com/search?q=SI+Inmobiliaria+Funes+rese%C3%B1as"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
              style={{ color: '#1A73E8', fontFamily: 'Poppins, sans-serif' }}
            >
              Leer las 99 reseñas en Google →
            </a>
          </div>
        </div>
      </section>

      {/* VIDEO INSTITUCIONAL */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-sm uppercase tracking-widest text-neutral-500 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Video institucional</p>
          <h2 className="text-3xl md:text-5xl font-bold text-black mb-5" style={{ fontFamily: 'Raleway, sans-serif' }}>Conocé nuestra oficina</h2>
          <div className="w-12 h-px bg-black mx-auto mb-5" />
          <p className="text-sm text-neutral-500 mb-10" style={{ fontFamily: 'Poppins, sans-serif' }}>Visitanos en Funes o Roldán — te esperamos</p>
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg">
            <iframe src="https://www.youtube.com/embed/l7woKym9w50" title="SI Inmobiliaria — Video institucional"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen
              className="absolute inset-0 w-full h-full" />
          </div>
        </div>
      </section>

      {/* OFICINAS + MAPA — interactiva, verde oscuro */}
      <OficinasInteractivas />

      {/* CTA FINAL — doble botón */}
      <section className="relative py-20 md:py-28 bg-neutral-50">
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <p className="text-sm uppercase tracking-widest text-neutral-500 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Dejanos acompañarte</p>
          <h2 className="text-3xl md:text-5xl font-bold text-black mb-5" style={{ fontFamily: 'Raleway, sans-serif' }}>¿Querés trabajar con nosotros?</h2>
          <div className="w-12 h-px bg-black mx-auto mb-6" />
          <p className="text-base text-neutral-600 mb-10 max-w-xl mx-auto" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Si querés vender tu propiedad o sumarte al equipo de SI, escribinos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="/tasaciones"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full text-sm font-semibold bg-black text-white transition-all hover:opacity-90"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Vendé con nosotros
            </a>
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSe3dth-z-OZEjrTKvXSvxiqEC2YFMD6GVkJEpuPPoa7PvfJWg/viewform?usp=sharing&ouid=105427159807754807240"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full text-sm font-semibold border-2 border-black text-black transition-all hover:bg-black hover:text-white"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Sumate a nuestro equipo
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
