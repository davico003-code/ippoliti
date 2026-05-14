// Vista pública del cliente para firmar una autorización de venta.
// Server component: carga la autorización, redirige si firmada, 404 si no
// existe o está expirada. Sino, renderiza el client con todos los datos.

import { notFound, redirect } from 'next/navigation'
import { getAutorizacion } from '@/lib/autorizaciones'
import AutorizacionPublicaClient from './AutorizacionPublicaClient'

export const dynamic = 'force-dynamic'

interface Props {
  params: { slug: string }
}

export default async function AutorizacionPublicaPage({ params }: Props) {
  const auth = await getAutorizacion(params.slug)
  if (!auth) notFound()
  if (auth.status === 'expirada') notFound()
  if (auth.status === 'firmada') redirect(`/autorizacion/${params.slug}/firmada`)
  return <AutorizacionPublicaClient auth={auth} />
}
