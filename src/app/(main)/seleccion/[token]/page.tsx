import type { Metadata } from 'next'
import { cache } from 'react'
import { headers } from 'next/headers'
import { getSeleccion, getReacciones, incrementViewCount } from '@/lib/redis'
import { getAgentePhoto } from '@/lib/agente-foto'
import { armarItems, idPropio } from '@/lib/seleccion-items'
import { archivoDeFotoFirmada, fotoAbsoluta, urlFotoFija } from '@/lib/fotos-fijas'
import { isLikelyBot } from '@/lib/ficha'
import type { SeleccionItem } from '@/lib/seleccion'
import ClientShortlist from '@/components/seleccion/ClientShortlist'

interface Props { params: { token: string }; searchParams?: { vista?: string } }

// La metadata (tarjeta de WhatsApp) y la página leen lo mismo: con cache() la
// selección y sus propiedades se piden UNA vez por request. Esta ruta ya es
// dinámica (headers()), así que leer Redis acá no rompe ningún ISR.
const leerSeleccion = cache(getSeleccion)
const leerItems = cache(armarItems)

const primerNombre = (nombre: unknown) => (typeof nombre === 'string' ? nombre.trim().split(/\s+/)[0] ?? '' : '')

/**
 * Foto para la tarjeta: la portada de la primera propiedad NUESTRA que tenga
 * foto. Las En red / de portales no: su foto puede traer el logo del colega y
 * no queremos que la tarjeta la muestre como propia. Las firmadas de Supabase
 * pasan a su URL fija (/fotos/<id>/<archivo>): la firma rota y WhatsApp se
 * queda con la vista previa rota.
 */
function portadaParaTarjeta(items: SeleccionItem[], props: { id: string; url: string; source?: 'externa' }[]): string | null {
  for (const it of items) {
    if (it.externa || it.enRed || !it.photos[0]) continue
    const foto = it.photos[0]
    const prop = props.find((p) => p.id === it.id)
    const id = prop ? idPropio(prop) : null
    const archivo = archivoDeFotoFirmada(foto)
    if (id != null && archivo) return urlFotoFija(id, archivo, true)
    return fotoAbsoluta(foto)
  }
  return null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const session = await leerSeleccion(params.token)
  const url = `https://siinmobiliaria.com/seleccion/${params.token}`
  // Selección privada de un cliente puntual: nunca indexar.
  const robots = { index: false, follow: false }
  if (!session) {
    return {
      title: 'Selección expirada · SI INMOBILIARIA',
      robots,
      // og:url a la propia URL: sin esto heredaba la home y Facebook/Messenger
      // podían llevar la tarjeta a siinmobiliaria.com en vez de al link.
      description: 'Esta selección ya no está disponible. Pedile una nueva a tu asesor.',
      openGraph: {
        title: 'Selección de propiedades · SI INMOBILIARIA',
        description: 'Esta selección ya no está disponible. Pedile una nueva a tu asesor.',
        url,
        siteName: 'SI INMOBILIARIA',
        type: 'website',
        images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
      },
    }
  }

  // Es el link más personal que manda un asesor: la tarjeta de WhatsApp tiene
  // que decir "esto es tuyo" y mostrar una casa, no la tarjeta genérica de la
  // home con el logo. Solo el PRIMER nombre: la tarjeta la ve cualquiera a quien
  // se reenvíe el link.
  const items = await leerItems(session.properties ?? []).catch(() => [] as SeleccionItem[])
  const nombre = primerNombre(session.clientName)
  const asesor = primerNombre(session.agentName || session.agent)
  const n = items.length
  const portada = portadaParaTarjeta(items, session.properties ?? [])
  const titulo = 'Tu selección de propiedades · SI INMOBILIARIA'
  const descripcion = [
    nombre && asesor && n > 0 ? `${nombre}, ${asesor} eligió ${n === 1 ? 'una propiedad' : `${n} propiedades`} para vos.` : null,
    'Deslizá, guardá con ♥ las que te gusten y coordinamos las visitas.',
  ].filter(Boolean).join(' ')
  // Sin width/height: la portada es la foto real (no 1200×630) y declarar
  // medidas falsas deforma la vista previa (igual que en la ficha).
  const imagenes = portada ? [{ url: portada, alt: titulo }] : [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'SI INMOBILIARIA' }]

  return {
    title: nombre ? `Selección para ${nombre} · SI INMOBILIARIA` : titulo,
    description: descripcion,
    robots,
    openGraph: { title: titulo, description: descripcion, url, siteName: 'SI INMOBILIARIA', type: 'website', images: imagenes },
    twitter: { card: 'summary_large_image', title: titulo, description: descripcion, images: imagenes.map((i) => i.url) },
  }
}

export default async function SeleccionPage({ params, searchParams }: Props) {
  const session = await leerSeleccion(params.token)
  // Un asesor la abre desde Hilo (?vista=asesor) para ver qué le gustó al
  // cliente: no cuenta como que el cliente la abrió y no guarda sus toques.
  const asesor = searchParams?.vista === 'asesor'
  // La vista previa de WhatsApp (y otros bots) baja la página cuando el asesor
  // manda el link: tampoco es el cliente abriéndola (igual que las fichas).
  const contarVista = !asesor && !isLikelyBot(headers().get('user-agent'))

  if (!session) {
    return (
      <div className="min-h-screen bg-[#F2F2F7] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-sm">
          <div className="w-16 h-16 bg-[#1A5C38] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-black text-2xl">SI</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Esta selección ya no está disponible</h1>
          <p className="text-gray-500 text-sm mb-6">
            El enlace expiró o fue eliminado. Contactanos para recibir una nueva selección.
          </p>
          <a
            href="https://wa.me/5493413340916?text=Hola!%20Mi%20selección%20de%20propiedades%20expiró.%20¿Pueden%20enviarme%20una%20nueva?"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white font-bold rounded-full text-sm hover:bg-[#1ea952] transition-colors"
          >
            Contactar por WhatsApp
          </a>
        </div>
      </div>
    )
  }

  // Fotos y datos de cada propiedad armados acá: la página llega completa, sin
  // tarjetas grises esperando al navegador.
  const [reactions, agentPhoto, items] = await Promise.all([
    getReacciones(params.token),
    getAgentePhoto(session.agentName || session.agent),
    leerItems(session.properties ?? []),
    // El contador de vistas no frena la página (antes iba después, en serie).
    contarVista ? incrementViewCount(params.token).catch(() => {}) : null,
  ])

  return (
    <ClientShortlist
      clientName={session.clientName}
      agentName={session.agentName || session.agent}
      note={session.note}
      items={items}
      initialReactions={reactions}
      token={params.token}
      agentPhoto={agentPhoto}
      soloMirar={asesor}
    />
  )
}
