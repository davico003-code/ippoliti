import Image from 'next/image'

// Franja "quién lo hace" para la portada de las landings de emprendimientos:
// el aval del desarrollador va arriba, con su logo en blanco, no solo al pie
// (regla de David, 03-oct). Mismo formato que la portada de Distrito Roldán.
// tono="claro" es la misma franja sobre fondo blanco (listado /emprendimientos):
// ahí los logos van en su versión oscura o a color.

export type Marca = {
  /** "Un desarrollo de", "Proyecto de", "Construye"… */
  rol: string
  nombre: string
  /** Logo en blanco sobre transparente (o a color con tono="claro"). Sin logo se muestra el nombre. */
  logo?: { src: string; width: number; height: number; className?: string }
  /** Dato duro de trayectoria al lado de la marca ("23 años · 250.000 m² construidos"). */
  nota?: string
}

export default function MarcaDesarrollador({
  marcas,
  className = '',
  tono = 'oscuro',
}: {
  marcas: Marca[]
  className?: string
  tono?: 'oscuro' | 'claro'
}) {
  const claro = tono === 'claro'
  return (
    <div
      className={`flex flex-wrap items-center gap-x-8 gap-y-4 border-t pt-6 ${
        claro ? 'border-gray-200' : 'border-white/[0.18]'
      } ${className}`}
    >
      {marcas.map((m) => (
        <div key={m.nombre} className="flex items-center gap-3">
          <span className={`text-xs font-medium ${claro ? 'text-gray-500' : 'text-white/[0.75]'}`}>{m.rol}</span>
          {m.logo ? (
            <Image
              src={m.logo.src}
              alt={m.nombre}
              width={m.logo.width}
              height={m.logo.height}
              className={m.logo.className ?? 'h-8 w-auto sm:h-9'}
            />
          ) : (
            <span
              className={`text-lg font-black uppercase tracking-[0.12em] sm:text-xl ${claro ? 'text-gray-900' : 'text-white'}`}
            >
              {m.nombre}
            </span>
          )}
          {m.nota && <span className={`text-xs ${claro ? 'text-gray-500' : 'text-white/60'}`}>{m.nota}</span>}
        </div>
      ))}
    </div>
  )
}

export const PROYECTTA_LOGO = {
  src: '/emprendimientos/marcas/proyectta-blanco.svg',
  width: 225,
  height: 64,
}

export const VERS_LOGO = {
  src: '/emprendimientos/marcas/vers-blanco.webp',
  width: 640,
  height: 185,
}

// Versiones para fondo blanco. Transatlántica y EDECA solo están en blanco:
// se oscurecen con brightness-0 (son logos de un solo color).
export const LOGOS_CLARO = {
  proyectta: { src: '/emprendimientos/marcas/proyectta-negro.svg', width: 225, height: 64, className: 'h-8 w-auto' },
  vers: { src: '/emprendimientos/marcas/vers-azul.webp', width: 640, height: 185, className: 'h-8 w-auto' },
  /** Recortado del brochure oficial de Fincazul ("by MSR CASA"). */
  msr: { src: '/emprendimientos/marcas/msr-casa.webp', width: 581, height: 140, className: 'h-7 w-auto' },
  transatlantica: {
    src: '/images/distrito-roldan/brand/logo-transatlantica-blanco.webp',
    width: 640,
    height: 162,
    className: 'h-8 w-auto brightness-0',
  },
  edeca: {
    src: '/images/distrito-roldan/brand/logo-edeca-blanco.webp',
    width: 480,
    height: 80,
    className: 'h-4 w-auto brightness-0',
  },
  hausing: { src: '/hausing-logo.svg', width: 468, height: 114, className: 'h-6 w-auto brightness-0' },
}
