'use client'

// Mapa de comercios de Funes (Leaflet, solo cliente).
// Datos: base OpenStreetMap depurada + relevamiento del equipo
// (src/data/analisis-comercial/comercios.json). Con preferCanvas los ~760
// puntos se dibujan en un solo canvas y el mapa sigue fluido en el celular.

import 'leaflet/dist/leaflet.css'
import { useEffect, useMemo, useState } from 'react'
import { Circle, CircleMarker, MapContainer, Polyline, Popup, Rectangle, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import { LIGHT_TILES } from '@/lib/map-tiles'
import data from '@/data/analisis-comercial/comercios.json'
import {
  AVENIDAS,
  ESTADOS,
  ICONOS,
  POLOS,
  RUBROS,
  RUBRO_COLOR,
  RUBRO_NOMBRE,
  ZONAS,
  type Comercio,
  type ZonaKey,
} from '@/lib/analisis-comercial/zonas'

export type FiltroMapa =
  | { tipo: 'todo' }
  | { tipo: 'rubro'; nombre: string; re: string }
  | { tipo: 'zona'; zona: ZonaKey }

const ITEMS = data.items as unknown as Comercio[]
const FUNES_BOUNDS = L.latLngBounds([-32.951, -60.868], [-32.894, -60.765])

function Encuadre({ puntos, clave }: { puntos: [number, number][]; clave: string }) {
  const map = useMap()
  useEffect(() => {
    const t = setTimeout(() => {
      map.invalidateSize()
      if (puntos.length === 0 || clave === 'todo') {
        map.fitBounds(FUNES_BOUNDS, { padding: [8, 8] })
      } else if (puntos.length === 1) {
        map.setView(puntos[0], 16)
      } else {
        map.fitBounds(L.latLngBounds(puntos), { padding: [48, 48], maxZoom: 16 })
      }
    }, 120)
    return () => clearTimeout(t)
    // Solo re-encuadra cuando cambia el filtro, no al tocar chips de rubro.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave])
  return null
}

function norm(s: string) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

export default function MapaComercial({
  filtro,
  onFiltro,
}: {
  filtro: FiltroMapa
  onFiltro: (f: FiltroMapa) => void
}) {
  const [rubro, setRubro] = useState<string | null>(null)
  const [soloLibres, setSoloLibres] = useState(false)
  const [q, setQ] = useState('')

  // Al llegar un filtro nuevo desde el informe, limpiar los filtros locales.
  const claveFiltro =
    filtro.tipo === 'todo' ? 'todo' : filtro.tipo === 'rubro' ? `r:${filtro.re}` : `z:${filtro.zona}`
  useEffect(() => {
    setRubro(null)
    setSoloLibres(false)
    setQ('')
  }, [claveFiltro])

  const base = useMemo(() => {
    if (filtro.tipo === 'rubro') {
      const re = new RegExp(filtro.re, 'i')
      return ITEMS.filter((c) => re.test(c[4]))
    }
    if (filtro.tipo === 'zona') return ITEMS.filter((c) => c[3] === filtro.zona)
    return ITEMS
  }, [filtro])

  const conteoRubros = useMemo(() => {
    const m: Record<string, number> = {}
    for (const c of base) m[c[2]] = (m[c[2]] ?? 0) + 1
    return m
  }, [base])

  const visibles = useMemo(() => {
    const nq = norm(q.trim())
    return base.filter(
      (c) =>
        (!rubro || c[2] === rubro) &&
        (!soloLibres || c[6] === 'libre') &&
        (!nq || norm(`${c[5]} ${c[4]}`).includes(nq)),
    )
  }, [base, rubro, soloLibres, q])

  const puntosEncuadre = useMemo(() => base.map((c) => [c[0], c[1]] as [number, number]), [base])
  const zonaActiva = filtro.tipo === 'zona' ? filtro.zona : null
  const libres = base.filter((c) => c[6] === 'libre').length

  return (
    <div className="acm">
      <style dangerouslySetInnerHTML={{ __html: MAP_STYLES }} />

      <div className="acm-bar">
        <label className="acm-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscá un comercio o rubro (ej: farmacia)"
            aria-label="Buscar comercio"
          />
        </label>
        {filtro.tipo !== 'todo' && (
          <button type="button" className="acm-active" onClick={() => onFiltro({ tipo: 'todo' })}>
            {filtro.tipo === 'rubro' ? filtro.nombre : ZONAS[filtro.zona].nombre}
            <span aria-hidden>×</span>
            <span className="sr-only">Quitar filtro</span>
          </button>
        )}
        <button
          type="button"
          className={`acm-toggle ${soloLibres ? 'is-on' : ''}`}
          aria-pressed={soloLibres}
          onClick={() => setSoloLibres((v) => !v)}
        >
          <i className="acm-dot acm-dot--libre" /> Solo locales libres{libres ? ` (${libres})` : ''}
        </button>
      </div>

      <div className="acm-chips" role="toolbar" aria-label="Filtrar por rubro">
        <button type="button" className={`acm-chip ${rubro === null ? 'is-on' : ''}`} onClick={() => setRubro(null)}>
          Todos <small>{base.length}</small>
        </button>
        {RUBROS.filter((r) => conteoRubros[r.k]).map((r) => (
          <button
            key={r.k}
            type="button"
            className={`acm-chip ${rubro === r.k ? 'is-on' : ''}`}
            onClick={() => setRubro(rubro === r.k ? null : r.k)}
            style={{ ['--c' as string]: r.color }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
              dangerouslySetInnerHTML={{ __html: ICONOS[r.k] }}
            />
            {r.corto} <small>{conteoRubros[r.k]}</small>
          </button>
        ))}
      </div>

      <div className="acm-map">
        <MapContainer
          bounds={FUNES_BOUNDS}
          scrollWheelZoom={false}
          preferCanvas
          zoomSnap={0.25}
          style={{ height: '100%', width: '100%' }}
          attributionControl
        >
          <TileLayer url={LIGHT_TILES.url} attribution={LIGHT_TILES.attribution} maxNativeZoom={LIGHT_TILES.maxNativeZoom} maxZoom={19} />
          <Encuadre puntos={puntosEncuadre} clave={claveFiltro} />

          {(Object.keys(AVENIDAS) as (keyof typeof AVENIDAS)[]).map((k) => {
            const dim = zonaActiva !== null && zonaActiva !== k
            return AVENIDAS[k].map((linea, i) => (
              <Polyline
                key={`${k}-${i}`}
                positions={linea}
                interactive={false}
                pathOptions={{
                  color: ZONAS[k].color,
                  weight: zonaActiva === k ? 16 : 12,
                  opacity: dim ? 0.08 : 0.28,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              />
            ))
          })}

          {POLOS.map((p) => {
            const dim = zonaActiva !== null && zonaActiva !== p.k
            const opts = {
              color: ZONAS[p.k].color,
              weight: 1.5,
              opacity: dim ? 0.2 : 0.7,
              fillOpacity: dim ? 0.03 : 0.1,
              dashArray: '4 4',
            }
            return p.k === 'V' ? (
              <Rectangle key={p.k} bounds={[[p.box[0], p.box[1]], [p.box[2], p.box[3]]]} pathOptions={opts} interactive={false} />
            ) : (
              <Circle key={p.k} center={[p.lat, p.lng]} radius={p.r} pathOptions={opts} interactive={false} />
            )
          })}

          {visibles.map((c, i) => {
            const [lat, lng, rub, zona, detalle, nombre, estado] = c
            const color = RUBRO_COLOR[rub] ?? '#8A9597'
            const esLibre = estado === 'libre'
            const viene = estado === 'proximo' || estado === 'obra'
            return (
              <CircleMarker
                key={`${lat},${lng},${i}`}
                center={[lat, lng]}
                radius={viene ? 9 : esLibre ? 6 : 5.5}
                pathOptions={{
                  color: esLibre ? '#111' : '#fff',
                  weight: esLibre ? 2 : viene ? 3 : 1.5,
                  fillColor: esLibre ? '#fff' : viene ? '#1D4ED8' : color,
                  fillOpacity: 1,
                }}
              >
                <Popup maxWidth={260}>
                  <div className="acm-pop">
                    <b>{nombre || detalle}</b>
                    <span>
                      {detalle}
                      {RUBRO_NOMBRE[rub] && detalle !== RUBRO_NOMBRE[rub] ? ` · ${RUBRO_NOMBRE[rub]}` : ''}
                    </span>
                    <span>{ZONAS[zona as ZonaKey]?.nombre ?? 'Funes'}</span>
                    <em className={`acm-est acm-est--${estado}`}>{ESTADOS[estado] ?? estado}</em>
                  </div>
                </Popup>
              </CircleMarker>
            )
          })}
        </MapContainer>

        <div className="acm-count" aria-live="polite">
          {visibles.length.toLocaleString('es-AR')} {visibles.length === 1 ? 'comercio' : 'comercios'}
        </div>
      </div>

      <div className="acm-legend">
        {(Object.keys(ZONAS) as ZonaKey[])
          .filter((k) => k !== 'X')
          .map((k) => (
            <button
              key={k}
              type="button"
              className={`acm-zl ${zonaActiva === k ? 'is-on' : ''}`}
              onClick={() => onFiltro(zonaActiva === k ? { tipo: 'todo' } : { tipo: 'zona', zona: k })}
            >
              <i style={{ background: ZONAS[k].color }} />
              {ZONAS[k].corto}
            </button>
          ))}
        <span className="acm-leg-sep" />
        <span className="acm-li">
          <i className="acm-dot" /> Abierto
        </span>
        <span className="acm-li">
          <i className="acm-dot acm-dot--libre" /> Local libre
        </span>
        <span className="acm-li">
          <i className="acm-dot acm-dot--viene" /> Próximo / en obra
        </span>
      </div>
    </div>
  )
}

const MAP_STYLES = `
.acm{display:flex;flex-direction:column;gap:12px}
.acm-bar{display:flex;flex-wrap:wrap;gap:10px;align-items:center}
.acm-search{flex:1 1 280px;display:flex;align-items:center;gap:10px;background:#F4F4F2;border:1px solid transparent;border-radius:999px;padding:0 16px;color:#6B6B6B;transition:border-color .15s,background .15s}
.acm-search:focus-within{background:#fff;border-color:#1A5C38;box-shadow:0 0 0 4px #E9F3EC}
.acm-search input{flex:1;border:0;background:transparent;outline:none;padding:12px 0;font:inherit;font-size:15px;color:#111;min-width:0}
.acm-active,.acm-toggle{display:inline-flex;align-items:center;gap:8px;border-radius:999px;padding:10px 16px;font:inherit;font-size:14px;font-weight:700;cursor:pointer;white-space:nowrap}
.acm-active{background:#111;color:#fff;border:1px solid #111}
.acm-active span[aria-hidden]{font-size:18px;line-height:1;opacity:.8}
.acm-toggle{background:#fff;color:#111;border:1px solid #DDDDDA}
.acm-toggle.is-on{border-color:#111;box-shadow:inset 0 0 0 1px #111}
.acm-chips{display:flex;gap:8px;overflow-x:auto;padding:2px 2px 6px;scrollbar-width:thin;-webkit-overflow-scrolling:touch}
.acm-chip{--c:#111;flex:none;display:inline-flex;align-items:center;gap:7px;border:1px solid #E3E3E0;background:#fff;border-radius:999px;padding:8px 14px;font:inherit;font-size:13.5px;font-weight:600;color:#222;cursor:pointer;transition:border-color .15s,background .15s}
.acm-chip svg{color:var(--c)}
.acm-chip small{font-size:12px;color:#8A8A8A;font-variant-numeric:tabular-nums}
.acm-chip:hover{border-color:#BDBDB8}
.acm-chip.is-on{background:#111;border-color:#111;color:#fff}
.acm-chip.is-on svg{color:#fff}.acm-chip.is-on small{color:#CFCFCF}
.acm-map{position:relative;height:clamp(460px,70vh,680px);border-radius:22px;overflow:hidden;border:1px solid #E8E8E6;isolation:isolate}
.acm-count{position:absolute;left:12px;bottom:12px;z-index:500;background:rgba(255,255,255,.95);border:1px solid #E8E8E6;border-radius:999px;padding:7px 14px;font-size:13px;font-weight:700;box-shadow:0 4px 14px rgba(0,0,0,.08);pointer-events:none;font-variant-numeric:tabular-nums}
.acm .leaflet-control-zoom{margin:12px 0 0 12px;border:0!important;box-shadow:0 4px 14px rgba(0,0,0,.12)!important;border-radius:12px!important;overflow:hidden}
.acm .leaflet-popup-content-wrapper{border-radius:14px;box-shadow:0 10px 30px rgba(0,0,0,.14)}
.acm .leaflet-popup-content{margin:12px 14px}
.acm-pop{display:flex;flex-direction:column;gap:3px;font-family:var(--font-raleway),Raleway,system-ui,sans-serif;font-size:13px;color:#555;line-height:1.35}
.acm-pop b{font-size:15px;color:#111}
.acm-est{font-style:normal;font-weight:700;font-size:11.5px;border-radius:999px;padding:3px 9px;margin-top:6px;align-self:flex-start;background:#E3F1E8;color:#1A5C38}
.acm-est--libre{background:#F4F4F2;color:#111}.acm-est--proximo{background:#E7F0FF;color:#1D4ED8}.acm-est--obra{background:#FFF1D6;color:#8A5A00}
.acm-legend{display:flex;flex-wrap:wrap;gap:8px 14px;align-items:center;font-size:13px;color:#555}
.acm-zl{display:inline-flex;align-items:center;gap:6px;border:0;background:none;padding:4px 2px;font:inherit;font-size:13px;font-weight:600;color:#444;cursor:pointer;border-bottom:2px solid transparent}
.acm-zl i{width:14px;height:6px;border-radius:3px}
.acm-zl.is-on{color:#111;border-bottom-color:#111}
.acm-leg-sep{width:1px;height:16px;background:#E3E3E0}
.acm-li{display:inline-flex;align-items:center;gap:6px}
.acm-dot{display:inline-block;width:11px;height:11px;border-radius:50%;background:#E4572E;border:1.5px solid #fff;box-shadow:0 0 0 1px #E3E3E0}
.acm-dot--libre{background:#fff;border:2px solid #111;box-shadow:none}
.acm-dot--viene{background:#1D4ED8;border:2px solid #fff;box-shadow:0 0 0 1px #1D4ED8;width:13px;height:13px}
@media (max-width:680px){
  .acm-map{height:68vh;border-radius:16px}
  .acm-toggle{flex:1;justify-content:center}
}
`
