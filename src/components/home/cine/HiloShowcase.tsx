'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useScrollProgress, tramo, suave } from './useScrollProgress'

const RALEWAY = "var(--font-raleway), 'Raleway', system-ui, sans-serif"
const POPPINS = "var(--font-poppins), 'Poppins', system-ui, sans-serif"

// HILO es un producto aparte de la marca SI: va en su índigo.
const INDIGO = '#211E78'
const LILA = '#8F8BFF'
const FONDO = '#06050D'

type Paso = { eyebrow: string; titulo: string; texto: string }
const PASOS: Paso[] = [
  {
    eyebrow: 'Consultas',
    titulo: 'Ninguna consulta se pierde.',
    texto:
      'La IA de HILO lee cada consulta que entra —web, portales, WhatsApp o mail— y la pone en manos del agente que conoce esa propiedad.',
  },
  {
    eyebrow: 'Difusión',
    titulo: 'Tu propiedad, en todas partes.',
    texto:
      'Se carga una vez y HILO la publica en nuestra web y en los principales portales, con fotos optimizadas y la ubicación exacta para que aparezca en cada búsqueda.',
  },
  {
    eyebrow: 'Tasaciones',
    titulo: 'Un precio con datos, no con intuición.',
    texto:
      'Cruzamos comparables reales de la zona con el mercado del momento para llegar a un valor que se sostiene en la negociación.',
  },
  {
    eyebrow: 'Informes',
    titulo: 'Siempre sabés qué pasa con tu propiedad.',
    texto:
      'Un informe claro: cuánta gente la vio, cuántos consultaron, qué dijeron en las visitas y cuál es el próximo paso.',
  },
]

export default function HiloShowcase() {
  return (
    <div style={{ background: FONDO }} className="relative text-white">
      <Intro />
      <Pasos />
      <Cierre />
    </div>
  )
}

// ─── 1 · Intro: el wordmark gigante y el hilo de luz ─────────────────────────

function Intro() {
  const wrap = useRef<HTMLElement>(null)
  const trazo = useRef<SVGPathElement>(null)
  const brillo = useRef<SVGPathElement>(null)
  const marca = useRef<HTMLDivElement>(null)
  const bajada = useRef<HTMLDivElement>(null)
  const eyebrow = useRef<HTMLParagraphElement>(null)

  useScrollProgress(wrap, (p) => {
    const d = suave(tramo(p, 0.0, 0.55))
    for (const el of [trazo.current, brillo.current]) {
      if (el) el.style.strokeDashoffset = String(1 - d)
    }
    const m = suave(tramo(p, 0.08, 0.5))
    if (marca.current) {
      marca.current.style.opacity = String(m)
      marca.current.style.transform = `scale(${0.86 + m * 0.14})`
      marca.current.style.letterSpacing = `${0.12 - m * 0.16}em`
      marca.current.style.filter = m < 0.99 ? `blur(${(1 - m) * 18}px)` : 'none'
    }
    if (eyebrow.current) eyebrow.current.style.opacity = String(suave(tramo(p, 0.02, 0.2)))
    const b = suave(tramo(p, 0.45, 0.8))
    if (bajada.current) {
      bajada.current.style.opacity = String(b)
      bajada.current.style.transform = `translate3d(0, ${(1 - b) * 40}px, 0)`
    }
  })

  return (
    <section ref={wrap} className="relative" style={{ height: '230vh' }}>
      <div className="sticky top-0 flex flex-col items-center justify-center overflow-hidden px-6" style={{ height: '100svh' }}>
        {/* Resplandor índigo de fondo */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(60% 45% at 50% 55%, ${INDIGO}cc 0%, ${INDIGO}33 45%, transparent 75%)`,
          }}
        />
        {/* El hilo */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="hiloGrad" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor={LILA} stopOpacity="0" />
              <stop offset="0.25" stopColor={LILA} />
              <stop offset="0.6" stopColor="#ffffff" />
              <stop offset="1" stopColor={LILA} stopOpacity="0.2" />
            </linearGradient>
            <filter id="hiloGlow" x="-10%" y="-50%" width="120%" height="200%">
              <feGaussianBlur stdDeviation="8" />
            </filter>
          </defs>
          {[
            { r: brillo, w: 10, f: 'url(#hiloGlow)', o: 0.7 },
            { r: trazo, w: 2, f: undefined, o: 1 },
          ].map(({ r, w, f, o }, i) => (
            <path
              key={i}
              ref={r}
              d="M -40 640 C 220 640, 300 300, 520 360 S 820 700, 980 520 S 1240 230, 1480 300"
              fill="none"
              stroke="url(#hiloGrad)"
              strokeWidth={w}
              strokeLinecap="round"
              pathLength={1}
              filter={f}
              opacity={o}
              style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>

        <p
          ref={eyebrow}
          className="relative"
          style={{ fontFamily: RALEWAY, fontWeight: 600, fontSize: 13, letterSpacing: '0.32em', textTransform: 'uppercase', color: LILA, opacity: 0 }}
        >
          Tecnología propia
        </p>
        <div
          ref={marca}
          className="relative mt-2 select-none"
          style={{
            fontFamily: RALEWAY,
            fontWeight: 800,
            fontSize: 'clamp(116px, 21vw, 340px)',
            lineHeight: 0.9,
            opacity: 0,
            background: `linear-gradient(180deg, #ffffff 20%, ${LILA} 100%)`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            willChange: 'transform, opacity, filter',
          }}
        >
          HILO
        </div>
        <div ref={bajada} className="relative mt-6 max-w-[720px] text-center" style={{ opacity: 0 }}>
          <h2
            style={{ fontFamily: RALEWAY, fontWeight: 700, fontSize: 'clamp(26px, 3.4vw, 44px)', lineHeight: 1.12, letterSpacing: '-0.03em' }}
          >
            Detrás de cada propiedad, un sistema que piensa.
          </h2>
          <p className="mx-auto mt-5 max-w-[560px] text-white/65" style={{ fontFamily: RALEWAY, fontWeight: 500, fontSize: 'clamp(16px, 1.4vw, 19px)', lineHeight: 1.55 }}>
            HILO es el CRM que desarrollamos en SI INMOBILIARIA, con inteligencia artificial integrada.
            Nuestros agentes trabajan con él todos los días. Vos lo notás en la velocidad.
          </p>
        </div>
      </div>
    </section>
  )
}

// ─── 2 · Los cuatro pasos con el "producto" en pantalla ──────────────────────

function Pasos() {
  const wrap = useRef<HTMLElement>(null)
  const barras = useRef<(HTMLSpanElement | null)[]>([])
  const [activo, setActivo] = useState(0)
  const [local, setLocal] = useState(0)

  useScrollProgress(wrap, (p) => {
    const x = Math.min(PASOS.length - 0.0001, p * PASOS.length)
    const i = Math.floor(x)
    setActivo((a) => (a === i ? a : i))
    // Progreso dentro del paso, cuantizado para no re-renderizar en cada px.
    const k = Math.round((x - i) * 20) / 20
    setLocal((l) => (l === k ? l : k))
    barras.current.forEach((b, j) => {
      if (b) b.style.transform = `scaleX(${j < i ? 1 : j > i ? 0 : x - i})`
    })
  })

  return (
    <section ref={wrap} className="relative" style={{ height: `${PASOS.length * 110}vh` }}>
      <div className="sticky top-0 mx-auto flex max-w-[1280px] flex-col justify-center gap-6 px-5 lg:flex-row lg:items-center lg:gap-16 lg:px-10" style={{ height: '100svh' }}>
        {/* Texto */}
        <div className="order-2 lg:order-1 lg:w-[42%]">
          <div className="mb-6 hidden gap-2 lg:flex">
            {PASOS.map((p, j) => (
              <span key={p.eyebrow} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/15">
                <span
                  ref={(el) => { barras.current[j] = el }}
                  className="block h-full w-full origin-left rounded-full"
                  style={{ background: LILA, transform: 'scaleX(0)' }}
                />
              </span>
            ))}
          </div>
          <div className="relative min-h-[210px] lg:min-h-[300px]">
            {PASOS.map((p, j) => (
              <div
                key={p.eyebrow}
                className="absolute inset-0"
                aria-hidden={j !== activo}
                style={{
                  opacity: j === activo ? 1 : 0,
                  transform: `translate3d(0, ${j === activo ? 0 : j < activo ? -24 : 24}px, 0)`,
                  filter: j === activo ? 'none' : 'blur(8px)',
                  transition: 'opacity 600ms ease, transform 700ms cubic-bezier(.2,.7,.2,1), filter 600ms ease',
                }}
              >
                <p style={{ fontFamily: POPPINS, fontWeight: 600, fontSize: 13, letterSpacing: '0.2em', textTransform: 'uppercase', color: LILA }}>
                  <span className="font-numeric">0{j + 1}</span> · {p.eyebrow}
                </p>
                <h3 className="mt-3" style={{ fontFamily: RALEWAY, fontWeight: 800, fontSize: 'clamp(30px, 3.6vw, 54px)', lineHeight: 1.02, letterSpacing: '-0.04em' }}>
                  {p.titulo}
                </h3>
                <p className="mt-4 max-w-[460px] text-white/65" style={{ fontFamily: RALEWAY, fontWeight: 500, fontSize: 'clamp(15px, 1.25vw, 18px)', lineHeight: 1.55 }}>
                  {p.texto}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Pantalla */}
        <div className="order-1 lg:order-2 lg:w-[58%]">
          <Ventana>
            <Pantalla visible={activo === 0}><ScrConsultas k={activo === 0 ? local : activo > 0 ? 1 : 0} /></Pantalla>
            <Pantalla visible={activo === 1}><ScrDifusion k={activo === 1 ? local : activo > 1 ? 1 : 0} /></Pantalla>
            <Pantalla visible={activo === 2}><ScrTasacion k={activo === 2 ? local : activo > 2 ? 1 : 0} /></Pantalla>
            <Pantalla visible={activo === 3}><ScrInforme k={activo === 3 ? local : 0} /></Pantalla>
          </Ventana>
          <p className="mt-3 text-center text-[11px] text-white/35" style={{ fontFamily: RALEWAY }}>Pantallas ilustrativas de HILO.</p>
        </div>
      </div>
    </section>
  )
}

function Ventana({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative mx-auto w-full max-w-[680px] overflow-hidden rounded-[22px] lg:rounded-[26px]"
      style={{
        background: '#fff',
        boxShadow: `0 0 0 1px rgba(255,255,255,0.08), 0 40px 120px -20px ${INDIGO}, 0 30px 60px -30px rgba(0,0,0,0.8)`,
      }}
    >
      <div className="flex items-center gap-2 border-b border-black/5 px-4 py-3" style={{ background: '#FAFAFD' }}>
        <span className="h-[10px] w-[10px] rounded-full bg-[#FF5F57]" />
        <span className="h-[10px] w-[10px] rounded-full bg-[#FEBC2E]" />
        <span className="h-[10px] w-[10px] rounded-full bg-[#28C840]" />
        <span className="ml-3 text-[12px] font-extrabold tracking-[0.2em]" style={{ fontFamily: RALEWAY, color: INDIGO }}>HILO</span>
        <span className="ml-auto flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-semibold" style={{ fontFamily: RALEWAY, background: `${INDIGO}0f`, color: INDIGO }}>
          <Chispa /> IA activa
        </span>
      </div>
      <div className="relative h-[350px] sm:h-[370px] lg:h-[420px]">{children}</div>
    </div>
  )
}

function Pantalla({ visible, children }: { visible: boolean; children: React.ReactNode }) {
  return (
    <div
      className="absolute inset-0 p-4 sm:p-6"
      aria-hidden={!visible}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'scale(0.98)',
        transition: 'opacity 500ms ease, transform 600ms cubic-bezier(.2,.7,.2,1)',
        color: '#15132B',
        fontFamily: RALEWAY,
      }}
    >
      {children}
    </div>
  )
}

function Chispa({ size = 11 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2l2.2 6.3L20.5 10l-6.3 2.2L12 18.5l-2.2-6.3L3.5 10l6.3-1.7z" fill="currentColor" />
    </svg>
  )
}

// ─── Pantallas ───────────────────────────────────────────────────────────────

const CONSULTAS = [
  { canal: 'Web', de: 'Mariana G.', msg: 'Hola, ¿la casa de Kentucky sigue disponible?', ini: 'MG' },
  { canal: 'MercadoLibre', de: 'Tomás R.', msg: '¿Aceptan permuta por un depto en Rosario?', ini: 'TR' },
  { canal: 'WhatsApp', de: 'Lucía P.', msg: 'Quiero coordinar una visita para el sábado', ini: 'LP' },
  { canal: 'Argenprop', de: 'Diego M.', msg: '¿El lote de Roldán tiene servicios?', ini: 'DM' },
]

function ScrConsultas({ k }: { k: number }) {
  const n = Math.min(CONSULTAS.length, Math.floor(k * 5) + 1)
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-baseline justify-between">
        <p className="text-[15px] font-bold sm:text-[17px]">Bandeja de entrada</p>
        <p className="text-[11px] text-black/45"><span className="font-numeric">{n}</span> nuevas · hoy</p>
      </div>
      <div className="mt-3 flex flex-col gap-2 sm:gap-2.5">
        {CONSULTAS.map((c, i) => {
          const on = i < n
          const ruteada = i < n - 1 || k > 0.9
          return (
            <div
              key={c.de}
              className="flex items-center gap-3 rounded-2xl border border-black/[0.06] bg-white px-3 py-2.5 sm:py-3"
              style={{
                opacity: on ? 1 : 0,
                transform: on ? 'none' : 'translate3d(0, 14px, 0)',
                transition: 'opacity 450ms ease, transform 500ms cubic-bezier(.2,.7,.2,1)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              }}
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white" style={{ background: INDIGO }}>{c.ini}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] font-semibold leading-tight">
                  {c.de} <span className="ml-1 rounded-full bg-black/[0.05] px-1.5 py-0.5 text-[10px] font-semibold text-black/55">{c.canal}</span>
                </p>
                <p className="truncate text-[12px] text-black/55">{c.msg}</p>
              </div>
              <span
                className="hidden shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10.5px] font-semibold sm:flex"
                style={{
                  background: ruteada ? '#E7F5EE' : `${INDIGO}0f`,
                  color: ruteada ? '#00754A' : INDIGO,
                  transition: 'background 400ms, color 400ms',
                }}
              >
                <Chispa size={10} /> {ruteada ? 'Con su agente' : 'Leyendo…'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const PORTALES = ['siinmobiliaria.com', 'MercadoLibre', 'Argenprop', 'Zonaprop', 'Instagram']

function ScrDifusion({ k }: { k: number }) {
  const listos = Math.min(PORTALES.length, Math.floor(k * 6.5))
  return (
    <div className="flex h-full gap-4 sm:gap-6">
      <div className="hidden w-[44%] shrink-0 flex-col sm:flex">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
          <Image src="/images/hero/home-cine-poster.webp" alt="" fill sizes="300px" className="object-cover" />
          <span className="absolute left-2.5 top-2.5 rounded-full bg-[#1A5C38] px-2.5 py-1 text-[10.5px] font-semibold text-white">Venta</span>
        </div>
        <p className="mt-3 text-[15px] font-bold leading-tight">Casa en Funes</p>
        <p className="text-[12px] text-black/50">4 dorm · 3 baños · pileta</p>
        <span
          className="mt-auto rounded-full py-2.5 text-center text-[13px] font-bold text-white"
          style={{ background: INDIGO, boxShadow: listos > 0 ? `0 0 0 6px ${INDIGO}22` : 'none', transition: 'box-shadow 400ms' }}
        >
          {listos >= PORTALES.length ? 'Publicada en todos lados' : 'Activar'}
        </span>
      </div>
      <div className="flex flex-1 flex-col">
        <p className="text-[15px] font-bold sm:text-[17px]">Difusión</p>
        <p className="text-[11px] text-black/45"><span className="font-numeric">{listos}</span> de <span className="font-numeric">{PORTALES.length}</span> canales</p>
        <div className="mt-3 flex flex-col gap-2">
          {PORTALES.map((p, i) => {
            const ok = i < listos
            return (
              <div key={p} className="flex items-center justify-between rounded-xl border border-black/[0.06] px-3 py-2.5">
                <span className="text-[13px] font-semibold">{p}</span>
                <span
                  className="flex items-center gap-1.5 text-[11px] font-semibold"
                  style={{ color: ok ? '#00754A' : 'rgba(0,0,0,0.35)', transition: 'color 300ms' }}
                >
                  <span
                    className="grid h-[18px] w-[18px] place-items-center rounded-full text-[10px] text-white"
                    style={{ background: ok ? '#00754A' : 'rgba(0,0,0,0.12)', transform: ok ? 'scale(1)' : 'scale(0.8)', transition: 'all 350ms cubic-bezier(.3,1.6,.5,1)' }}
                  >
                    ✓
                  </span>
                  {ok ? 'Publicada' : 'En cola'}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function ScrTasacion({ k }: { k: number }) {
  const m = suave(Math.min(1, k * 1.6))
  const pos = 18 + m * 44 // marcador sobre la barra de rango
  return (
    <div className="flex h-full flex-col">
      <p className="text-[15px] font-bold sm:text-[17px]">Tasación · Casa en Funes</p>
      <p className="text-[11px] text-black/45">Comparables de la zona · mercado actual</p>
      <div className="mt-5 rounded-2xl p-4 sm:p-5" style={{ background: `${INDIGO}08` }}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/45">Valor sugerido</p>
        <p className="font-numeric mt-1 text-[30px] font-semibold leading-none tracking-tight sm:text-[40px]" style={{ fontFamily: POPPINS, color: INDIGO }}>
          USD <span style={{ opacity: 0.25 + m * 0.75 }}>{Math.round(250 + m * 35)}.000</span>
        </p>
        <div className="relative mt-5 h-2 rounded-full" style={{ background: `linear-gradient(90deg, ${INDIGO}22, ${INDIGO}, ${INDIGO}22)` }}>
          <span
            className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white"
            style={{ left: `${pos}%`, background: INDIGO, boxShadow: `0 0 0 6px ${INDIGO}22` }}
          />
        </div>
        <div className="font-numeric mt-2 flex justify-between text-[10.5px] text-black/45" style={{ fontFamily: POPPINS }}>
          <span>Mín.</span><span>Rango de mercado</span><span>Máx.</span>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {['Kentucky', 'Funes Hills', 'Villa Ángela'].map((b, i) => (
          <div
            key={b}
            className="rounded-xl border border-black/[0.06] p-2.5"
            style={{ opacity: k > 0.2 + i * 0.15 ? 1 : 0.25, transition: 'opacity 400ms' }}
          >
            <p className="text-[10.5px] text-black/45">Comparable</p>
            <p className="truncate text-[12px] font-bold">{b}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function ScrInforme({ k }: { k: number }) {
  const barras = [0.35, 0.5, 0.42, 0.68, 0.6, 0.85, 0.95]
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-baseline justify-between">
        <p className="text-[15px] font-bold sm:text-[17px]">Informe al propietario</p>
        <p className="text-[11px] text-black/45">Esta semana</p>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {[
          { l: 'Vistas de la ficha', v: 'Subiendo' },
          { l: 'Consultas', v: 'Nuevas' },
          { l: 'Visitas', v: 'Agendadas' },
        ].map((x) => (
          <div key={x.l} className="rounded-xl border border-black/[0.06] p-2.5">
            <p className="text-[10.5px] text-black/45">{x.l}</p>
            <p className="text-[13px] font-bold" style={{ color: '#00754A' }}>{x.v}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex h-[70px] items-end gap-1.5 sm:h-[90px]">
        {barras.map((b, i) => (
          <span
            key={i}
            className="flex-1 origin-bottom rounded-t-md"
            style={{
              height: `${b * 100}%`,
              background: i === barras.length - 1 ? INDIGO : `${INDIGO}33`,
              transform: `scaleY(${Math.min(1, Math.max(0.05, k * 2 - i * 0.12))})`,
              transition: 'transform 500ms cubic-bezier(.2,.7,.2,1)',
            }}
          />
        ))}
      </div>
      <div className="mt-3 rounded-2xl p-3 text-[12px] leading-relaxed" style={{ background: `${INDIGO}08`, opacity: k > 0.4 ? 1 : 0.2, transition: 'opacity 500ms' }}>
        <p className="mb-1 flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-[0.12em]" style={{ color: INDIGO }}>
          <Chispa size={10} /> Resumen
        </p>
        Las visitas destacan la luz y el jardín. Próximo paso: renovar las fotos del living y reforzar la difusión el fin de semana.
      </div>
    </div>
  )
}

// ─── 3 · Cierre ──────────────────────────────────────────────────────────────

function Cierre() {
  return (
    <section className="relative overflow-hidden px-6 pb-28 pt-20 text-center lg:pb-40 lg:pt-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%]"
        style={{ background: `radial-gradient(50% 60% at 50% 100%, ${INDIGO}aa 0%, transparent 70%)` }}
      />
      <h2
        className="relative mx-auto max-w-[900px]"
        style={{ fontFamily: RALEWAY, fontWeight: 800, fontSize: 'clamp(38px, 6vw, 88px)', lineHeight: 0.98, letterSpacing: '-0.045em' }}
      >
        Tecnología propia.
        <br />
        <span style={{ color: LILA }}>El trato de siempre.</span>
      </h2>
      <div className="relative mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href="/tasaciones"
          className="rounded-full px-7 py-3.5 text-[15px] font-bold text-white transition-transform hover:scale-[1.03]"
          style={{ background: '#00754A', fontFamily: RALEWAY, textDecoration: 'none' }}
        >
          Tasá tu propiedad
        </Link>
        <Link
          href="/propiedades"
          className="rounded-full border border-white/25 px-7 py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-white/10"
          style={{ fontFamily: RALEWAY, textDecoration: 'none' }}
        >
          Ver propiedades
        </Link>
      </div>
    </section>
  )
}
