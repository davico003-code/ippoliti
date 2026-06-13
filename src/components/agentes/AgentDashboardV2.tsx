'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import {
  BarChart3,
  FileText,
  GraduationCap,
  Mail,
  MessageSquare,
  Newspaper,
  Users,
} from 'lucide-react'

import { getProgress } from '@/lib/si-school/progress'

// ── Design tokens ──────────────────────────────────────────────────────
const GREEN = '#1A5C38'
const GREEN_DARK = '#143E27'
const GREEN_TINT = '#E8F1ED'
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
}

export default function AgentDashboardV2({
  agentName,
  agentRole,
  clientesEnCartera,
  autorizacionesEsteMes,
  newsletterTotal = 0,
  newsletterEsteMes = 0,
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
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 18,
            marginBottom: 40,
          }}
        >
          <PlacaCard
            href="/agentes/seleccion"
            icon={<Users size={22} strokeWidth={1.8} />}
            iconColor={GREEN}
            iconBg={GREEN_TINT}
            title="Seguimiento de Clientes"
            description="Tu cartera activa de compradores y vendedores. Conversaciones, visitas y notas en un solo lugar."
            statLabel={`${clientesEnCartera} en tu cartera`}
            statColor={GREEN}
          />
          <PlacaCard
            href="/recursos/si-school"
            icon={<GraduationCap size={22} strokeWidth={1.8} />}
            iconColor={GOLD}
            iconBg={GOLD_TINT}
            title="SI School"
            description="El programa de onboarding del agente SI. 6 capacidades para construir oficio desde el día uno."
            accent="gold"
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
            iconColor={GREEN}
            iconBg={GREEN_TINT}
            title="Autorización de Venta Digital"
            description="Generá Acuerdos de Comercialización para firmar a distancia. Plazo, condiciones y firma del propietario en un minuto."
            statLabel={`${autorizacionesEsteMes} acuerdos generados este mes`}
            statColor={GREEN}
          />
        </div>

        {/* Próximamente */}
        <SectionTitle>Próximamente</SectionTitle>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 18,
            marginBottom: isAdmin ? 56 : 0,
          }}
        >
          <PlacaCard
            comingSoon
            icon={<MessageSquare size={22} strokeWidth={1.8} />}
            iconColor={GREEN}
            iconBg={GREEN_TINT}
            title="Modelos de Contratos"
            description="Biblioteca de modelos: oferta digital, reserva, boleto de compraventa. Todos editables y firmables online."
            statLabel="En desarrollo"
          />
          <PlacaCard
            comingSoon
            icon={<BarChart3 size={22} strokeWidth={1.8} />}
            iconColor={GREEN}
            iconBg={GREEN_TINT}
            title="Métricas y KPI"
            description={
              isAdmin
                ? 'Tus operaciones y las del equipo. Visualización mes a mes y año a año.'
                : 'Tus operaciones cerradas, origen de leads, tasa de cierre. Visualización mes a mes y año a año.'
            }
            statLabel="En desarrollo"
          />
        </div>

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
        <div
          style={{
            marginLeft: 'auto',
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
          border-color: ${GREEN} !important;
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
          transform: translateY(-2px);
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
  iconColor: string
  iconBg: string
  title: string
  description: string
  statLabel?: string
  statColor?: string
  footerNode?: React.ReactNode
  accent?: 'gold'
}

function PlacaCard({
  href,
  comingSoon,
  icon,
  iconColor,
  iconBg,
  title,
  description,
  statLabel,
  statColor,
  footerNode,
  accent,
}: PlacaProps) {
  const baseStyle: React.CSSProperties = {
    background: comingSoon ? PAPER : '#fff',
    border: comingSoon
      ? `1.5px dashed ${LINE}`
      : `1px solid ${accent === 'gold' ? 'rgba(184, 147, 90, 0.4)' : LINE}`,
    borderRadius: 16,
    padding: 28,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    position: 'relative',
    transition: 'border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease',
    color: TEXT,
    textDecoration: 'none',
    cursor: comingSoon ? 'default' : 'pointer',
    minHeight: 220,
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
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: iconBg,
          color: iconColor,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <h3 style={{ fontFamily: RALEWAY, fontWeight: 600, fontSize: 18, margin: '4px 0 0', color: TEXT, lineHeight: 1.25 }}>
        {title}
      </h3>
      <p style={{ fontFamily: POPPINS, fontWeight: 300, fontSize: 13.5, lineHeight: 1.55, color: TEXT_MUTED, margin: 0, flex: 1 }}>
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
            fontSize: 12.5,
            color: statColor ?? (comingSoon ? TEXT_SOFT : TEXT_MUTED),
            letterSpacing: '0.02em',
          }}
        >
          {statLabel}
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

// ── Progress bar ────────────────────────────────────────────────────────
function ProgressBar({ done, total, label }: { done: number; total: number; label: string }) {
  const pct = total > 0 ? Math.min(1, done / total) : 0
  return (
    <div style={{ marginTop: 4 }}>
      <div
        style={{
          height: 6,
          background: '#F4F4F5',
          borderRadius: 3,
          overflow: 'hidden',
          marginBottom: 6,
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${Math.round(pct * 100)}%`,
            background: GOLD,
            transition: 'width 0.3s ease',
          }}
        />
      </div>
      <div style={{ fontFamily: POPPINS, fontWeight: 500, fontSize: 12.5, color: GOLD }}>{label}</div>
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

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 18,
          marginBottom: 28,
        }}
      >
        <PlacaCard
          href="/agentes/newsletter"
          icon={<Mail size={22} strokeWidth={1.8} />}
          iconColor={GREEN}
          iconBg={GREEN_TINT}
          title="Suscriptores Newsletter"
          description="Personas que dejaron sus datos en el popup “¿Encontraste lo que buscabas?”. Exportá la lista o contactalos por WhatsApp."
          statLabel={newsletterStat}
          statColor={GREEN}
        />
        <PlacaCard
          href="/admin/notas"
          icon={<Newspaper size={22} strokeWidth={1.8} />}
          iconColor={GREEN}
          iconBg={GREEN_TINT}
          title="Notas del Blog"
          description="Editá el texto, subí portada o borrá notas del blog. El radar publica solo martes y viernes; acá ves la actividad. Pide el código del equipo."
          statLabel="Editar · portada · borrar"
          statColor={GREEN}
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
