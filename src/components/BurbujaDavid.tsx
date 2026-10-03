import AgenteAvatar from '@/components/property-detail/AgenteAvatar'

// Burbuja de David en los CTA donde lo nombramos ("Hablá con David",
// "Coordinar un café con David"…): su video de saludo (o la foto), el nombre y
// la matrícula. `tono="oscuro"` para fondos verdes o negros.
export default function BurbujaDavid({
  tono = 'claro',
  size = 52,
  className = '',
}: {
  tono?: 'claro' | 'oscuro'
  size?: number
  className?: string
}) {
  const oscuro = tono === 'oscuro'
  return (
    <div className={`inline-flex items-center gap-3 text-left ${className}`}>
      <AgenteAvatar
        name="David Flores"
        picture="/team/david-flores-v2.jpg"
        initials="DF"
        bg="#1A5C38"
        fontFamily="'Raleway', system-ui, sans-serif"
        size={size}
        className={oscuro ? 'ring-2 ring-white/80' : 'ring-2 ring-[#1A5C38]/15'}
      />
      <div className="min-w-0 leading-tight">
        <span className={`block font-raleway text-[15px] font-bold ${oscuro ? 'text-white' : 'text-gray-900'}`}>
          David Flores
        </span>
        <span className={`mt-0.5 block text-xs ${oscuro ? 'text-white/70' : 'text-gray-500'}`}>
          Corredor inmobiliario · Mat. N° <span className="font-numeric">0621</span>
        </span>
      </div>
    </div>
  )
}
