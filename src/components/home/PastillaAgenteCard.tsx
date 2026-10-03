import AgenteAvatar from '@/components/property-detail/AgenteAvatar'

// Pastilla del agente para las cards de "Nuestra selección": vidrio oscuro
// abajo a la izquierda de la foto (el padre tiene que ser `relative`), con su
// video de saludo (o su foto) y el nombre.
export default function PastillaAgenteCard({ agente, size = 34 }: { agente?: { name: string; picture: string }; size?: number }) {
  if (!agente) return null
  return (
    <div
      className="absolute left-2.5 bottom-2.5 z-[1] flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-white"
      style={{
        background: 'rgba(17,17,17,0.42)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        fontFamily: "'Raleway', system-ui, sans-serif",
        fontWeight: 600,
        fontSize: 12.5,
        lineHeight: 1,
      }}
      title={`Asesor: ${agente.name}`}
    >
      <AgenteAvatar
        name={agente.name}
        picture={agente.picture}
        initials=""
        bg="#1A5C38"
        fontFamily="'Raleway', system-ui, sans-serif"
        size={size}
        className="ring-2 ring-white/85"
      />
      <span className="whitespace-nowrap">{agente.name}</span>
    </div>
  )
}
