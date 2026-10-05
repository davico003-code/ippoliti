// LA MARCA DEL TINDER: colores, el ♥, el isotipo de SI y el chip "En red".
// La usan el mazo y todas sus piezas (tarjeta, match, hoja, rescate) y, vía
// MazoCasas (que la re-exporta), la ficha y "Conocé tu próximo hogar". Vive
// aparte para que esas piezas no se importen entre sí en círculo.

import { Logo } from '@/components/marca/LogoSI'

export const VERDE = '#1A5C38'
const OCRE_FONDO = '#F4EAD8'
const OCRE_TEXTO = '#7A5212'
/**
 * El ♥ del Tinder es VERDE (David 4-oct: "darle más la estética de Tinder": en
 * Tinder el me gusta es verde y el paso rojo; acá el verde es el de la marca).
 * Antes era rosa. Lo usan también la ficha y "Conocé tu próximo hogar".
 */
export const CORAZON = VERDE
export const ROJO_PASO = '#E5484D'
export const AZUL_VISITA = '#2B7FFF'
export const ORO_VOLVER = '#D99A00'

/**
 * El isotipo OFICIAL de SI (placa verde + monograma; kit de marca en
 * si-crm/logo-si-inmobiliaria, copiado tal cual en components/marca/LogoSI).
 * Antes era una pastilla con las letras "SI" escritas y un tilde genérico.
 */
export function IsotipoSI({ className = 'h-4 w-auto' }: { className?: string }) {
  return <Logo variant="isotipo" className={`${className} flex-none`} />
}

export function IconoRed({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="5" cy="12" r="2.5" />
      <circle cx="19" cy="6" r="2.5" />
      <circle cx="19" cy="18" r="2.5" />
      <path d="M7.3 10.9l9.4-3.8M7.3 13.1l9.4 3.8" />
    </svg>
  )
}

export function Corazon({ lleno, className = 'w-7 h-7' }: { lleno: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 20.5s-7.5-4.4-9.3-9A5 5 0 0 1 12 6.6a5 5 0 0 1 9.3 4.9c-1.8 4.6-9.3 9-9.3 9z"
        fill={lleno ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Chip({ nuestra }: { nuestra: boolean }) {
  return nuestra ? (
    // Sin caja alrededor: el isotipo ya es la placa (regla del kit: no encerrarlo).
    <IsotipoSI className="h-7 w-auto" />
  ) : (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold font-raleway shadow-sm" style={{ background: OCRE_FONDO, color: OCRE_TEXTO }}>
      <IconoRed className="w-3 h-3" /> En red
    </span>
  )
}
