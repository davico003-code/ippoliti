// "Dos generaciones" + las tres sedes, en dos variantes para elegir:
//   linea    → historia 1983 → 2015 → 2024 con una línea verde que se dibuja
//   tarjetas → tres tarjetas con el año grande sobre la foto
// Las dos suman lo que faltaba: "Cómo llegar", WhatsApp y abierto/cerrado.
// Todo HTML + CSS (la línea usa scroll-driven animations); solo el estado
// abierto/cerrado corre en el navegador.

import Image from 'next/image'
import { MapPin } from 'lucide-react'
import EncabezadoSeccion from './EncabezadoSeccion'
import EstadoSede, { type Horario } from './EstadoSede'

const RALEWAY = "var(--font-raleway), 'Raleway', system-ui, sans-serif"
const POPPINS = "var(--font-poppins), 'Poppins', system-ui, sans-serif"
const VERDE = '#1A5C38'
const WHATSAPP = '5493413340916'

type Sede = {
  anio: string
  nombre: string
  subtitulo: string
  direccion: string
  foto: string
  horario: Horario | null
  etiqueta?: string
}

const SEDES: Sede[] = [
  { anio: '1983', nombre: 'Oficina Histórica', subtitulo: 'Donde empezó todo · Roldán', direccion: '1ro de Mayo 258, Roldán', foto: '/oficina-historica.webp', horario: null },
  { anio: '2015', nombre: 'Oficina Ventas', subtitulo: 'Sede comercial · Roldán', direccion: 'Catamarca 775, Roldán', foto: '/oficina-ruta9.webp', horario: null },
  { anio: '2024', nombre: 'Oficina Funes', subtitulo: 'Inmobiliaria + Galería de Arte', direccion: 'Hipólito Yrigoyen 2643, Funes', foto: '/oficina-funes.webp', etiqueta: 'Nueva', horario: { 1: [9, 17], 2: [9, 17], 3: [9, 17], 4: [9, 17], 5: [9, 17], 6: [9, 13] } },
]

const CIFRAS = [
  { n: '1983', l: 'Desde' },
  { n: '43', l: 'Años' },
  { n: '3', l: 'Sedes' },
  { n: '2', l: 'Generaciones' },
]

const mapa = (s: Sede) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`SI INMOBILIARIA ${s.direccion}, Santa Fe`)}`
const wsp = (s: Sede) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hola! Quiero pasar por la ${s.nombre} (${s.direccion}).`)}`

function Acciones({ s }: { s: Sede }) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <a
        href={mapa(s)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 px-4 py-2 text-[13px] font-bold text-gray-900 transition-colors hover:border-gray-900"
        style={{ fontFamily: RALEWAY, textDecoration: 'none' }}
      >
        <MapPin className="h-3.5 w-3.5" /> Cómo llegar
      </a>
      <a
        href={wsp(s)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-bold text-white transition-opacity hover:opacity-90"
        style={{ background: VERDE, fontFamily: RALEWAY, textDecoration: 'none' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.7a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3Z" /></svg>
        WhatsApp
      </a>
    </div>
  )
}

function Cifras() {
  return (
    <div className="revela mt-10 grid grid-cols-2 gap-y-8 border-t border-black/10 pt-8 md:grid-cols-4">
      {CIFRAS.map(c => (
        <div key={c.l}>
          <p className="font-numeric" style={{ fontFamily: POPPINS, fontWeight: 600, fontSize: 'clamp(40px, 4.4vw, 60px)', lineHeight: 1, letterSpacing: '-0.04em', color: '#111' }}>
            {c.n}
          </p>
          <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500" style={{ fontFamily: RALEWAY }}>{c.l}</p>
        </div>
      ))}
    </div>
  )
}

function Encabezado() {
  return (
    <EncabezadoSeccion
      eyebrow="Dos generaciones"
      titulo={<>No vendemos casas.<br /><span style={{ color: VERDE }}>Acompañamos historias.</span></>}
      bajada="Empezamos en 1983 cuando Susana abrió la primera oficina en Roldán. Hoy somos un equipo en tres sedes, pero seguimos pensándonos como un estudio: pocos clientes a la vez, mucha cabeza puesta en cada uno."
    />
  )
}

// ─── Variante 1 · Línea de tiempo ────────────────────────────────────────────

function Linea() {
  return (
    <div className="relative mt-12">
      {/* La línea pasa solo por los puntos: vertical en celular (a la
          izquierda), horizontal en compu (debajo de los años). */}
      <div aria-hidden="true" className="sedes-linea absolute left-[11px] top-3 bottom-3 w-[2px] md:left-3 md:right-0 md:top-[47px] md:bottom-auto md:h-[2px] md:w-auto" />
      <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
        {SEDES.map(s => (
          <article key={s.anio} className="revela relative pl-12 md:pl-0">
            <p className="font-numeric md:h-[26px]" style={{ fontFamily: POPPINS, fontWeight: 600, fontSize: 28, letterSpacing: '-0.03em', color: VERDE, lineHeight: 1 }}>
              {s.anio}
            </p>
            <span aria-hidden="true" className="absolute left-0 top-[2px] grid h-6 w-6 place-items-center rounded-full bg-white md:static md:mt-[10px]" style={{ boxShadow: `0 0 0 2px ${VERDE}` }}>
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: VERDE }} />
            </span>
            <div className="group relative mt-3 aspect-[4/3] overflow-hidden rounded-2xl md:mt-6">
              <Image src={s.foto} alt={`${s.nombre} de SI INMOBILIARIA — ${s.direccion}`} fill sizes="(min-width: 768px) 380px, 90vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
              {s.etiqueta && (
                <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.12em]" style={{ color: VERDE, fontFamily: RALEWAY }}>{s.etiqueta}</span>
              )}
            </div>
            <h3 className="mt-4 text-[22px] font-extrabold tracking-[-0.02em] text-gray-900" style={{ fontFamily: RALEWAY }}>{s.nombre}</h3>
            <p className="text-[14px] font-semibold text-gray-500" style={{ fontFamily: RALEWAY }}>{s.subtitulo}</p>
            <p className="mt-2 flex items-center gap-1.5 text-[14px] text-gray-700" style={{ fontFamily: RALEWAY }}>
              <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" /> {s.direccion}
            </p>
            {s.horario && <div className="mt-3"><EstadoSede horario={s.horario} /></div>}
            <Acciones s={s} />
          </article>
        ))}
      </div>
    </div>
  )
}

// ─── Variante 2 · Tarjetas con el año grande ─────────────────────────────────

function Tarjetas() {
  return (
    <div className="-mx-5 mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0" style={{ scrollbarWidth: 'none' }}>
      {SEDES.map(s => (
        <article key={s.anio} className="revela min-w-[82%] snap-start overflow-hidden rounded-3xl bg-white md:min-w-0" style={{ boxShadow: '0 1px 2px rgba(0,0,0,.04), 0 24px 50px -24px rgba(17,24,39,.25)' }}>
          <div className="group relative aspect-[4/5] overflow-hidden">
            <Image src={s.foto} alt={`${s.nombre} de SI INMOBILIARIA — ${s.direccion}`} fill sizes="(min-width: 768px) 380px, 82vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.05]" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,.45) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0) 55%, rgba(0,0,0,.7) 100%)' }} />
            <p className="font-numeric absolute left-5 top-4 text-white" style={{ fontFamily: POPPINS, fontWeight: 600, fontSize: 44, letterSpacing: '-0.04em', lineHeight: 1 }}>{s.anio}</p>
            {s.etiqueta && (
              <span className="absolute right-4 top-5 rounded-full bg-white px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.12em]" style={{ color: VERDE, fontFamily: RALEWAY }}>{s.etiqueta}</span>
            )}
            <div className="absolute inset-x-5 bottom-4 text-white">
              <h3 className="text-[24px] font-extrabold tracking-[-0.02em]" style={{ fontFamily: RALEWAY }}>{s.nombre}</h3>
              <p className="text-[13px] font-semibold text-white/85" style={{ fontFamily: RALEWAY }}>{s.subtitulo}</p>
            </div>
          </div>
          <div className="p-5">
            <p className="flex items-center gap-1.5 text-[14px] text-gray-700" style={{ fontFamily: RALEWAY }}>
              <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" /> {s.direccion}
            </p>
            {s.horario && <div className="mt-3"><EstadoSede horario={s.horario} /></div>}
            <Acciones s={s} />
          </div>
        </article>
      ))}
    </div>
  )
}

export default function SedesModernas({ variante }: { variante: 'linea' | 'tarjetas' }) {
  return (
    <section className="bg-white px-5 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-[1200px]">
        <Encabezado />
        <Cifras />
        <div className="mt-16">
          <EncabezadoSeccion eyebrow="Nuestras sedes" titulo="Tres lugares para encontrarnos." nivel="h3" />
        </div>
        {variante === 'linea' ? <Linea /> : <Tarjetas />}
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .sedes-linea { background: linear-gradient(90deg, ${VERDE}, #00754A 60%, ${VERDE}); transform-origin: top left; }
        @supports (animation-timeline: view()) {
          @media (prefers-reduced-motion: no-preference) {
            .sedes-linea { animation: sedesLinea linear both; animation-timeline: view(); animation-range: entry 0% cover 38%; }
          }
        }
        @keyframes sedesLinea { from { transform: scale(var(--sx, 1), var(--sy, 0)); } to { transform: none; } }
        @media (min-width: 768px) { .sedes-linea { --sx: 0; --sy: 1; } }
      ` }} />
    </section>
  )
}
