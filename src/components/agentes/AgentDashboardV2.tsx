'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  Calculator,
  ChevronDown,
  FileText,
  GraduationCap,
  LandPlot,
  LogOut,
  Mail,
  Megaphone,
  MonitorPlay,
  Newspaper,
  PieChart,
  Printer,
  Users,
} from 'lucide-react'

import { getProgress } from '@/lib/si-school/progress'
import FeedbackPropiedadesTable from './FeedbackPropiedadesTable'
import type { PanelRow } from '@/lib/feedback-admin'

// ── Design tokens ──────────────────────────────────────────────────────
// Paleta oficial SI: blanco/gris claro + verde; nada de crema/beige.
const GREEN = '#1A5C38'
const GREEN_DARK = '#143E27'
const GREEN_BRIGHT = '#00754A'

// Total de cápsulas por capacidad para calcular progreso real desde
// localStorage. Mantener en sync con TOTAL_CAPSULAS_PER_CAP de si-school.
const TOTAL_CAPSULAS_PER_CAP: Record<string, number> = {
  'capacidad-01': 7,
  'capacidad-02': 5,
  'capacidad-03': 7,
  'capacidad-04': 9,
  'capacidad-05': 8,
  'capacidad-06': 6,
}
const TOTAL_CAPACIDADES = 6

// Fotos del equipo que existen en /public/team (slug = nombre sin tildes).
const TEAM_FOTOS = new Set([
  'aldana-ruiz', 'carolina-echen', 'claudia', 'david-flores', 'eliana-rojas',
  'florencia-acquarone', 'gino-pecchenino', 'gisela-ramallo', 'jeremias-caraballo',
  'julian-ruschneider', 'laura-flores', 'leticia-alexenicer', 'lucia-wilson',
  'maria-jose-espilocin', 'mariana-orlate', 'marisa-benitez', 'mauro-matteucci',
  'micaela-gonzalez', 'sabrina-rogani', 'susana-ippoliti',
])

// TODO Fase 2: leer progreso real de SI School por agente desde Redis,
//              clientes/autorizaciones scope por agente, y métricas reales
//              del equipo. Por ahora mocks coherentes para la vista admin.
const ADMIN_MOCK_AGENTS: { id: string; name: string; matricula: string; clientes: number; capacidadesDone: number }[] = [
  { id: 'aldana', name: 'Aldana Ruiz', matricula: 'CMC 612', clientes: 12, capacidadesDone: 4 },
  { id: 'carolina', name: 'Carolina Echen', matricula: 'CMC 581', clientes: 9, capacidadesDone: 6 },
  { id: 'gino', name: 'Gino Pecchenino', matricula: 'CMC 0621', clientes: 14, capacidadesDone: 5 },
  { id: 'gisela', name: 'Gisela Ramallo', matricula: 'CMC 0623', clientes: 7, capacidadesDone: 3 },
  { id: 'leticia', name: 'Leticia Alexenicer', matricula: 'CMC 0624', clientes: 11, capacidadesDone: 6 },
  { id: 'lucia', name: 'Lucia Wilson', matricula: 'CMC 0639', clientes: 8, capacidadesDone: 2 },
  { id: 'mariajose', name: 'Maria Jose Espilocin', matricula: 'CMC 0640', clientes: 10, capacidadesDone: 4 },
  { id: 'mariana', name: 'Mariana Orlate', matricula: 'CMC 0641', clientes: 6, capacidadesDone: 1 },
  { id: 'mauro', name: 'Mauro Matteucci', matricula: 'CMC 0642', clientes: 13, capacidadesDone: 6 },
  { id: 'micaela', name: 'Micaela Gonzalez', matricula: 'CMC 0643', clientes: 5, capacidadesDone: 0 },
]

interface Props {
  agentName: string
  agentRole: 'admin' | 'agent'
  clientesEnCartera: number
  autorizacionesEsteMes: number
  /** Total de suscriptores newsletter (solo se popula si admin). */
  newsletterTotal?: number
  /** Suscriptos newsletter este mes (solo se popula si admin). */
  newsletterEsteMes?: number
  /** Feedback de caritas de la calculadora de costos (visible para todos). */
  feedbackCostos?: { up: number; mid: number; down: number }
  /** Feedback por propiedad (solo admin; incluye PII de leads). */
  feedbackPropiedades?: PanelRow[]
}

export default function AgentDashboardV2({
  agentName,
  agentRole,
  clientesEnCartera,
  autorizacionesEsteMes,
  newsletterTotal = 0,
  newsletterEsteMes = 0,
  feedbackCostos = { up: 0, mid: 0, down: 0 },
  feedbackPropiedades = [],
}: Props) {
  const firstName = agentName.split(' ')[0]
  const isAdmin = agentRole === 'admin'

  // SI School progress local del usuario.
  const [capsCompletas, setCapsCompletas] = useState(0)

  useEffect(() => {
    const sync = () => {
      const p = getProgress()
      let count = 0
      for (const [slug, total] of Object.entries(TOTAL_CAPSULAS_PER_CAP)) {
        const done = p.capsulasCompletadas.filter((k) => k.startsWith(`${slug}/`)).length
        if (total > 0 && done >= total) count++
      }
      setCapsCompletas(count)
    }
    sync()
    window.addEventListener('si-school-progress-updated', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('si-school-progress-updated', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#F5F5F7] font-raleway text-[#09090B]">
      <AgentHeader name={agentName} role={isAdmin ? 'Administrador' : 'Agente'} />

      <main className="mx-auto max-w-[1240px] px-4 pb-20 pt-5 sm:px-6 md:pt-8 lg:px-8">
        <Portada
          firstName={firstName}
          clientesEnCartera={clientesEnCartera}
          autorizacionesEsteMes={autorizacionesEsteMes}
          capsCompletas={capsCompletas}
        />

        {/* Herramientas */}
        <SectionTitle sub="Lo que usás cada día">Tus herramientas</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          <ToolCard
            href="/agentes/seleccion"
            img="/images/agentes/clientes.webp"
            icon={<Users size={18} strokeWidth={2} />}
            title="Seguimiento de Clientes"
            description="Cartera, conversaciones, visitas y notas."
            stat={<><span className="font-poppins font-semibold">{clientesEnCartera}</span> en tu cartera</>}
            priority
          />
          <ToolCard
            href="/recursos/si-school"
            img="/images/agentes/school.webp"
            icon={<GraduationCap size={18} strokeWidth={2} />}
            title="SI School"
            description="Onboarding y capacitaciones del agente SI."
            footer={<ProgressBar done={capsCompletas} total={TOTAL_CAPACIDADES} />}
            priority
          />
          <ToolCard
            href="/recursos/autorizaciones"
            img="/images/agentes/autorizacion.webp"
            icon={<FileText size={18} strokeWidth={2} />}
            title="Autorización de Venta Digital"
            description="Acuerdos para firmar a distancia."
            stat={<><span className="font-poppins font-semibold">{autorizacionesEsteMes}</span> acuerdos este mes</>}
            priority
          />
          <ToolCard
            href="/agentes/presentacion"
            img="/images/sedes/ventas.webp"
            icon={<MonitorPlay size={18} strokeWidth={2} />}
            title="Presentación “Cómo trabajamos”"
            description="Link personal para el dueño: 2 visitas en 48 h."
            stat="Generá y mandá el link"
          />
          <ToolCard
            href="/agentes/comisiones"
            img="/images/agentes/comisiones.webp"
            icon={<Calculator size={18} strokeWidth={2} />}
            title="Calculadora de comisiones"
            description="Ventas, alquileres y tus objetivos."
            stat="Simulá cuánto cobrás"
          />
          <ToolCard
            href="/agentes/plano-distrito-roldan"
            img="/images/agentes/plano.webp"
            icon={<LandPlot size={18} strokeWidth={2} />}
            title="Plano de lotes · Distrito Roldán"
            description="Disponibilidad, medidas y precios de los 180 lotes."
            stat="Actualizá y descargá el plano"
          />
          <ToolCard
            href="/agentes/lista-alquileres"
            img="/images/agentes/alquileres.webp"
            icon={<Printer size={18} strokeWidth={2} />}
            title="Alquileres para imprimir"
            description="Lista A4 con foto, dirección, características y precio."
            stat="Imprimila o guardala en PDF"
          />
        </div>

        <AnalisisCartera />

        {isAdmin && (
          <AdminSection
            clientesGlobal={clientesEnCartera}
            autorizacionesMes={autorizacionesEsteMes}
            newsletterTotal={newsletterTotal}
            newsletterEsteMes={newsletterEsteMes}
          />
        )}

        <FeedbackCostosSection data={feedbackCostos} />

        {isAdmin && <FeedbackPropiedadesTable rows={feedbackPropiedades} />}

        {isAdmin && <EquipoSection />}
      </main>
    </div>
  )
}

// ── Header ──────────────────────────────────────────────────────────────
function AgentHeader({ name, role }: { name: string; role: string }) {
  const router = useRouter()
  const handleLogout = async () => {
    await fetch('/api/agentes/logout', { method: 'POST' }).catch(() => {})
    router.push('/agentes/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-20 border-b border-black/[0.06] bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-4 px-4 py-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5">
          <span
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[11px] font-extrabold tracking-wide text-white"
            style={{ background: GREEN }}
          >
            SI
          </span>
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#71717A]">
            Panel de agentes
          </span>
        </div>

        <div className="flex items-center gap-1">
          <div className="flex items-center gap-2.5 rounded-full px-1.5 py-1">
            <Avatar name={name} size={32} />
            <div className="hidden flex-col leading-tight sm:flex">
              <span className="whitespace-nowrap text-[13px] font-semibold text-[#09090B]">{name}</span>
              <span className="text-[11px] text-[#71717A]">{role}</span>
            </div>
          </div>

          <span aria-hidden className="mx-1.5 h-6 w-px bg-black/10" />

          <button
            type="button"
            onClick={handleLogout}
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#71717A] transition-colors hover:bg-[#F40009]/10 hover:text-[#C0392B]"
          >
            <LogOut size={16} strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </header>
  )
}

// ── Portada: foto de la oficina + saludo + indicadores del día ──────────
function Portada({
  firstName,
  clientesEnCartera,
  autorizacionesEsteMes,
  capsCompletas,
}: {
  firstName: string
  clientesEnCartera: number
  autorizacionesEsteMes: number
  capsCompletas: number
}) {
  // Saludo y fecha en hora local del navegador (el server corre en UTC):
  // se calculan después de montar para no romper la hidratación.
  const [saludo, setSaludo] = useState('Hola')
  const [fecha, setFecha] = useState('')
  useEffect(() => {
    const now = new Date()
    const h = now.getHours()
    setSaludo(h < 6 ? 'Buenas noches' : h < 13 ? 'Buen día' : h < 20 ? 'Buenas tardes' : 'Buenas noches')
    const f = now.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
    setFecha(f.charAt(0).toUpperCase() + f.slice(1))
  }, [])

  const indicadores = [
    { valor: String(clientesEnCartera), label: 'clientes en cartera' },
    { valor: String(autorizacionesEsteMes), label: 'acuerdos este mes' },
    { valor: `${capsCompletas}/${TOTAL_CAPACIDADES}`, label: 'SI School' },
  ]

  return (
    <section className="relative mb-10 overflow-hidden rounded-[24px] bg-[#0F2A1C] md:mb-12 md:rounded-[28px]">
      <Image
        src="/images/hero/oficina-portada.webp"
        alt="Oficina de SI INMOBILIARIA en Funes"
        fill
        priority
        sizes="(min-width: 1240px) 1240px, 100vw"
        className="object-cover object-[center_40%]"
      />
      {/* Velo: oscuro a la izquierda (texto) y abajo (celular), la foto respira a la derecha */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, rgba(8,24,16,0.88) 0%, rgba(8,24,16,0.62) 45%, rgba(8,24,16,0.12) 100%), linear-gradient(0deg, rgba(8,24,16,0.55) 0%, rgba(8,24,16,0) 55%)',
        }}
      />

      <div className="relative flex min-h-[280px] flex-col justify-end gap-5 p-5 sm:p-8 md:min-h-[340px] md:p-10 lg:p-12">
        <div>
          <p className="mb-2 min-h-[18px] text-[12px] font-semibold uppercase tracking-[0.18em] text-white/70">
            {fecha}
          </p>
          <h1 className="m-0 text-[32px] font-extrabold leading-[1.05] tracking-[-0.02em] text-white sm:text-[40px] md:text-[48px]">
            {saludo}, {firstName}
          </h1>
          <p className="mt-3 max-w-[440px] text-[15px] leading-relaxed text-white/80">
            Todo lo que necesitás para vender y alquilar, en un solo lugar.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-2.5">
          {indicadores.map((i) => (
            <div
              key={i.label}
              className="flex flex-col gap-1 rounded-2xl border border-white/15 bg-white/10 px-3 py-2.5 text-white backdrop-blur-md sm:flex-row sm:items-baseline sm:gap-2 sm:px-4"
            >
              <span className="font-poppins text-[20px] font-semibold leading-none">{i.valor}</span>
              <span className="text-[11.5px] leading-tight text-white/75 sm:text-[12.5px]">{i.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Section title ───────────────────────────────────────────────────────
function SectionTitle({ children, sub, chip }: { children: React.ReactNode; sub?: string; chip?: string }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
      <div>
        {sub && (
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: GREEN_BRIGHT }}>
            {sub}
          </p>
        )}
        <h2 className="m-0 text-[22px] font-extrabold tracking-[-0.01em] text-[#09090B] md:text-[26px]">{children}</h2>
      </div>
      {chip && (
        <span
          className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em]"
          style={{ color: GREEN, background: 'rgba(26,92,56,0.08)' }}
        >
          {chip}
        </span>
      )}
    </div>
  )
}

// ── Tool card: foto ilustrativa arriba, texto abajo ─────────────────────
function ToolCard({
  href,
  img,
  icon,
  title,
  description,
  stat,
  footer,
  priority,
}: {
  href: string
  img: string
  icon: React.ReactNode
  title: string
  description: string
  stat?: React.ReactNode
  footer?: React.ReactNode
  priority?: boolean
}) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_0_0_1px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-12px_rgba(15,23,42,0.22),0_0_0_1px_rgba(15,23,42,0.05)]"
    >
      <div className="relative aspect-[2/1] overflow-hidden bg-[#E8E8ED] sm:aspect-[16/10]">
        <Image
          src={img}
          alt=""
          fill
          priority={priority}
          sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
        <span
          className="absolute left-3.5 top-3.5 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 shadow-sm backdrop-blur"
          style={{ color: GREEN }}
        >
          {icon}
        </span>
        <span className="absolute right-3.5 top-3.5 inline-flex h-9 w-9 translate-y-1 items-center justify-center rounded-full bg-white text-[#09090B] opacity-0 shadow-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight size={17} strokeWidth={2} />
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-5">
        <h3 className="m-0 text-[17px] font-bold leading-snug text-[#09090B]">{title}</h3>
        <p className="m-0 text-[13.5px] leading-relaxed text-[#52525B]">{description}</p>
        <div className="mt-auto pt-3">
          {footer ?? (
            <div className="flex items-center justify-between gap-2 border-t border-black/[0.06] pt-3">
              <span className="text-[13px] text-[#3F3F46]">{stat}</span>
              <ArrowRight
                size={16}
                strokeWidth={2}
                className="shrink-0 text-[#A1A1AA] transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

// ── Análisis de cartera: banda ancha verde con foto ──────────────────────
function AnalisisCartera() {
  return (
    <Link
      href="/agentes/cartera"
      className="group mt-5 grid overflow-hidden rounded-[20px] text-white transition-shadow duration-300 hover:shadow-[0_18px_40px_-12px_rgba(20,62,39,0.45)] md:grid-cols-[1fr_1.1fr]"
      style={{ background: `linear-gradient(135deg, ${GREEN} 0%, ${GREEN_DARK} 100%)` }}
    >
      <div className="flex flex-col justify-center gap-3 p-6 sm:p-8 md:p-10">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
          <PieChart size={20} strokeWidth={1.9} />
        </span>
        <h3 className="m-0 text-[22px] font-extrabold tracking-[-0.01em] md:text-[26px]">Análisis de cartera</h3>
        <p className="m-0 max-w-[380px] text-[14px] leading-relaxed text-white/80">
          Rendimiento y evolución de tu cartera de clientes y propiedades.
        </p>
        <span className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[13px] font-bold text-[#143E27] transition-transform duration-300 group-hover:translate-x-1">
          Ver análisis <ArrowRight size={15} strokeWidth={2.2} />
        </span>
      </div>
      <div className="relative hidden min-h-[260px] overflow-hidden md:block">
        <Image
          src="/images/agentes/cartera.webp"
          alt=""
          fill
          sizes="620px"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        {/* Funde la foto con el verde de la banda */}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-[#1A5C38] via-[#1A5C38]/20 to-transparent" />
      </div>
    </Link>
  )
}

// ── Feedback · Calculadora de Construcción ────────────────────────────
// Contadores de las caritas (Redis feedback:costos:*), visibles para todos
// los usuarios del panel.
function FeedbackCostosSection({ data }: { data: { up: number; mid: number; down: number } }) {
  const total = data.up + data.mid + data.down
  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0)
  const filas = [
    { emoji: '😄', label: 'Me sirvió', valor: data.up, color: GREEN_BRIGHT },
    { emoji: '😐', label: 'Más o menos', valor: data.mid, color: '#A1A1AA' },
    { emoji: '😞', label: 'No me sirvió', valor: data.down, color: '#E08585' },
  ]

  return (
    <section aria-label="Feedback de la calculadora de construcción" className="mt-14">
      <SectionTitle sub="Lo que opinan los usuarios">Calculadora de Construcción</SectionTitle>
      <div className="rounded-[20px] bg-white p-5 shadow-[0_0_0_1px_rgba(15,23,42,0.05)] sm:p-6">
        {total === 0 ? (
          <p className="m-0 text-[13px] text-[#71717A]">Sin respuestas todavía</p>
        ) : (
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:gap-8">
            <div className="shrink-0">
              <div className="font-poppins text-[34px] font-semibold leading-none tracking-[-0.02em]">{total}</div>
              <div className="mt-1 text-[12.5px] text-[#71717A]">respuestas</div>
            </div>
            <div className="flex flex-1 flex-col gap-3">
              <div
                role="img"
                aria-label={`Proporción: ${pct(data.up)}% positivos, ${pct(data.mid)}% neutros, ${pct(data.down)}% negativos`}
                className="flex h-2.5 overflow-hidden rounded-full bg-[#E4E4E7]"
              >
                {filas.map(
                  (f) =>
                    f.valor > 0 && <div key={f.label} style={{ width: `${(f.valor / total) * 100}%`, background: f.color }} />,
                )}
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {filas.map((f) => (
                  <span key={f.label} className="inline-flex items-center gap-2 text-[13px] text-[#3F3F46]">
                    <span aria-hidden>{f.emoji}</span>
                    {f.label}
                    <span className="font-poppins font-semibold text-[#09090B]">{f.valor}</span>
                    <span className="font-poppins text-[12px]" style={{ color: f.color }}>
                      {pct(f.valor)}%
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

// ── Progress bar ────────────────────────────────────────────────────────
function ProgressBar({ done, total }: { done: number; total: number }) {
  const pct = total > 0 ? Math.min(1, done / total) : 0
  return (
    <div className="border-t border-black/[0.06] pt-3">
      <div className="mb-2 flex items-center justify-between text-[13px] text-[#3F3F46]">
        <span>
          <span className="font-poppins font-semibold">{done}</span> de{' '}
          <span className="font-poppins font-semibold">{total}</span> capacidades
        </span>
        <span className="font-poppins text-[12px] text-[#71717A]">{Math.round(pct * 100)}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[#E4E4E7]">
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: `${Math.round(pct * 100)}%`, background: `linear-gradient(90deg, ${GREEN}, ${GREEN_BRIGHT})` }}
        />
      </div>
    </div>
  )
}

// ── Admin section ───────────────────────────────────────────────────────
function AdminSection({
  clientesGlobal,
  autorizacionesMes,
  newsletterTotal,
  newsletterEsteMes,
}: {
  clientesGlobal: number
  autorizacionesMes: number
  newsletterTotal: number
  newsletterEsteMes: number
}) {
  // TODO Fase 2: reemplazar mocks por datos reales del equipo
  const agentesActivos = ADMIN_MOCK_AGENTS.length
  const completos = ADMIN_MOCK_AGENTS.filter((a) => a.capacidadesDone >= TOTAL_CAPACIDADES).length

  const stats = useMemo(
    () => [
      { label: 'Agentes activos', value: String(agentesActivos) },
      { label: 'Clientes en cartera', value: String(clientesGlobal) },
      { label: 'Autorizaciones este mes', value: String(autorizacionesMes) },
      { label: 'Con SI School completo', value: `${completos}/${agentesActivos}` },
    ],
    [agentesActivos, clientesGlobal, autorizacionesMes, completos],
  )

  const newsletterStat = newsletterEsteMes > 0
    ? `${newsletterTotal} suscriptos · ${newsletterEsteMes} este mes`
    : `${newsletterTotal} suscriptos`

  return (
    <section aria-label="Administración" className="mt-14">
      <SectionTitle sub="Vista del equipo" chip="Solo administrador">Administración</SectionTitle>

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-[18px] bg-white p-5 shadow-[0_0_0_1px_rgba(15,23,42,0.05)]">
            <div className="font-poppins text-[30px] font-semibold leading-none tracking-[-0.02em] text-[#09090B]">
              {s.value}
            </div>
            <div className="mt-2 text-[12.5px] text-[#71717A]">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:gap-4">
        <AdminCard
          href="/agentes/newsletter"
          img="/images/agentes/newsletter.webp"
          icon={<Mail size={16} strokeWidth={2} />}
          title="Suscriptores Newsletter"
          description="Leads del popup de la web."
          stat={newsletterStat}
        />
        <AdminCard
          href="/admin/notas"
          img="/images/agentes/blog.webp"
          icon={<Newspaper size={16} strokeWidth={2} />}
          title="Notas del Blog"
          description="Editá, subí portada o borrá notas."
          stat="Editar · portada · borrar"
        />
        <AdminCard
          href="/agentes/oportunidades"
          img="/images/agentes/oportunidades.webp"
          icon={<Megaphone size={16} strokeWidth={2} />}
          title="Oportunidades"
          description="Popup del sitio: vendedor motivado, permuta, negociable."
          stat="Gestionar popup"
        />
      </div>
    </section>
  )
}

function AdminCard({
  href,
  img,
  icon,
  title,
  description,
  stat,
}: {
  href: string
  img: string
  icon: React.ReactNode
  title: string
  description: string
  stat: string
}) {
  return (
    <Link
      href={href}
      className="group flex items-stretch gap-4 overflow-hidden rounded-[18px] bg-white p-3 shadow-[0_0_0_1px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-12px_rgba(15,23,42,0.2),0_0_0_1px_rgba(15,23,42,0.05)]"
    >
      <div className="relative w-[88px] shrink-0 overflow-hidden rounded-[12px] bg-[#E8E8ED]">
        <Image
          src={img}
          alt=""
          fill
          sizes="88px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1 py-1 pr-1">
        <div className="flex items-center gap-2" style={{ color: GREEN }}>
          {icon}
          <h3 className="m-0 truncate text-[15px] font-bold text-[#09090B]">{title}</h3>
        </div>
        <p className="m-0 text-[12.5px] leading-snug text-[#52525B]">{description}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-1.5">
          <span className="truncate text-[12.5px] font-semibold text-[#3F3F46]">{stat}</span>
          <ArrowRight size={15} strokeWidth={2} className="shrink-0 text-[#A1A1AA] transition-transform duration-300 group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  )
}

// ── Equipo · Progreso en SI School (desplegable, solo admin) ──────────────
function EquipoSection() {
  const [open, setOpen] = useState(false)
  const agents = ADMIN_MOCK_AGENTS

  return (
    <section aria-label="Equipo" className="mt-14">
      <div className="overflow-hidden rounded-[20px] bg-white shadow-[0_0_0_1px_rgba(15,23,42,0.05)]">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-3 bg-transparent p-5 text-left sm:p-6"
        >
          <span className="flex flex-col gap-1">
            <span className="flex flex-wrap items-center gap-2.5">
              <span className="text-[18px] font-extrabold text-[#09090B]">Equipo</span>
              <span
                className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em]"
                style={{ color: GREEN, background: 'rgba(26,92,56,0.08)' }}
              >
                Solo administrador
              </span>
            </span>
            <span className="text-[13px] text-[#71717A]">Progreso en SI School</span>
          </span>
          <span className="flex items-center gap-3">
            {/* Caras apiladas del equipo */}
            <span className="flex -space-x-2.5">
              {agents.slice(0, 6).map((ag) => (
                <span key={ag.id} className="rounded-full ring-2 ring-white">
                  <Avatar name={ag.name} size={32} />
                </span>
              ))}
            </span>
            <span className="font-poppins text-[12.5px] text-[#71717A]">{agents.length}</span>
            <ChevronDown
              size={18}
              className="text-[#71717A] transition-transform duration-200"
              style={{ transform: open ? 'rotate(180deg)' : 'none' }}
            />
          </span>
        </button>

        {open && (
          <div className="px-5 pb-5 sm:px-6">
            <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
              {agents.map((ag) => {
                const pct = ag.capacidadesDone / TOTAL_CAPACIDADES
                const completed = ag.capacidadesDone >= TOTAL_CAPACIDADES
                return (
                  <div key={ag.id} className="flex items-center gap-3.5 border-t border-black/[0.06] py-3">
                    <Avatar name={ag.name} size={40} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[14px] font-semibold text-[#09090B]">{ag.name}</div>
                      <div className="text-[11.5px] text-[#71717A]">
                        Matrícula <span className="font-poppins">{ag.matricula}</span> ·{' '}
                        <span className="font-poppins">{ag.clientes}</span> clientes
                      </div>
                    </div>
                    <div className="w-[88px] shrink-0 sm:w-[120px]">
                      <div className="mb-1 h-1.5 overflow-hidden rounded-full bg-[#F4F4F5]">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${Math.round(pct * 100)}%`, background: completed ? GREEN_BRIGHT : GREEN }}
                        />
                      </div>
                      <div
                        className="text-right font-poppins text-[11.5px] font-medium"
                        style={{ color: completed ? GREEN_BRIGHT : '#52525B' }}
                      >
                        {ag.capacidadesDone}/{TOTAL_CAPACIDADES}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <p className="mt-4 text-[11.5px] italic text-[#71717A]">
              Datos de demostración — la sincronización por agente llega en Fase 2.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

// ── Avatar: foto del equipo si existe, si no iniciales ───────────────────
function Avatar({ name, size }: { name: string; size: number }) {
  const slug = toSlug(name)
  if (TEAM_FOTOS.has(slug)) {
    return (
      <Image
        src={`/team/${slug}.jpg`}
        alt=""
        width={size}
        height={size}
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <span
      aria-hidden
      className="inline-flex shrink-0 items-center justify-center rounded-full font-poppins font-semibold text-white"
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.36),
        background: `linear-gradient(135deg, ${GREEN} 0%, ${GREEN_DARK} 100%)`,
      }}
    >
      {getInitials(name)}
    </span>
  )
}

// ── Utils ───────────────────────────────────────────────────────────────
function toSlug(fullName: string): string {
  return fullName
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
}

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 0) return 'SI'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
