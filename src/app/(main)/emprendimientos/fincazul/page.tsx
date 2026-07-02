// Landing de Fincazul (MSR) — desarrollo comercializado por SI INMOBILIARIA.
// Fincazul no está en el feed Tokko/Hilo, por eso es una ruta estática propia
// (le gana al [slug] dinámico). Assets locales en public/emprendimientos/fincazul.

import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Download,
  Home,
  MapPin,
  MessageCircle,
  Shield,
  TreePine,
} from 'lucide-react'

const GREEN = '#1A5C38'
const WA_TEXT = encodeURIComponent(
  'Hola! Quiero más información sobre Fincazul, las casas en condominio en Funes.',
)
const WA_URL = `https://wa.me/5493412101694?text=${WA_TEXT}`
const BASE = '/emprendimientos/fincazul'

export const metadata: Metadata = {
  title: 'Fincazul · Casas en condominio en Funes | SI Inmobiliaria',
  description:
    'Fincazul: conjuntos privados de 12 casas con portón de acceso en Paseo del Norte, Funes. Casas de 2 dormitorios con jardín, piscina y parrillero propios. Desarrollado por MSR.',
  alternates: { canonical: 'https://siinmobiliaria.com/emprendimientos/fincazul' },
  openGraph: {
    title: 'Fincazul · Tu casa en condominio en Funes',
    description:
      'Conjuntos privados de 12 casas con portón de acceso. 2 dormitorios, jardín, piscina y parrillero propios. Paseo del Norte, Funes.',
    url: 'https://siinmobiliaria.com/emprendimientos/fincazul',
    siteName: 'SI Inmobiliaria',
    images: [{ url: `${BASE}/render-3.jpg`, width: 1500, height: 843, alt: 'Fincazul · Funes' }],
    locale: 'es_AR',
    type: 'website',
  },
}

const PILARES = [
  {
    icon: Shield,
    titulo: 'Tu seguridad',
    texto: 'Conjuntos privados de doce casas individuales con portón de acceso.',
  },
  {
    icon: TreePine,
    titulo: 'Tu privacidad',
    texto: 'Fachadas orientadas hacia el espacio de circulación interna, con 15 metros de distancia entre frentes.',
  },
  {
    icon: Home,
    titulo: 'Tu confort',
    texto: 'La dimensión precisa para tu vida: casas dúplex de 2 dormitorios y 2 baños, con jardín, piscina y parrillero propios.',
  },
]

const SPECS = [
  '12 casas dúplex',
  '2 dormitorios',
  '2 baños',
  'Estacionamiento',
  'Pileta y parrillero propios',
  'Portón de acceso y calle interna',
]

const PLANOS = [
  { src: 'plano-unidad.jpg', label: 'Planta baja y alta · Unidad tipo' },
  { src: 'plano-planta-baja.jpg', label: 'Planta baja · Conjunto' },
  { src: 'plano-planta-alta.jpg', label: 'Planta alta · Conjunto' },
  { src: 'plano-plantas-conjunto.jpg', label: 'Plantas · Conjunto completo' },
]

const OBRA_ITEMS = [
  'Nivelación y compactación del terreno finalizada',
  'Etapa de replanteo de pilotes finalizada',
  'Armando estructura de pilotes, próximos a hormigonar',
]

const RENDERS = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const OBRA_FOTOS = [1, 2, 3, 4, 5, 6]

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

export default function FincazulPage() {
  return (
    <div className="bg-white" style={{ fontFamily: 'var(--font-raleway), Raleway, sans-serif' }}>
      {/* ── Hero ── */}
      <section className="relative min-h-[78vh] flex items-end">
        <Image
          src={`${BASE}/render-3.jpg`}
          alt="Fincazul — casas en condominio en Funes"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/30" />
        <div className="relative z-10 w-full max-w-6xl mx-auto px-5 pb-14 pt-40 text-white">
          <Link
            href="/emprendimientos"
            className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Emprendimientos
          </Link>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 text-[10px] font-bold rounded-full text-white uppercase tracking-widest" style={{ background: GREEN }}>
              En construcción
            </span>
            <span className="px-3 py-1 text-[10px] font-bold rounded-full bg-white/15 text-white uppercase tracking-widest backdrop-blur-sm border border-white/25">
              Casas en condominio
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black leading-none mb-3 drop-shadow-lg">Fincazul</h1>
          <p className="text-xl md:text-2xl font-semibold text-white/95 mb-2">
            Tu casa en condominio en Funes
          </p>
          <p className="flex items-center gap-1.5 text-white/80 text-sm mb-8">
            <MapPin className="w-4 h-4" /> Paseo del Norte · Funes · a minutos de Fisherton
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <CtaWhatsApp label="Quiero saber más" />
            <a
              href="#obra"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm bg-white/10 text-white border border-white/30 backdrop-blur-sm hover:bg-white/20 transition-colors"
              style={{ fontFamily: 'var(--font-poppins), Poppins, sans-serif' }}
            >
              Ver avance de obra
            </a>
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
            Una propuesta innovadora que hace posible tu casa en el lugar de mayor potencial de Funes.
          </h2>
          <p className="text-gray-500 text-lg leading-relaxed">
            Viví en Funes muy cerca de Fisherton, en una zona con fuerte proyección de
            crecimiento de valor. Construidas por MSR Casa, con la experiencia y garantía
            de MSR: 250.000 m² construidos en 23 años de trayectoria.
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

      {/* ── Galería de renders ── */}
      <section className="pb-16 md:pb-20 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] uppercase mb-2" style={{ color: GREEN }}>
                Galería
              </p>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900">Así va a ser Fincazul</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {RENDERS.map((n, i) => (
              <div
                key={n}
                className={`relative rounded-xl overflow-hidden bg-gray-100 ${i === 0 ? 'col-span-2 md:col-span-2 md:row-span-2 aspect-[16/10] md:aspect-auto' : 'aspect-[4/3]'}`}
              >
                <Image
                  src={`${BASE}/render-${n}.jpg`}
                  alt={`Fincazul render ${n}`}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                  sizes={i === 0 ? '(max-width: 768px) 100vw, 66vw' : '(max-width: 768px) 50vw, 33vw'}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Planos ── */}
      <section id="planos" className="pb-16 md:pb-20 px-5">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-bold tracking-[0.2em] uppercase mb-2" style={{ color: GREEN }}>
            Planos
          </p>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-6">Conocé la unidad y el conjunto</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {PLANOS.map((p) => (
              <figure key={p.src} className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm">
                <div className="relative aspect-[2482/1755] bg-white">
                  <Image
                    src={`${BASE}/${p.src}`}
                    alt={`Fincazul — ${p.label}`}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <figcaption
                  className="px-5 py-3 text-[13px] font-semibold text-gray-600 border-t border-gray-100"
                  style={{ fontFamily: 'var(--font-poppins), Poppins, sans-serif' }}
                >
                  {p.label}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── Avance de obra ── */}
      <section id="obra" className="py-16 md:py-20 px-5" style={{ background: '#F6F8F7' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] uppercase mb-2" style={{ color: GREEN }}>
                Avance de obra · Junio 2026
              </p>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-5">Tu inversión avanza</h2>
              <ul className="space-y-3.5 mb-8">
                {OBRA_ITEMS.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-gray-700">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: GREEN }} />
                    <span className="text-[15px] leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
              <a
                href={`${BASE}/brochure.pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-bold hover:underline"
                style={{ color: GREEN, fontFamily: 'var(--font-poppins), Poppins, sans-serif' }}
              >
                <Download className="w-4 h-4" /> Descargar presentación (PDF)
              </a>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {OBRA_FOTOS.map((n) => (
                <div key={n} className={`relative rounded-lg overflow-hidden bg-gray-200 ${n === 1 ? 'col-span-3 aspect-[16/9]' : 'aspect-square'}`}>
                  <Image
                    src={`${BASE}/obra-${n}.jpg`}
                    alt={`Avance de obra Fincazul ${n}`}
                    fill
                    className="object-cover"
                    sizes={n === 1 ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 33vw, 16vw'}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Ubicación + respaldo ── */}
      <section className="py-16 md:py-20 px-5">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] uppercase mb-2" style={{ color: GREEN }}>
              Ubicación
            </p>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-4">Paseo del Norte, Funes</h2>
            <ul className="space-y-3 text-gray-600 text-[15px] leading-relaxed">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: GREEN }} />
                En el sector de mayor potencial de Funes, muy cerca de Fisherton.
              </li>
              <li className="flex items-start gap-3">
                <ArrowRight className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: GREEN }} />
                Zona con fuerte proyección de crecimiento de valor.
              </li>
              <li className="flex items-start gap-3">
                <Home className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: GREEN }} />
                Rodeado de barrios consolidados, comercios y servicios.
              </li>
            </ul>
          </div>
          <div className="rounded-2xl p-8 text-white flex flex-col justify-center" style={{ background: GREEN }}>
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-white/70 mb-3">El respaldo</p>
            <p className="text-2xl md:text-[26px] font-black leading-snug mb-5">
              Construido por MSR Casa, comercializado por SI INMOBILIARIA.
            </p>
            <div className="flex gap-8">
              <div>
                <p className="text-3xl font-black" style={{ fontFamily: 'var(--font-poppins), Poppins, sans-serif' }}>250.000</p>
                <p className="text-white/70 text-xs uppercase tracking-wider mt-1">m² construidos</p>
              </div>
              <div>
                <p className="text-3xl font-black" style={{ fontFamily: 'var(--font-poppins), Poppins, sans-serif' }}>23</p>
                <p className="text-white/70 text-xs uppercase tracking-wider mt-1">años de trayectoria</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="pb-20 px-5">
        <div className="max-w-3xl mx-auto text-center rounded-3xl border border-gray-100 shadow-sm py-12 px-6">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-3">
            ¿Querés conocer Fincazul?
          </h2>
          <p className="text-gray-500 mb-7 max-w-xl mx-auto">
            Te contamos precios, financiación y disponibilidad de unidades. Sin compromiso.
          </p>
          <CtaWhatsApp />
        </div>
      </section>
    </div>
  )
}
