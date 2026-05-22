'use client'

// Tabla de suscriptores del newsletter (popup "¿Encontraste lo que buscabas?").
// Vive dentro de /agentes/newsletter, gateada por role admin server-side.
//
// Acciones: buscar por nombre/email, exportar CSV (descarga del endpoint con
// ?format=csv), refrescar, abrir WhatsApp del lead. Sin paginación: la lista
// está topada en LIST_LIMIT (1000) del helper lib/leads.

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Download,
  MessageCircle,
  RefreshCw,
  Search,
} from 'lucide-react'

const GREEN = '#1A5C38'
const PAPER = '#FAF7F2'
const LINE = '#E4E4E7'
const TEXT = '#09090B'
const TEXT_MUTED = '#52525B'
const TEXT_SOFT = '#71717A'

const RALEWAY = 'var(--font-raleway), Raleway, system-ui, sans-serif'
const POPPINS = 'var(--font-poppins), Poppins, system-ui, sans-serif'

interface NewsletterLead {
  nombre: string
  email: string
  whatsapp?: string
  origen: string
  fecha: string
  operation?: string
  propertyType?: string
  budget?: string
}

interface Props {
  initialItems: NewsletterLead[]
}

function fmtDate(iso: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function buildWhatsAppUrl(lead: NewsletterLead): string {
  const phone = lead.whatsapp
    ? `54${lead.whatsapp.replace(/\D/g, '')}`
    : '5493412101694'
  const msg = encodeURIComponent(
    `Hola ${lead.nombre || 'qué tal'}, soy de SI INMOBILIARIA. Te escribo porque nos dejaste tus datos en el sitio. ¿En qué te podemos ayudar?`,
  )
  return `https://wa.me/${phone}?text=${msg}`
}

export default function NewsletterClient({ initialItems }: Props) {
  const [items, setItems] = useState<NewsletterLead[]>(initialItems)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter(l =>
      l.email.toLowerCase().includes(q)
      || l.nombre.toLowerCase().includes(q)
      || (l.whatsapp ?? '').toLowerCase().includes(q),
    )
  }, [items, query])

  const stats = useMemo(() => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
    let esteMes = 0
    for (const l of items) {
      const t = Date.parse(l.fecha)
      if (Number.isFinite(t) && t >= startOfMonth) esteMes++
    }
    return { total: items.length, esteMes, mostrando: filtered.length }
  }, [items, filtered.length])

  const refresh = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/agentes/newsletter', { cache: 'no-store' })
      if (!res.ok) {
        setError(`Error ${res.status}`)
        return
      }
      const data = await res.json()
      if (Array.isArray(data.items)) setItems(data.items as NewsletterLead[])
    } catch {
      setError('Error de red')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: '#FAFAFA', minHeight: '100vh', fontFamily: RALEWAY, color: TEXT }}>
      <main style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(24px, 4vw, 48px) clamp(18px, 4vw, 32px) 80px' }}>
        <Link
          href="/agentes"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: POPPINS,
            fontSize: 12.5,
            color: TEXT_SOFT,
            textDecoration: 'none',
            marginBottom: 18,
          }}
        >
          <ArrowLeft size={14} /> Volver al panel
        </Link>

        <header style={{ marginBottom: 28 }}>
          <h1
            style={{
              fontFamily: RALEWAY,
              fontWeight: 700,
              fontSize: 'clamp(24px, 3.5vw, 32px)',
              letterSpacing: '-0.02em',
              margin: '0 0 6px',
            }}
          >
            Suscriptores Newsletter
          </h1>
          <p style={{ fontFamily: POPPINS, fontWeight: 300, fontSize: 14, color: TEXT_MUTED, margin: 0 }}>
            Personas que dejaron sus datos en el popup “¿Encontraste lo que buscabas?”.
          </p>
        </header>

        {/* Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 12,
            marginBottom: 22,
          }}
        >
          <StatCard label="Suscriptos totales" value={String(stats.total)} />
          <StatCard label="Este mes" value={String(stats.esteMes)} />
          <StatCard label="Mostrando" value={String(stats.mostrando)} />
        </div>

        {/* Toolbar */}
        <div
          style={{
            display: 'flex',
            gap: 10,
            flexWrap: 'wrap',
            alignItems: 'center',
            marginBottom: 18,
          }}
        >
          <div
            style={{
              flex: 1,
              minWidth: 240,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: '#fff',
              border: `1px solid ${LINE}`,
              borderRadius: 10,
              padding: '8px 12px',
            }}
          >
            <Search size={14} color={TEXT_SOFT} />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar por nombre, email o WhatsApp…"
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontFamily: POPPINS,
                fontSize: 13,
                color: TEXT,
              }}
            />
          </div>

          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '9px 14px',
              background: '#fff',
              color: TEXT_MUTED,
              border: `1px solid ${LINE}`,
              borderRadius: 10,
              fontFamily: POPPINS,
              fontSize: 12.5,
              cursor: loading ? 'wait' : 'pointer',
            }}
          >
            <RefreshCw size={13} className={loading ? 'nl-spin' : ''} />
            {loading ? 'Refrescando…' : 'Refrescar'}
          </button>

          <a
            href="/api/agentes/newsletter?format=csv"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '9px 14px',
              background: GREEN,
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              fontFamily: POPPINS,
              fontSize: 12.5,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <Download size={13} /> Exportar CSV
          </a>
        </div>

        {error && (
          <div
            style={{
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#B91C1C',
              padding: 12,
              borderRadius: 10,
              fontSize: 13,
              marginBottom: 14,
            }}
          >
            {error}
          </div>
        )}

        {/* Tabla */}
        {filtered.length === 0 ? (
          <div
            style={{
              background: '#fff',
              border: `1px dashed ${LINE}`,
              borderRadius: 14,
              padding: '48px 24px',
              textAlign: 'center',
              color: TEXT_SOFT,
              fontFamily: POPPINS,
              fontSize: 14,
            }}
          >
            {items.length === 0
              ? 'Todavía no hay suscriptores. Cuando alguien complete el popup, aparece acá.'
              : 'Nadie matchea con esa búsqueda.'}
          </div>
        ) : (
          <div
            style={{
              background: '#fff',
              border: `1px solid ${LINE}`,
              borderRadius: 14,
              overflow: 'hidden',
            }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: POPPINS, fontSize: 13 }}>
                <thead style={{ background: PAPER }}>
                  <tr>
                    <Th>Nombre</Th>
                    <Th>Email</Th>
                    <Th>WhatsApp</Th>
                    <Th>Búsqueda</Th>
                    <Th>Fecha</Th>
                    <Th />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((l, i) => (
                    <tr
                      key={`${l.email}-${i}`}
                      style={{
                        borderTop: `1px solid ${LINE}`,
                      }}
                    >
                      <Td>{l.nombre || '—'}</Td>
                      <Td style={{ color: GREEN, fontWeight: 500 }}>{l.email}</Td>
                      <Td style={{ fontVariantNumeric: 'tabular-nums', color: TEXT_MUTED }}>
                        {l.whatsapp || '—'}
                      </Td>
                      <Td style={{ color: TEXT_MUTED }}>{buildBusquedaLabel(l)}</Td>
                      <Td style={{ color: TEXT_SOFT, fontSize: 12 }}>{fmtDate(l.fecha)}</Td>
                      <Td>
                        <a
                          href={buildWhatsAppUrl(l)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '5px 10px',
                            background: '#25D366',
                            color: '#fff',
                            borderRadius: 999,
                            fontSize: 11,
                            fontWeight: 600,
                            textDecoration: 'none',
                          }}
                          title="Abrir WhatsApp"
                        >
                          <MessageCircle size={11} /> WA
                        </a>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <p
          style={{
            marginTop: 18,
            fontFamily: POPPINS,
            fontSize: 11.5,
            color: TEXT_SOFT,
          }}
        >
          Lista deduplicada por email. Si un suscriptor vuelve a completar el popup, gana el registro más reciente.
        </p>

        <style>{`
          @keyframes nl-spin { to { transform: rotate(360deg); } }
          .nl-spin { animation: nl-spin 1s linear infinite; }
        `}</style>
      </main>
    </div>
  )
}

function buildBusquedaLabel(l: NewsletterLead): string {
  const parts: string[] = []
  if (l.operation) parts.push(l.operation)
  if (l.propertyType) parts.push(l.propertyType)
  if (l.budget && l.budget !== 'Sin límite') parts.push(l.budget)
  return parts.length > 0 ? parts.join(' · ') : '—'
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: PAPER,
        border: `1px solid ${LINE}`,
        borderRadius: 12,
        padding: '14px 16px',
      }}
    >
      <div style={{ fontFamily: POPPINS, fontWeight: 600, fontSize: 24, color: TEXT, letterSpacing: '-0.02em', lineHeight: 1.05 }}>
        {value}
      </div>
      <div style={{ marginTop: 4, fontFamily: POPPINS, fontWeight: 300, fontSize: 11.5, color: TEXT_SOFT, letterSpacing: '0.06em' }}>
        {label}
      </div>
    </div>
  )
}

function Th({ children }: { children?: React.ReactNode }) {
  return (
    <th
      style={{
        textAlign: 'left',
        padding: '11px 14px',
        fontFamily: POPPINS,
        fontWeight: 600,
        fontSize: 11.5,
        color: TEXT_SOFT,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </th>
  )
}

function Td({ children, style }: { children?: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <td
      style={{
        padding: '11px 14px',
        color: TEXT,
        verticalAlign: 'middle',
        ...style,
      }}
    >
      {children}
    </td>
  )
}

