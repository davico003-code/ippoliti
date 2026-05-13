import Link from 'next/link'
import { BARRIOS, type Barrio, type BarrioTier } from '@/lib/barrios'

// Tier-grouped editorial grid del hub /barrios-privados.
// Referencia visual: 11-landings/index.html — cards con gradiente palette
// + iniciales semitransparentes + chip tier coloreado.

const TIER_ORDER: BarrioTier[] = [
  'Premium',
  'Consolidado',
  'Consolidado con vida joven',
  'En desarrollo',
]

const TIER_SUBTITLE: Record<BarrioTier, string> = {
  Premium:
    'El country tradicional de Funes — marca histórica, vecindario discreto, ticket más alto.',
  Consolidado:
    'Tres barrios del cluster Funes Hills — comunidad establecida, vecindario probado.',
  'Consolidado con vida joven':
    'Barrios consolidados con perfil de vecindario más joven y dinámico.',
  'En desarrollo':
    'Cinco proyectos en obra activa — oportunidad de entrar antes de la entrega final.',
}

const TIER_FALLBACK_COLOR: Record<BarrioTier, string> = {
  Premium: '#C9A961',
  Consolidado: '#1A5C38',
  'Consolidado con vida joven': '#5A9F70',
  'En desarrollo': '#666666',
}

function iniciales(nombre: string): string {
  const limpio = nombre.replace(/[^a-zA-Záéíóúñ ]/gi, '').trim()
  const palabras = limpio.split(/\s+/)
  if (palabras.length >= 2 && palabras[0].length >= 1 && palabras[1].length >= 1) {
    return (palabras[0][0] + palabras[1][0]).toUpperCase()
  }
  return limpio.slice(0, 2).toUpperCase()
}

function metaSummary(b: Barrio): string {
  const stat = b.stats?.[0]
  const sup = b.stats?.[1]
  if (stat && sup) {
    return `${stat.value}${stat.unit ? ' ' + stat.unit : ''} ${stat.label.toLowerCase()} · ${sup.value}${sup.unit ? ' ' + sup.unit : ''} ${sup.label.toLowerCase()}`
  }
  if (b.datosDuros.cantidadLotes && b.datosDuros.hectareasTotales) {
    return `${b.datosDuros.cantidadLotes} lotes · ${b.datosDuros.hectareasTotales} ha`
  }
  if (b.datosDuros.cantidadLotes) return `${b.datosDuros.cantidadLotes} lotes`
  return `${b.zona === 'funes' ? 'Funes' : 'Roldán'}, Santa Fe`
}

export default function BarrioHubTierGrid() {
  const porTier = TIER_ORDER.map((tier) => ({
    tier,
    barrios: (BARRIOS as Barrio[]).filter((b) => b.tier === tier),
  })).filter((g) => g.barrios.length > 0)

  return (
    <div>
      {porTier.map(({ tier, barrios }) => (
        <section
          key={tier}
          className="mx-auto max-w-[1280px] border-b border-[rgba(15,15,15,0.08)] px-6 py-16 last:border-b-0 last:pb-32 md:px-10 md:py-20"
        >
          <header className="mb-12">
            <h2 className="mb-4 font-raleway text-[clamp(32px,5vw,64px)] font-medium leading-none tracking-tight text-[#0F0F0F]">
              {tier}
            </h2>
            <p className="max-w-[720px] font-raleway text-[18px] font-light italic leading-[1.55] text-[#6B6B6B] md:text-[20px]">
              {TIER_SUBTITLE[tier]}
            </p>
          </header>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {barrios.map((b) => (
              <BarrioHubCard key={b.slug} barrio={b} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function BarrioHubCard({ barrio }: { barrio: Barrio }) {
  const ubicacion =
    barrio.ubicacionEditorial ??
    (barrio.zona === 'funes' ? 'Funes, Santa Fe' : 'Roldán, Santa Fe')
  const tierColor = barrio.tierColor ?? TIER_FALLBACK_COLOR[barrio.tier]
  const palette = barrio.palette
  const gradient = palette
    ? `linear-gradient(135deg, ${palette.from} 0%, ${palette.to} 100%)`
    : `linear-gradient(135deg, #1A5C38 0%, #2D7A4F 100%)`

  return (
    <Link
      href={`/barrios-privados/${barrio.slug}`}
      className="group flex flex-col overflow-hidden rounded-sm border border-[rgba(15,15,15,0.08)] bg-white transition duration-300 hover:-translate-y-1 hover:border-[#1A5C38] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]"
    >
      <div
        className="relative flex aspect-[4/3] items-end justify-start p-6"
        style={{ background: gradient }}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
        <span className="relative z-10 font-poppins text-[56px] font-medium leading-none text-white/65">
          {iniciales(barrio.nombre)}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-7 md:p-8">
        <span
          className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em]"
          style={{ color: tierColor }}
        >
          {barrio.tier}
        </span>
        <h3 className="mb-2 font-raleway text-[28px] font-semibold leading-[1.05] tracking-tight text-[#0F0F0F] md:text-[32px]">
          {barrio.nombre}
        </h3>
        {barrio.subtitulo && (
          <p className="mb-5 font-raleway text-[15px] font-normal leading-[1.45] text-[#8B7355] md:text-[16px]">
            {barrio.subtitulo}
          </p>
        )}
        <p className="mb-5 flex-1 border-t border-[rgba(15,15,15,0.08)] pt-4 text-[13px] text-[#6B6B6B]">
          <span>{ubicacion}</span>
          <span className="mx-2 text-[#0F0F0F]/30">·</span>
          <span>{metaSummary(barrio)}</span>
        </p>
        <span className="font-poppins text-[12px] font-medium uppercase tracking-[0.15em] text-[#1A5C38] transition-transform group-hover:translate-x-1">
          Conocer el barrio →
        </span>
      </div>
    </Link>
  )
}
