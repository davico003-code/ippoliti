'use client'

import { useState } from 'react'
import Image from 'next/image'
import MobileGallery from './MobileGallery'

interface Props {
  photos: string[]
  mainPhoto: string
  title: string
  price: string
  operation: string
}

export default function MobileHeroGallery({ photos, mainPhoto, title, price, operation }: Props) {
  const [showGallery, setShowGallery] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const openGallery = (index: number) => {
    setSelectedIndex(index)
    setShowGallery(true)
  }

  return (
    <>
      {/* Mobile hero — tappable */}
      <div className="md:hidden relative w-full h-[60vh]" onClick={() => openGallery(0)}>
        <Image
          src={mainPhoto}
          alt={title}
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        {operation && (
          <div className="absolute top-6 left-6 z-10">
            <span className="px-4 py-1.5 text-xs font-bold rounded-full shadow-lg uppercase tracking-wider backdrop-blur-md bg-brand-600 text-white">
              {operation}
            </span>
          </div>
        )}
        {/* Photo count badge */}
        <div className="absolute bottom-4 right-4 z-10 bg-black/50 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full">
          {photos.length} fotos
        </div>
      </div>

      {/* Fullscreen lightbox */}
      {showGallery && (
        <MobileGallery
          photos={photos}
          title={title}
          price={price}
          initialIndex={selectedIndex}
          onClose={() => setShowGallery(false)}
        />
      )}
    </>
  )
}
