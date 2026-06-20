'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import {
  BarChart3,
  Check,
  FileText,
  GraduationCap,
  Mail,
  MessageSquare,
  Newspaper,
  RefreshCw,
  Users,
} from 'lucide-react'

import { getProgress } from '@/lib/si-school/progress'
import FeedbackPropiedadesTable from './FeedbackPropiedadesTable'
import type { PanelRow } from '@/lib/feedback-admin'

// ── Design tokens ──────────────────────────────────────────────────────
const GREEN = '#1A5C38'
const GREEN_DARK = '#143E27'
const GOLD = '#B8935A'
const GOLD_TINT = '#F5EFE3'
const PAPER = '#FAF7F2'
const BG = '#FAFAFA'
const LINE = '#E4E4E7'
const TEXT = '#09090B'
const TEXT_MUTED = '#52525B'
const TEXT_SOFT = '#71717A'

const RALEWAY = 'var(--font-raleway), Raleway, system-ui, sans-serif'
const POPPINS = 'var(--font-poppins), Poppins, system-ui, sans-serif'

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
  const initials = getInitials(agentName)
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
    <div style={{ background: BG, minHeight: '100vh', color: TEXT, fontFamily: RALEWAY }}>
      <AgentHeader name={agentName} initials={initials} role={isAdmin ? 'Administrador' : 'Agente'} />

      <main style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(24px, 4vw, 48px) clamp(18px, 4vw, 32px) 80px' }}>
        {/* Saludo */}
        <header style={{ marginBottom: 32 }}>
          <h1
            style={{
              fontFamily: RALEWAY,
              fontWeight: 700,
              fontSize: 'clamp(26px, 4vw, 34px)',
              letterSpacing: '-0.02em',
              margin: '0 0 6px',
              color: TEXT,
            }}
          >
            Buen día, {firstName}
          </h1>
          <p style={{ fontFamily: POPPINS, fontWeight: 300, fontSize: 15, color: TEXT_MUTED, margin: 0 }}>
            Estas son las herramientas que tenés disponibles hoy.
          </p>
        </header>

        {/* En uso */}
        <SectionTitle>En uso</SectionTitle>
        <div className="agent-tool-grid" style={{ marginBottom: 40 }}>
          <PlacaCard
            href="/agentes/seleccion"
            icon={<Users size={22} strokeWidth={1.8} />}
            pastel="#C8D9D2"
            title="Seguimiento de Clientes"
            description="Cartera, conversaciones, visitas y notas."
            statLabel={`${clientesEnCartera} en tu cartera`}
          />
          <PlacaCard
            href="/recursos/si-school"
            icon={<GraduationCap size={22} strokeWidth={1.8} />}
            pastel="#EEDDBD"
            title="SI School"
            description="Onboarding del agente SI."
            footerNode={
              <ProgressBar
                done={capsCompletas}
                total={TOTAL_CAPACIDADES}
                label={`${capsCompletas} de ${TOTAL_CAPACIDADES} capacidades`}
              />
            }
          />
          <PlacaCard
            href="/recursos/autorizaciones"
            icon={<FileText size={22} strokeWidth={1.8} />}
            pastel="#F4D2C7"
            title="Autorización de Venta Digital"
            description="Acuerdos para firmar a distancia."
            statLabel={`${autorizacionesEsteMes} acuerdos generados este mes`}
          />
        </div>

        {/* Próximamente */}
        <SectionTitle>Próximamente</SectionTitle>
        <div className="agent-tool-grid" style={{ marginBottom: isAdmin ? 56 : 0 }}>
          <PlacaCard
            comingSoon
            icon={<MessageSquare size={22} strokeWidth={1.8} />}
            title="Modelos de Contratos"
            description="Modelos editables y firmables online."
            statLabel="En desarrollo"
          />
          <PlacaCard
            comingSoon
            icon={<BarChart3 size={22} strokeWidth={1.8} />}
            title="Métricas y KPI"
            description="Operaciones tuyas y del equipo."
            statLabel="En desarrollo"
          />
        </div>

        <FeedbackCostosSection data={feedbackCostos} />

        {isAdmin && <FeedbackPropiedadesTable rows={feedbackPropiedades} />}

        {isAdmin && (
          <AdminSection
            clientesGlobal={clientesEnCartera}
            autorizacionesMes={autorizacionesEsteMes}
            newsletterTotal={newsletterTotal}
            newsletterEsteMes={newsletterEsteMes}
          />
        )}
      </main>
    </div>
  )
}

// ── Header ──────────────────────────────────────────────────────────────
function AgentHeader({ name, initials, role }: { name: string; initials: string; role: string }) {
  const router = useRouter()
  const handleLogout = async () => {
    await fetch('/api/agentes/logout', { method: 'POST' }).catch(() => {})
    router.push('/agentes/login')
    router.refresh()
  }

  // Actualizar manualmente el cache de Tokko (botón del header). Estados:
  // idle → cargando → ok/error, y vuelve a idle a los ~3.5s.
  const [tokkoEstado, setTokkoEstado] = useState<'idle' | 'cargando' | 'ok' | 'error'>('idle')
  const actualizarTokko = async () => {
    if (tokkoEstado === 'cargando') return
    setTokkoEstado('cargando')
    try {
      const res = await fetch('/api/agentes/revalidate-tokko', { method: 'POST' })
      setTokkoEstado(res.ok ? 'ok' : 'error')
    } catch {
      setTokkoEstado('error')
    }
    setTimeout(() => setTokkoEstado('idle'), 3500)
  }

  return (
    <header
      style={{
        background: '#fff',
        borderBottom: `1px solid ${LINE}`,
        padding: '14px clamp(18px, 4vw, 32px)',
        position: 'sticky',
        top: 0,
        zIndex: 20,
      }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={actualizarTokko}
          disabled={tokkoEstado === 'cargando'}
          title="Traé a la web los últimos cambios cargados en Tokko"
          style={{
            marginLeft: 'auto',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            background: tokkoEstado === 'ok' ? GREEN : '#fff',
            border: `1px solid ${tokkoEstado === 'ok' ? GREEN : LINE}`,
            borderRadius: 999,
            padding: '7px 14px',
            cursor: tokkoEstado === 'cargando' ? 'default' : 'pointer',
            fontFamily: POPPINS,
            fontSize: 12.5,
            fontWeight: 500,
            color: tokkoEstado === 'ok' ? '#fff' : TEXT_MUTED,
            transition: 'background 0.2s, color 0.2s, border-color 0.2s',
            whiteSpace: 'nowrap',
          }}
        >
          {tokkoEstado === 'ok' ? (
            <>
              <Check size={15} strokeWidth={2.4} />
              Actualizado
            </>
          ) : tokkoEstado === 'error' ? (
            <>
              <RefreshCw size={15} strokeWidth={2} />
              Reintentar
            </>
          ) : (
            <>
              <RefreshCw
                size={15}
                strokeWidth={2}
                style={tokkoEstado === 'cargando' ? { animation: 'si-spin 0.8s linear infinite' } : undefined}
              />
              {tokkoEstado === 'cargando' ? 'Actualizando…' : 'Actualizar Tokko'}
            </>
          )}
        </button>
        <style>{`@keyframes si-spin { to { transform: rotate(360deg) } }`}</style>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            background: PAPER,
            border: `1px solid ${LINE}`,
            borderRadius: 999,
            padding: '6px 14px 6px 6px',
          }}
        >
          <span
            aria-hidden
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${GREEN} 0%, ${GREEN_DARK} 100%)`,
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: POPPINS,
              fontWeight: 600,
              fontSize: 12,
            }}
          >
            {initials}
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
            <span style={{ fontFamily: RALEWAY, fontWeight: 600, fontSize: 13, color: TEXT }}>{name}</span>
            <span style={{ fontFamily: POPPINS, fontWeight: 300, fontSize: 11, color: TEXT_SOFT }}>{role}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontFamily: POPPINS,
            fontSize: 12.5,
            color: TEXT_SOFT,
            padding: '6px 10px',
          }}
        >
          Salir
        </button>
      </div>

      <style>{`
        .agent-placa-card:hover {
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.10);
          transform: translateY(-2px);
        }
        .agent-tool-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        @media (min-width: 768px) {
          .agent-tool-grid { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>
    </header>
  )
}

// ── Section title ───────────────────────────────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontFamily: POPPINS,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: TEXT_SOFT,
        margin: '0 0 14px',
      }}
    >
      {children}
    </h2>
  )
}

// ── Placa card ──────────────────────────────────────────────────────────
interface PlacaProps {
  href?: string
  comingSoon?: boolean
  icon: React.ReactNode
  pastel?: string
  title: string
  description: string
  statLabel?: string
  footerNode?: React.ReactNode
}

// ── Feedback · Calculadora de Construcción ────────────────────────────
// Contadores de las caritas (Redis feedback:costos:*), visibles para todos
// los usuarios del panel. Mismo lenguaje visual que los stats de admin.
function FeedbackCostosSection({ data }: { data: { up: number; mid: number; down: number } }) {
  const total = data.up + data.mid + data.down
  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0)
  const filas = [
    { emoji: '😄', label: 'Me sirvió', valor: data.up, color: GREEN },
    { emoji: '😐', label: 'Más o menos', valor: data.mid, color: '#A1A1AA' },
    { emoji: '😞', label: 'No me sirvió', valor: data.down, color: '#E08585' },
  ]

  return (
    <section aria-label="Feedback de la calculadora de construcción" style={{ marginTop: 40 }}>
      <SectionTitle>Feedback · Calculadora de Construcción</SectionTitle>
      <div
        style={{
          background: '#fff',
          border: `1px solid ${LINE}`,
          borderRadius: 18,
          padding: 'clamp(20px, 3vw, 28px)',
        }}
      >
        {total === 0 ? (
          <p style={{ fontFamily: POPPINS, fontWeight: 300, fontSize: 14, color: TEXT_SOFT, margin: 0 }}>
            Sin respuestas todavía
          </p>
        ) : (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: 14,
                marginBottom: 20,
              }}
            >
              <div style={{ background: PAPER, border: `1px solid ${LINE}`, borderRadius: 12, padding: '16px 18px' }}>
                <div style={{ fontFamily: POPPINS, fontWeight: 600, fontSize: 26, color: TEXT, letterSpacing: '-0.02em', lineHeight: 1.05 }}>
                  {total}
                </div>
                <div style={{ marginTop: 6, fontFamily: POPPINS, fontWeight: 300, fontSize: 11.5, color: TEXT_SOFT }}>
                  Respuestas totales
                </div>
              </div>
              {filas.map((f) => (
                <div key={f.label} style={{ background: PAPER, border: `1px solid ${LINE}`, borderRadius: 12, padding: '16px 18px' }}>
                  <div style={{ fontFamily: POPPINS, fontWeight: 600, fontSize: 26, color: TEXT, letterSpacing: '-0.02em', lineHeight: 1.05 }}>
                    {f.emoji} {f.valor}
                    <span style={{ fontSize: 14, fontWeight: 500, color: f.color, marginLeft: 8 }}>{pct(f.valor)}%</span>
                  </div>
                  <div style={{ marginTop: 6, fontFamily: POPPINS, fontWeight: 300, fontSize: 11.5, color: TEXT_SOFT }}>
                    {f.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Barra de proporción verde / gris / rojo suave */}
            <div
              role="img"
              aria-label={`Proporción de votos: ${pct(data.up)}% positivos, ${pct(data.mid)}% neutros, ${pct(data.down)}% negativos`}
              style={{ display: 'flex', height: 10, borderRadius: 99, overflow: 'hidden', background: LINE }}
            >
              {filas.map(
                (f) =>
                  f.valor > 0 && (
                    <div
                      key={f.label}
                      style={{ width: `${(f.valor / total) * 100}%`, background: f.color }}
                    />
                  ),
              )}
            </div>
          </>
        )}
      </div>
    </section>
  )
}

function PlacaCard({
  href,
  comingSoon,
  icon,
  pastel,
  title,
  description,
  statLabel,
  footerNode,
}: PlacaProps) {
  const baseStyle: React.CSSProperties = {
    background: comingSoon ? PAPER : pastel ?? '#fff',
    border: comingSoon ? '1.5px dashed #d8d2c6' : 'none',
    borderRadius: 16,
    padding: 15,
    paddingRight: comingSoon ? 64 : 15,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    position: 'relative',
    transition: 'box-shadow 0.18s ease, transform 0.18s ease',
    color: TEXT,
    textDecoration: 'none',
    cursor: comingSoon ? 'default' : 'pointer',
  }

  const content = (
    <>
      {comingSoon && (
        <span
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: GOLD_TINT,
            color: '#6B5230',
            fontFamily: POPPINS,
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            padding: '4px 10px',
            borderRadius: 999,
          }}
        >
          Próximamente
        </span>
      )}
      <span
        style={{
          color: comingSoon ? '#9a958a' : '#2b2b2b',
          flexShrink: 0,
          display: 'inline-flex',
          marginTop: 1,
        }}
      >
        {icon}
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0, flex: 1 }}>
        <h3 style={{ fontFamily: RALEWAY, fontWeight: 600, fontSize: 16, margin: 0, color: comingSoon ? '#9a958a' : '#222', lineHeight: 1.25 }}>
          {title}
        </h3>
        <p
          style={{
            fontFamily: POPPINS,
            fontWeight: 300,
            fontSize: 12.5,
            lineHeight: 1.4,
            color: comingSoon ? '#9a958a' : '#54584f',
            margin: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {description}
        </p>
        {footerNode ? (
          <div style={{ marginTop: 4 }}>{footerNode}</div>
        ) : statLabel ? (
          <div
            style={{
              marginTop: 4,
              fontFamily: POPPINS,
              fontWeight: 500,
              fontSize: 12,
              color: comingSoon ? '#9a958a' : '#3a3a3a',
              letterSpacing: '0.02em',
            }}
          >
            {statLabel}
          </div>
        ) : null}
      </div>
    </>
  )

  if (comingSoon || !href) {
    return (
      <div style={baseStyle} aria-disabled={comingSoon}>
        {content}
      </div>
    )
  }
  return (
    <Link href={href} style={baseStyle} className="agent-placa-card">
      {content}
    </Link>
  )
}

// ── Progress bar ────────────────────────────────────────────────────────
function ProgressBar({ done, total, label }: { done: number; total: number; label: string }) {
  const pct = total > 0 ? Math.min(1, done / total) : 0
  return (
    <div style={{ marginTop: 4 }}>
      <div
        style={{
          height: 5,
          background: 'rgba(0,0,0,0.08)',
          borderRadius: 3,
          overflow: 'hidden',
          marginBottom: 6,
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${Math.round(pct * 100)}%`,
            background: 'linear-gradient(90deg, #B8935A, #caa468)',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
      <div style={{ fontFamily: POPPINS, fontWeight: 500, fontSize: 12, color: '#3a3a3a' }}>{label}</div>
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
    <section aria-label="Vista de administrador" style={{ marginTop: 16 }}>
      <SectionTitle>Administrador</SectionTitle>

      <div className="agent-tool-grid" style={{ marginBottom: 28 }}>
        <PlacaCard
          href="/agentes/newsletter"
          icon={<Mail size={22} strokeWidth={1.8} />}
          pastel="#D8D5F2"
          title="Suscriptores Newsletter"
          description="Leads del popup de la web."
          statLabel={newsletterStat}
        />
        <PlacaCard
          href="/admin/notas"
          icon={<Newspaper size={22} strokeWidth={1.8} />}
          pastel="#CBE2DC"
          title="Notas del Blog"
          description="Editá, subí portada o borrá notas."
          statLabel="Editar · portada · borrar"
        />
      </div>

      <SectionTitle>Vista de Administrador</SectionTitle>

      <div
        style={{
          background: '#fff',
          border: `1px solid ${LINE}`,
          borderRadius: 18,
          padding: 'clamp(20px, 3vw, 32px)',
        }}
      >
        {/* Stats agregados */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 14,
            marginBottom: 28,
          }}
        >
          {stats.map((s) => (
            <div
              key={s.label}
              style={{
                background: PAPER,
                border: `1px solid ${LINE}`,
                borderRadius: 12,
                padding: '16px 18px',
              }}
            >
              <div
                style={{
                  fontFamily: POPPINS,
                  fontWeight: 600,
                  fontSize: 26,
                  color: TEXT,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.05,
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontFamily: POPPINS,
                  fontWeight: 300,
                  fontSize: 11.5,
                  color: TEXT_SOFT,
                  letterSpacing: '0.06em',
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Progreso por agente */}
        <h3
          style={{
            fontFamily: RALEWAY,
            fontWeight: 600,
            fontSize: 15,
            color: TEXT,
            margin: '0 0 14px',
          }}
        >
          Progreso del equipo en SI School
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ADMIN_MOCK_AGENTS.map((ag) => {
            const pct = ag.capacidadesDone / TOTAL_CAPACIDADES
            const completed = ag.capacidadesDone >= TOTAL_CAPACIDADES
            return (
              <div
                key={ag.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '10px 6px',
                  borderBottom: `1px solid ${LINE}`,
                }}
              >
                <span
                  aria-hidden
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${GREEN} 0%, ${GREEN_DARK} 100%)`,
                    color: '#fff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: POPPINS,
                    fontWeight: 600,
                    fontSize: 12,
                    flexShrink: 0,
                  }}
                >
                  {getInitials(ag.name)}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: RALEWAY, fontWeight: 600, fontSize: 14, color: TEXT }}>{ag.name}</div>
                  <div style={{ fontFamily: POPPINS, fontWeight: 300, fontSize: 11.5, color: TEXT_SOFT }}>
                    Matrícula {ag.matricula} · {ag.clientes} clientes activos
                  </div>
                </div>
                <div style={{ width: 'clamp(140px, 20vw, 200px)', flexShrink: 0 }}>
                  <div
                    style={{
                      height: 4,
                      background: '#F4F4F5',
                      borderRadius: 2,
                      overflow: 'hidden',
                      marginBottom: 4,
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.round(pct * 100)}%`,
                        background: completed ? '#2A8B5A' : GOLD,
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                  <div
                    style={{
                      fontFamily: POPPINS,
                      fontWeight: 500,
                      fontSize: 11.5,
                      color: completed ? '#2A8B5A' : TEXT_MUTED,
                      textAlign: 'right',
                    }}
                  >
                    {ag.capacidadesDone}/{TOTAL_CAPACIDADES}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <p
          style={{
            marginTop: 18,
            fontFamily: POPPINS,
            fontWeight: 300,
            fontSize: 11.5,
            color: TEXT_SOFT,
            fontStyle: 'italic',
          }}
        >
          {/* TODO Fase 2: datos reales de progreso por agente (Redis-scoped por
              agentId), clientes y autorizaciones filtradas por agente. */}
          Datos de demostración — la sincronización por agente llega en Fase 2.
        </p>
      </div>
    </section>
  )
}

// ── Utils ───────────────────────────────────────────────────────────────
function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 0) return 'SI'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
