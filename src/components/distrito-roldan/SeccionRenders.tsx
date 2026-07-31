import Image from 'next/image'

interface Bloque {
  titulo: string
  frase: string
  detalle: string
  img: string
  alt: string
  imagenDerecha: boolean
  /** Fotos secundarias del bloque, en tira de 2 columnas bajo la imagen principal. */
  galeria?: { img: string; alt: string }[]
}

const BLOQUES: Bloque[] = [
  {
    titulo: 'Lotes residenciales',
    frase: 'La calma que buscás, con la conexión que necesitás.',
    detalle:
      'Pensados para quienes buscan la calma de un entorno seguro, con calles pavimentadas, forestación planificada y servicios subterráneos que garantizan estética, confort y conectividad. Superficie promedio desde 450 m².',
    img: '/images/distrito-roldan/render-residencial.webp',
    alt: 'Render del área residencial de Distrito Roldán',
    imagenDerecha: false,
  },
  {
    titulo: 'Lotes comerciales',
    frase: 'Con frente Ruta 9 y dársenas de estacionamiento.',
    detalle:
      'Ubicados al frente sobre Ruta Nacional 9, ideales para locales, oficinas o desarrollos de renta. Superficie promedio de 630 m². Visibilidad y tránsito asegurado en una zona en plena expansión.',
    img: '/images/distrito-roldan/render-comercial.webp',
    alt: 'Render del área comercial de Distrito Roldán',
    imagenDerecha: true,
    galeria: [
      { img: '/images/distrito-roldan/galeria-comercial-01.webp', alt: 'Vista de los locales comerciales sobre Ruta 9 en Distrito Roldán' },
      { img: '/images/distrito-roldan/galeria-comercial-02.webp', alt: 'Dársenas de estacionamiento del área comercial de Distrito Roldán' },
    ],
  },
]

export default function SeccionRenders() {
  return (
    <section className="bg-white px-6 py-20 md:py-28">
      <div className="mx-auto max-w-[1180px]">
        {BLOQUES.map((b, i) => (
          <div
            key={b.titulo}
            className={`grid grid-cols-1 items-center gap-9 lg:grid-cols-[1.15fr_.85fr] lg:gap-20 ${i < BLOQUES.length - 1 ? 'mb-20 lg:mb-32' : ''}`}
          >
            {/* Imagen (+ galería secundaria opcional) */}
            <div className={b.imagenDerecha ? 'order-1 lg:order-2' : 'order-1'}>
              <div className={`relative overflow-hidden ${i === 0 ? 'aspect-[1491/1055]' : 'aspect-[1672/941]'}`}>
                <Image src={b.img} alt={b.alt} fill sizes="(max-width: 1024px) 100vw, 680px" className="object-cover" />
              </div>
              {b.galeria && (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {b.galeria.map(g => (
                    <div key={g.img} className="relative aspect-[16/9] overflow-hidden">
                      <Image src={g.img} alt={g.alt} fill sizes="(max-width: 1024px) 50vw, 287px" className="object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Texto */}
            <div className={b.imagenDerecha ? 'order-2 lg:order-1' : 'order-2'}>
              <p className="text-sm font-semibold text-[#B35E21]">{b.titulo}</p>
              <h2 className="mt-4 text-balance text-[clamp(32px,4vw,52px)] font-bold leading-[1.08] tracking-[-0.03em] text-[#345544]">
                {b.frase}
              </h2>
              <p className="mt-6 max-w-[55ch] text-[15px] leading-7 text-[#345544]/75">{b.detalle}</p>
              <a href="#plano" className="mt-7 inline-flex min-h-11 items-center border-b border-[#B35E21] text-sm font-semibold text-[#345544] transition-colors hover:text-[#B35E21]">
                Ver ubicación de los lotes
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
