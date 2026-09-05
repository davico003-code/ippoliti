'use client'

// Widget del tasador online. Se renderiza embebido en cada landing /tasar/[slug]
// ya configurado con el precio de tierra de ESE barrio: el mismo motor sirve a
// todas las páginas, cada una con su contexto.
//
// Criterio de conversión (patrón Bresson/Magnin): el valor se da al instante y
// sin pedir datos. El contacto se pide recién después de que la persona vio su
// número, en /tasaciones (el pedido va a Hilo; no abre WhatsApp).

import { useMemo, useState } from 'react'
import {
  AMENITIES_DEPTO,
  ANTIGUEDAD,
  ESTADO,
  EXTRAS,
  fmtUSD,
  tasar,
  tasarDepartamento,
  type AntiguedadId,
  type EstadoId,
} from '@/lib/tasador/motor'
import { trackEvent } from '@/lib/analytics'
import type { OpcionBarrioSelector } from '@/lib/tasador/barrios'

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
  fuenteTierra: 'curado' | 'barrio' | 'ciudad'
  muestras: number
  calidades: CalidadConstruccion[]
  esLote: boolean
  esDepto?: boolean
  /** Catálogo completo para el selector "¿En qué barrio está?" (opcional). */
  barrios?: OpcionBarrioSelector[]
  /** Slug del barrio de la landing, para preseleccionar. */
  barrioSlug?: string
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
  esDepto = false,
  barrios = [],
  barrioSlug = '',
}: Props) {
  const [barrioSel, setBarrioSel] = useState(barrioSlug)
  const [ppm2Custom, setPpm2Custom] = useState('')
  const [lote, setLote] = useState(esLote ? 600 : 300)
  const [cubiertos, setCubiertos] = useState(esLote ? 0 : 120)
  const [calidadSlug, setCalidadSlug] = useState(calidades[1]?.slug ?? calidades[0]?.slug ?? '')
  const [antiguedad, setAntiguedad] = useState<AntiguedadId>('estrenar')
  const [estado, setEstado] = useState<EstadoId>('muybueno')
  const [extras, setExtras] = useState<string[]>([])
  const [amenities, setAmenities] = useState('sinamenities')
  const [cochera, setCochera] = useState(false)
  const [tocado, setTocado] = useState(false)

  const costoM2 = calidades.find((c) => c.slug === calidadSlug)?.costoM2 ?? calidades[0]?.costoM2 ?? 0

  // Zona activa: la de la landing, salvo que la persona elija otro barrio.
  const sel = barrios.find((b) => b.slug === barrioSel)
  const esInicial = !sel || sel.slug === barrioSlug
  const nombreZona = esInicial ? barrioNombre : sel!.nombre
  const ciudadZona = esInicial ? ciudad : sel!.ciudad
  const baseZona = esInicial ? ppm2Tierra : esDepto ? sel!.depto : sel!.tierra
  const fuenteZona = esInicial ? fuenteTierra : esDepto ? sel!.fuenteDepto : sel!.fuenteTierra
  const muestrasZona = esInicial ? muestras : esDepto ? sel!.muestrasDepto : sel!.muestrasTierra
  // Si la persona escribió su propio valor del m², manda ese.
  const custom = Number(ppm2Custom)
  const ppm2Activo = custom > 0 ? custom : baseZona
  const fuenteActiva: 'manual' | 'curado' | 'barrio' | 'ciudad' = custom > 0 ? 'manual' : fuenteZona

  const res = useMemo(
    () =>
      esDepto
        ? tasarDepartamento({
            cubiertosM2: cubiertos,
            ppm2Zona: ppm2Activo,       // en depto, trae el USD/m² cubierto de la zona
            antiguedad,
            estado,
            amenities,
            cochera,
            fuenteZona: fuenteActiva,
          })
        : tasar({
        loteM2: lote,
        cubiertosM2: esLote ? 0 : cubiertos,
        ppm2Tierra: ppm2Activo,
        costoM2Construccion: costoM2,
        antiguedad,
        estado,
        extras,
        fuenteTierra: fuenteActiva,
      }),
    [lote, cubiertos, ppm2Activo, costoM2, antiguedad, estado, extras, esLote, fuenteActiva, esDepto, amenities, cochera],
  )

  const marcar = () => {
    if (tocado) return
    setTocado(true)
    trackEvent('tasador_uso', { barrio: nombreZona, ciudad: ciudadZona })
  }

  // El pedido de tasación se hace en /tasaciones (3 pasos, va a Hilo). Le
  // pasamos barrio y tipo para que arranque precargado.
  const hrefTasacion = `/tasaciones?barrio=${encodeURIComponent(barrioSel || barrioSlug || '')}&tipo=${esLote ? 'lote' : esDepto ? 'depto' : 'casa'}`

  const pedirTasacion = () => {
    // Click intermedio: NO es un Lead. El Lead lo dispara /tasaciones cuando el
    // servidor confirma el envío.
    trackEvent('tasador_pedir_click', { barrio: nombreZona, estimacion: Math.round(res.total) })
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
          {esLote ? 'Contanos de tu lote' : esDepto ? 'Contanos de tu departamento' : 'Contanos de tu propiedad'}
        </h2>
        <p style={{ fontSize: 13, color: '#6e6e73', marginBottom: 18 }}>
          {esLote
            ? 'Con la superficie alcanza. El valor se calcula solo.'
            : 'Tres datos alcanzan. El valor se actualiza mientras completás.'}
        </p>

        {barrios.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
              ¿En qué barrio está?
            </label>
            <select
              value={barrioSel || barrioSlug}
              onChange={(e) => {
                setBarrioSel(e.target.value)
                setPpm2Custom('')
                marcar()
              }}
              style={{
                width: '100%',
                height: 46,
                border: '1px solid #d0d0d0',
                borderRadius: 12,
                padding: '0 10px',
                fontFamily: P,
                fontSize: 15,
                background: '#fff',
              }}
            >
              {(['Funes', 'Roldán', 'Rosario'] as const).map((c) => (
                <optgroup key={c} label={c}>
                  {barrios.filter((b) => b.ciudad === c).map((b) => (
                    <option key={b.slug} value={b.slug}>{b.nombre}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        )}

        <div className={esLote || esDepto ? '' : 'grid grid-cols-2 gap-3.5'}>
          {!esDepto && <Campo label="Superficie del lote (m²)" value={lote} onChange={setLote} />}
          {!esLote && (
            <Campo label="Superficie cubierta (m²)" value={cubiertos} onChange={setCubiertos} />
          )}
        </div>

        <div style={{ marginTop: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
            {esDepto ? 'Valor del m² en la zona (USD)' : 'Valor de la tierra (USD/m²)'}
          </label>
          <input
            type="number"
            inputMode="numeric"
            value={ppm2Custom}
            placeholder={String(baseZona)}
            onChange={(e) => {
              setPpm2Custom(e.target.value)
              marcar()
            }}
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
          <div style={{ fontSize: 11.5, color: '#8a8a8e', marginTop: 4 }}>
            Precargado con nuestro valor para {nombreZona}. Si conocés el de tu cuadra, escribilo y manda el tuyo.
          </div>
        </div>

        {!esLote && !esDepto && (
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

        {esDepto && (
          <>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, margin: '16px 0 6px' }}>
              Antigüedad
            </label>
            <div className="flex flex-wrap gap-2">
              {ANTIGUEDAD.map((a) => (
                <button key={a.id} type="button" onClick={() => { setAntiguedad(a.id); marcar() }}
                  style={antiguedad === a.id ? chipOn : chipBase}>{a.label}</button>
              ))}
            </div>

            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, margin: '16px 0 6px' }}>
              Estado general
            </label>
            <div className="flex flex-wrap gap-2">
              {ESTADO.map((x) => (
                <button key={x.id} type="button" onClick={() => { setEstado(x.id); marcar() }}
                  style={estado === x.id ? chipOn : chipBase}>{x.label}</button>
              ))}
            </div>

            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, margin: '16px 0 6px' }}>
              Amenities del edificio
            </label>
            <div className="flex flex-wrap gap-2">
              {AMENITIES_DEPTO.map((a) => (
                <button key={a.id} type="button" onClick={() => { setAmenities(a.id); marcar() }}
                  style={amenities === a.id ? chipOn : chipBase}>{a.label}</button>
              ))}
            </div>

            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, margin: '16px 0 6px' }}>
              Cochera
            </label>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => { setCochera(true); marcar() }}
                style={cochera ? chipOn : chipBase}>Con cochera</button>
              <button type="button" onClick={() => { setCochera(false); marcar() }}
                style={!cochera ? chipOn : chipBase}>Sin cochera</button>
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
            {esDepto ? (
              <div className="flex justify-between">
                <span>
                  {cubiertos} m² × USD {ppm2Activo}/m² de la zona
                </span>
                <b>{fmtUSD(res.construccion)}</b>
              </div>
            ) : (
              <>
                <div className="flex justify-between">
                  <span>
                    Tierra ({lote} m² × USD {ppm2Activo})
                  </span>
                  <b>{fmtUSD(res.tierra)}</b>
                </div>
                {!esLote && (
                  <div className="flex justify-between">
                    <span>Construcción depreciada</span>
                    <b>{fmtUSD(res.construccion)}</b>
                  </div>
                )}
              </>
            )}
            {res.extras > 0 && (
              <div className="flex justify-between">
                <span>Extras</span>
                <b>{fmtUSD(res.extras)}</b>
              </div>
            )}
          </div>

          <p style={{ marginTop: 14, fontSize: 11.5, opacity: 0.75, lineHeight: 1.5 }}>
            {esDepto ? 'Valor de referencia: ' : 'Valor de la tierra: '}
            {fuenteActiva === 'manual'
              ? `valor del m² ingresado por vos para ${nombreZona}`
              : fuenteActiva === 'curado'
              ? `valor de mercado relevado por SI INMOBILIARIA (agosto 2026) para ${nombreZona}`
              : fuenteActiva === 'barrio'
              ? `promedio de ${muestrasZona} ${
                  esDepto
                    ? muestrasZona === 1 ? 'departamento relevado' : 'departamentos relevados'
                    : muestrasZona === 1 ? 'terreno relevado' : 'terrenos relevados'
                } en ${nombreZona}`
              : `promedio de ${esDepto ? 'departamentos' : 'terrenos'} en ${ciudadZona} (todavía no tenemos muestra propia de ${nombreZona})`}
            {!esLote && !esDepto && ` · Costo de construcción: USD ${costoM2}/m² llave en mano, actualizado mensualmente`}
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
            <b style={{ color: '#111' }}>Quiero una tasación profesional.</b> Un corredor
            inmobiliario matriculado revisa la ubicación, el estado, la documentación y los
            comparables que ningún estimador automático puede verificar.
          </p>
          <a
            href={hrefTasacion}
            onClick={pedirTasacion}
            className="si-tap flex items-center justify-center gap-2 w-full"
            style={{
              background: GREEN,
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
          <p style={{ marginTop: 9, fontSize: 12.5, color: '#6e6e73' }}>
            Sin compromiso. Te escribimos por WhatsApp en menos de 24 h.
          </p>
        </div>
      </div>
    </div>
  )
}
