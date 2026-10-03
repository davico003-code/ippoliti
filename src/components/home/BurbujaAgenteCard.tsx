import AgenteAvatar from '@/components/property-detail/AgenteAvatar'

// Burbuja del agente para las cards de "Nuestra selección": montada sobre el
// borde inferior derecho de la foto (el padre tiene que ser `relative`).
// Video de saludo si lo tiene, si no su foto.
export default function BurbujaAgenteCard({ agente, size = 52 }: { agente?: { name: string; picture: string }; size?: number }) {
  if (!agente) return null
  return (
    <div className="absolute right-4 z-[1]" style={{ bottom: -Math.round(size * 0.45) }} title={`Asesor: ${agente.name}`}>
      <AgenteAvatar
        name={agente.name}
        picture={agente.picture}
        initials=""
        bg="#1A5C38"
        fontFamily="'Raleway', system-ui, sans-serif"
        size={size}
        className="ring-[3px] ring-white shadow-[0_4px_14px_rgba(0,0,0,0.18)]"
      />
    </div>
  )
}
