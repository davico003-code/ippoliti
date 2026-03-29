import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { Building2, Eye, Heart, Star, Quote, Play, MapPin, Phone, Clock, ExternalLink } from 'lucide-react'
import AnimatedCounter from '@/components/AnimatedCounter'

const OfficesMap = dynamic(() => import('@/components/OfficesMap'), { ssr: false })

export const metadata: Metadata = {
  title: 'Nosotros | SI Inmobiliaria',
  description: 'Conocé la historia de SI Inmobiliaria. Más de 40 años acompañando familias en Roldán, Funes y Rosario. Susana Ippoliti, Laura y David.',
}

const TIMELINE = [
  { year: '1983', title: 'Fundación', desc: 'Susana Ippoliti abre la primera oficina en 1ro de Mayo 258, Roldán. Comienza una historia familiar de confianza y profesionalismo.' },
  { year: '2015', title: 'Segunda oficina en Roldán', desc: 'Apertura de la segunda oficina en Catamarca 775, Roldán. Consolidación como referente inmobiliario en la ciudad.' },
  { year: '2022', title: 'Expansión a Funes', desc: 'Aprobación del Concejo Deliberante de Funes para construir la nueva sede en Hipólito Yrigoyen 2643.' },
  { year: '2024', title: 'Oficina Funes + Galería + Rebranding', desc: 'Inauguración de la oficina en Funes, un espacio único que combina inmobiliaria con galería de arte. Nace SI Inmobiliaria.' },
]

const TEAM = [
  { name: 'Susana Ippoliti', role: 'Fundadora', credential: 'Mat. 0559', image: 'https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?w=400&q=80' },
  { name: 'David Flores', role: 'Corredor Inmobiliario', credential: 'Mat. 0621', image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?w=400&q=80' },
  { name: 'Laura Flores', role: 'Lic. en Administración', credential: 'de Empresas', image: 'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?w=400&q=80' },
]

const TESTIMONIALS = [
  { text: 'Vendimos nuestra casa en tiempo récord gracias al equipo de SI. Profesionales de principio a fin.', author: 'Familia García', location: 'Roldán' },
  { text: 'Encontramos el terreno ideal en Funes con su ayuda. Nos acompañaron en todo el proceso hasta la escritura.', author: 'Martín R.', location: 'Funes' },
  { text: 'Profesionales, honestos y siempre disponibles. Más de 40 años de experiencia se notan en cada detalle.', author: 'Carolina S.', location: 'Fisherton' },
]

export default function NosotrosPage() {
  return (
    <div className="min-h-screen">

      {/* 1. Header with background image */}
      <section
        className="relative text-white py-24 md:py-32 px-4 text-center bg-[#1A5C38]"
      >
        <div className="relative z-10">
          <p className="text-white/80 text-sm uppercase tracking-widest font-semibold mb-3">QUIÉNES SOMOS</p>
          <h1 className="text-4xl md:text-5xl font-black leading-tight max-w-3xl mx-auto drop-shadow-md">
            Desde 1983 acompañando cada decisión importante
          </h1>
          <p className="text-white/80 text-lg mt-4 max-w-2xl mx-auto">
            Susana, David y Laura — tres generaciones de confianza en Roldán y Funes
          </p>
        </div>
      </section>

      {/* 2. Three-column photo section */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="relative rounded-xl overflow-hidden bg-gray-100 h-[280px]">
            <Image src="/hero-nosotros.jpg"
              alt="Equipo SI Inmobiliaria" fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
          </div>
          <div className="flex flex-col items-center justify-center text-center">
            <div className="bg-brand-600 rounded-xl w-20 h-20 flex items-center justify-center mb-4">
              <span className="text-white font-black text-4xl leading-none">SI</span>
            </div>
            <h2 className="text-2xl font-black text-gray-900">SI INMOBILIARIA</h2>
            <p className="tracking-widest text-gray-400 text-xs uppercase mt-1">DESDE 1983</p>
            <div className="my-4 w-12 h-0.5 bg-brand-600" />
            <p className="text-sm text-gray-600">Susana Ippoliti, Laura &amp; David</p>
          </div>
          <div className="relative rounded-xl overflow-hidden bg-gray-100 h-[280px]">
            <Image src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?w=600&q=80"
              alt="Equipo SI Inmobiliaria" fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
          </div>
        </div>
      </section>

      {/* 3. Números que impactan */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-sm font-bold text-brand-600 uppercase tracking-widest mb-10">Números que impactan</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { target: 43, suffix: '', label: 'Años en el mercado' },
              { target: 1500, prefix: '+', label: 'Operaciones concretadas' },
              { target: 3, suffix: '', label: 'Oficinas' },
              { target: 215, suffix: '', label: 'Propiedades activas' },
            ].map(stat => (
              <div key={stat.label}>
                <p className="text-5xl font-black text-brand-600">
                  <AnimatedCounter target={stat.target} suffix={stat.suffix} prefix={stat.prefix} />
                </p>
                <p className="text-gray-500 text-sm mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Mission / Vision / Values */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-8 shadow-sm border-l-4 border-brand-600">
            <Building2 className="w-8 h-8 text-brand-600 mb-4" />
            <h3 className="font-black text-gray-900 text-xl mb-3">MISIÓN</h3>
            <p className="text-gray-600 leading-relaxed">
              Acompañar a cada persona en su camino inmobiliario, brindando un asesoramiento honesto, cercano y profesional.
            </p>
          </div>
          <div className="bg-white rounded-xl p-8 shadow-sm border-l-4 border-brand-600">
            <Eye className="w-8 h-8 text-brand-600 mb-4" />
            <h3 className="font-black text-gray-900 text-xl mb-3">VISIÓN</h3>
            <p className="text-gray-600 leading-relaxed">
              Ser la inmobiliaria de referencia en Funes, Roldán y la región, reconocida por nuestra calidez humana, trayectoria y compromiso real con cada cliente.
            </p>
          </div>
          <div className="bg-white rounded-xl p-8 shadow-sm border-l-4 border-brand-600">
            <Heart className="w-8 h-8 text-brand-600 mb-4" />
            <h3 className="font-black text-gray-900 text-xl mb-3">VALORES</h3>
            <p className="text-gray-600 leading-relaxed">
              Honestidad, compromiso y profesionalismo son los pilares que guían cada operación. Más de 40 años de trayectoria nos respaldan.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Timeline */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-center text-sm font-bold text-brand-600 uppercase tracking-widest mb-12">Nuestra historia</h2>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[19px] md:left-1/2 md:-translate-x-px top-0 bottom-0 w-0.5 bg-brand-200" />

            {TIMELINE.map((item, i) => (
              <div key={item.year} className={`relative flex items-start gap-6 mb-12 last:mb-0 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                {/* Dot */}
                <div className="absolute left-[12px] md:left-1/2 md:-translate-x-1/2 w-4 h-4 rounded-full bg-brand-600 border-4 border-white shadow-md z-10 mt-1" />

                {/* Content card */}
                <div className={`ml-12 md:ml-0 md:w-[calc(50%-32px)] ${i % 2 === 0 ? 'md:pr-8' : 'md:pl-8'}`}>
                  <span className="text-brand-600 font-black text-2xl font-numeric">{item.year}</span>
                  <h3 className="font-black text-gray-900 text-lg mt-1">{item.title}</h3>
                  <p className="text-gray-500 text-sm mt-2 leading-relaxed">{item.desc}</p>
                </div>

                {/* Spacer for the other side */}
                <div className="hidden md:block md:w-[calc(50%-32px)]" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Equipo */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-sm font-bold text-brand-600 uppercase tracking-widest mb-3">Nuestro equipo</h2>
          <p className="text-center text-gray-500 text-lg mb-12 max-w-xl mx-auto">Las personas detrás de cada operación exitosa</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TEAM.map(member => (
              <div key={member.name} className="rounded-xl overflow-hidden shadow-sm border border-gray-100 group">
                <div className="relative h-[300px] bg-gray-100 overflow-hidden">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="bg-brand-600 text-white p-5 text-center">
                  <h3 className="font-black text-lg">{member.name}</h3>
                  <p className="text-brand-200 text-sm font-medium">{member.role}</p>
                  <p className="text-brand-300 text-xs mt-1">{member.credential}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Testimonios */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-sm font-bold text-brand-600 uppercase tracking-widest mb-3">Lo que dicen nuestros clientes</h2>
          <p className="text-center text-gray-500 text-lg mb-12">Opiniones reales de familias que confiaron en nosotros</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-brand-600">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <Quote className="w-6 h-6 text-brand-200 mb-2" />
                <p className="text-gray-700 text-sm leading-relaxed mb-4">{t.text}</p>
                <div className="border-t border-gray-100 pt-3">
                  <p className="font-bold text-gray-900 text-sm">{t.author}</p>
                  <p className="text-gray-400 text-xs">{t.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Video institucional */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-sm font-bold text-brand-600 uppercase tracking-widest mb-3">Video institucional</h2>
            <p className="text-2xl font-black text-gray-900 flex items-center justify-center gap-2">
              <Play className="w-6 h-6 text-brand-600" />
              Conocé nuestra oficina
            </p>
          </div>
          <div className="relative w-full rounded-2xl overflow-hidden shadow-lg bg-black h-[300px] md:h-[500px]">
            <iframe
              src="https://www.youtube.com/embed/l7woKym9w50?rel=0&modestbranding=1"
              title="SI Inmobiliaria — Video institucional"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
          <p className="text-center text-gray-400 text-sm mt-4">Visitanos en Funes o Roldán — te esperamos</p>
        </div>
      </section>

      {/* 9. Dónde encontrarnos */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-sm font-bold text-brand-600 uppercase tracking-widest mb-3">Nuestras oficinas</h2>
            <p className="text-2xl font-black text-gray-900">Tres ubicaciones para atenderte mejor</p>
          </div>

          {/* 3 Office cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

            {/* Roldán Histórica */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">🏛️</span>
                  <div>
                    <h3 className="font-black text-gray-900 text-lg leading-tight">Oficina Histórica</h3>
                    <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded uppercase tracking-wider">Desde 1983</span>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600 mb-5">
                  <p className="flex items-start gap-2"><MapPin className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" /> 1ro de Mayo 258, Roldán</p>
                  <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-brand-600 flex-shrink-0" /> <span className="font-numeric">(341) 210-1694</span></p>
                  <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-brand-600 flex-shrink-0" /> Lunes a Viernes 9 a 17hs</p>
                </div>
                <a href="https://maps.google.com/?q=1ro+de+Mayo+258+Roldan+Santa+Fe" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-colors w-full justify-center">
                  <ExternalLink className="w-4 h-4" /> Cómo llegar
                </a>
              </div>
            </div>

            {/* Roldán Ventas */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">🏢</span>
                  <div>
                    <h3 className="font-black text-gray-900 text-lg leading-tight">Oficina Ventas</h3>
                    <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded uppercase tracking-wider">Desde 2015</span>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600 mb-5">
                  <p className="flex items-start gap-2"><MapPin className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" /> Catamarca 775, Roldán</p>
                  <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-brand-600 flex-shrink-0" /> <span className="font-numeric">(341) 210-1694</span></p>
                  <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-brand-600 flex-shrink-0" /> Lunes a Viernes 9 a 17hs</p>
                </div>
                <a href="https://maps.google.com/?q=Catamarca+775+Roldan+Santa+Fe" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-colors w-full justify-center">
                  <ExternalLink className="w-4 h-4" /> Cómo llegar
                </a>
              </div>
            </div>

            {/* Funes + Galería */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm border-2 border-brand-500 hover:shadow-md hover:-translate-y-0.5 transition-all relative">
              <div className="absolute top-3 right-3 z-10">
                <span className="text-[10px] font-bold text-white bg-brand-600 px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">Nuevo 2024</span>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🎨</span>
                  <div>
                    <h3 className="font-black text-gray-900 text-lg leading-tight">Oficina Funes</h3>
                    <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded uppercase tracking-wider">Desde 2024</span>
                  </div>
                </div>
                <p className="text-brand-600 text-xs font-semibold mb-4">Inmobiliaria + Galería de Arte</p>
                <div className="space-y-2 text-sm text-gray-600 mb-5">
                  <p className="flex items-start gap-2"><MapPin className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" /> Hipólito Yrigoyen 2643, Funes</p>
                  <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-brand-600 flex-shrink-0" /> <span className="font-numeric">(341) 210-1694</span></p>
                  <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-brand-600 flex-shrink-0" /> Lunes a Viernes 9 a 17hs</p>
                </div>
                <a href="https://maps.google.com/?q=Hipolito+Yrigoyen+2643+Funes+Santa+Fe" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-colors w-full justify-center">
                  <ExternalLink className="w-4 h-4" /> Cómo llegar
                </a>
              </div>
            </div>
          </div>

          {/* Map with 3 markers */}
          <OfficesMap />

        </div>
      </section>

      {/* 10. CTA Final */}
      <section className="bg-brand-600 py-16 px-4 text-center">
        <h2 className="text-white font-black text-3xl md:text-4xl mb-4">¿Querés trabajar con nosotros?</h2>
        <p className="text-brand-200 text-lg mb-8 max-w-lg mx-auto">
          Contactanos y contanos tu proyecto. Te contactamos en menos de 24 horas.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/tasaciones"
            className="px-8 py-4 bg-white text-brand-600 hover:bg-brand-50 font-black rounded-lg transition-colors text-lg"
          >
            Solicitá tu tasación en 24hs
          </Link>
          <Link
            href="/propiedades"
            className="px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-brand-600 font-bold rounded-lg transition-colors"
          >
            Ver propiedades
          </Link>
        </div>
      </section>

    </div>
  )
}
