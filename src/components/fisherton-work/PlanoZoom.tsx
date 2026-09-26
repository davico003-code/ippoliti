'use client'

// Visor a pantalla completa con zoom (rueda / pinch / doble toque) para leer
// las cotas de los croquis. Se importa con next/dynamic solo al abrirlo.

import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import Captions from 'yet-another-react-lightbox/plugins/captions'
import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/captions.css'

export default function PlanoZoom({
  slides,
  index,
  onClose,
}: {
  slides: { src: string; width: number; height: number; title: string }[]
  index: number
  onClose: () => void
}) {
  return (
    <Lightbox
      open
      close={onClose}
      index={index}
      slides={slides}
      plugins={[Zoom, Captions]}
      zoom={{ maxZoomPixelRatio: 5, scrollToZoom: true }}
    />
  )
}
