'use client'

import Image from 'next/image'
import { useGalleryLightbox } from '@/components/lightbox/useGalleryLightbox'

interface Props {
  blueprints: string[]
}

export default function BlueprintGallery({ blueprints }: Props) {
  const { openGallery } = useGalleryLightbox()

  if (blueprints.length === 0) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {blueprints.map((bp, i) => (
        <button
          key={i}
          onClick={() => openGallery(blueprints, i)}
          className="relative h-52 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <Image
            src={bp}
            alt={`Plano ${i + 1}`}
            fill
            className="object-contain group-hover:scale-105 transition-transform duration-300 p-2"
            sizes="(max-width: 640px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-brand-600 bg-white/90 px-3 py-1.5 rounded-full shadow-sm">
              Ver plano
            </span>
          </div>
        </button>
      ))}
    </div>
  )
}
