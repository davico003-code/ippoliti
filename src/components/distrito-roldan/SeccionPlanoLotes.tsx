'use client'

// Plano interactivo de lotes de Distrito Roldán.
// El plano es un archivo autocontenido en public/planos/distrito-roldan.html
// (sin librerías ni CDN). Se embebe en un iframe y avisa su altura real por
// postMessage, así el iframe se ajusta solo y no queda scroll interno.
// Para actualizar disponibilidad y precios se usa el panel de control interno
// (panel-distrito-roldan.html), que regenera ese mismo archivo.

import { useEffect, useState } from 'react'
import { ArrowUpRight, Compass } from 'lucide-react'

const SRC = '/planos/distrito-roldan.html'

export default function SeccionPlanoLotes({ tourUrl }: { tourUrl?: string }) {
  // Arranca cerca del alto real del plano en mobile. Si el contenido necesita
  // más espacio, el propio iframe informa su scrollHeight por postMessage.
  const [alto, setAlto] = useState(780)

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const d = e.data as { type?: string; h?: number } | null
      if (d && d.type === 'plano-height' && typeof d.h === 'number') {
        setAlto(Math.max(720, Math.min(1600, d.h)))
      }
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [])

  return (
    <section id="plano" className="bg-[#345544] px-4 py-20 text-white sm:px-6 md:py-28">
      <div className="mx-auto max-w-[1180px]">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-[#BB8D3F]">Masterplan interactivo</p>
            <h2 className="mt-4 text-balance text-[clamp(34px,4.5vw,58px)] font-bold leading-[1.04] tracking-[-0.03em] text-[#F8F1E6]">
              Encontrá el lote que mejor se adapta a vos.
            </h2>
            <p className="mt-6 max-w-[62ch] text-[15px] leading-7 text-white/75">
              Prendé los filtros para ver qué lotes están disponibles, cuáles no y cuáles ya se vendieron.
              Pasá el mouse por cualquiera para conocer frente, fondo, superficie y precio, y tocalo para
              ver la cuota y consultarlo: te escribe el equipo por WhatsApp.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <a
              href="/distrito-roldan-precios"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#B35E21] px-6 text-sm font-bold text-white transition-colors hover:bg-[#9d4f18]"
            >
              Abrir plano completo
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </a>
            {tourUrl && (
              <a
                href={tourUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/30 px-6 text-sm font-semibold text-white transition-colors hover:border-white/70"
              >
                <Compass className="h-4 w-4" aria-hidden />
                Recorrer en 360°
              </a>
            )}
          </div>
        </div>

        <div className="mt-10 overflow-hidden border border-white/20 bg-[#F8F1E6] p-1 sm:p-2">
          <iframe
            src={SRC}
            title="Plano interactivo de lotes — Distrito Roldán"
            loading="lazy"
            className="block w-full border-0"
            style={{ height: alto, background: '#F8F1E6' }}
          />
        </div>
      </div>
    </section>
  )
}
