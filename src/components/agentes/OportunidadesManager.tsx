'use client'

// Gestor admin del popup de Oportunidades: pegás el link (o ID) de una
// propiedad, elegís el gancho y guardás. La lista se refleja al instante en
// el popup del sitio público (cache de 60s).

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import type { Oportunidad, Hook } from '@/lib/oportunidades'

const GREEN = '#1A5C38'
const LINE = '#E4E4E7'
const TEXT = '#09090B'
const TEXT_MUTED = '#52525B'
const TEXT_SOFT = '#71717A'
const RALEWAY = 'var(--font-raleway), Raleway, system-ui, sans-serif'
const POPPINS = 'var(--font-poppins), Poppins, system-ui, sans-serif'

const HOOK_OPTIONS: { value: Hook; label: string; cta: string }[] = [
  { value: 'motivado', label: 'Vendedor motivado', cta: 'Pasá a conocerla' },
  { value: 'permuta', label: 'Acepta permuta', cta: 'Pasá a conocerla' },
  { value: 'negociable', label: 'Margen para negociar', cta: 'Hacé tu oferta' },
  { value: 'bajo-precio', label: 'Bajó el precio', cta: 'Miralá ahora' },
]

/** Acepta un ID pelado o una URL de ficha (/propiedades/1234567-slug). */
function parsePropertyId(input: string): number | null {
  const s = input.trim()
  if (/^\d+$/.test(s)) return Number(s)
  const m = s.match(/\/propiedades\/(\d+)/)
  return m ? Number(m[1]) : null
}

export default function OportunidadesManager({ initialItems }: { initialItems: Oportunidad[] }) {
  const [items, setItems] = useState<Oportunidad[]>(initialItems)
  const [input, setInput] = useState('')
  const [hook, setHook] = useState<Hook>('motivado')
  const [precioAnterior, setPrecioAnterior] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const agregar = async () => {
    const propertyId = parsePropertyId(input)
    if (!propertyId) {
      setMsg({ ok: false, text: 'Pegá el link de la ficha o el ID numérico de la propiedad.' })
      return
    }
    if (hook === 'bajo-precio' && !Number(precioAnterior.replace(/\D/g, ''))) {
      setMsg({ ok: false, text: 'Ingresá el precio anterior para "Bajó el precio".' })
      return
    }
    setBusy(true)
    setMsg(null)
    try {
      const res = await fetch('/api/oportunidades', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          hook,
          ...(hook === 'bajo-precio' ? { precioAnterior: Number(precioAnterior.replace(/\D/g, '')) } : {}),
        }),
      })
      const d = await res.json()
      if (!res.ok) {
        setMsg({ ok: false, text: d?.error || 'No se pudo agregar.' })
      } else {
        setItems((prev) => [...prev, d.item])
        setInput('')
        setPrecioAnterior('')
        setMsg({ ok: true, text: 'Agregada — ya aparece en el popup del sitio.' })
      }
    } catch {
      setMsg({ ok: false, text: 'Error de red.' })
    } finally {
      setBusy(false)
    }
  }

  const borrar = async (id: number) => {
    if (!window.confirm('¿Sacar esta propiedad del popup?')) return
    const res = await fetch(`/api/oportunidades?id=${id}`, { method: 'DELETE' })
    if (res.ok) setItems((prev) => prev.filter((i) => i.propertyId !== id))
    else window.alert('No se pudo borrar.')
  }

  return (
    <div style={{ background: '#FAFAFA', minHeight: '100vh', fontFamily: RALEWAY, color: TEXT }}>
      <main style={{ maxWidth: 880, margin: '0 auto', padding: 'clamp(24px, 4vw, 48px) clamp(18px, 4vw, 32px) 80px' }}>
        <Link
          href="/agentes"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: POPPINS, fontSize: 12.5, color: TEXT_SOFT, textDecoration: 'none', marginBottom: 18 }}
        >
          <ArrowLeft size={14} /> Volver al panel
        </Link>

        <header style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: RALEWAY, fontWeight: 700, fontSize: 'clamp(24px, 3.5vw, 32px)', letterSpacing: '-0.02em', margin: '0 0 6px' }}>
            Oportunidades
          </h1>
          <p style={{ fontFamily: POPPINS, fontWeight: 300, fontSize: 14, color: TEXT_MUTED, margin: 0 }}>
            Hasta 4 propiedades con gancho comercial para el popup del sitio (esquina inferior derecha).
          </p>
        </header>

        {/* Alta */}
        <div style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 16, padding: 18, marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input
              value={input}
              onChange={(e) => { setInput(e.target.value); setMsg(null) }}
              onKeyDown={(e) => { if (e.key === 'Enter') agregar() }}
              placeholder="Link de la ficha o ID de la propiedad"
              style={{ flex: '1 1 260px', padding: '11px 14px', border: `1px solid ${LINE}`, borderRadius: 10, fontSize: 14, fontFamily: POPPINS, outline: 'none' }}
            />
            <select
              value={hook}
              onChange={(e) => { setHook(e.target.value as Hook); setMsg(null) }}
              style={{ padding: '11px 12px', border: `1px solid ${LINE}`, borderRadius: 10, fontSize: 13.5, fontFamily: POPPINS, background: '#fff', cursor: 'pointer' }}
            >
              {HOOK_OPTIONS.map((h) => (
                <option key={h.value} value={h.value}>{h.label} · {h.cta}</option>
              ))}
            </select>
            {hook === 'bajo-precio' && (
              <input
                value={precioAnterior}
                onChange={(e) => { setPrecioAnterior(e.target.value); setMsg(null) }}
                inputMode="numeric"
                placeholder="Precio anterior (ej: 300000)"
                style={{ flex: '0 1 200px', padding: '11px 14px', border: `1px solid ${LINE}`, borderRadius: 10, fontSize: 14, fontFamily: POPPINS, outline: 'none' }}
              />
            )}
            <button
              type="button"
              onClick={agregar}
              disabled={busy}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: GREEN, color: '#fff', border: 'none', borderRadius: 10, padding: '11px 18px', fontFamily: POPPINS, fontWeight: 600, fontSize: 13.5, cursor: 'pointer', opacity: busy ? 0.6 : 1 }}
            >
              <Plus size={15} strokeWidth={2.2} /> {busy ? 'Agregando…' : 'Agregar'}
            </button>
          </div>
          {msg && (
            <p style={{ margin: '10px 0 0', fontFamily: POPPINS, fontSize: 12.5, color: msg.ok ? GREEN : '#C0563E' }}>
              {msg.text}
            </p>
          )}
        </div>

        {/* Lista */}
        {items.length === 0 ? (
          <p style={{ fontFamily: POPPINS, fontSize: 13.5, color: TEXT_SOFT }}>
            No hay oportunidades cargadas — el popup no se muestra en el sitio.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.map((it) => {
              const meta = HOOK_OPTIONS.find((h) => h.value === it.hook)
              return (
                <div key={it.propertyId} style={{ display: 'flex', alignItems: 'center', gap: 13, background: '#fff', border: `1px solid ${LINE}`, borderRadius: 14, padding: 12 }}>
                  {it.foto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.foto} alt="" width={72} height={54} style={{ width: 72, height: 54, objectFit: 'cover', borderRadius: 9, flexShrink: 0, background: '#f2f2f2' }} />
                  ) : (
                    <span style={{ width: 72, height: 54, borderRadius: 9, background: '#EEF2F0', flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: RALEWAY, fontWeight: 700, fontSize: 14.5, color: '#1c1c1e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {it.titulo}
                    </div>
                    <div style={{ fontFamily: POPPINS, fontSize: 12, color: TEXT_MUTED, marginTop: 2 }}>
                      {it.precioAnterior ? <><s style={{ color: '#A1A1AA' }}>{it.precioAnterior}</s> {it.precio} (−{String(it.pctBaja).replace('.', ',')}%)</> : it.precio}
                      {' · '}<span style={{ color: GREEN, fontWeight: 600 }}>{meta?.label}</span> · ID {it.propertyId}
                    </div>
                  </div>
                  <a href={it.href} target="_blank" rel="noopener noreferrer" style={{ fontFamily: POPPINS, fontSize: 12.5, fontWeight: 600, color: GREEN, textDecoration: 'none', flexShrink: 0 }}>
                    Ver ficha ↗
                  </a>
                  <button
                    type="button"
                    onClick={() => borrar(it.propertyId)}
                    title="Sacar del popup"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C4C4C8', padding: 6, display: 'inline-flex', flexShrink: 0 }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#C0563E' }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#C4C4C8' }}
                  >
                    <Trash2 size={16} strokeWidth={1.9} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
