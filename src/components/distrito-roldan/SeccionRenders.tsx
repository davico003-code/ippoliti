import Image from 'next/image'

const RALEWAY = 'var(--font-raleway-distrito), Raleway, sans-serif'

interface Bloque {
  cifra: string
  titulo: string
  frase: string
  detalle: string
  img: string
  alt: string
  imagenDerecha: boolean
}

const BLOQUES: Bloque[] = [
  {
    cifra: '159',
    titulo: 'Lotes residenciales',
    frase: 'La calma que buscás, con la conexión que necesitás.',
    detalle:
      'Pensados para quienes buscan la calma de un entorno seguro, con calles pavimentadas, forestación planificada y servicios subterráneos que garantizan estética, confort y conectividad. Superficie promedio desde 450 m².',
    img: '/images/distrito-roldan/render-residencial.jpg',
    alt: 'Render del área residencial de Distrito Roldán',
    imagenDerecha: false,
  },
  {
    cifra: '21',
    titulo: 'Lotes comerciales',
    frase: 'Con frente Ruta 9 y dársenas de estacionamiento.',
    detalle:
      'Ubicados al frente sobre Ruta Nacional 9, ideales para locales, oficinas o desarrollos de renta. Superficie promedio de 630 m². Visibilidad y tránsito asegurado en una zona en plena expansión.',
    img: '/images/distrito-roldan/render-comercial.jpg',
    alt: 'Render del área comercial de Distrito Roldán',
    imagenDerecha: true,
  },
]

export default function SeccionRenders() {
  return (
    <section className="bg-[#FAF7F2] px-6 py-24 md:py-[120px]">
      <div className="mx-auto max-w-[1180px]">
        {BLOQUES.map((b, i) => (
          <div
            key={b.titulo}
            className={`grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16 ${i < BLOQUES.length - 1 ? 'mb-16 lg:mb-[100px]' : ''}`}
          >
            {/* Imagen */}
            <div className={`relative aspect-[4/3] overflow-hidden rounded-2xl shadow-lg ${b.imagenDerecha ? 'order-1 lg:order-2' : 'order-1'}`}>
              <Image src={b.img} alt={b.alt} fill sizes="(max-width: 1024px) 100vw, 590px" className="object-cover" />
            </div>

            {/* Texto */}
            <div className={b.imagenDerecha ? 'order-2 lg:order-1' : 'order-2'}>
              <p style={{ fontFamily: RALEWAY, fontWeight: 200, fontSize: 'clamp(72px, 8vw, 120px)', lineHeight: 1, color: '#1A5C38' }}>
                {b.cifra}
              </p>
              <p className="mb-6 mt-2 uppercase text-[#1A5C38]" style={{ fontWeight: 600, letterSpacing: '0.18em', fontSize: 13 }}>
                {b.titulo}
              </p>
              <p style={{ fontFamily: RALEWAY, fontWeight: 300, fontStyle: 'italic', fontSize: 22, lineHeight: 1.45, color: '#0F3F26' }}>
                {b.frase}
              </p>
              <p className="mt-5 text-[14px] leading-[1.7] text-[#6b6b6b]">{b.detalle}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
