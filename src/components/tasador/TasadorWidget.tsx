'use client'

// Widget del tasador online. Se renderiza embebido en cada landing /tasar/[slug]
// ya configurado con el precio de tierra de ESE barrio: el mismo motor sirve a
// todas las páginas, cada una con su contexto.
//
// Criterio de conversión (patrón Bresson/Magnin): el valor se da GRATIS y sin
// pedir datos. El contacto se pide recién después de que la persona vio su
// número, para la tasación profesional.

import { useMemo, useState } from 'react'
import {
  ANTIGUEDAD,
  ESTADO,
  EXTRAS,
  fmtUSD,
  tasar,
  type AntiguedadId,
  type EstadoId,
} from '@/lib/tasador/motor'
import { trackEvent, trackFbEvent } from '@/lib/analytics'

const GREEN = '#1A5C38'
const R = "'Raleway', system-ui, sans-serif"
const P = "var(--font-poppins), 'Poppins', system-ui, sans-serif"

export interface CalidadConstruccion {
  slug: string
  label: string
  costoM2: number
  superficie: string
}

interface Props {
  barrioNombre: string
  ciudad: string
  ppm2Tierra: number
  fuenteTierra: 'barrio' | 'ciudad'
  muestras: number
  calidades: CalidadConstruccion[]
  esLote: boolean
  whatsappBase: string
}

const chipBase: React.CSSProperties = {
  border: '1px solid #d0d0d0',
  background: '#f5f5f7',
  color: '#6e6e73',
  borderRadius: 999,
  padding: '9px 15px',
  fontSize: 13.5,
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: R,
  transition: 'all .15s',
}
const chipOn: React.CSSProperties = {
  ...chipBase,
  background: GREEN,
  borderColor: GREEN,
  color: '#fff',
}

function Campo({
  label,
  value,
  onChange,
  hint,
}: {
  label: string
  value: number
  onChange: (n: number) => void
  hint?: string
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
        {label}
      </label>
      <input
        type="number"
        inputMode="numeric"
        value={value || ''}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: '100%',
          height: 46,
          border: '1px solid #d0d0d0',
          borderRadius: 12,
          padding: '0 14px',
          fontFamily: P,
          fontSize: 15,
          fontVariantNumeric: 'tabular-nums',
        }}
      />
      {hint && <div style={{ fontSize: 11.5, color: '#8a8a8e', marginTop: 4 }}>{hint}</div>}
    </div>
  )
}

export default function TasadorWidget({
  barrioNombre,
  ciudad,
  ppm2Tierra,
  fuenteTierra,
  muestras,
  calidades,
  esLote,
  whatsappBase,
}: Props) {
  const [lote, setLote] = useState(esLote ? 600 : 300)
  const [cubiertos, setCubiertos] = useState(esLote ? 0 : 120)
  const [calidadSlug, setCalidadSlug] = useState(calidades[1]?.slug ?? calidades[0]?.slug ?? '')
  const [antiguedad, setAntiguedad] = useState<AntiguedadId>('estrenar')
  const [estado, setEstado] = useState<EstadoId>('muybueno')
  const [extras, setExtras] = useState<string[]>([])
  const [tocado, setTocado] = useState(false)

  const costoM2 = calidades.find((c) => c.slug === calidadSlug)?.costoM2 ?? calidades[0]?.costoM2 ?? 0

  const res = useMemo(
    () =>
      tasar({
        loteM2: lote,
        cubiertosM2: esLote ? 0 : cubiertos,
        ppm2Tierra,
        costoM2Construccion: costoM2,
        antiguedad,
        estado,
        extras,
        fuenteTierra,
      }),
    [lote, cubiertos, ppm2Tierra, costoM2, antiguedad, estado, extras, esLote, fuenteTierra],
  )

  const marcar = () => {
    if (tocado) return
    setTocado(true)
    trackEvent('tasador_uso', { barrio: barrioNombre, ciudad })
  }

  const mensajeWsp = () => {
    const detalle = [
      `Hola! Usé el tasador online de ${barrioNombre}.`,
      `Estimación: ${fmtUSD(res.total)}`,
      esLote ? `Lote: ${lote} m²` : `Lote: ${lote} m² · Cubiertos: ${cubiertos} m²`,
      !esLote && `Antigüedad: ${ANTIGUEDAD.find((a) => a.id === antiguedad)?.label}`,
      !esLote && `Estado: ${ESTADO.find((e) => e.id === estado)?.label}`,
      'Quiero mi tasación precisa.',
    ]
      .filter(Boolean)
      .join('\n')
    return `${whatsappBase}?text=${encodeURIComponent(detalle)}`
  }

  const pedirTasacion = () => {
    trackEvent('tasador_lead', { barrio: barrioNombre, estimacion: Math.round(res.total) })
    trackFbEvent('Lead', { content_name: `Tasador ${barrioNombre}` })
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1.05fr_.95fr] items-start">
      {/* ── Entrada ── */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: 18,
          padding: 24,
          boxShadow: '0 10px 34px rgba(9,30,20,.07)',
        }}
        onChange={marcar}
      >
        <h2 style={{ fontFamily: R, fontWeight: 800, fontSize: 18, marginBottom: 4 }}>
          {esLote ? 'Contanos de tu lote' : 'Contanos de tu propiedad'}
        </h2>
        <p style={{ fontSize: 13, color: '#6e6e73', marginBottom: 18 }}>
          {esLote
            ? 'Con la superficie alcanza. El valor se calcula solo.'
            : 'Tres datos alcanzan. El valor se actualiza mientras completás.'}
        </p>

        <div className={esLote ? '' : 'grid grid-cols-2 gap-3.5'}>
          <Campo label="Superficie del lote (m²)" value={lote} onChange={setLote} />
          {!esLote && (
            <Campo label="Superficie cubierta (m²)" value={cubiertos} onChange={setCubiertos} />
          )}
        </div>

        {!esLote && (
          <>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, margin: '16px 0 6px' }}>
              Calidad de la construcción
            </label>
            <div className="flex flex-wrap gap-2">
              {calidades.map((c) => (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => {
                    setCalidadSlug(c.slug)
                    marcar()
                  }}
                  style={calidadSlug === c.slug ? chipOn : chipBase}
                  title={`${c.superficie} · USD ${c.costoM2}/m²`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, margin: '16px 0 6px' }}>
              Antigüedad
            </label>
            <div className="flex flex-wrap gap-2">
              {ANTIGUEDAD.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => {
                    setAntiguedad(a.id)
                    marcar()
                  }}
                  style={antiguedad === a.id ? chipOn : chipBase}
                >
                  {a.label}
                </button>
              ))}
            </div>

            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, margin: '16px 0 6px' }}>
              Estado general
            </label>
            <div className="flex flex-wrap gap-2">
              {ESTADO.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setEstado(s.id)
                    marcar()
                  }}
                  style={estado === s.id ? chipOn : chipBase}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, margin: '16px 0 6px' }}>
              Extras que suman
            </label>
            <div className="flex flex-wrap gap-2">
              {EXTRAS.map((x) => {
                const on = extras.includes(x.id)
                return (
                  <button
                    key={x.id}
                    type="button"
                    onClick={() => {
                      setExtras((p) => (on ? p.filter((i) => i !== x.id) : [...p, x.id]))
                      marcar()
                    }}
                    style={on ? chipOn : chipBase}
                  >
                    {x.label}
                  </button>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* ── Resultado + captura ── */}
      <div className="md:sticky md:top-4">
        <div
          style={{
            background: `linear-gradient(160deg,#0d3d24,${GREEN})`,
            color: '#fff',
            borderRadius: 18,
            padding: 24,
          }}
        >
          <div
            style={{
              fontSize: 12.5,
              fontWeight: 600,
              opacity: 0.85,
              textTransform: 'uppercase',
              letterSpacing: '.08em',
            }}
          >
            Valor estimado {esLote ? 'de tu lote' : 'de tu propiedad'}
          </div>
          <div style={{ fontFamily: P, fontSize: 40, fontWeight: 800, margin: '6px 0 2px' }}>
            {fmtUSD(res.total)}
          </div>
          <div style={{ fontFamily: P, fontSize: 13.5, opacity: 0.9 }}>
            Rango estimado: {fmtUSD(res.min)} a {fmtUSD(res.max)}
          </div>

          <div
            style={{
              marginTop: 18,
              borderTop: '1px solid rgba(255,255,255,.25)',
              paddingTop: 14,
              fontFamily: P,
              fontSize: 13.5,
              display: 'grid',
              gap: 7,
            }}
          >
            <div className="flex justify-between">
              <span>
                Tierra ({lote} m² × USD {ppm2Tierra})
              </span>
              <b>{fmtUSD(res.tierra)}</b>
            </div>
            {!esLote && (
              <div className="flex justify-between">
                <span>Construcción depreciada</span>
                <b>{fmtUSD(res.construccion)}</b>
              </div>
            )}
            {res.extras > 0 && (
              <div className="flex justify-between">
                <span>Extras</span>
                <b>{fmtUSD(res.extras)}</b>
              </div>
            )}
          </div>

          <p style={{ marginTop: 14, fontSize: 11.5, opacity: 0.75, lineHeight: 1.5 }}>
            Valor de la tierra:{' '}
            {fuenteTierra === 'barrio'
              ? `promedio de ${muestras} ${muestras === 1 ? 'terreno relevado' : 'terrenos relevados'} en ${barrioNombre}`
              : `promedio de terrenos en ${ciudad} (todavía no tenemos muestra propia de ${barrioNombre})`}
            {!esLote && ` · Costo de construcción: USD ${costoM2}/m² llave en mano, actualizado por IPC`}
            . Estimación orientativa: no reemplaza una tasación profesional.
          </p>
        </div>

        {/* Captura DESPUÉS del valor */}
        <div
          style={{
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 18,
            padding: 22,
            marginTop: 16,
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: 14.5, color: '#6e6e73', marginBottom: 14, lineHeight: 1.55 }}>
            <b style={{ color: '#111' }}>Quiero recibir mi tasación precisa.</b> Un martillero
            matriculado con 40 años en {ciudad} la hace <b style={{ color: '#111' }}>gratis y en 24 hs</b>,
            mirando lo que ningún algoritmo ve.
          </p>
          <a
            href={mensajeWsp()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={pedirTasacion}
            className="flex items-center justify-center gap-2 w-full"
            style={{
              background: '#25D366',
              color: '#fff',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 15,
              padding: '13px 22px',
              textDecoration: 'none',
              fontFamily: R,
            }}
          >
            Quiero mi tasación precisa
          </a>
          <a
            href={`/tasaciones?tipo=${esLote ? 'Terreno' : 'Casa'}&zona=${encodeURIComponent(barrioNombre)}`}
            onClick={pedirTasacion}
            className="flex items-center justify-center w-full"
            style={{
              background: '#fff',
              border: `2px solid ${GREEN}`,
              color: GREEN,
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 15,
              padding: '11px 22px',
              textDecoration: 'none',
              marginTop: 9,
              fontFamily: R,
            }}
          >
            Prefiero que me contacten
          </a>
        </div>
      </div>
    </div>
  )
}
