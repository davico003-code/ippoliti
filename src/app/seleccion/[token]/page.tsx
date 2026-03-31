import type { Metadata } from 'next'
import { getSeleccion, getReacciones, incrementViewCount } from '@/lib/redis'
import ClientShortlist from '@/components/seleccion/ClientShortlist'

interface Props { params: { token: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const session = await getSeleccion(params.token)
  return {
    title: session ? `Selección para ${session.clientName} · SI Inmobiliaria` : 'Selección expirada · SI Inmobiliaria',
  }
}

export default async function SeleccionPage({ params }: Props) {
  const session = await getSeleccion(params.token)

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
            href="https://wa.me/5493412101694?text=Hola!%20Mi%20selección%20de%20propiedades%20expiró.%20¿Pueden%20enviarme%20una%20nueva?"
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

  const reactions = await getReacciones(params.token)
  await incrementViewCount(params.token)

  return <ClientShortlist session={session} initialReactions={reactions} token={params.token} />
}
