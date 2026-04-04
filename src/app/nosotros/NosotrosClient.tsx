'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

/* ─────────────────────────────────────────────
   ANIMATED COUNTER
───────────────────────────────────────────── */
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const duration = 1800
          const steps = 60
          const increment = target / steps
          let current = 0
          const timer = setInterval(() => {
            current += increment
            if (current >= target) {
              setCount(target)
              clearInterval(timer)
            } else {
              setCount(Math.floor(current))
            }
          }, duration / steps)
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target])

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  )
}

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const direccion = [
  {
    nombre: 'Susana Ippoliti',
    cargo: 'Fundadora',
    desc: 'Abrió la primera oficina en 1983. Más de 40 años construyendo confianza en Roldán y Funes.',
    foto: '/team/susana-ippoliti.jpg',
  },
  {
    nombre: 'David Flores',
    cargo: 'Director · Mat. N° 0621',
    desc: 'Corredor Inmobiliario habilitado. Especialista en el mercado residencial premium de la zona oeste.',
    foto: '/team/david-flores.jpg',
  },
  {
    nombre: 'Laura Flores',
    cargo: 'Administración',
    desc: 'Responsable de la gestión administrativa y postventa de todas las operaciones.',
    foto: '/team/laura-flores.jpg',
  },
]

const administracion = [
  { nombre: 'Marisa Benitez', rol: 'Administración' },
  { nombre: 'Eliana Rojas', rol: 'Administración' },
  { nombre: 'Sabrina Riters', rol: 'Administración' },
  { nombre: 'Leticia Alexenicer', rol: 'Administración' },
]

const asesores = [
  { nombre: 'Aldana Ruiz', rol: 'Asesora comercial' },
  { nombre: 'Carolina Echen', rol: 'Asesora comercial' },
  { nombre: 'Gino Pecchenino', rol: 'Asesor comercial' },
  { nombre: 'Gisela Ramallo', rol: 'Asesora comercial' },
  { nombre: 'Lucia Wilson', rol: 'Asesora comercial' },
  { nombre: 'Maria Jose Espilocin', rol: 'Asesora comercial' },
  { nombre: 'Mariana Orlate', rol: 'Asesora comercial' },
  { nombre: 'Mauro Matteucci', rol: 'Asesor comercial' },
]

const soporte = [
  { nombre: 'Micaela Gonzalez', rol: 'Marketing' },
  { nombre: 'Julian Ruschneider', rol: 'Producción audiovisual' },
]

const historia = [
  { año: '1983', titulo: 'Fundación', desc: 'Susana Ippoliti abre la primera oficina en 1ro de Mayo 258, Roldán. Comienza una historia familiar de confianza y profesionalismo.' },
  { año: '2015', titulo: 'Segunda oficina en Roldán', desc: 'Apertura de la segunda oficina en Catamarca 775, Roldán. Consolidación como referente inmobiliario en la ciudad.' },
  { año: '2022', titulo: 'Expansión a Funes', desc: 'Aprobación del Concejo Deliberante de Funes para construir la nueva sede en Hipólito Yrigoyen 2643.' },
  { año: '2024', titulo: 'Oficina Funes + Galería + Rebranding', desc: 'Inauguración de la oficina en Funes, un espacio único que combina inmobiliaria con galería de arte. Nace SI Inmobiliaria.' },
]

const testimonios = [
  { texto: 'Vendimos nuestra casa en tiempo récord gracias al equipo de SI. Profesionales de principio a fin.', nombre: 'Familia García', ciudad: 'Roldán' },
  { texto: 'Encontramos el terreno ideal en Funes con su ayuda. Nos acompañaron en todo el proceso hasta la escritura.', nombre: 'Martín R.', ciudad: 'Funes' },
  { texto: 'Profesionales, honestos y siempre disponibles. Más de 40 años de experiencia se notan en cada detalle.', nombre: 'Carolina S.', ciudad: 'Fisherton' },
]

const oficinas = [
  { badge: 'Desde 1983', titulo: 'Oficina Histórica', subtitulo: '', dir: '1ro de Mayo 258, Roldán', horario: 'Lunes a Viernes 9 a 17hs', maps: 'https://maps.google.com/?q=1ro+de+Mayo+258+Roldan+Santa+Fe', icon: '🏛️', highlight: false, lat: -32.8935, lng: -60.9016 },
  { badge: 'Desde 2015', titulo: 'Oficina Ventas', subtitulo: '', dir: 'Catamarca 775, Roldán', horario: 'Lunes a Viernes 9 a 17hs', maps: 'https://maps.google.com/?q=Catamarca+775+Roldan+Santa+Fe', icon: '🏢', highlight: false, lat: -32.8940, lng: -60.9020 },
  { badge: 'Nuevo 2024', titulo: 'Oficina Funes', subtitulo: 'Inmobiliaria + Galería de Arte', dir: 'Hipólito Yrigoyen 2643, Funes', horario: 'Lunes a Viernes 9 a 17hs', maps: 'https://maps.google.com/?q=Hipolito+Yrigoyen+2643+Funes+Santa+Fe', icon: '🎨', highlight: true, lat: -32.9181, lng: -60.8270 },
]

function iniciales(nombre: string) {
  return nombre.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
}

/* ─────────────────────────────────────────────
   MAP COMPONENT (Leaflet, lazy)
───────────────────────────────────────────── */
function OficinasMapa() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<unknown>(null)

  const puntos = [
    { titulo: 'Oficina Histórica', dir: '1ro de Mayo 258, Roldán', lat: -32.89350, lng: -60.90390, maps: 'https://maps.google.com/?q=1ro+de+Mayo+258+Roldan+Santa+Fe' },
    { titulo: 'Oficina Ventas', dir: 'Catamarca 775, Roldán', lat: -32.89540, lng: -60.90280, maps: 'https://maps.google.com/?q=Catamarca+775+Roldan+Santa+Fe' },
    { titulo: 'Oficina Funes', dir: 'Hipólito Yrigoyen 2643, Funes', lat: -32.91810, lng: -60.82700, maps: 'https://maps.google.com/?q=Hipolito+Yrigoyen+2643+Funes+Santa+Fe' },
  ]

  useEffect(() => {
    if (mapInstance.current || !mapRef.current) return

    import('leaflet').then((L) => {
      // @ts-expect-error leaflet icon hack
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current!, {
        center: [-32.906, -60.864],
        zoom: 13,
        zoomControl: false,
        scrollWheelZoom: false,
        attributionControl: false,
      })

      mapInstance.current = map

      L.control.zoom({ position: 'topright' }).addTo(map)

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map)

      L.control.attribution({ position: 'bottomright', prefix: false })
        .addAttribution('© <a href="https://carto.com/">CartoDB</a>')
        .addTo(map)

      puntos.forEach((p, idx) => {
        const isFunes = idx === 2
        const icon = L.divIcon({
          html: `<div style="position:relative;width:${isFunes ? 44 : 36}px;height:${isFunes ? 44 : 36}px">
            <div style="position:absolute;inset:0;background:${isFunes ? '#1A5C38' : '#2D6A4F'};border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 4px 12px rgba(0,0,0,0.25)"></div>
            <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:white;font-size:${isFunes ? 13 : 11}px;font-family:Raleway,sans-serif;font-weight:700;padding-bottom:4px">${isFunes ? '★' : idx + 1}</div>
          </div>`,
          iconSize: [isFunes ? 44 : 36, isFunes ? 44 : 36],
          iconAnchor: [isFunes ? 22 : 18, isFunes ? 44 : 36],
          popupAnchor: [0, isFunes ? -46 : -38],
          className: '',
        })

        L.marker([p.lat, p.lng], { icon })
          .addTo(map)
          .bindPopup(
            `<div style="font-family:Poppins,sans-serif;min-width:180px;padding:6px 2px">
              <p style="font-family:Raleway,sans-serif;font-weight:700;font-size:14px;margin:0 0 4px;color:#1A5C38">${p.titulo}</p>
              <p style="font-size:12px;color:#666;margin:0 0 10px">${p.dir}</p>
              <a href="${p.maps}" target="_blank" style="font-size:12px;color:white;background:#1A5C38;padding:5px 12px;border-radius:20px;text-decoration:none;font-weight:600">Ver en Maps →</a>
            </div>`,
            { maxWidth: 240, className: 'si-popup' }
          )
      })
    })

    return () => {
      if (mapInstance.current) {
        ;(mapInstance.current as { remove: () => void }).remove()
        mapInstance.current = null
      }
    }
  }, [])

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossOrigin="" />
      <style>{`
        .si-popup .leaflet-popup-content-wrapper { border-radius:16px; box-shadow:0 8px 32px rgba(0,0,0,0.15); border:none; padding:4px }
        .si-popup .leaflet-popup-tip { display:none }
      `}</style>
      <div ref={mapRef} className="w-full rounded-2xl overflow-hidden shadow-md" style={{ height: '440px' }} />
    </>
  )
}

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
export default function NosotrosClient() {
  return (
    <main className="bg-white text-gray-900">

      {/* HERO — collage */}
      <section className="relative h-[520px] overflow-hidden">
        <div className="absolute inset-0 grid grid-cols-3 gap-0">
          <div className="col-span-2 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/nosotros/FACHADA_OFICINA.jpg" alt="Fachada oficina SI Inmobiliaria" className="w-full h-[520px] object-cover" />
          </div>
          <div className="flex flex-col">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/nosotros/IMG_2545_2.JPG" alt="Oficina SI Inmobiliaria" className="w-full h-[260px] object-cover" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/nosotros/IMG_9120.JPG" alt="Equipo SI Inmobiliaria" className="w-full h-[260px] object-cover" />
          </div>
        </div>
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center px-6 max-w-3xl">
            <p className="text-xs uppercase tracking-[0.25em] text-white/70 mb-3 font-poppins">Quiénes somos</p>
            <h1 className="text-3xl md:text-4xl text-white leading-tight mb-4" style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 300 }}>
              Desde 1983 acompañando<br />cada decisión importante
            </h1>
            <p className="text-lg text-white/80 font-poppins">
              Susana, Laura y David — dos generaciones de confianza en Roldán y Funes
            </p>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-20 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
            {[
              { label: 'Años en el mercado', value: 43, suffix: '' },
              { label: 'Operaciones concretadas', value: 1500, suffix: '+' },
              { label: 'Oficinas', value: 3, suffix: '' },
              { label: 'Propiedades activas', value: 200, suffix: '+' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl md:text-5xl font-semibold mb-2 font-numeric" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#1A5C38' }}>
                  <Counter target={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-sm text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EQUIPO — foto + texto */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative rounded-2xl overflow-hidden shadow-lg aspect-[3/4]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/nosotros/LAURASUSANADAVID.jpeg" alt="Susana, Laura y David — SI Inmobiliaria" className="w-full h-full object-cover object-top" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] mb-3 font-poppins" style={{ color: '#1A5C38' }}>Nuestro equipo</p>
              <h2 className="text-3xl mb-4" style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 200 }}>
                Negocio de familia, vocación de servicio
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Susana Ippoliti fundó la inmobiliaria en 1983. Más de 40 años después, junto a David y Laura, siguen construyendo relaciones de confianza con cada cliente que pasa por nuestras oficinas en Roldán y Funes. Hoy el equipo está formado por más de 15 profesionales especializados en el mercado inmobiliario de la zona.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* GALERÍA OFICINAS */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl mb-8 text-center" style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 200 }}>Nuestras oficinas</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/nosotros/Oficina_funes.JPG" alt="Oficina Funes" className="w-full aspect-video object-cover rounded-xl" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/nosotros/oficina_funes_3.JPG" alt="Interior oficina Funes" className="w-full aspect-video object-cover rounded-xl" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/nosotros/Oficina.JPG" alt="Oficina Roldán" className="w-full aspect-video object-cover rounded-xl" />
          </div>
        </div>
      </section>

      {/* MISIÓN · VISIÓN · VALORES */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { titulo: 'Misión', texto: 'Acompañar a cada persona en su camino inmobiliario, brindando un asesoramiento honesto, cercano y profesional.' },
              { titulo: 'Visión', texto: 'Ser la inmobiliaria de referencia en Funes, Roldán y la región, reconocida por nuestra calidez humana, trayectoria y compromiso real con cada cliente.' },
              { titulo: 'Valores', texto: 'Honestidad, compromiso y profesionalismo son los pilares que guían cada operación. Más de 40 años de trayectoria nos respaldan.' },
            ].map((item) => (
              <div key={item.titulo} className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="w-8 h-1 rounded-full mb-5" style={{ backgroundColor: '#1A5C38' }} />
                <h3 className="text-xl font-semibold mb-3" style={{ fontFamily: 'Raleway, sans-serif' }}>{item.titulo}</h3>
                <p className="text-sm text-gray-500 leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>{item.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NUESTRA DIRECCIÓN */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.2em] mb-3" style={{ fontFamily: 'Poppins, sans-serif', color: '#1A5C38' }}>Liderazgo</p>
            <h2 className="text-4xl" style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 200 }}>Nuestra dirección</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {direccion.map((p) => (
              <div key={p.nombre} className="flex flex-col items-center text-center group">
                <div className="relative w-48 h-48 mb-6 rounded-full overflow-hidden ring-4 ring-gray-100 group-hover:ring-[#1A5C38]/30 transition-all duration-300 shadow-md">
                  <Image src={p.foto} alt={p.nombre} fill className="object-cover object-top" />
                </div>
                <h3 className="text-xl font-semibold mb-1" style={{ fontFamily: 'Raleway, sans-serif' }}>{p.nombre}</h3>
                <p className="text-sm mb-4" style={{ fontFamily: 'Poppins, sans-serif', color: '#1A5C38' }}>{p.cargo}</p>
                <p className="text-sm text-gray-500 leading-relaxed max-w-xs" style={{ fontFamily: 'Poppins, sans-serif' }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EQUIPO COMPLETO */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.2em] mb-3" style={{ fontFamily: 'Poppins, sans-serif', color: '#1A5C38' }}>El equipo</p>
            <h2 className="text-4xl mb-4" style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 200 }}>Nuestro equipo</h2>
            <p className="text-sm text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>Profesionales especializados en el mercado de Funes y Roldán</p>
          </div>

          {/* Asesores comerciales */}
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>Asesores comerciales</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 mb-14">
            {asesores.map((a) => (
              <div key={a.nombre} className="bg-white rounded-2xl p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 text-white text-lg font-semibold" style={{ backgroundColor: '#1A5C38', fontFamily: 'Raleway, sans-serif' }}>
                  {iniciales(a.nombre)}
                </div>
                <p className="text-sm font-semibold leading-tight mb-1" style={{ fontFamily: 'Raleway, sans-serif' }}>{a.nombre}</p>
                <p className="text-xs text-gray-400" style={{ fontFamily: 'Poppins, sans-serif' }}>{a.rol}</p>
              </div>
            ))}
          </div>

          {/* Administración */}
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>Administración</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-14">
            {administracion.map((a) => (
              <div key={a.nombre} className="bg-white rounded-2xl p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 text-white text-lg font-semibold" style={{ backgroundColor: '#2D6A4F', fontFamily: 'Raleway, sans-serif' }}>
                  {iniciales(a.nombre)}
                </div>
                <p className="text-sm font-semibold leading-tight mb-1" style={{ fontFamily: 'Raleway, sans-serif' }}>{a.nombre}</p>
                <p className="text-xs text-gray-400" style={{ fontFamily: 'Poppins, sans-serif' }}>{a.rol}</p>
              </div>
            ))}
          </div>

          {/* Soporte */}
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>Soporte</p>
          <div className="flex flex-wrap gap-5 mb-14">
            {soporte.map((s) => (
              <div key={s.nombre} className="bg-white rounded-2xl p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow w-48">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 text-white text-lg font-semibold" style={{ backgroundColor: '#334155', fontFamily: 'Raleway, sans-serif' }}>
                  {iniciales(s.nombre)}
                </div>
                <p className="text-sm font-semibold leading-tight mb-2" style={{ fontFamily: 'Raleway, sans-serif' }}>{s.nombre}</p>
                <span className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-500" style={{ fontFamily: 'Poppins, sans-serif' }}>{s.rol}</span>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-400 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>¿Querés ser parte del equipo?</p>
            <a href="https://wa.me/5493412101694?text=Hola%2C%20me%20interesa%20sumarme%20al%20equipo%20de%20SI%20Inmobiliaria"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-sm font-medium border-2 transition-all hover:text-white hover:bg-[#1A5C38]"
              style={{ fontFamily: 'Poppins, sans-serif', borderColor: '#1A5C38', color: '#1A5C38' }}>
              Escribinos por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* HISTORIA */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.2em] mb-3" style={{ fontFamily: 'Poppins, sans-serif', color: '#1A5C38' }}>Trayectoria</p>
            <h2 className="text-4xl" style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 200 }}>Nuestra historia</h2>
          </div>
          <div className="relative">
            <div className="absolute left-[1.4rem] top-2 bottom-2 w-px hidden md:block" style={{ backgroundColor: '#1A5C38', opacity: 0.15 }} />
            <div className="space-y-8">
              {historia.map((h, i) => (
                <div key={i} className="flex gap-8 items-start">
                  <div className="hidden md:flex flex-col items-center w-12 shrink-0 pt-5">
                    <div className="w-3 h-3 rounded-full ring-4 ring-white z-10" style={{ backgroundColor: '#1A5C38' }} />
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-7 flex-1">
                    <span className="text-xs font-semibold px-3 py-1 rounded-full inline-block mb-3 text-white" style={{ backgroundColor: '#1A5C38', fontFamily: 'Poppins, sans-serif' }}>{h.año}</span>
                    <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: 'Raleway, sans-serif' }}>{h.titulo}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>{h.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.2em] mb-3" style={{ fontFamily: 'Poppins, sans-serif', color: '#1A5C38' }}>Testimonios</p>
            <h2 className="text-4xl" style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 200 }}>Lo que dicen nuestros clientes</h2>
            <p className="text-sm text-gray-400 mt-3" style={{ fontFamily: 'Poppins, sans-serif' }}>Opiniones reales de familias que confiaron en nosotros</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonios.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-sm flex flex-col">
                <div className="text-4xl mb-4 leading-none" style={{ color: '#1A5C38', fontFamily: 'Georgia, serif' }}>&ldquo;</div>
                <p className="text-sm text-gray-600 leading-relaxed flex-1 mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>{t.texto}</p>
                <div>
                  <p className="text-sm font-semibold" style={{ fontFamily: 'Raleway, sans-serif' }}>{t.nombre}</p>
                  <p className="text-xs text-gray-400" style={{ fontFamily: 'Poppins, sans-serif' }}>{t.ciudad}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VIDEO INSTITUCIONAL */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-[0.2em] mb-3" style={{ fontFamily: 'Poppins, sans-serif', color: '#1A5C38' }}>Video institucional</p>
          <h2 className="text-4xl mb-4" style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 200 }}>Conocé nuestra oficina</h2>
          <p className="text-sm text-gray-400 mb-10" style={{ fontFamily: 'Poppins, sans-serif' }}>Visitanos en Funes o Roldán — te esperamos</p>
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg">
            <iframe src="https://www.youtube.com/embed/l7woKym9w50" title="SI Inmobiliaria — Video institucional"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen
              className="absolute inset-0 w-full h-full" />
          </div>
        </div>
      </section>

      {/* OFICINAS + MAPA */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.2em] mb-3" style={{ fontFamily: 'Poppins, sans-serif', color: '#1A5C38' }}>Ubicaciones</p>
            <h2 className="text-4xl mb-3" style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 200 }}>Nuestras oficinas</h2>
            <p className="text-sm text-gray-400" style={{ fontFamily: 'Poppins, sans-serif' }}>Tres ubicaciones para atenderte mejor</p>
          </div>
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <div className="flex flex-col gap-5">
              {oficinas.map((o) => (
                <div key={o.titulo} className={`rounded-2xl p-7 flex gap-5 items-start ${o.highlight ? 'bg-[#1A5C38] text-white shadow-lg' : 'bg-white shadow-sm'}`}>
                  <span className="text-3xl shrink-0">{o.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h3 className="text-base font-semibold" style={{ fontFamily: 'Raleway, sans-serif' }}>{o.titulo}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${o.highlight ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`} style={{ fontFamily: 'Poppins, sans-serif' }}>{o.badge}</span>
                    </div>
                    {o.subtitulo && <p className={`text-xs mb-2 ${o.highlight ? 'text-white/70' : 'text-gray-400'}`} style={{ fontFamily: 'Poppins, sans-serif' }}>{o.subtitulo}</p>}
                    <p className={`text-sm ${o.highlight ? 'text-white/80' : 'text-gray-500'}`} style={{ fontFamily: 'Poppins, sans-serif' }}>{o.dir} · {o.horario}</p>
                    <a href={o.maps} target="_blank" rel="noopener noreferrer"
                      className={`inline-block mt-3 text-xs font-semibold underline underline-offset-2 ${o.highlight ? 'text-white/90' : 'text-[#1A5C38]'}`}
                      style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Ver en Maps →
                    </a>
                  </div>
                </div>
              ))}
            </div>
            <div className="lg:sticky lg:top-24">
              <OficinasMapa />
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl mb-4" style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 200 }}>¿Querés trabajar con nosotros?</h2>
          <p className="text-sm text-gray-500 mb-10" style={{ fontFamily: 'Poppins, sans-serif' }}>Contactanos y contanos tu proyecto. Te respondemos en menos de 24 horas.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/tasaciones" className="px-8 py-3 rounded-full text-sm font-medium text-white transition-opacity hover:opacity-80" style={{ fontFamily: 'Poppins, sans-serif', backgroundColor: '#1A5C38' }}>
              Solicitá tu tasación en 24hs
            </a>
            <a href="/propiedades" className="px-8 py-3 rounded-full text-sm font-medium border-2 transition-all hover:bg-[#1A5C38] hover:text-white" style={{ fontFamily: 'Poppins, sans-serif', borderColor: '#1A5C38', color: '#1A5C38' }}>
              Ver propiedades
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
