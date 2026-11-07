// Landing de Nórdica 1 — complejo de 5 casas equipadas en Añelo (Vaca Muerta,
// Neuquén), en venta como UN solo conjunto bajo régimen de PH. Es una propiedad
// nativa de Hilo (900000694), no un development del feed, por eso es una ruta
// estática propia como Fincazul (le gana al [slug] dinámico). Assets locales en
// public/emprendimientos/nordica-1. Las consultas las atiende la captadora.

import type { Metadata } from 'next'
import Image from '@/components/Imagen'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Flame,
  Gauge,
  Home,
  MapPin,
  MessageCircle,
  ShieldCheck,
  TreePine,
} from 'lucide-react'
import FincazulGaleriaLazy from '@/components/fincazul/FincazulGaleriaLazy'

const GREEN = '#1A5C38'
const WA_TEXT = encodeURIComponent(
  'Hola Aldana! Quiero más información sobre Nórdica 1, el complejo de 5 casas en Añelo.',
)
// Captadora del complejo (regla: el captador atiende lo suyo).
const WA_URL = `https://wa.me/5493416847745?text=${WA_TEXT}`
const BASE = '/emprendimientos/nordica-1'
// Ficha completa de la propiedad en la web (misma publicación que los portales).
const FICHA_URL = '/propiedades/900000694-complejo-nordica-1-5-casas-equipadas-en-anelo-vaca-muerta'

export const metadata: Metadata = {
  title: 'Nórdica 1 · Complejo de 5 casas equipadas en Añelo, Vaca Muerta | SI INMOBILIARIA',
  description:
    'Nórdica 1: complejo terminado de 5 casas de 53 m² con 2 dormitorios en suite, equipadas, en el único sector forestado de Añelo. Régimen PH, renta en marcha. USD 650.000 por el conjunto.',
  alternates: { canonical: 'https://siinmobiliaria.com/emprendimientos/nordica-1' },
  openGraph: {
    title: 'Nórdica 1 · Complejo de 5 casas equipadas en Añelo, Vaca Muerta',
    description:
      '5 casas terminadas y equipadas, 2 dormitorios en suite cada una, en el único sector forestado de Añelo. Régimen PH. USD 650.000 por el conjunto.',
    url: 'https://siinmobiliaria.com/emprendimientos/nordica-1',
    siteName: 'SI INMOBILIARIA',
    images: [{ url: `${BASE}/og.jpg`, width: 1200, height: 630, alt: 'Nórdica 1 · Añelo' }],
    locale: 'es_AR',
    type: 'website',
  },
}

const SPECS = [
  '5 casas terminadas',
  '53 m² cada una',
  '2 dormitorios en suite',
  'Totalmente equipadas',
  'Régimen PH inscripto',
  'Parrilleros y cocheras',
]

const PILARES = [
  {
    icon: Home,
    titulo: 'Renta desde el día uno',
    texto:
      'Camas de hotelería, heladera, cocina, tres estufas y tres equipos de aire por casa, TV de 43". Una de las unidades ya está alquilada y hay demanda constante de la industria.',
  },
  {
    icon: Gauge,
    titulo: 'Control casa por casa',
    texto:
      'Medidores individuales de gas y electricidad, alarma y cámaras con acceso remoto. Inscripto como PH: cada unidad es independiente y se administra desde cualquier lugar.',
  },
  {
    icon: TreePine,
    titulo: 'El único lugar forestado',
    texto:
      'El terreno está 70 cm por encima de la calle y las casas 60 cm más: 1,30 m que lo dejaron afuera de las inundaciones de Añelo. Todas las instalaciones son accesibles sin romper pisos.',
  },
]

// Fotos reales del complejo (el drone de noche abre la galería) + la aérea satelital
// de La Forestada para mostrar el entorno.
const FOTOS = [
  'foto-05.jpg',
  'foto-03.jpg',
  'foto-01.jpg',
  'foto-04.jpg',
  'foto-06.jpg',
  'foto-07.jpg',
  'foto-10.jpg',
  'foto-11.jpg',
  'foto-09.jpg',
  'foto-08.jpg',
  'foto-02.jpg',
  'aerea-satelital.jpg',
]

const VIDEOS = [
  { id: 'iLdfCf8UPNE', titulo: 'Recorrido por el complejo', vertical: false },
  { id: 'qAy_pSef6oE', titulo: 'Las casas por dentro', vertical: true },
]

const PARA_QUIEN = [
  'Empresas de servicios petroleros que alojan equipos técnicos y gerenciales en Añelo.',
  'Inversores que buscan renta en dólares con unidades ya equipadas y funcionando.',
  'Estudios de arquitectura e ingeniería con obra en Vaca Muerta.',
]

function CtaWhatsApp({ label = 'Consultar por WhatsApp' }: { label?: string }) {
  return (
    <a
      href={WA_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm text-white transition-transform hover:-translate-y-0.5"
      style={{ background: '#25D366', fontFamily: 'var(--font-poppins), Poppins, sans-serif' }}
    >
      <MessageCircle className="w-4 h-4" /> {label}
    </a>
  )
}

export default function Nordica1Page() {
  return (
    <div className="bg-white" style={{ fontFamily: 'var(--font-raleway), Raleway, sans-serif' }}>
      {/* ── Hero ── */}
      <section className="relative min-h-[82vh] flex items-end overflow-hidden">
        <Image
          src={`${BASE}/foto-05.jpg`}
          alt="Nórdica 1 — vista aérea del complejo de noche"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/35" />
        <div className="relative z-10 w-full max-w-6xl mx-auto px-5 pb-14 pt-40 text-white">
          <Link
            href="/emprendimientos"
            className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Emprendimientos
          </Link>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 text-[10px] font-bold rounded-full text-white uppercase tracking-widest" style={{ background: GREEN }}>
              Terminado
            </span>
            <span className="px-3 py-1 text-[10px] font-bold rounded-full bg-white/15 text-white uppercase tracking-widest backdrop-blur-sm border border-white/25">
              Complejo de 5 casas · PH
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black leading-none mb-3 drop-shadow-lg">Nórdica 1</h1>
          <p className="text-xl md:text-2xl font-semibold text-white/95 mb-2">
            Cinco casas equipadas en el corazón de Vaca Muerta
          </p>
          <p className="flex items-center gap-1.5 text-white/80 text-sm mb-8">
            <MapPin className="w-4 h-4" /> La Maga 994 · La Forestada · Añelo, Neuquén
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <CtaWhatsApp label="Quiero saber más" />
            <Link
              href={FICHA_URL}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm bg-white/10 text-white border border-white/30 backdrop-blur-sm hover:bg-white/20 transition-colors"
              style={{ fontFamily: 'var(--font-poppins), Poppins, sans-serif' }}
            >
              Ver la ficha completa <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Intro ── */}
      <section className="py-16 md:py-20 px-5">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold tracking-[0.2em] uppercase mb-4" style={{ color: GREEN }}>
            La propuesta
          </p>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-5">
            Un complejo terminado, equipado y funcionando, pensado para la gente que trabaja en Vaca Muerta.
          </h2>
          <p className="text-gray-500 text-lg leading-relaxed">
            Nórdica 1 se construyó para arquitectos, ingenieros y mandos gerenciales de la
            industria petrolera, con terminaciones que no se ven en Añelo. Se vende el conjunto
            completo, con las cinco casas listas para rentar.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {SPECS.map((s) => (
              <span
                key={s}
                className="px-4 py-2 rounded-full text-[13px] font-semibold border"
                style={{ color: GREEN, borderColor: '#D5E5DB', background: '#F3F9F5', fontFamily: 'var(--font-poppins), Poppins, sans-serif' }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pilares ── */}
      <section className="pb-16 md:pb-20 px-5">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
          {PILARES.map(({ icon: Icon, titulo, texto }) => (
            <div key={titulo} className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm">
              <span
                className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4"
                style={{ background: '#E8F4EC', color: GREEN }}
              >
                <Icon className="w-6 h-6" strokeWidth={1.8} />
              </span>
              <h3 className="text-lg font-black text-gray-900 mb-2">{titulo}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Galería ── */}
      <section className="pb-16 md:pb-20 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] uppercase mb-2" style={{ color: GREEN }}>
                Galería
              </p>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900">Así es Nórdica 1 hoy</h2>
            </div>
          </div>
          <FincazulGaleriaLazy base={BASE} items={FOTOS} alt="Nórdica 1 — foto real" layout="renders" />
        </div>
      </section>

      {/* ── Videos ── */}
      <section className="pb-16 md:pb-20 px-5">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-bold tracking-[0.2em] uppercase mb-2" style={{ color: GREEN }}>
            En movimiento
          </p>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-6">Recorré el complejo</h2>
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-5">
            {VIDEOS.map((v) => (
              <div
                key={v.id}
                className={`relative overflow-hidden rounded-2xl bg-gray-100 ${v.vertical ? 'aspect-[9/16] md:max-h-[520px] md:justify-self-center md:w-[292px]' : 'aspect-video'}`}
              >
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${v.id}?rel=0&modestbranding=1`}
                  title={v.titulo}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Para quién ── */}
      <section className="py-16 md:py-20 px-5" style={{ background: '#F6F8F7' }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] uppercase mb-2" style={{ color: GREEN }}>
              Para quién
            </p>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-5">Alojamiento corporativo con renta en dólares</h2>
            <ul className="space-y-3.5 mb-8">
              {PARA_QUIEN.map((item) => (
                <li key={item} className="flex items-start gap-3 text-gray-700">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: GREEN }} />
                  <span className="text-[15px] leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
            <CtaWhatsApp label="Pedir la carpeta completa" />
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
            <Image
              src={`${BASE}/foto-03.jpg`}
              alt="Nórdica 1 — parrilleros y fachadas de noche"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </div>
        </div>
      </section>

      {/* ── Ubicación + la inversión ── */}
      <section className="py-16 md:py-20 px-5">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] uppercase mb-2" style={{ color: GREEN }}>
              Ubicación
            </p>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-4">La Forestada, Añelo</h2>
            <ul className="space-y-3 text-gray-600 text-[15px] leading-relaxed">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: GREEN }} />
                Añelo es la ciudad base de Vaca Muerta, el principal yacimiento de petróleo y gas no convencional de Argentina.
              </li>
              <li className="flex items-start gap-3">
                <TreePine className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: GREEN }} />
                La Forestada es el único sector arbolado de la ciudad: sombra, reparo del viento y un entorno distinto al resto de Añelo.
              </li>
              <li className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: GREEN }} />
                A 1,30 m sobre el nivel de la calle: el único lugar que no se vio afectado por las inundaciones.
              </li>
              <li className="flex items-start gap-3">
                <Flame className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: GREEN }} />
                Sector de parrilleros y estacionamiento asignado para cada unidad.
              </li>
            </ul>
          </div>
          <div className="rounded-2xl p-8 text-white flex flex-col justify-center" style={{ background: GREEN }}>
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-white/70 mb-3">La inversión</p>
            <p className="text-2xl md:text-[26px] font-black leading-snug mb-5">
              Las cinco casas, equipadas y en funcionamiento, en una sola operación.
            </p>
            <div className="flex flex-wrap gap-8">
              <div>
                <p className="text-3xl font-black" style={{ fontFamily: 'var(--font-poppins), Poppins, sans-serif' }}>USD 650.000</p>
                <p className="text-white/70 text-xs uppercase tracking-wider mt-1">el complejo completo</p>
              </div>
              <div>
                <p className="text-3xl font-black" style={{ fontFamily: 'var(--font-poppins), Poppins, sans-serif' }}>5 × 53 m²</p>
                <p className="text-white/70 text-xs uppercase tracking-wider mt-1">casas de 2 dormitorios en suite</p>
              </div>
            </div>
            <p className="text-white/70 text-sm mt-6 leading-relaxed">
              Inscripto bajo régimen de propiedad horizontal. El reglamento de copropiedad queda a definir por quien compre.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="pb-20 px-5">
        <div className="max-w-3xl mx-auto text-center rounded-3xl border border-gray-100 shadow-sm py-12 px-6">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-3">
            ¿Querés conocer Nórdica 1?
          </h2>
          <p className="text-gray-500 mb-7 max-w-xl mx-auto">
            Te mandamos la carpeta con planos, equipamiento y la renta actual. Sin compromiso.
          </p>
          <CtaWhatsApp />
        </div>
      </section>
    </div>
  )
}
