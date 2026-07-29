'use client'

// Plano interactivo de lotes de Distrito Roldán.
// El plano es un archivo autocontenido en public/planos/distrito-roldan.html
// (sin librerías ni CDN). Se embebe en un iframe y avisa su altura real por
// postMessage, así el iframe se ajusta solo y no queda scroll interno.
// Para actualizar disponibilidad y precios se usa el panel de control interno
// (panel-distrito-roldan.html), que regenera ese mismo archivo.

import { useEffect, useState } from 'react'

const RALEWAY = 'var(--font-raleway-distrito), Raleway, sans-serif'
const POPPINS = 'var(--font-poppins), Poppins, sans-serif'

const SRC = '/planos/distrito-roldan.html'

export default function SeccionPlanoLotes({ tourUrl }: { tourUrl?: string }) {
  const [alto, setAlto] = useState(1080)

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const d = e.data as { type?: string; h?: number } | null
      if (d && d.type === 'plano-height' && typeof d.h === 'number') {
        setAlto(Math.max(700, Math.min(2000, d.h)))
      }
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [])

  return (
    <section id="plano" className="bg-[#f7f5f0] px-6 py-24 md:py-[120px]">
      <div className="mx-auto max-w-[1180px]">
        <div className="max-w-2xl">
          <p className="mb-4 uppercase text-[#1A5C38]" style={{ fontWeight: 600, letterSpacing: '0.18em', fontSize: 13 }}>
            Disponibilidad
          </p>
          <h2 style={{ fontFamily: RALEWAY, fontWeight: 300, fontSize: 'clamp(30px, 4vw, 46px)', lineHeight: 1.15, color: '#0F3F26' }}>
            Elegí tu lote en el plano.
          </h2>
          <p className="mt-5 text-[14px] leading-[1.7] text-[#6b6b6b]" style={{ fontFamily: POPPINS }}>
            Prendé los filtros para ver qué lotes están disponibles, cuáles no y cuáles ya se vendieron.
            Pasá el mouse por cualquiera para conocer frente, fondo, superficie y precio — y tocalo para
            consultarlo por WhatsApp.
          </p>

          {/* Tour 360° — acceso secundario, deliberadamente discreto: el
              protagonista de la sección es el plano. */}
          {tourUrl && (
            <a
              href={tourUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 border-b border-[#c9c2b4] pb-0.5 text-[13px] text-[#6b6b6b] transition-colors hover:border-[#1A5C38] hover:text-[#1A5C38]"
              style={{ fontFamily: POPPINS }}
            >
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                <ellipse cx="12" cy="12" rx="10" ry="4.5" />
                <path d="M2 12a10 4.5 0 0 0 20 0" />
                <circle cx="12" cy="12" r="2" />
              </svg>
              También podés recorrer el barrio en el tour 360°
            </a>
          )}
        </div>

        <div className="mt-10">
          <iframe
            src={SRC}
            title="Plano interactivo de lotes — Distrito Roldán"
            loading="lazy"
            className="block w-full rounded-3xl border-[0.5px] border-[#e8e3da]"
            style={{ height: alto, background: '#EDE7DA' }}
          />
        </div>
      </div>
    </section>
  )
}
