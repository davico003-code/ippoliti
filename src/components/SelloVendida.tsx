import { CircleCheck } from 'lucide-react'

/** Sello "VENDIDA" en el mismo estilo de las placas de Instagram (/como-trabajamos y Barrios privados). */
export default function SelloVendida({ grande = false }: { grande?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[10px] font-extrabold uppercase text-white ${grande ? 'px-4 py-2 text-[20px] md:text-[28px]' : 'px-2.5 py-1 text-[12px] md:text-[13px]'}`}
      style={{ background: '#1A5C38', letterSpacing: '0.06em', boxShadow: '0 8px 24px rgba(0,0,0,.3)' }}
    >
      <CircleCheck size={grande ? 26 : 15} strokeWidth={2.4} aria-hidden />
      Vendida
    </span>
  )
}
