'use client'

// Análisis comercial de Funes — informe del mes + mapa de comercios.
// El informe se renderiza en el servidor (SEO); el mapa (Leaflet) se carga
// solo en el cliente con dynamic({ ssr: false }).

import dynamic from 'next/dynamic'
import { useCallback, useRef, useState } from 'react'
import type { Informe } from '@/lib/analisis-comercial/informe'
import { POBLACION } from '@/lib/analisis-comercial/informe'
import { ICONOS, RUBRO_COLOR, ZONAS, type ZonaKey } from '@/lib/analisis-comercial/zonas'
import type { FiltroMapa } from './MapaComercial'

const MapaComercial = dynamic(() => import('./MapaComercial'), {
  ssr: false,
  loading: () => <div className="ac-map-skel" aria-hidden />,
})

const fmt = (n: number) => Math.round(n).toLocaleString('es-AR')

function Icono({ k, size = 22 }: { k: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      dangerouslySetInnerHTML={{ __html: ICONOS[k] ?? ICONOS.x }}
    />
  )
}

function Spark() {
  const W = 300
  const H = 56
  const pts: [number, number][] = []
  for (let y = 2010; y <= 2035; y++) {
    pts.push([y, POBLACION.censo2010 * Math.pow(POBLACION.censo2022 / POBLACION.censo2010, (y - 2010) / 12)])
  }
  const mn = pts[0][1]
  const mx = pts[pts.length - 1][1]
  const X = (y: number) => ((y - 2010) / 25) * W
  const Y = (v: number) => H - 4 - ((v - mn) / (mx - mn)) * (H - 10)
  const d = pts.map(([y, v], i) => `${i ? 'L' : 'M'}${X(y).toFixed(1)} ${Y(v).toFixed(1)}`).join('')
  const hoy = new Date().getFullYear()
  const vHoy = pts.find(([y]) => y === hoy)?.[1] ?? pts[16][1]
  return (
    <svg className="ac-spark" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden>
      <path d={`${d} L${W} ${H} L0 ${H}Z`} fill="#E9F3EC" />
      <path d={d} fill="none" stroke="#1A5C38" strokeWidth={2.5} vectorEffect="non-scaling-stroke" />
      <circle cx={X(hoy)} cy={Y(vHoy)} r={4} fill="#1A5C38" />
    </svg>
  )
}

export default function AnalisisComercial({ informe }: { informe: Informe }) {
  const [filtro, setFiltro] = useState<FiltroMapa>({ tipo: 'todo' })
  const mapaRef = useRef<HTMLElement>(null)
  const n = informe.numeros

  const verEnMapa = useCallback((f: FiltroMapa) => {
    setFiltro(f)
    requestAnimationFrame(() => mapaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }, [])

  const fecha = new Date(informe.generado).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="ac">
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* ── Hero del informe ── */}
      <section className="ac-hero">
        <div>
          <span className="ac-per">
            <i />
            Informe comercial · {informe.periodo}
          </span>
          <h2 className="ac-tit">{informe.titular}</h2>
          <ol className="ac-res">
            {informe.resumen.map((t, i) => (
              <li key={i}>
                <span>{i + 1}</span>
                <div>{t}</div>
              </li>
            ))}
          </ol>
        </div>
        <div className="ac-stats">
          <div className="ac-st ac-st--big">
            <b>
              {fmt(n.habitantesHoy)} → {fmt(n.habitantes2030)}
            </b>
            <span>habitantes hoy y proyectados a {POBLACION.anioProyeccion}</span>
            <Spark />
          </div>
          <div className="ac-st">
            <b>{fmt(n.relevados)}</b>
            <span>comercios relevados</span>
          </div>
          <div className="ac-st">
            <b>{fmt(n.libres)}</b>
            <span>locales libres detectados</span>
          </div>
        </div>
      </section>

      {/* ── Lo que va a faltar ── */}
      <section>
        <div className="ac-sh">
          <h2>Lo que va a faltar</h2>
          <p>Rubros donde Funes ya tiene menos comercios de los que necesita, y la brecha crece con cada vecino nuevo.</p>
        </div>
        <div className="ac-ogrid">
          {informe.oportunidades.map((o, i) => {
            const col = RUBRO_COLOR[o.icono] ?? '#1A5C38'
            const tot = Math.max(o.esperado, o.abiertos)
            return (
              <article key={o.rubro} className="ac-ocard">
                <div className="ac-otop">
                  <span className="ac-oic" style={{ background: `${col}1F`, color: col }}>
                    <Icono k={o.icono} />
                  </span>
                  <h3>{o.rubro}</h3>
                  <span className="ac-rnk">#{i + 1}</span>
                </div>
                <div className="ac-gap">
                  <b>+{o.faltan}</b>
                  <span>locales para cubrir la demanda de {POBLACION.anioProyeccion}</span>
                </div>
                <div>
                  <div className="ac-bar">
                    <i style={{ width: `${(o.abiertos / tot) * 100}%` }} />
                    <em style={{ left: `calc(${(o.esperado / tot) * 100}% - 2px)` }} />
                  </div>
                  <div className="ac-blg">
                    <span>Hoy: {o.abiertos}</span>
                    <span>Necesita: ~{o.esperado}</span>
                  </div>
                </div>
                <p>{o.porque}</p>
                <div className="ac-donde">
                  <b>Dónde mirar:</b> {o.donde}
                </div>
                <div className="ac-ofoot">
                  <span className={`ac-conf ac-conf--${o.confianza}`}>Confianza {o.confianza}</span>
                  <button type="button" className="ac-lnk" onClick={() => verEnMapa({ tipo: 'rubro', nombre: o.rubro, re: o.re })}>
                    Ver en el mapa
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {/* ── Dónde ya hay de sobra ── */}
      <section>
        <div className="ac-sh">
          <h2>Dónde ya hay de sobra</h2>
          <p>Rubros con más oferta de la que la ciudad necesita hoy. No es imposible entrar, pero hay que diferenciarse.</p>
        </div>
        <div className="ac-cgrid">
          {informe.cuidado.map((c) => (
            <article key={c.rubro} className="ac-ccard">
              <h3>{c.rubro}</h3>
              <div className="ac-x2">
                {c.abiertos}
                <small>vs ~{c.esperado} necesarios</small>
              </div>
              <p>{c.porque}</p>
              <button type="button" className="ac-lnk" onClick={() => verEnMapa({ tipo: 'rubro', nombre: c.rubro, re: c.re })}>
                Ver en el mapa
              </button>
            </article>
          ))}
        </div>
      </section>

      {/* ── Zona por zona ── */}
      <section>
        <div className="ac-sh">
          <h2>Zona por zona</h2>
          <p>Qué tiene cada avenida y polo, y para qué conviene. Tocá una zona para verla en el mapa.</p>
        </div>
        <div className="ac-zgrid">
          {informe.zonas.map((z) => (
            <button
              key={z.k}
              type="button"
              className="ac-zcard"
              onClick={() => verEnMapa({ tipo: 'zona', zona: z.k as ZonaKey })}
            >
              <h3>
                <i style={{ background: ZONAS[z.k]?.color ?? '#999' }} />
                {z.nombre}
              </h3>
              <div className="ac-znum">
                {z.comercios}
                <small>{z.libres} libres</small>
              </div>
              <div className="ac-zper">{z.perfil}</div>
              <p>{z.nota}</p>
            </button>
          ))}
        </div>
      </section>

      {/* ── Mapa ── */}
      <section ref={mapaRef} className="ac-mapsec" aria-label="Mapa de comercios de Funes">
        <div className="ac-sh">
          <h2>El mapa</h2>
          <p>Cada punto es un comercio relevado sobre las avenidas y polos. Filtrá por rubro o tocá un punto para ver qué es.</p>
        </div>
        <MapaComercial filtro={filtro} onFiltro={setFiltro} />
      </section>

      {/* ── Lo que viene / verificar ── */}
      <section className="ac-two">
        <div className="ac-box">
          <h3>Lo que viene</h3>
          <ul className="ac-vlist">
            {informe.viene.map((v) => (
              <li key={v.nombre}>
                <span className={`ac-pill ${/obra/i.test(v.estado) ? 'ac-pill--obra' : ''}`}>{v.estado}</span>
                <div>
                  <b>{v.nombre}</b>
                  <small>
                    {v.zona} · {v.nota}
                  </small>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="ac-box">
          <h3>Antes de decidir, verificá</h3>
          <ul className="ac-chk">
            {informe.verificar.map((t) => (
              <li key={t}>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="ac-meta">
        <p>
          <b>Cómo se hizo.</b> {informe.supuestos} Para cada rubro se calcula cuántos comercios necesitaría Funes en{' '}
          {POBLACION.anioProyeccion} (comercios cada 10.000 habitantes de una ciudad argentina promedio) y se compara con
          los que hay abiertos. Es una guía para empezar a mirar, no un estudio de mercado: antes de invertir, recorré la
          zona.
        </p>
        <div>
          <span className="ac-upd">Se actualiza el 1° de cada mes</span>
          <br />
          Última actualización: {fecha}
          <br />
          Datos de comercios: © colaboradores de OpenStreetMap
        </div>
      </footer>
    </div>
  )
}

const STYLES = `
.ac{--ink:#111;--muted:#6B6B6B;--line:#E8E8E6;--soft:#F7F7F5;--green:#1A5C38;--green-soft:#E9F3EC;
  font-family:var(--font-raleway),Raleway,system-ui,sans-serif;color:var(--ink);-webkit-font-smoothing:antialiased;
  max-width:1180px;margin:0 auto;padding:clamp(20px,3vw,40px) clamp(16px,3vw,28px) 8px;display:flex;flex-direction:column;gap:clamp(40px,5vw,60px)}
.ac h2,.ac h3{font-family:inherit}
.ac-hero{display:grid;grid-template-columns:1.35fr 1fr;gap:40px;align-items:start}
.ac-per{display:inline-flex;align-items:center;gap:8px;font-weight:700;font-size:13px;color:var(--green);background:var(--green-soft);border-radius:999px;padding:6px 12px}
.ac-per i{width:7px;height:7px;border-radius:50%;background:var(--green);display:inline-block}
.ac-tit{font-weight:800;font-size:clamp(28px,3.6vw,44px);line-height:1.08;letter-spacing:-.02em;margin:16px 0 22px;text-wrap:balance}
.ac-res{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:14px}
.ac-res li{display:grid;grid-template-columns:28px 1fr;gap:12px;font-size:16px;line-height:1.55;color:#3A3A3A;max-width:62ch}
.ac-res li span{width:28px;height:28px;border-radius:50%;background:#111;color:#fff;display:grid;place-items:center;font-weight:800;font-size:13px}
.ac-stats{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.ac-st{border:1px solid var(--line);border-radius:18px;padding:18px}
.ac-st b{display:block;font-weight:800;font-size:30px;line-height:1.1;font-variant-numeric:tabular-nums;letter-spacing:-.01em}
.ac-st span{font-size:13px;color:var(--muted)}
.ac-st--big{grid-column:1/-1;background:var(--soft);border-color:transparent}
.ac-spark{display:block;width:100%;height:56px;margin-top:12px}
.ac-sh{margin-bottom:18px}
.ac-sh h2{font-weight:800;font-size:clamp(22px,2.4vw,28px);line-height:1.15;margin:0;letter-spacing:-.01em}
.ac-sh p{margin:6px 0 0;color:var(--muted);font-size:15px;max-width:62ch;line-height:1.5}
.ac-ogrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
.ac-ocard{border:1px solid var(--line);border-radius:20px;padding:20px;display:flex;flex-direction:column;gap:12px;background:#fff;transition:box-shadow .2s,transform .2s}
.ac-ocard:hover{box-shadow:0 10px 30px rgba(0,0,0,.08);transform:translateY(-2px)}
.ac-otop{display:flex;align-items:center;gap:12px}
.ac-oic{width:44px;height:44px;border-radius:14px;display:grid;place-items:center;flex:none}
.ac-rnk{margin-left:auto;font-weight:800;font-size:13px;color:#B0B0B0}
.ac-ocard h3{margin:0;font-weight:800;font-size:18px;line-height:1.2}
.ac-gap{display:flex;align-items:baseline;gap:8px}
.ac-gap b{font-weight:800;font-size:34px;line-height:1;color:var(--green);font-variant-numeric:tabular-nums}
.ac-gap span{font-size:13.5px;color:var(--muted)}
.ac-bar{position:relative;height:10px;border-radius:999px;background:#F0F0EE;overflow:hidden}
.ac-bar i{position:absolute;inset:0 auto 0 0;background:#222;border-radius:999px}
.ac-bar em{position:absolute;top:0;bottom:0;width:2px;background:var(--green)}
.ac-blg{display:flex;justify-content:space-between;font-size:12px;color:var(--muted);font-variant-numeric:tabular-nums;margin-top:6px}
.ac-ocard p{margin:0;font-size:14.5px;line-height:1.55;color:#3A3A3A}
.ac-donde{font-size:14px;background:var(--soft);border-radius:12px;padding:10px 12px;line-height:1.45}
.ac-ofoot{display:flex;align-items:center;justify-content:space-between;margin-top:auto;padding-top:4px;gap:10px}
.ac-conf{font-weight:700;font-size:12px;border-radius:999px;padding:5px 10px}
.ac-conf--alta{background:#E3F1E8;color:var(--green)}.ac-conf--media{background:#FFF4DC;color:#8A5A00}.ac-conf--baja{background:#F4F4F2;color:#717171}
.ac-lnk{border:0;background:none;font:inherit;font-weight:700;font-size:14px;color:var(--ink);text-decoration:underline;text-underline-offset:3px;cursor:pointer;padding:6px 0;align-self:flex-start}
.ac-lnk:hover{color:var(--green)}
.ac-cgrid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px}
.ac-ccard{border:1px solid var(--line);border-radius:16px;padding:16px;display:flex;flex-direction:column;gap:8px}
.ac-ccard h3{margin:0;font-weight:800;font-size:15px;line-height:1.25}
.ac-x2{font-weight:800;font-size:22px;color:#B3261E;font-variant-numeric:tabular-nums}
.ac-x2 small{font-weight:600;font-size:12px;color:var(--muted);margin-left:4px}
.ac-ccard p{margin:0;font-size:13.5px;line-height:1.5;color:#555;flex:1}
.ac-zgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
.ac-zcard{border:1px solid var(--line);border-radius:18px;padding:18px 20px;display:grid;grid-template-columns:1fr auto;gap:6px 16px;cursor:pointer;background:#fff;text-align:left;font:inherit;color:inherit;transition:box-shadow .2s,border-color .2s}
.ac-zcard:hover{box-shadow:0 8px 24px rgba(0,0,0,.07);border-color:#D6D6D2}
.ac-zcard h3{margin:0;font-weight:800;font-size:17px;display:flex;align-items:center;gap:8px}
.ac-zcard h3 i{width:10px;height:10px;border-radius:50%;flex:none}
.ac-znum{text-align:right;font-weight:800;font-size:24px;line-height:1;font-variant-numeric:tabular-nums}
.ac-znum small{display:block;font-weight:600;font-size:12px;color:var(--muted);margin-top:4px}
.ac-zper{font-size:13px;color:var(--muted);grid-column:1/-1}
.ac-zcard p{grid-column:1/-1;margin:4px 0 0;font-size:14.5px;line-height:1.55;color:#3A3A3A}
.ac-mapsec{scroll-margin-top:90px}
.ac-map-skel{height:clamp(460px,70vh,680px);border-radius:22px;background:#F2F2F0;animation:acpulse 1.4s ease-in-out infinite}
@keyframes acpulse{50%{opacity:.6}}
.ac-two{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.ac-box{border:1px solid var(--line);border-radius:18px;padding:20px}
.ac-box h3{margin:0 0 14px;font-weight:800;font-size:18px}
.ac-vlist,.ac-chk{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:12px}
.ac-vlist li{display:grid;grid-template-columns:auto 1fr;gap:12px;align-items:start;font-size:14.5px;line-height:1.45}
.ac-vlist small{color:var(--muted);display:block;font-size:13.5px}
.ac-pill{font-weight:700;font-size:11.5px;border-radius:999px;padding:4px 9px;background:#E7F0FF;color:#1D4ED8;white-space:nowrap}
.ac-pill--obra{background:#FFF1D6;color:#8A5A00}
.ac-chk li{display:grid;grid-template-columns:22px 1fr;gap:10px;font-size:14.5px;line-height:1.5}
.ac-chk li::before{content:"";width:18px;height:18px;border:2px solid #222;border-radius:6px;margin-top:2px;box-sizing:border-box}
.ac-meta{border-top:1px solid var(--line);padding-top:20px;display:flex;justify-content:space-between;gap:24px;flex-wrap:wrap;font-size:13.5px;color:var(--muted);line-height:1.6}
.ac-meta p{margin:0;max-width:72ch}
.ac-meta b{color:var(--ink)}
.ac-upd{font-weight:700;color:var(--ink)}
@media (max-width:1024px){
  .ac-hero{grid-template-columns:1fr;gap:28px}
  .ac-ogrid{grid-template-columns:repeat(2,minmax(0,1fr))}
  .ac-cgrid{grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media (max-width:680px){
  .ac-ogrid,.ac-zgrid,.ac-two{grid-template-columns:1fr}
  .ac-cgrid{grid-template-columns:1fr}
  .ac-res li{font-size:15px}
  .ac-st b{font-size:24px}
}
`
