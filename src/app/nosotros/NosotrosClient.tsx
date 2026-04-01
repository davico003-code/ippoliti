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

const asesores = [
  { nombre: 'Aldana Ruiz', rol: 'Asesora comercial' },
  { nombre: 'Carolina Echen', rol: 'Asesora comercial' },
  { nombre: 'Gino Pecchenino', rol: 'Asesor comercial' },
  { nombre: 'Gisela Ramallo', rol: 'Asesora comercial' },
  { nombre: 'Leticia Alexenicer', rol: 'Asesora comercial' },
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
  {
    año: '1983',
    titulo: 'Fundación',
    desc: 'Susana Ippoliti abre la primera oficina en 1ro de Mayo 258, Roldán. Comienza una historia familiar de confianza y profesionalismo.',
  },
  {
    año: '2015',
    titulo: 'Segunda oficina en Roldán',
    desc: 'Apertura de la segunda oficina en Catamarca 775, Roldán. Consolidación como referente inmobiliario en la ciudad.',
  },
  {
    año: '2022',
    titulo: 'Expansión a Funes',
    desc: 'Aprobación del Concejo Deliberante de Funes para construir la nueva sede en Hipólito Yrigoyen 2643.',
  },
  {
    año: '2024',
    titulo: 'Oficina Funes + Galería + Rebranding',
    desc: 'Inauguración de la oficina en Funes, un espacio único que combina inmobiliaria con galería de arte. Nace SI Inmobiliaria.',
  },
]

const testimonios = [
  {
    texto: 'Vendimos nuestra casa en tiempo récord gracias al equipo de SI. Profesionales de principio a fin.',
    nombre: 'Familia García',
    ciudad: 'Roldán',
  },
  {
    texto: 'Encontramos el terreno ideal en Funes con su ayuda. Nos acompañaron en todo el proceso hasta la escritura.',
    nombre: 'Martín R.',
    ciudad: 'Funes',
  },
  {
    texto: 'Profesionales, honestos y siempre disponibles. Más de 40 años de experiencia se notan en cada detalle.',
    nombre: 'Carolina S.',
    ciudad: 'Fisherton',
  },
]

const oficinas = [
  {
    badge: 'Desde 1983',
    titulo: 'Oficina Histórica',
    subtitulo: '',
    dir: '1ro de Mayo 258, Roldán',
    tel: '(341) 210-1694',
    horario: 'Lunes a Viernes 9 a 17hs',
    maps: 'https://maps.google.com/?q=1ro+de+Mayo+258+Roldan+Santa+Fe',
    icon: '🏛️',
    highlight: false,
  },
  {
    badge: 'Desde 2015',
    titulo: 'Oficina Ventas',
    subtitulo: '',
    dir: 'Catamarca 775, Roldán',
    tel: '(341) 210-1694',
    horario: 'Lunes a Viernes 9 a 17hs',
    maps: 'https://maps.google.com/?q=Catamarca+775+Roldan+Santa+Fe',
    icon: '🏢',
    highlight: false,
  },
  {
    badge: 'Nuevo 2024',
    titulo: 'Oficina Funes',
    subtitulo: 'Inmobiliaria + Galería de Arte',
    dir: 'Hipólito Yrigoyen 2643, Funes',
    tel: '(341) 210-1694',
    horario: 'Lunes a Viernes 9 a 17hs',
    maps: 'https://maps.google.com/?q=Hipolito+Yrigoyen+2643+Funes+Santa+Fe',
    icon: '🎨',
    highlight: true,
  },
]

function iniciales(nombre: string) {
  return nombre.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
}

function WaIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.083.534 4.04 1.47 5.748L0 24l6.444-1.449C8.106 23.49 10.014 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.846 0-3.574-.49-5.063-1.345l-.363-.215-3.826.861.877-3.726-.236-.375C2.54 15.614 2 13.867 2 12 2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
    </svg>
  )
}

export default function NosotrosClient() {
  return (
    <main className="bg-white text-gray-900">

      {/* HERO */}
      <section className="relative h-[70vh] min-h-[500px] flex items-end overflow-hidden">
        <Image src="/hero-nosotros.jpg" alt="Fachada SI Inmobiliaria" fill className="object-cover object-center" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 pb-16">
          <p className="text-xs uppercase tracking-[0.25em] text-white/70 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>Quiénes somos</p>
          <h1 className="text-4xl md:text-6xl text-white leading-tight mb-4" style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 200 }}>
            Desde 1983 acompañando<br />cada decisión importante
          </h1>
          <p className="text-lg text-white/80" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Susana, David y Laura — tres generaciones de confianza en Roldán y Funes
          </p>
        </div>
      </section>

      {/* STATS */}
      <section className="py-20 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
            {[
              { label: 'Años en el mercado', value: 42, suffix: '' },
              { label: 'Operaciones concretadas', value: 3000, suffix: '+' },
              { label: 'Oficinas', value: 3, suffix: '' },
              { label: 'Propiedades activas', value: 400, suffix: '+' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-5xl md:text-6xl mb-2 font-numeric" style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 200, color: '#1A5C38' }}>
                  <Counter target={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-sm text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>{stat.label}</p>
              </div>
            ))}
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
                <p className="text-sm text-gray-500 leading-relaxed mb-6 max-w-xs" style={{ fontFamily: 'Poppins, sans-serif' }}>{p.desc}</p>
                <a href="https://wa.me/5493412101694" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium text-white transition-opacity hover:opacity-80"
                  style={{ fontFamily: 'Poppins, sans-serif', backgroundColor: '#1A5C38' }}>
                  <WaIcon /> Contactar
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EQUIPO DE ASESORES */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.2em] mb-3" style={{ fontFamily: 'Poppins, sans-serif', color: '#1A5C38' }}>El equipo</p>
            <h2 className="text-4xl mb-4" style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 200 }}>Nuestro equipo de asesores</h2>
            <p className="text-sm text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>Profesionales especializados en el mercado de Funes y Roldán</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 mb-16">
            {asesores.map((a) => (
              <a key={a.nombre} href="https://wa.me/5493412101694" target="_blank" rel="noopener noreferrer"
                className="group bg-white rounded-2xl p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 text-white text-lg font-semibold group-hover:scale-105 transition-transform"
                  style={{ backgroundColor: '#1A5C38', fontFamily: 'Raleway, sans-serif' }}>
                  {iniciales(a.nombre)}
                </div>
                <p className="text-sm font-semibold leading-tight mb-1" style={{ fontFamily: 'Raleway, sans-serif' }}>{a.nombre}</p>
                <p className="text-xs text-gray-400" style={{ fontFamily: 'Poppins, sans-serif' }}>{a.rol}</p>
              </a>
            ))}
          </div>

          <h3 className="text-center text-xs uppercase tracking-[0.2em] text-gray-400 mb-8" style={{ fontFamily: 'Poppins, sans-serif' }}>Equipo de soporte</h3>
          <div className="flex flex-wrap justify-center gap-5">
            {soporte.map((s) => (
              <a key={s.nombre} href="https://wa.me/5493412101694" target="_blank" rel="noopener noreferrer"
                className="group bg-white rounded-2xl p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 w-48">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 text-white text-lg font-semibold group-hover:scale-105 transition-transform"
                  style={{ backgroundColor: '#334155', fontFamily: 'Raleway, sans-serif' }}>
                  {iniciales(s.nombre)}
                </div>
                <p className="text-sm font-semibold leading-tight mb-2" style={{ fontFamily: 'Raleway, sans-serif' }}>{s.nombre}</p>
                <span className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-500" style={{ fontFamily: 'Poppins, sans-serif' }}>{s.rol}</span>
              </a>
            ))}
          </div>

          <div className="text-center mt-14">
            <p className="text-sm text-gray-400 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>¿Querés ser parte del equipo?</p>
            <a href="https://wa.me/5493412101694?text=Hola%2C%20me%20interesa%20sumarme%20al%20equipo%20de%20SI%20Inmobiliaria"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-sm font-medium border-2 transition-all hover:text-white hover:bg-[#1A5C38]"
              style={{ fontFamily: 'Poppins, sans-serif', borderColor: '#1A5C38', color: '#1A5C38' }}>
              <WaIcon /> Escribinos por WhatsApp
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
                    <span className="text-xs font-semibold px-3 py-1 rounded-full inline-block mb-3 text-white"
                      style={{ backgroundColor: '#1A5C38', fontFamily: 'Poppins, sans-serif' }}>{h.año}</span>
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
                <div className="text-3xl mb-4" style={{ color: '#1A5C38', fontFamily: 'Georgia, serif' }}>&ldquo;</div>
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

      {/* OFICINAS */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.2em] mb-3" style={{ fontFamily: 'Poppins, sans-serif', color: '#1A5C38' }}>Ubicaciones</p>
            <h2 className="text-4xl mb-3" style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 200 }}>Nuestras oficinas</h2>
            <p className="text-sm text-gray-400" style={{ fontFamily: 'Poppins, sans-serif' }}>Tres ubicaciones para atenderte mejor</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {oficinas.map((o) => (
              <div key={o.titulo} className={`rounded-2xl p-8 flex flex-col gap-4 ${o.highlight ? 'bg-[#1A5C38] text-white shadow-lg' : 'bg-white shadow-sm'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{o.icon}</span>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${o.highlight ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}
                    style={{ fontFamily: 'Poppins, sans-serif' }}>{o.badge}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold" style={{ fontFamily: 'Raleway, sans-serif' }}>{o.titulo}</h3>
                  {o.subtitulo && <p className={`text-xs mt-0.5 ${o.highlight ? 'text-white/70' : 'text-gray-400'}`} style={{ fontFamily: 'Poppins, sans-serif' }}>{o.subtitulo}</p>}
                </div>
                <div className={`text-sm space-y-1 ${o.highlight ? 'text-white/80' : 'text-gray-500'}`} style={{ fontFamily: 'Poppins, sans-serif' }}>
                  <p>{o.dir}</p>
                  <p className="font-numeric">{o.tel}</p>
                  <p>{o.horario}</p>
                </div>
                <a href={o.maps} target="_blank" rel="noopener noreferrer"
                  className={`inline-block mt-2 text-sm font-medium px-5 py-2 rounded-full text-center transition-opacity hover:opacity-80 ${o.highlight ? 'bg-white text-[#1A5C38]' : 'border border-[#1A5C38] text-[#1A5C38]'}`}
                  style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Cómo llegar
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl mb-4" style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 200 }}>¿Querés trabajar con nosotros?</h2>
          <p className="text-sm text-gray-500 mb-10" style={{ fontFamily: 'Poppins, sans-serif' }}>Contactanos y contanos tu proyecto. Te respondemos en menos de 24 horas.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/tasaciones" className="px-8 py-3 rounded-full text-sm font-medium text-white transition-opacity hover:opacity-80"
              style={{ fontFamily: 'Poppins, sans-serif', backgroundColor: '#1A5C38' }}>
              Solicitá tu tasación en 24hs
            </a>
            <a href="/propiedades" className="px-8 py-3 rounded-full text-sm font-medium border-2 transition-all hover:bg-[#1A5C38] hover:text-white"
              style={{ fontFamily: 'Poppins, sans-serif', borderColor: '#1A5C38', color: '#1A5C38' }}>
              Ver propiedades
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
