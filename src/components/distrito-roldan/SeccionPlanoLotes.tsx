'use client'

// Plano interactivo de lotes de Distrito Roldán.
// El plano es un archivo autocontenido en public/planos/distrito-roldan.html
// (sin librerías ni CDN). Se embebe en un iframe y avisa su altura real por
// postMessage, así el iframe se ajusta solo y no queda scroll interno.
// Para actualizar disponibilidad y precios se usa el panel de control interno
// (panel-distrito-roldan.html), que regenera ese mismo archivo.

import { useEffect, useState } from 'react'
import { ArrowUpRight, Compass } from 'lucide-react'
import VendidosMosaico from './VendidosMosaico'

const SRC = '/planos/distrito-roldan.html'

export default function SeccionPlanoLotes({ tourUrl }: { tourUrl?: string }) {
  // Arranca cerca del alto real del plano en mobile. Si el contenido necesita
  // más espacio, el propio iframe informa su scrollHeight por postMessage.
  const [alto, setAlto] = useState(780)

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const d = e.data as { type?: string; h?: number; abierta?: boolean } | null
      if (!d) return
      if (d.type === 'plano-height' && typeof d.h === 'number') {
        setAlto(Math.max(720, Math.min(1600, d.h)))
      }
      // Hoja del lote abierta: el FAB de WhatsApp de esta página (que vive
      // fuera del iframe) le quedaba encima, tapando "Sin compromiso" y
      // compitiendo con el formulario. Se esconde por CSS mientras dure
      // (06-sep-2026, revisión).
      if (d.type === 'plano-hoja') {
        document.body.classList.toggle('dr-hoja-abierta', d.abierta === true)
      }
    }
    window.addEventListener('message', onMsg)
    return () => {
      window.removeEventListener('message', onMsg)
      document.body.classList.remove('dr-hoja-abierta')
    }
  }, [])

  return (
    <section id="plano" data-sin-fab className="bg-dr-bosque px-4 py-20 text-white sm:px-6 md:py-32">
      <div className="mx-auto max-w-[1320px] lg:px-2">
        <VendidosMosaico />

        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#E2B872]">Masterplan interactivo</p>
            <h2 className="mt-5 text-balance text-[clamp(36px,5vw,68px)] font-extrabold leading-[1] tracking-[-0.035em] text-[#F8F1E6]">
              Elegí tu lote. Cada uno, con su cuenta.
            </h2>
            <p className="mt-6 max-w-[58ch] text-base leading-7 text-white/75 md:text-lg md:leading-8">
              Tocá cualquier lote para ver frente, fondo, superficie, precio, entrega y cuota. Si te gusta, pedilo desde ahí:
              te escribe el equipo por WhatsApp.
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

        <div className="mt-10 overflow-hidden rounded-[20px] border border-white/20 bg-[#F4F5F3] p-1 sm:p-2">
          <iframe
            src={SRC}
            title="Plano interactivo de lotes — Distrito Roldán"
            loading="lazy"
            className="block w-full border-0"
            style={{ height: alto, background: '#F4F5F3' }}
          />
        </div>
      </div>
    </section>
  )
}
