'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  Calculator,
  ChevronDown,
  FileText,
  GraduationCap,
  LandPlot,
  LogOut,
  Mail,
  Megaphone,
  Newspaper,
  PieChart,
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

        {/* Herramientas */}
        <SectionTitle sub="Lo que usás cada día">Tus herramientas</SectionTitle>
        <div className="agent-tool-grid agent-tool-grid-4" style={{ marginBottom: 16 }}>
          <PlacaCard
            href="/agentes/seleccion"
            icon={<Users size={22} strokeWidth={1.8} />}
            pastel="#C8D9D2"
            iconColor={GREEN}
            title="Seguimiento de Clientes"
            description="Cartera, conversaciones, visitas y notas."
            statLabel={`${clientesEnCartera} en tu cartera`}
          />
          <PlacaCard
            href="/recursos/si-school"
            icon={<GraduationCap size={22} strokeWidth={1.8} />}
            pastel="#EEDDBD"
            iconColor="#9A7B16"
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
            iconColor="#B5562F"
            title="Autorización de Venta Digital"
            description="Acuerdos para firmar a distancia."
            statLabel={`${autorizacionesEsteMes} acuerdos este mes`}
          />
          <PlacaCard
            href="/agentes/comisiones"
            icon={<Calculator size={22} strokeWidth={1.8} />}
            pastel="#C7D8F4"
            iconColor="#2B5C9B"
            title="Calculadora de comisiones"
            description="Ventas, alquileres y tus objetivos."
            statLabel="Simulá cuánto cobrás"
          />
          <PlacaCard
            href="/agentes/plano-distrito-roldan"
            icon={<LandPlot size={22} strokeWidth={1.8} />}
            pastel="#D5E3C2"
            iconColor="#4A6B24"
            title="Plano de lotes · Distrito Roldán"
            description="Disponibilidad, medidas y precios de los 180 lotes."
            statLabel="Actualizá y descargá el plano"
          />
        </div>

        {/* Análisis de cartera — card ancha */}
        <WideCard
          icon={<PieChart size={22} strokeWidth={1.8} />}
          pastel="#C8D9D2"
          iconColor={GREEN}
          title="Análisis de cartera"
          description="Rendimiento y evolución de tu cartera de clientes y propiedades."
          action={
            <Link
              href="/agentes/cartera"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                background: GREEN,
                color: '#fff',
                fontFamily: POPPINS,
                fontWeight: 600,
                fontSize: 13,
                padding: '10px 18px',
                borderRadius: 10,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              Ver análisis <ArrowRight size={15} strokeWidth={2.2} />
            </Link>
          }
        />
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
function AgentHeader({ name, initials, role }: { name: string; initials: string; role: string }) {
  const router = useRouter()
  const handleLogout = async () => {
    await fetch('/api/agentes/logout', { method: 'POST' }).catch(() => {})
    router.push('/agentes/login')
    router.refresh()
  }

  return (
    <header
      style={{
        background: '#fff',
        borderBottom: `1px solid ${LINE}`,
        padding: '13px clamp(18px, 4vw, 32px)',
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
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <span
          style={{
            fontFamily: POPPINS,
            fontWeight: 600,
            fontSize: 11,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: TEXT_SOFT,
          }}
        >
          Panel de agentes
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '4px 6px',
              borderRadius: 999,
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
                flexShrink: 0,
              }}
            >
              {initials}
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
              <span style={{ fontFamily: RALEWAY, fontWeight: 600, fontSize: 13, color: TEXT, whiteSpace: 'nowrap' }}>{name}</span>
              <span style={{ fontFamily: POPPINS, fontWeight: 300, fontSize: 11, color: TEXT_SOFT }}>{role}</span>
            </div>
          </div>

          <span aria-hidden style={{ width: 1, height: 24, background: LINE, margin: '0 6px' }} />

          <button
            type="button"
            onClick={handleLogout}
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
            className="agent-logout-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: TEXT_SOFT,
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            <LogOut size={16} strokeWidth={1.8} />
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .agent-logout-btn:hover {
          background: rgba(224, 90, 90, 0.1);
          color: #C0563E;
        }
        .agent-placa-card:hover {
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.10);
          transform: translateY(-2px);
        }
        .agent-tool-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        @media (min-width: 640px) {
          .agent-tool-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 768px) {
          .agent-tool-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (min-width: 1024px) {
          .agent-tool-grid-4 { grid-template-columns: repeat(4, 1fr); }
        }
      ` }} />
    </header>
  )
}

// ── Section title ───────────────────────────────────────────────────────
// Título de sección con sub-label opcional, chip opcional y línea divisoria
// que ocupa el ancho restante (look del mockup).
function SectionTitle({ children, sub, chip }: { children: React.ReactNode; sub?: string; chip?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '0 0 16px' }}>
      <h2 style={{ fontFamily: RALEWAY, fontSize: 17, fontWeight: 700, color: TEXT, margin: 0, whiteSpace: 'nowrap' }}>
        {children}
      </h2>
      {sub && (
        <span style={{ fontFamily: POPPINS, fontWeight: 300, fontSize: 12.5, color: TEXT_SOFT, whiteSpace: 'nowrap' }}>
          {sub}
        </span>
      )}
      {chip && (
        <span style={{ fontFamily: POPPINS, fontWeight: 600, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: GREEN, background: 'rgba(26,92,56,0.08)', borderRadius: 999, padding: '3px 9px', whiteSpace: 'nowrap' }}>
          {chip}
        </span>
      )}
      <span style={{ flex: 1, height: 1, background: LINE }} />
    </div>
  )
}

// ── Placa card ──────────────────────────────────────────────────────────
interface PlacaProps {
  href?: string
  comingSoon?: boolean
  icon: React.ReactNode
  /** Color del badge del ícono (pastel). */
  pastel?: string
  /** Color del ícono dentro del badge (tono oscuro del pastel). */
  iconColor?: string
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
          borderRadius: 12,
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
          fontFamily: POPPINS,
        }}
      >
        {total === 0 ? (
          <p style={{ fontWeight: 300, fontSize: 13, color: TEXT_SOFT, margin: 0 }}>
            Sin respuestas todavía
          </p>
        ) : (
          <>
            <span style={{ fontWeight: 600, fontSize: 14, color: TEXT, whiteSpace: 'nowrap' }}>
              {total} <span style={{ fontWeight: 300, fontSize: 12, color: TEXT_SOFT }}>respuestas</span>
            </span>
            {filas.map((f) => (
              <span key={f.label} title={f.label} style={{ fontWeight: 500, fontSize: 13.5, color: TEXT, whiteSpace: 'nowrap' }}>
                {f.emoji} {f.valor}
                <span style={{ fontSize: 12, color: f.color, marginLeft: 5 }}>{pct(f.valor)}%</span>
              </span>
            ))}
            <div
              role="img"
              aria-label={`Proporción: ${pct(data.up)}% positivos, ${pct(data.mid)}% neutros, ${pct(data.down)}% negativos`}
              style={{ display: 'flex', height: 6, borderRadius: 99, overflow: 'hidden', background: LINE, flex: 1, minWidth: 120 }}
            >
              {filas.map(
                (f) =>
                  f.valor > 0 && (
                    <div key={f.label} style={{ width: `${(f.valor / total) * 100}%`, background: f.color }} />
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
  iconColor,
  title,
  description,
  statLabel,
  footerNode,
}: PlacaProps) {
  const isLink = !comingSoon && !!href
  const baseStyle: React.CSSProperties = {
    background: '#fff',
    border: comingSoon ? `1.5px dashed #d8d2c6` : `1px solid ${LINE}`,
    borderRadius: 16,
    padding: 18,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    position: 'relative',
    transition: 'box-shadow 0.18s ease, transform 0.18s ease',
    color: TEXT,
    textDecoration: 'none',
    cursor: comingSoon ? 'default' : 'pointer',
    height: '100%',
  }

  const content = (
    <>
      {comingSoon && (
        <span
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
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
      {/* Badge del ícono */}
      <span
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          background: comingSoon ? '#EEEAE2' : pastel ?? '#EEF2F0',
          color: comingSoon ? '#9a958a' : iconColor ?? GREEN,
          flexShrink: 0,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </span>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0, flex: 1 }}>
        <h3 style={{ fontFamily: RALEWAY, fontWeight: 700, fontSize: 16, margin: 0, color: comingSoon ? '#9a958a' : '#1c1c1e', lineHeight: 1.25 }}>
          {title}
        </h3>
        <p
          style={{
            fontFamily: POPPINS,
            fontWeight: 300,
            fontSize: 12.5,
            lineHeight: 1.45,
            color: comingSoon ? '#9a958a' : TEXT_MUTED,
            margin: 0,
          }}
        >
          {description}
        </p>
      </div>

      {footerNode ? (
        <div>{footerNode}</div>
      ) : statLabel ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span
            style={{
              fontFamily: POPPINS,
              fontWeight: 500,
              fontSize: 12,
              color: comingSoon ? '#9a958a' : '#3a3a3a',
              letterSpacing: '0.02em',
            }}
          >
            {statLabel}
          </span>
          {isLink && <ArrowRight size={16} strokeWidth={2} color={TEXT_SOFT} style={{ flexShrink: 0 }} />}
        </div>
      ) : null}
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

// ── Wide card (ancha: badge + texto + acción a la derecha) ────────────────
function WideCard({
  icon,
  pastel,
  iconColor,
  title,
  description,
  action,
}: {
  icon: React.ReactNode
  pastel: string
  iconColor: string
  title: string
  description: string
  action: React.ReactNode
}) {
  return (
    <div
      style={{
        background: '#fff',
        border: `1px solid ${LINE}`,
        borderRadius: 16,
        padding: 18,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap',
      }}
    >
      <span
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          background: pastel,
          color: iconColor,
          flexShrink: 0,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </span>
      <div style={{ flex: '1 1 220px', minWidth: 0 }}>
        <h3 style={{ fontFamily: RALEWAY, fontWeight: 700, fontSize: 16, margin: '0 0 2px', color: '#1c1c1e' }}>
          {title}
        </h3>
        <p style={{ fontFamily: POPPINS, fontWeight: 300, fontSize: 12.5, lineHeight: 1.45, color: TEXT_MUTED, margin: 0 }}>
          {description}
        </p>
      </div>
      <div style={{ flexShrink: 0 }}>{action}</div>
    </div>
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

  // Un color de acento por stat, en sync con las tarjetas de "Tus herramientas"
  // (Autorizaciones ↔ coral de Autorización de Venta Digital, Con SI School
  // completo ↔ dorado de SI School) para que el panel se lea como un sistema.
  const stats = useMemo(
    () => [
      { label: 'Agentes activos', value: String(agentesActivos), color: GREEN },
      { label: 'Clientes en cartera', value: String(clientesGlobal), color: '#2B5C9B' },
      { label: 'Autorizaciones este mes', value: String(autorizacionesMes), color: '#B5562F' },
      { label: 'Con SI School completo', value: `${completos}/${agentesActivos}`, color: GOLD },
    ],
    [agentesActivos, clientesGlobal, autorizacionesMes, completos],
  )

  const newsletterStat = newsletterEsteMes > 0
    ? `${newsletterTotal} suscriptos · ${newsletterEsteMes} este mes`
    : `${newsletterTotal} suscriptos`

  return (
    <section aria-label="Administración" style={{ marginTop: 40 }}>
      <SectionTitle chip="Solo administrador">Administración</SectionTitle>

      {/* Stats sueltas */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: 12,
          marginBottom: 16,
        }}
      >
        {stats.map((s) => (
          <div
            key={s.label}
            style={{
              background: '#fff',
              border: `1px solid ${LINE}`,
              borderLeft: `3px solid ${s.color}`,
              borderRadius: 14,
              padding: '16px 18px 16px 15px',
            }}
          >
            <div style={{ fontFamily: POPPINS, fontWeight: 700, fontSize: 28, color: TEXT, letterSpacing: '-0.02em', lineHeight: 1.05 }}>
              {s.value}
            </div>
            <div style={{ marginTop: 6, fontFamily: POPPINS, fontWeight: 300, fontSize: 12, color: TEXT_SOFT }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Newsletter + Notas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
        <PlacaCard
          href="/agentes/newsletter"
          icon={<Mail size={22} strokeWidth={1.8} />}
          pastel="#D8D5F2"
          iconColor="#5B46A8"
          title="Suscriptores Newsletter"
          description="Leads del popup de la web."
          statLabel={newsletterStat}
        />
        <PlacaCard
          href="/admin/notas"
          icon={<Newspaper size={22} strokeWidth={1.8} />}
          pastel="#CBE2DC"
          iconColor={GREEN}
          title="Notas del Blog"
          description="Editá, subí portada o borrá notas."
          statLabel="Editar · portada · borrar"
        />
        <PlacaCard
          href="/agentes/oportunidades"
          icon={<Megaphone size={22} strokeWidth={1.8} />}
          pastel="#FCEBE3"
          iconColor="#B5562F"
          title="Oportunidades"
          description="Popup del sitio: vendedor motivado, permuta, negociable."
          statLabel="Gestionar popup"
        />
      </div>
    </section>
  )
}

// ── Equipo · Progreso en SI School (desplegable, solo admin) ──────────────
function EquipoSection() {
  const [open, setOpen] = useState(false)
  const agents = ADMIN_MOCK_AGENTS

  return (
    <section aria-label="Equipo" style={{ marginTop: 40 }}>
      <div style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 16, padding: '4px 6px' }}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px 12px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '12px 12px',
            textAlign: 'left',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: RALEWAY, fontWeight: 700, fontSize: 16, color: TEXT }}>Equipo</span>
            <span style={{ fontFamily: POPPINS, fontWeight: 300, fontSize: 12.5, color: TEXT_SOFT }}>Progreso en SI School</span>
            <span style={{ fontFamily: POPPINS, fontWeight: 600, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: GREEN, background: 'rgba(26,92,56,0.08)', borderRadius: 999, padding: '3px 9px' }}>
              Solo administrador
            </span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <span style={{ fontFamily: POPPINS, fontSize: 12.5, color: TEXT_SOFT }}>{agents.length} agentes</span>
            <ChevronDown size={18} color={TEXT_SOFT} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
          </span>
        </button>

        {open && (
          <div style={{ padding: '0 12px 12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {agents.map((ag) => {
                const pct = ag.capacidadesDone / TOTAL_CAPACIDADES
                const completed = ag.capacidadesDone >= TOTAL_CAPACIDADES
                return (
                  <div key={ag.id} style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 14, padding: '10px 4px', borderTop: `1px solid ${LINE}` }}>
                    <span
                      aria-hidden
                      style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: `linear-gradient(135deg, ${GREEN} 0%, ${GREEN_DARK} 100%)`,
                        color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: POPPINS, fontWeight: 600, fontSize: 12, flexShrink: 0,
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
                      <div style={{ height: 4, background: '#F4F4F5', borderRadius: 2, overflow: 'hidden', marginBottom: 4 }}>
                        <div style={{ height: '100%', width: `${Math.round(pct * 100)}%`, background: completed ? '#2A8B5A' : GOLD, transition: 'width 0.3s ease' }} />
                      </div>
                      <div style={{ fontFamily: POPPINS, fontWeight: 500, fontSize: 11.5, color: completed ? '#2A8B5A' : TEXT_MUTED, textAlign: 'right' }}>
                        {ag.capacidadesDone}/{TOTAL_CAPACIDADES}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <p style={{ marginTop: 14, fontFamily: POPPINS, fontWeight: 300, fontSize: 11.5, color: TEXT_SOFT, fontStyle: 'italic' }}>
              Datos de demostración — la sincronización por agente llega en Fase 2.
            </p>
          </div>
        )}
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
