import Image from 'next/image'

// Franja "quién lo hace" para la portada de las landings de emprendimientos:
// el aval del desarrollador va arriba, con su logo en blanco, no solo al pie
// (regla de David, 03-oct). Mismo formato que la portada de Distrito Roldán.

export type Marca = {
  /** "Un desarrollo de", "Proyecto de", "Construye"… */
  rol: string
  nombre: string
  /** Logo en blanco sobre transparente. Sin logo se muestra el nombre. */
  logo?: { src: string; width: number; height: number; className?: string }
  /** Dato duro de trayectoria al lado de la marca ("23 años · 250.000 m² construidos"). */
  nota?: string
}

export default function MarcaDesarrollador({ marcas, className = '' }: { marcas: Marca[]; className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-white/[0.18] pt-6 ${className}`}>
      {marcas.map((m) => (
        <div key={m.nombre} className="flex items-center gap-3">
          <span className="text-xs font-medium text-white/[0.75]">{m.rol}</span>
          {m.logo ? (
            <Image
              src={m.logo.src}
              alt={m.nombre}
              width={m.logo.width}
              height={m.logo.height}
              className={m.logo.className ?? 'h-8 w-auto sm:h-9'}
            />
          ) : (
            <span className="text-lg font-black uppercase tracking-[0.12em] text-white sm:text-xl">{m.nombre}</span>
          )}
          {m.nota && <span className="text-xs text-white/60">{m.nota}</span>}
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
