import AgenteAvatar from '@/components/property-detail/AgenteAvatar'

// Cara del agente en las tarjetas de "Nuestra selección" (home): grande,
// a la derecha, montada sobre el borde de la foto (mitad foto, mitad blanco),
// con su video de saludo (o su foto) y nombre y apellido en una pastilla
// blanca. Diseño elegido por David el 4-oct-2026 entre varias opciones; a
// 96 px le pareció "demasiado grande" en la home: 72 compu; en el celu
// pidió más chica todavía: 52. En
// /propiedades (lista + mapa) David pidió dejar la pastilla de antes
// (PastillaAgenteCard).
//
// El padre tiene que ser `relative` y envolver SOLO la foto: la cara se ubica
// contra su borde de abajo. El cuerpo de la tarjeta le deja lugar con
// `espacioCaraAgente` (precio y datos se corren; la dirección pasa por debajo).

export const CARA_AGENTE_COMPU = 72
export const CARA_AGENTE_CELU = 52

const RIGHT = 14

/** Lo que la cara ocupa del cuerpo: ancho a la derecha y alto hacia abajo
 *  (media cara + la pastilla del nombre), medidos desde el borde de la foto. */
export function espacioCaraAgente(size: number) {
  return { derecha: size + RIGHT + 10, abajo: Math.round(size / 2) + 14 }
}

export default function CaraAgenteCard({ agente, size = CARA_AGENTE_COMPU }: { agente?: { name: string; picture: string }; size?: number }) {
  if (!agente) return null
  return (
    <div
      className="absolute z-10"
      style={{ right: RIGHT, top: `calc(100% - ${Math.round(size / 2)}px)` }}
      title={`Asesor: ${agente.name}`}
    >
      <AgenteAvatar
        name={agente.name}
        picture={agente.picture}
        initials=""
        bg="#1A5C38"
        fontFamily="'Raleway', system-ui, sans-serif"
        size={size}
        className="ring-[3px] ring-white shadow-[0_3px_12px_rgba(0,0,0,0.22)]"
      />
      <span
        className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
        style={{
          bottom: -9,
          padding: '3px 10px',
          color: '#1A5C38',
          fontFamily: "'Raleway', system-ui, sans-serif",
          fontWeight: 800,
          fontSize: size >= CARA_AGENTE_COMPU ? 12 : 11,
          lineHeight: 1.2,
        }}
      >
        {agente.name}
      </span>
    </div>
  )
}
