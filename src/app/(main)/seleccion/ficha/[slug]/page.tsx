import type { Metadata } from 'next'
import PropertyPage, { generateMetadata as metadataDeLaFicha } from '../../../propiedades/[slug]/page'

// La ficha completa de la web para abrir ADENTRO de la selección (iframe del
// mismo origen), así el cliente la recorre sin irse de su selección. Vive bajo
// /seleccion/ para que el layout no muestre menú, pie, WhatsApp ni popups.
// Es la misma página: si la ficha cambia, esto cambia con ella.

export const revalidate = 3600
export const dynamicParams = true

type Props = { params: { slug: string } }

export async function generateMetadata(props: Props): Promise<Metadata> {
  const base = await metadataDeLaFicha(props)
  // Copia de la ficha pública: el canonical ya apunta a /propiedades/…, y
  // además no se indexa.
  return { ...base, robots: { index: false, follow: false } }
}

export default function FichaEnSeleccion(props: Props) {
  return <PropertyPage {...props} />
}
