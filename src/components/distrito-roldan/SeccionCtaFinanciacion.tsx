import { MessageCircle, Phone } from 'lucide-react'

const RALEWAY = 'var(--font-raleway-distrito), Raleway, sans-serif'

const WHATSAPP_URL =
  'https://wa.me/5493412101694?text=Hola!%20Quiero%20informaci%C3%B3n%20sobre%20Distrito%20Rold%C3%A1n'

export default function SeccionCtaFinanciacion() {
  return (
    <section className="bg-[#1A5C38] px-6 py-24 text-center text-white md:py-[100px]">
      <div className="mx-auto max-w-[720px]">
        <p className="uppercase text-[#D4B384]" style={{ fontFamily: RALEWAY, fontWeight: 600, letterSpacing: '0.24em', fontSize: 12 }}>
          Financiación
        </p>
        <h2
          className="mt-5"
          style={{ fontFamily: RALEWAY, fontWeight: 500, fontSize: 'clamp(30px, 4.5vw, 44px)', lineHeight: 1.18 }}
        >
          Entrega del 30% y saldo en 24 cuotas fijas en dólares.
        </h2>
        <p className="mt-5 text-white/85" style={{ fontFamily: RALEWAY, fontWeight: 300, fontStyle: 'italic', fontSize: 20 }}>
          Distrito Roldán es más que un barrio: es una propuesta de vida.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-7 py-3.5 font-poppins text-sm font-bold text-white transition-colors hover:bg-[#1ea952] sm:w-auto"
          >
            <MessageCircle className="h-5 w-5" />
            Consultar por WhatsApp
          </a>
          <a
            href="tel:+5493412101694"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/30 px-7 py-3.5 font-poppins text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto"
          >
            <Phone className="h-5 w-5" />
            <span className="font-numeric">(341) 210-1694</span>
          </a>
        </div>
      </div>
    </section>
  )
}
