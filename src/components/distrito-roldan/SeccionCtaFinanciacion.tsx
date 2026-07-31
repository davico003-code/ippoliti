import { ArrowRight, MessageCircle, Phone } from 'lucide-react'

const WHATSAPP_URL =
  'https://wa.me/5493412101694?text=Hola!%20Quiero%20informaci%C3%B3n%20sobre%20Distrito%20Rold%C3%A1n'

export default function SeccionCtaFinanciacion() {
  return (
    <section className="relative overflow-hidden bg-[#345544] px-6 py-20 text-white md:py-28">
      <div aria-hidden className="absolute -bottom-20 -right-16 h-80 w-80 text-white/[0.06]">
        <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="5">
          <path d="M98 101C57 94 30 65 24 24c41 6 70 33 74 77Z" />
          <path d="M103 97c7-40 36-67 77-72-7 41-35 69-77 72Z" />
          <path d="M101 106c39 9 64 39 67 80-40-9-66-38-67-80Z" />
        </svg>
      </div>
      <div className="relative mx-auto grid max-w-[1180px] gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="max-w-[760px]">
          <p className="text-sm font-semibold text-[#BB8D3F]">Financiación propia</p>
          <h2 className="mt-4 text-balance text-[clamp(36px,5vw,64px)] font-bold leading-[1.04] tracking-[-0.03em] text-[#F8F1E6]">
            Entrega del 30% y saldo en 24 cuotas fijas en dólares.
          </h2>
          <p className="mt-6 max-w-[58ch] text-base leading-7 text-white/75">
            Consultanos por disponibilidad, precios y alternativas para elegir el lote que mejor se ajuste a tu proyecto.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#B35E21] px-7 text-sm font-bold text-white transition-colors hover:bg-[#9d4f18] sm:w-auto"
          >
            <MessageCircle className="h-5 w-5" />
            Consultar por WhatsApp
            <ArrowRight className="h-4 w-4" aria-hidden />
          </a>
          <a
            href="tel:+5493412101694"
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-white/30 px-7 text-sm font-semibold text-white transition-colors hover:border-white/60 sm:w-auto"
          >
            <Phone className="h-5 w-5" />
            <span className="font-numeric">(341) 210-1694</span>
          </a>
        </div>
      </div>
    </section>
  )
}
