'use client'

import { useEffect, useState } from 'react'

// Selector para comparar variantes de diseño SOLO en previews de Vercel y en
// local: nunca aparece en siinmobiliaria.com. Guarda la elección en la URL
// (?efecto=…&sedes=…) para poder compartir el link y la aplica en
// <html data-efecto / data-sedes>. Se retira cuando se elige la versión final.

const GRUPOS = [
  { clave: 'efecto', titulo: 'Portada al bajar', opciones: [['actual', 'Actual'], ['a', 'A · Profundidad'], ['b', 'B · Desenfoque'], ['c', 'C · Acercar']], def: 'a' },
  { clave: 'sedes', titulo: 'Oficinas', opciones: [['0', 'Actual'], ['1', '1 · Línea de tiempo'], ['2', '2 · Tarjetas']], def: '1' },
] as const

export default function OpcionesPreview() {
  const [ok, setOk] = useState(false)
  const [sel, setSel] = useState<Record<string, string>>({})
  const [abierto, setAbierto] = useState(true)

  useEffect(() => {
    const h = location.hostname
    if (!(h.endsWith('.vercel.app') || h === 'localhost' || h === '127.0.0.1')) return
    const q = new URLSearchParams(location.search)
    const inicial: Record<string, string> = {}
    for (const g of GRUPOS) {
      inicial[g.clave] = q.get(g.clave) || g.def
      document.documentElement.dataset[g.clave] = inicial[g.clave]
    }
    setSel(inicial)
    setOk(true)
    window.dispatchEvent(new Event('si-opciones'))
  }, [])

  const elegir = (clave: string, valor: string) => {
    document.documentElement.dataset[clave] = valor
    const q = new URLSearchParams(location.search)
    q.set(clave, valor)
    history.replaceState(null, '', `${location.pathname}?${q.toString()}`)
    setSel(s => ({ ...s, [clave]: valor }))
    window.dispatchEvent(new Event('si-opciones'))
  }

  if (!ok) return null
  return (
    <div
      className="fixed bottom-4 left-4 z-[9999] max-w-[calc(100vw-110px)] rounded-2xl text-white"
      style={{ background: 'rgba(17,17,17,.88)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', boxShadow: '0 20px 50px -20px rgba(0,0,0,.6)', fontFamily: "var(--font-raleway), 'Raleway', sans-serif" }}
    >
      <button type="button" onClick={() => setAbierto(a => !a)} className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-[12px] font-extrabold uppercase tracking-[0.16em]">
        Opciones de diseño <span className="text-white/60">{abierto ? '–' : '+'}</span>
      </button>
      {abierto && (
        <div className="flex flex-col gap-3 px-4 pb-4">
          {GRUPOS.map(g => (
            <div key={g.clave}>
              <p className="mb-1.5 text-[11px] font-bold text-white/60">{g.titulo}</p>
              <div className="flex flex-wrap gap-1.5">
                {g.opciones.map(([v, label]) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => elegir(g.clave, v)}
                    className="rounded-full px-3 py-1.5 text-[12px] font-bold transition-colors"
                    style={{ background: sel[g.clave] === v ? '#fff' : 'rgba(255,255,255,.12)', color: sel[g.clave] === v ? '#111' : '#fff' }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
