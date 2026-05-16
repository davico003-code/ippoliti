// Mini-semáforo de 3 luces (8px c/u) para mostrar la salud del acuerdo en
// el listado del panel. La luz "prendida" es la que corresponde al estado;
// las apagadas se muestran en gris muy claro para no confundir.

import type { Salud } from '@/lib/autorizaciones'
import { evaluarSalud, tooltipSalud } from '@/lib/autorizaciones/saludLogic'

const ROJO_ON = '#DC2626'
const ROJO_OFF = '#F3D6D6'
const AMARILLO_ON = '#F59E0B'
const AMARILLO_OFF = '#F3E5C2'
const VERDE_ON = '#16A34A'
const VERDE_OFF = '#C7E5D2'

interface Props {
  salud: Salud | null | undefined
}

export function SaludLucesMini({ salud }: Props) {
  const ev = evaluarSalud(salud)
  const rojoOn = ev.estado === 'sin_datos' || ev.estado === 'rojo'
  const amarilloOn = ev.estado === 'amarillo'
  const verdeOn = ev.estado === 'verde'
  const tooltip = tooltipSalud(ev)
  return (
    <span
      title={tooltip}
      aria-label={tooltip}
      style={{
        display: 'inline-flex',
        gap: 4,
        alignItems: 'center',
        verticalAlign: 'middle',
      }}
    >
      <Luz on={rojoOn} onColor={ROJO_ON} offColor={ROJO_OFF} />
      <Luz on={amarilloOn} onColor={AMARILLO_ON} offColor={AMARILLO_OFF} />
      <Luz on={verdeOn} onColor={VERDE_ON} offColor={VERDE_OFF} />
    </span>
  )
}

function Luz({ on, onColor, offColor }: { on: boolean; onColor: string; offColor: string }) {
  return (
    <span
      aria-hidden
      style={{
        display: 'inline-block',
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: on ? onColor : offColor,
        boxShadow: on ? `0 0 0 1px ${onColor}33` : 'none',
      }}
    />
  )
}
